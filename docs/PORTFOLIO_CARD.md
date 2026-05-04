# Layer0 Studio

🔗 **Live**: [layer0-studio.vercel.app](https://layer0-studio.vercel.app)

---

## 🧩 한 줄 요약

> **Clean Architecture 기반 노코드 웹사이트 빌더** — 동시 편집·자산 업로드 정합성 문제를 직접 설계로 해결한 **1인 풀스택 SaaS**

---

## 🗓️ 메타 정보

| 항목 | 내용 |
|---|---|
| **기간** | 2026.01 ~ 2026.05 (5개월, 운영 중) |
| **역할** | 1인 풀스택 (기획·설계·개발·배포) |
| **기술** | Next.js 16 · TypeScript · Supabase · Tailwind v4 · Vercel |
| **아키텍처** | Clean Architecture (Domain / Data / Presentation) |
| **테마** | 7종 (corporate / cafe / fitness / interior / legal / medical / wedding) |

---

## 🚀 기술 하이라이트

### 1. 낙관적 동시성 제어 (Optimistic Concurrency)
- `expectedUpdatedAt` 기반 버전 비교 → `STALE_VERSION` RPC 응답
- 4초 자동 저장 + `beforeunload` 가드 + 충돌 모달의 **다층 방어**

→ 자동 저장 환경에서 발생하는 **last-write-wins 데이터 손실** 방지

### 2. 2-Phase Commit 자산 업로드
- `init → upload → confirm` 3단계 + 일일 cron cleanup
- `claim_cleanup_task` RPC로 분산 잠금

→ **클라이언트 직접 업로드**(대역폭↓) + **스토리지/DB 정합성** 동시 확보

### 3. Clean Architecture (DI without Framework)
- Domain 레이어 외부 의존성 **0개**
- 팩토리 함수 기반 요청별 DI (싱글턴 함정 회피)

→ 인메모리 fake로 **단위 테스트 가능**, 인프라 교체 시 Data 레이어만 수정

### 4. 플러그형 테마 시스템
- `src/themes/<key>/` 디렉터리만 추가하면 자동 등록 (`pnpm generate:themes`)
- 섹션 컴포넌트가 `dataSchema` 로 자기 스키마 선언 → 에디터가 동적으로 폼 생성
- `pnpm template:sync` 가 코드의 프리셋을 DB 로 단방향 반영 (코드 = 단일 진실)

→ 새 템플릿 추가 시 **코어 코드 수정 0줄**, 디자이너/개발자 분업 가능

### 5. `array` 필드로 반복 섹션 편집
- 메뉴/팀원/FAQ 같은 N개 항목을 시각적으로 추가·정렬·삭제
- `dataSchema` 차원에서 동적 검증 + 자동 저장과 충돌 모달까지 그대로 통합

→ 단순 텍스트 편집을 넘어선 **실제 콘텐츠 운영 수준**의 편집기

---

## 📌 운영

- 실제 도메인으로 운영 중 (Vercel)
- **무료 인프라 한도 내 설계** — Supabase Free + Vercel Hobby 제약 반영 (Cron 1일 1회 등)
- 사용자별 스토리지/DB 비용 추적 가능한 데이터 모델

---

> 📄 상세 문서: [PORTFOLIO_ENTRY.md](./PORTFOLIO_ENTRY.md)
