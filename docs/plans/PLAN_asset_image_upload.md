# Implementation Plan: Asset/Image Upload System

**Status**: 🔄 In Progress
**Started**: 2026-04-21
**Last Updated**: 2026-04-21
**Estimated Completion**: 2026-04-25

---

**⚠️ CRITICAL INSTRUCTIONS**: After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date above
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase

⛔ **DO NOT skip quality জ্ঞgates or proceed with failing checks**

---

## 📋 Overview

### Feature Description
사용자가 템플릿 환경에서 이미지를 업로드하고, 데이터베이스의 Asset 레코드와 물리 스토리지를 통해 에셋의 생애주기를 관리하는 진정한 이벤트 기반 SaaS 아키텍처. `value` 단일 URL 매핑에서 벗어나, `asset_usages` 관계 테이블을 통한 무결점 레퍼런스 카운트 방식을 채택합니다.

🔥 **핵심 철학**: "이미지는 업로드 시 결정되지 않는다. Save 시점에만 확정된다."

### Success Criteria
- [ ] `asset_usages` 및 `cleanup_queue` 테이블에 중복 방지 제약과 재처리 상태 관리 셋업 완료
- [ ] 동시성 보장을 위한 DB Lock(`FOR UPDATE`) 기반의 Transactional Save & Diffing 파이프라인
- [ ] Worker 다중 실행 경쟁 조건(Race Condition)을 원천 봉쇄하는 Claim 방식(`UPDATE ... RETURNING`)의 큐 구조 
- [ ] N+1을 억제하는 Server Batch Fetch 전략과 누락(Miss) 시 확실한 Observability(로깅) 확보

### User Impact
단순 게시판 업로드가 아닌, 동시 접속이나 연타 공격, 그리고 다중 Worker 서버 증설 시에도 절대 망가지지 않는 무결점 인프라 구조를 선사합니다. 서버나 Worker가 죽어도 Retry를 통해 상태를 보존・파기할 수 있는 최고의 안정성을 보장합니다.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **asset_usages 고유 매핑** | 에디터를 Save할 때마다 기존 사용 내역을 지우고 튜플 기준으로 인서트해 레퍼런스를 확정. Delete -> Insert 구조지만 동일 Transaction 블록 강제 하에 동작하므로, Worker가 중간 상태(0 count)를 가로채 지워버릴 수 있는 리스크를 완벽 소거. | 관계 테이블 관리 공수 증가 |
| **Save 동시성 제어 (FOR UPDATE)** | 유저가 Save를 연타하거나 동시 편집 시, 구식 JSON 상태를 기준으로 Diff 연산이 일어나면 엉뚱한 이미지가 파기되는 치명적 버그 발생. 반드시 Transaction 블록(BEGIN) 내부에서 `SELECT ... FOR UPDATE` 락 구문으로 최신 `oldJson`을 가져와서 Diff를 진행 | DB Lock 점유 시간에 민감해짐 |
| **Worker 동시성 제어 (Claim)** | 다수의 Node Worker 프로세스가 동시에 똑같은 ID의 쓰레기를 발견해 서로 삭제 경쟁을 벌이다 시스템이 터지는 것을 막기 위해, `UPDATE cleanup_queue SET status='processing' WHERE asset_id=? AND status IN('pending','failed') RETURNING *` 쿼리로 클레임(Claim) 한 자만 처리 권한 획득 | 큐잉/스케줄러 계층의 트랜잭션 추가 로직 필요 |
| **Two-Step 연산 (Slot + Set)** | 슬롯(`key`) 기준으로 변동 감지, 도출은 값(`Set`) 차집합으로 도출해 "타 위치 스왑 / 복제 사용" 시의 오작동 완전 억제 | 재귀 Diff 알고리즘 두 단계 구성 수반 |

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Write tests FIRST, then implement to make them pass

### Test Pyramid for This Feature
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | ≥80% | `Slot + Set` Two-step 알고리즘, Queue의 재처리 상태 검사, Worker Claim 쿼리 |
| **Integration Tests** | Critical paths | 다중 Save 연타 경쟁 및 다중 Worker 인스턴스의 Claim 경합 시나리오 점검 |

---

## 🚀 Implementation Phases

### Phase 1: Database & 인프라 설정 (수동 SQL 처리)
**Goal**: 마이그레이션(`assets`, `asset_usages`, 운영 상태 관리용 큐 저장소, 버킷 생성 규칙) 작성
**Estimated Time**: 1.5 hours

#### Tasks
**🔵 REFACTOR/SETUP: Generate SQL Resource**
- [x] **Task 1.1**: 메타 테이블 `assets` 생성 (status: pending/active, size, mime_type 등)
- [x] **Task 1.2**: 🌟 사용 매핑 테이블 `asset_usages` 생성 (`UNIQUE(asset_id, site_id, slot_key)`)
- [x] **Task 1.3**: 🌟 비동기 처리를 위한 옵저버블 큐 `cleanup_queue` 구조화 설계
  - 인덱스: `UNIQUE(asset_id)`
  - 상태 필드: `status` (pending|processing|done|failed), `retry_count`, `last_error`
- [x] **Task 1.4**: 스토리지 버킷 및 RLS 정책 셋업

---

### Phase 2: Domain Layer (Foundation & Entity Update)
**Goal**: `TemplateField` 구조 및 `Asset` 엔티티 Validation Rules
**Estimated Time**: 2 hours

#### Tasks
**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 2.2**: `TemplateField` 유니온 인터페이스 최종 적용
- [x] **Task 2.3**: `Asset` 엔티티 사이즈 / Mime 타입 규칙 정의

---

### Phase 3: Infrastructure Layer (Supabase 통합 로직)
**Goal**: 발급 및 Storage 파일 존재 유효성을 100% 무결점으로 보장하는 Confirm 인프라 모듈
**Estimated Time**: 2.5 hours

#### Tasks
**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 3.2**: `SupabaseAssetRepositoryImpl` 내부 발급 로직 연동
- [x] **Task 3.3**: 컨펌 인프라 (`confirmAssetUpload` 멱등/유무 판단)
  - 1. 이미 `active` 면 Return 
  - 2. `storage.exists(path)` 판단 예외 처리
  - 3. 확인되면 `update status='active'`

---

### Phase 4: Application Layer (Server Actions & 동시성 제어 Save)
**Goal**: DB Lock을 활용한 동시성 방어 Save 트랜잭션, Queue Push 파이프라인
**Estimated Time**: 3.5 hours

#### Tasks
**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 4.2**: `confirmUploadAction` 멱등 연동
- [x] **Task 4.3**: **N+1 회피 (Server Only)** `assetMap` 상단 병렬 호출 처리
- [x] **Task 4.4**: **[Slot+Set 분리 및 Lock 제어] Template Save 로직 트랜잭션 수립 (최핵심 지점)**
  - **단계 1**: `BEGIN`
  - **단계 2**: `SELECT template_json FROM user_sites WHERE id = ? FOR UPDATE` (동시 변경 차단)
  - **단계 3**: `oldMap` ↔ `newMap` 비교 후 `removed` Set 추출
  - **단계 4**: `UPDATE template_json = newJson`
  - **단계 5**: `DELETE FROM asset_usages WHERE site_id = ?` (트랜잭션에 묶여 Worker에게 상태 노출 안됨)
  - **단계 6**: `INSERT INTO asset_usages ... ON CONFLICT DO NOTHING`
  - **단계 7**: `COMMIT` 
  - **단계 8**: (Transaction 외부) `removed` 를 `cleanup_queue` 에 Push.

---

### Phase 5: Presentation Layer (UI 로컬 연동 및 로깅 옵저버빌리티)
**Goal**: Error Tracking/관측 가능성을 담은 렌더러 구축
**Estimated Time**: 2 hours

#### Tasks
**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 5.1**: 뷰어 렌더링 로직 적용
  - `field.assetId` 존재 & Map 탐색 실패 시 -> `logEvent({type: 'ASSET_MISS'...})` 및 Sentry 메시지 트리거
- [x] **Task 5.2**: `DynamicEditor` 완료 반영 구현 (에디터 내에선 `field.assetId` 임시 교체 상태 유지)

---

### Phase 6: Asset Cleanup System (안전망 강화 Worker & 방어적 TTL)
**Goal**: Worker 동시 배포 상태에서도 끄떡없는 Claim 방식 큐 컨슈머 및 Pending 쓰레기 청소
**Estimated Time**: 2.5 hours

#### Tasks
**🟢 GREEN: Implement**
- [x] **Task 6.1**: **Asset Cleanup Worker 로직 (Claim 기반 큐 선점)**
  - **동시성 락(Claim)**: `UPDATE cleanup_queue SET status = 'processing' WHERE asset_id = ? AND status IN ('pending', 'failed') AND retry_count < 3 RETURNING *` 로 작업 독점 획득 (Race Condition 무효화)
  - 타겟 ID로 `SELECT COUNT(*) FROM asset_usages` 체크 후 0일 때만 Storage 물리 및 DB 레코드 제거
  - 성공 시 Queue `status=done` 처리
  - 에러 시 `status=failed`, `retry_count++`, `last_error` 갱신 
- [x] **Task 6.2**: **최고 단계 방어식 TTL 삭제 룰 (Task Runner/Cron)**
  - `WHERE status = 'pending' AND created_at < now() - interval '1 hour' AND NOT EXISTS (SELECT 1 FROM asset_usages WHERE asset_id = assets.id)` 로 펜딩 쓰레기 레코드 삭제 무결성 확보.

#### Quality Gate ✋
**⚠️ STOP: 마지막 점검**
- [x] 2대 이상의 Worker 모킹을 가동해, 동일한 `cleanup_queue` 레코드를 동시에 물어도 오직 1대만 Claim (`RETURNING *` 결과 획득) 하는지 강력한 Race Condition 방어 통합 테스트 실시

---

## 📊 Progress Tracking

### Completion Status
- **Phase 1 (DB Setup)**: ⏳ 0% | 🔄 0% | ✅ 100%
- **Phase 2 (Domain)**: ⏳ 0% | 🔄 0% | ✅ 100%
- **Phase 3 (Infra)**: ⏳ 0% | 🔄 0% | ✅ 100%
- **Phase 4 (Action)**: ⏳ 0% | 🔄 0% | ✅ 100%
- **Phase 5 (UI/Editor)**: ⏳ 0% | 🔄 0% | ✅ 100%
- **Phase 6 (Cleanup System)**: ⏳ 0% | 🔄 0% | ✅ 100%

**Overall Progress**: 100% complete
