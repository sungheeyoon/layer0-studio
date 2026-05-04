# 포트폴리오 작성용 정리

> 이 문서는 **포트폴리오에 들어갈 핵심 내용**과 **본인이 반드시 숙지해야 할 내용**을 정리한 것입니다.
> 프로젝트명, 라이브 URL, GitHub 링크는 의도적으로 제외 (실제 운영 후 공개 예정).
> 개발 기간, 스크린샷은 본인이 직접 추가.

---

## 1. 한 줄 요약 (Hook)

> **노코드(No-code) 웹사이트 빌더 — 비개발자가 템플릿을 골라 시각적으로 편집하고 자신의 도메인으로 배포할 수 있는 SaaS 플랫폼**

> 한 줄 요약은 "이 제품이 누구의, 어떤 문제를 푸는가"가 즉시 드러나야 합니다.
> 위 문장을 본인 톤으로 다듬어 사용하세요.

---

## 2. 메타 정보 (포트폴리오 상단)

| 항목 | 내용 |
|---|---|
| **개발 기간** | 2026.01 ~ 2026.05 (5개월, 운영 중) |
| **역할** | Solo Full-stack Developer (기획, 설계, 개발, 배포 1인 진행) |
| **기술 스택** | Next.js 16 (App Router) · TypeScript · Supabase (Auth/DB/Storage) · Tailwind CSS v4 · Vercel |
| **아키텍처** | Clean Architecture (Domain / Data / Presentation 레이어 분리) |
| **테스트** | Vitest v2 (Domain Layer 단위 테스트, 인메모리 fake 기반) |
| **테마/템플릿** | 7종 운영 (corporate · cafe · fitness · interior · legal · medical · wedding) |

> _스크린샷 영역_ — 본인이 추가
> 추천 순서: ① 랜딩 ② 템플릿 카탈로그 ③ 에디터 화면 ④ 배포된 사이트

---

## 3. 개요 (Overview)

### 문제 (Problem)
- 소상공인·1인 사업자가 웹사이트를 만들려면 외주(고비용) 또는 기존 빌더(낮은 자유도, 종속) 중 선택해야 함
- 개발자에게도 "단순 소개 페이지"를 매번 처음부터 만드는 일은 비효율

### 해결 (Solution)
- 큐레이션된 템플릿 → 시각적 편집 → 자체 도메인 배포까지 한 흐름으로 제공
- 사용자는 코드를 한 줄도 작성하지 않고도 5분 안에 사이트를 띄울 수 있음

### 핵심 가치 (Value)
- **속도**: 템플릿 선택부터 배포까지 단일 플로우
- **소유권**: 사용자가 본인의 도메인으로 발행, 데이터는 본인 계정에 귀속
- **확장성**: 테마(Theme) 시스템으로 새 템플릿을 코드 수정 없이 추가 가능

---

## 4. 핵심 기능 (Key Features)

1. **템플릿 카탈로그** — 비로그인 상태에서 둘러보기 가능 (쇼핑몰 상품 목록과 동일한 UX). 선택 시 인증 → 사이트 생성 흐름으로 자동 연결
2. **시각적 에디터** — 좌측 섹션 패널 + 우측 실시간 프리뷰. 4초 idle 시 자동 저장, 페이지 이탈 시 미저장 변경 보호
3. **반복 항목 편집 (`array` 필드)** — 메뉴 · 팀원 · FAQ 등 N개 아이템을 시각적으로 추가·정렬·삭제. 섹션 컴포넌트의 `dataSchema` 가 검증을 담당
4. **다중 사용자 동시 편집 보호** — Optimistic Concurrency Control. 다른 탭/기기에서 먼저 저장된 경우 충돌 모달로 알림
5. **이미지 업로드 (2-Phase Commit)** — DB 레코드 → 직접 업로드 → Confirm 의 3단계로 고아(orphan) 파일 발생 방지. 미완료 자산은 일일 크론으로 정리
6. **사이트 발행 & 미리보기** — 발행 전 `/preview/[id]`로 검증 → `/site/[domain]`으로 공개
7. **인증 플로우** — 회원가입(이메일 OTP), 로그인, 비밀번호 재설정, 계정 삭제 전 과정
8. **관리자 템플릿 워크플로우** — `pnpm template:sync` 로 코드 프리셋 → DB 단방향 반영. Admin UI 가 Preview → Apply 2단계로 대체 (감사 로그 `template_sync_audit`)

---

## 5. 핵심 성과 (Achievements)

### A. 기술적 성과

#### A-1. Clean Architecture 적용
- **Domain → Data → Presentation** 레이어 분리. 의존성은 항상 안쪽으로만 향함
- Domain은 외부 의존성 0개 (Supabase 등 인프라 모름) → 단위 테스트가 인메모리 fake로 가능
- 결과: Supabase에서 다른 백엔드로 교체하더라도 Data 레이어만 수정하면 됨 (이론이 아닌 실제 구조)

#### A-2. Optimistic Concurrency 구현
- 사용자가 여러 기기/탭에서 동시 편집할 때 발생하는 **마지막 쓰기 승리(last-write-wins) 데이터 손실** 문제를 PostgreSQL RPC 레벨에서 해결
- 클라이언트가 `expectedUpdatedAt`을 함께 전송 → RPC가 현재 값과 비교 → 다르면 `STALE_VERSION` 반환 → UI가 충돌 모달로 안내
- 자동 저장(4초 디바운스) + `beforeunload` 가드로 데이터 유실 시나리오를 다층 방어

#### A-3. 2-Phase Commit 자산 업로드
- 초기 단순 업로드 방식의 문제점: **클라이언트에서 업로드만 하고 DB 등록을 안 하거나, 그 반대 케이스**에서 고아 파일/레코드 발생
- 해결: `init → upload → confirm` 3단계로 분리하고, 미완료(`pending`) 자산은 크론(매일 03:00 UTC)으로 청소
- `claim_cleanup_task` RPC로 동시 실행 방지(분산 잠금 패턴)

#### A-4. 의존성 주입 (DI without Framework)
- NestJS 같은 무거운 DI 컨테이너 없이, **요청당 Supabase 클라이언트 → Repository → Use Case 주입**을 팩토리 함수로 구현
- 결과: 보일러플레이트 최소화 + 요청별 격리(싱글턴 함정 회피)

#### A-5. 타입 안전한 에러 처리
- Domain에서 `code` 문자열을 가진 타입 에러 throw → Server Action이 `{ success: false, code }` 반환 → 클라이언트가 i18n 메시지 매핑
- 결과: 비즈니스 로직과 사용자 메시지(한국어) 완전 분리. 추후 다국어 추가 시 메시지 레지스트리만 확장하면 됨

#### A-6. 보안 하드닝
- Supabase Storage 버킷 레벨에서 **MIME 타입/파일 크기 제한** (애플리케이션 검증과 이중 방어)
- Service Role Key는 서버 전용 클라이언트(`createAdminClient()`)에서만 사용
- Cron 엔드포인트는 Bearer 토큰으로 보호
- 관리자 API는 `app_metadata.role === 'admin'` 검증

#### A-7. 플러그형 테마 시스템 (코드 = 단일 진실)
- 테마 디렉터리(`src/themes/<key>/`)만 추가하면 `pnpm generate:themes` 로 자동 등록 — 코어 코드 수정 0줄
- 섹션 컴포넌트가 `meta.dataSchema` 로 자기 스키마를 선언 → 에디터는 스키마 기반 폼을 동적으로 생성
- `pnpm template:sync` 가 코드 프리셋 → DB 로 단방향 반영, `template_sync_audit` 테이블에 변경 이력 기록
- 결과: **테마 7종(corporate/cafe/fitness/interior/legal/medical/wedding)** 까지 운영하면서 에디터 코어를 한 번도 손대지 않음

#### A-8. `array` 필드 — 반복 콘텐츠 편집 일반화
- 메뉴/팀원/FAQ 등 "N개 항목" 구조를 단일 `array` 필드 타입으로 표준화
- `itemSchema` 는 기존 필드 타입(text/image 등)을 재귀 사용 → 자동 저장·동시성·이미지 업로드 흐름이 그대로 적용
- Phase 2(Collections, 별도 테이블 분리)는 RFC만 남기고 의도적 deferred — **YAGNI 원칙으로 과설계 회피**

### B. 비즈니스 / 운영 성과

- **MVP 출시 완료** (Vercel 배포, 실제 도메인 운영 중)
- **무료 인프라 비용으로 운영 가능한 구조** — Supabase 무료 티어 + Vercel Hobby 한도 내 (Cron 1일 1회 등 제약 사항을 고려한 의도적 설계)
- **확장 비용 예측 가능** — 사용자 1명당 스토리지·DB 비용을 계산할 수 있는 데이터 모델 (`user_assets` 테이블에 owner 추적)

---

## 6. 주요 기술 의사결정 (Why)

| 선택 | 대안 | 선택한 이유 |
|---|---|---|
| Next.js 16 App Router | Pages Router, Remix | Server Component + Server Action으로 클라이언트 번들 최소화. 인증 세션을 미들웨어에서 갱신하는 패턴이 깔끔함 |
| Supabase | Firebase, 자체 백엔드 | Postgres 기반(SQL/RLS) + Auth/Storage 통합 → 1인 개발에서 인프라 셋업 시간 단축 |
| Clean Architecture | 단순 MVC | 1인이지만 도메인 로직이 복잡해질 것을 예상 (테마, 발행, 동시성 등). 테스트 가능성 확보가 핵심 |
| Tailwind v4 | CSS Modules, styled-components | 디자인 토큰 일관성 + 빌드 시점 최적화 + AI 도구와의 시너지 |
| 낙관적 동시성 (RPC) | 비관적 락(SELECT FOR UPDATE) | 편집 시간이 길고 동시 편집 빈도가 낮음 → 충돌 시점에만 비용 지불하는 낙관 모델이 적합 |
| 2-Phase Asset Upload | 단일 업로드 | 클라이언트 직접 업로드(스토리지 비용·대역폭 절감) + 데이터 일관성 두 마리 토끼 |
| 코드 = 단일 진실 (`template:sync`) | DB 가 진실 (Admin UI 직접 편집) | 템플릿 변경을 Git diff 로 리뷰 가능, 환경 간 drift 방지 |
| `array` 필드 (Phase 1) → Collections 보류 | 처음부터 별도 테이블·RLS | 트리거 조건(detail page · 검색)이 발생할 때까지 과설계 회피 (YAGNI) |

---

## 7. 회고 (Retrospective)

### 잘한 것
- 초기에 아키텍처 레이어를 엄격히 분리한 결과, 후반부 기능 추가(동시성 제어, 자산 정리, `array` 필드)가 기존 코드에 거의 영향을 주지 않음
- Domain 레이어 단위 테스트로 리팩토링 자신감 확보
- 테마를 1종 → 7종으로 늘리면서 **에디터 코어 코드를 한 줄도 수정하지 않은 점** — 초기 추상화 설계가 실전에서 검증됨
- Phase 2(Collections)를 의도적으로 미루고 `array` 필드로 90% 케이스를 해결한 판단 — 과설계 회피

### 아쉬운 것 / 개선 예정
- 실제 사용자 데이터 부족 → 운영하면서 사용 패턴 확인 후 다음 우선순위 결정
- E2E 테스트 부재 → Playwright 도입 검토
- 결제/구독 흐름 미구현 → 외부 사용자 유입 후 도입 시점 판단

### 다음 스텝
1. 운영 중 사용자 피드백 수집 → 다음 우선순위 결정
2. Collections (Phase 2): 블로그/공지 등 detail page · SEO 가 필요해지는 시점에 트리거
3. 결제/구독 도입 검토 (Stripe)

---

## 8. ★ 면접에서 반드시 답할 수 있어야 할 내용 (Must-Know)

> 포트폴리오에 적은 모든 항목은 "왜?"와 "어떻게?"를 답할 수 있어야 합니다.
> 적었지만 설명 못 하면 오히려 **마이너스**입니다. 모르는 항목은 차라리 빼세요.

### 8-1. 아키텍처 관련
- [ ] Clean Architecture 레이어를 그림으로 그릴 수 있는가? (Domain ← Data ← Presentation)
- [ ] "왜 이 프로젝트에 Clean Architecture가 필요했는가?" — 1인 프로젝트에 오버엔지니어링 아닌가? 라는 질문에 답할 수 있는가?
- [ ] DI 컨테이너를 안 쓰고 팩토리 함수로 한 이유는?
- [ ] Domain이 Supabase를 모르게 하는 게 실제로 어떤 이점이 있는가? (예: 테스트, 교체 가능성)

### 8-2. 동시성 / 데이터 일관성
- [ ] Optimistic vs Pessimistic Locking의 차이를 설명할 수 있는가?
- [ ] **이 프로젝트에 왜 낙관적 동시성을 선택했는가?** (편집 시간이 길고, 충돌 빈도가 낮다)
- [ ] `STALE_VERSION` 반환 시 UI가 어떻게 동작하는가?
- [ ] 자동 저장 + `beforeunload` + 충돌 모달 — 각각 어떤 시나리오를 막는가?

### 8-3. 파일 업로드
- [ ] 2-Phase Commit이 무엇인가? 왜 필요한가?
- [ ] 만약 클라이언트가 업로드 도중 종료되면 어떻게 되는가? (→ pending → 크론이 정리)
- [ ] 크론을 매일 1회만 도는 이유는? (Vercel 무료 플랜 제약을 인지하고 있는가)
- [ ] `claim_cleanup_task` RPC는 왜 필요한가? (동시 실행 시 같은 자산을 두 번 삭제하지 않기 위한 분산 잠금)

### 8-4. Next.js / 인증
- [ ] App Router의 Server Component / Server Action / Client Component 경계를 설명할 수 있는가?
- [ ] Supabase 세션을 미들웨어에서 갱신하는 이유는? (쿠키 기반 세션의 만료 처리)
- [ ] Service Role Key는 어디서 쓰는가? 클라이언트에 노출되지 않는다는 걸 어떻게 보장하는가?

### 8-5. 보안
- [ ] Storage 버킷 레벨 제한과 애플리케이션 검증을 둘 다 두는 이유는? (방어 심층화 / Defense in Depth)
- [ ] 관리자 권한은 어떻게 구분하는가? (`app_metadata.role`이 `user_metadata`와 다른 이유 — 사용자가 수정 불가)
- [ ] 크론 엔드포인트는 어떻게 보호되는가? (`CRON_SECRET` Bearer)

### 8-6. 테마 / 템플릿 시스템
- [ ] 새 테마를 추가할 때 코어 코드를 안 건드릴 수 있는 이유는? (자동 registry · `dataSchema` 자기서술)
- [ ] `pnpm template:sync` 가 단방향(코드→DB)인 이유는? (소스 of truth 일원화, drift 방지)
- [ ] `template_sync_audit` 가 필요한 이유는? (운영 중 의도치 않은 덮어쓰기 추적)

### 8-7. `array` 필드 / Collections
- [ ] `array` 필드와 Collections(Phase 2)는 어떻게 다른가? (단일 row JSONB vs 별도 테이블+RLS)
- [ ] Phase 2 를 미룬 근거는? (트리거 조건 — detail page · 항목 수백 이상 · 외부 입력 — 도달 전 과설계)
- [ ] `array` 필드의 한계는? (페이지네이션 · slug 기반 detail URL · RLS 분리 불가)

### 8-8. 트레이드오프 / 한계 (가장 중요)
- [ ] **이 프로젝트의 가장 큰 약점은 무엇인가?** (예: 실사용자 데이터 부족, E2E 테스트 부재, 결제 미구현)
- [ ] 만약 사용자 1만 명이 동시 접속하면 어디가 먼저 터질까?
- [ ] 다음에 다시 만든다면 무엇을 다르게 할 것인가?
- [ ] 현재 구조의 어떤 부분이 미래에 부담이 될 수 있는가?

> 마지막 6번 카테고리 질문을 잘 답하는 사람이 시니어로 평가됩니다.
> 솔직하게 약점을 말하고, 그것을 인지하고 있다는 사실 자체를 어필하세요.

---

## 9. 포트폴리오에 들어갈 최종 분량 가이드

- **포트폴리오 카드 (요약)**: 1·2·3번만 (한 줄 요약 + 메타 + 개요 3줄)
- **상세 페이지 (링크)**: 4·5·6·7번 전체
- **본인 머릿속에만 (외부 노출 X)**: 8번 (면접 대비)

---

_작성: 포트폴리오 정리 도우미_
_업데이트: 운영 중 새 기능/지표가 추가되면 5번(핵심 성과)에 누적 기록_
