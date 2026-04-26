---
name: 대시보드 성능 리뷰
description: 대시보드 탭 이동 체감 지연(~2초) 원인 분석과 단계별 개선 작업
---

# Performance Review — Dashboard Navigation Latency

_작성일: 2026-04-26 / 최근 갱신: 2026-04-26 (P0 A/B/C 완료) / 브랜치: `main` / 운영: https://layer0-studio.vercel.app_

**상태:** P0 완료 — Auth 호출 3→1, DB 호출 1→0 (탭 이동 시), 스켈레톤 5종 추가. P1·P2 대기.

## 1. 문제 정의

대시보드 사이드바에서 탭 이동(Overview ↔ Projects ↔ Domains ↔ Settings)이 체감 ~2초 지연. Templates는 DB에서 카탈로그를 가져오므로 일부 정당하지만, 나머지는 **이미 본 데이터를 매번 다시 받아오는 구조**라 부당하게 느림.

## 2. 근본 원인

### 2.1 `getUser()` 더블/트리플 호출 (가장 큼)

`supabase.auth.getUser()`는 **로컬 쿠키 디코딩이 아니라 Supabase Auth 서버에 JWT 검증 요청을 보냄** (네트워크 왕복 ~150–400ms).

탭 1회 이동 시 호출 순서:

| # | 위치 | 호출 |
|---|---|---|
| 1 | `src/middleware.ts:4` → `updateSession()` | `getUser()` (모든 라우트 공통) |
| 2 | `src/app/dashboard/layout.tsx:8` | `getUser()` (인증 가드) |
| 3 | `src/app/dashboard/{page,projects,domains,settings}/page.tsx` | `getUser()` (또) |
| 4 | 같은 page.tsx | `listSitesUseCase.execute(user.id)` (DB SELECT) |

`createClient()`(`src/utils/supabase/server.ts`)는 호출마다 새 Supabase 클라이언트를 만들고, React `cache()` 디듑이 없어서 layout과 page의 `getUser()`가 **같은 요청 안인데도 합쳐지지 않음**.

### 2.2 같은 데이터의 반복 fetch

세 페이지가 동일한 `listSitesUseCase.execute(user.id)` 호출:
- `dashboard/page.tsx:15` — overview 통계용
- `dashboard/projects/page.tsx:14` — 프로젝트 카드용
- `dashboard/domains/page.tsx:14` — 도메인 편집용

탭만 바꿔도 매번 풀 SELECT. **수정하지 않는 한 다시 가져올 이유 없음**.

### 2.3 캐시/로딩 UX 부재

- `dashboard/projects/`, `dashboard/domains/`, `dashboard/settings/`, `dashboard/templates/` 어느 곳에도 `loading.tsx`가 없음 → RSC 응답이 올 때까지 화면이 멈춰 보임 (체감을 가장 키우는 요소)
- `<Link>`의 자동 prefetch도 **쿠키 의존 dynamic SSR이라 캐시 불가**, 호버 prefetch가 실효 없음
- Vercel 무료 플랜 콜드 스타트(~500ms) 가끔 추가됨

### 2.4 부수 요인

- `material-symbols-outlined` Google Fonts CSS — 렌더 차단 가능성
- Vercel 함수 리전이 Supabase 리전과 다르면 호출당 100–300ms 추가
- `DashboardLayout`의 `animate-pulse`, `grid-blueprint` — 시각적 노이즈(실제 성능 영향 없음)

## 3. 개선 우선순위

### 🔥 P0 — 한 번에 체감 절반 이상 줄어듦 ✅ 완료 (2026-04-26)

**A. 데이터 fetch를 `dashboard/layout.tsx`로 끌어올리기** ✅
Layout에서 user + sites를 한 번만 fetch하고 React Context로 자식 페이지에 전달. Next.js App Router는 sibling 라우트 이동 시 layout을 **재실행하지 않으므로**, 탭 이동 시 DB·Auth 호출이 0회가 됨.

**B. 모든 dashboard 하위 라우트에 `loading.tsx` 추가** ✅
0ms에 스켈레톤 표시 → 체감 지연 제거(실제 시간이 같아도 “멈춘 듯한 느낌” 사라짐).

**C. `getUser()` 중복 제거** ✅
React `cache()` 헬퍼로 요청당 1회만 Supabase에 가도록.

### 🟡 P1 — 추가 개선

**D. Vercel 리전을 Supabase 리전과 매칭**
`vercel.json`에 `"regions": ["icn1"]` 등 추가. 함수 호출당 100–300ms 절약.

**E. mutation 시점에만 `revalidatePath('/dashboard')`**
`updateSiteDomainAction`, `selectTemplateAction`, `deleteUserSiteAction` 등에서 명시적으로 layout 캐시 무효화 → 평소엔 메모리 재사용.

**F. `getUser()` → `getSession()` 검토 (조건부)**
middleware의 `getUser()`만 `getSession()`으로 바꾸면 ~150ms 절약. 단 JWT revocation 즉시 반영 못 함 — 보안 트레이드오프 결정 필요. 페이지의 `getUser()`는 그대로 두고 middleware만 바꾸는 절충안 권장.

### 🟢 P2 — 마이크로 최적화

- `material-symbols` → SVG 인라인 또는 `display=block` swap
- `formatDate` 등 client 연산 → 서버에서 미리 포맷
- Sidebar의 “System Online” 인디케이터 — 시각적 노이즈, 제거 검토

## 4. P0 구현 메모

### 4.1 새로 추가된 파일
- `src/lib/auth/current-user.ts` — `cache()`로 감싼 `getCurrentUser()` / `getCurrentUserSites()` (요청당 1회 보장)
- `src/app/dashboard/DashboardDataProvider.tsx` — 클라이언트 Context provider (`user`, `sites`, `patchSite`, `removeSite`, `setSites`)
- `src/app/dashboard/loading.tsx` (overview)
- `src/app/dashboard/projects/loading.tsx`
- `src/app/dashboard/domains/loading.tsx`
- `src/app/dashboard/settings/loading.tsx`
- `src/app/dashboard/templates/loading.tsx`

### 4.2 변경된 파일
- `src/app/dashboard/layout.tsx` — sites까지 fetch, Provider로 감쌈
- `src/app/dashboard/page.tsx`, `dashboard/projects/page.tsx`, `dashboard/domains/page.tsx`, `dashboard/settings/page.tsx` — 더 이상 `getUser()`/`listSites()` 호출 안 함, 단순히 Client wrapper만 렌더
- `DashboardClient`, `ProjectsClient`, `DomainsClient`, `SettingsClient` — `useDashboardData()` hook으로 context 소비, `initialSites`/`user` prop 제거. mutation은 `patchSite`/`removeSite`로 낙관적 업데이트

### 4.3 mutation 처리 패턴

1. Client가 Server Action 호출
2. 성공 시 즉시 `patchSite(id, patch)` 또는 `removeSite(id)`로 context 낙관적 업데이트 → UI 즉시 반영
3. Server Action이 `revalidatePath('/dashboard/...')` (기존 그대로) → 같은 layout을 공유하므로 layout RSC도 자동 무효화
4. `router.refresh()` 호출 시 layout 재실행 → 새 `initialSites` 도착 → Provider의 `useEffect`가 context를 서버 데이터로 동기화 (낙관적 결과와 일치하므로 깜빡임 없음)

## 4.4 호출 횟수 비교 (탭 1회 이동 기준)

| 항목 | 이전 | 이후 |
|---|---|---|
| Supabase Auth `getUser()` | 3회 (middleware + layout + page) | 1회 (middleware만) |
| `user_sites` SELECT | 1회 (페이지마다) | 0회 (layout 캐시 재사용) |
| 화면 빈 상태 | RSC 응답까지 멈춤 | 즉시 스켈레톤 |

## 5. 측정

작업 전 베이스라인:
1. Vercel Dashboard → Logs → 함수 실행 시간 (탭 이동 1회)
2. Chrome DevTools → Network → Doc 요청 TTFB
3. Lighthouse Performance → LCP

P0 적용 후 일반적으로 TTFB가 **800ms+ → 100–200ms** 수준으로 떨어짐. 적용 후 위 지표 재측정 권장.

## 6. 변경 이력

- 2026-04-26: 초안 작성
- 2026-04-26: P0 A/B/C 구현 완료 (`pnpm tsc --noEmit` / `pnpm lint` 통과)
