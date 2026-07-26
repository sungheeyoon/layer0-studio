# 게시된 Site 는 서브도메인(`<slug>.layer0.studio`)에서 read-only public origin 으로 서빙한다

> **Status: Accepted — 미구현** (2026-07-26 확인). 결정만 존재하고 코드는 없다 — `src/middleware.ts` 에 host 분기·internal rewrite 가 **없으며**, 공개 Site 는 여전히 경로 기반 `/site/<slug>` 로 서빙된다. 아래 본문은 **구현할 때 따를 설계**이지 현재 동작의 설명이 아니다.
>
> 원 결정: 공개 Site 서빙을 경로 기반(`layer0.studio/site/<slug>`)에서 **서브도메인 기반**(`<slug>.layer0.studio`)으로 전환한다. `/site/[domain]` 라우트 핸들러는 그대로 재사용하되, 미들웨어 host 분기 + internal rewrite 를 그 앞단에 둔다.

## 맥락

현재 게시된 Site 는 `layer0.studio/site/<slug>` 경로로 서빙된다(`src/app/site/[domain]/[[...slug]]/page.tsx`). `user_sites.domain` 은 단일 슬러그 필드이고(3~50자, `a-z0-9-`, `RESERVED_DOMAINS` 차단), DB 에 unique 제약(002)·부분 unique 인덱스(004)·공개 RLS(`status='active' AND domain IS NOT NULL`)가 이미 존재한다.

"사용자 Site 의 소유권"을 URL 표현으로 강화하기 위해 **서브도메인**으로 전환한다. 서브도메인은 "수정 가능한 공간"이 아니라 **배포된 결과물의 read-only public origin** 이다 — 편집은 오직 대시보드(apex)에서, 로그인 세션도 apex 에만 존재한다.

## 결정

### 1. 서브도메인 = read-only public origin, apex = 편집/세션

- 게시 Site 는 `<slug>.layer0.studio` 에서 서빙. 서브도메인은 sessionless.
- **세션 쿠키는 host-only 로 유지한다(현행).** Supabase 쿠키는 `domain` 옵션 없이 설정되어 `layer0.studio` host-only 이므로 `<slug>.layer0.studio` 로 전송되지 않는다. **쿠키를 `domain=.layer0.studio` 로 절대 바꾸지 않는 것**이 이 격리의 불변식이다 — 바꾸는 순간 사용자 Site origin 으로 대시보드 세션이 누출된다.

### 2. 미들웨어 host 분기 + internal rewrite (라우트 핸들러 재사용)

- **apex/www/localhost** → 기존 `updateSession` 실행. 단 **apex 의 `/site/*` 외부 직접 접근은 404**(내부 rewrite 전용 경로이지 공개 진입점이 아님).
- **서브도메인**(`<label>.${ROOT_DOMAIN}`) → `updateSession` 을 **건너뛰고**(read-only origin, 세션 호출 0회), `/<path>` → `/site/<label>/<path>` 로 `NextResponse.rewrite`. URL 은 바뀌지 않으므로 리다이렉트 루프 없음.
- **서브도메인 요청 필터**: `/api`, `/_next`, `/dashboard`, `/admin`, `/login`, `/preview` 등 플랫폼 경로 → **404**(읽기전용 origin 에 이런 경로는 없다). 실제 페이지 경로만 rewrite. `_next/static`·`_next/image`·이미지·`favicon.ico` 는 기존 matcher 가 미들웨어에서 제외하므로 그대로 통과.

### 3. 헤더 폐기 — 공개 라우트는 "서브도메인 전용" 단일 의미

rewrite 후 `[domain]` 파라미터가 곧 label 이므로, 서빙 모드를 알리는 헤더 주입은 불필요하다.

- **`basePath = ''` 무조건** (root-relative 네비 — 서브도메인이 곧 origin).
- canonical/OG `url` origin = `https://${domain}.${ROOT_DOMAIN}` (params 에서 구성).
- 공개 라우트(`/site/[domain]`)는 오직 서브도메인 rewrite 로만 도달한다(apex 직접 접근은 404). 따라서 이중 모드·이중 basePath 가 사라지고 의미가 하나로 고정된다.

### 4. publish 는 서브도메인을 요구한다

"배포된 결과물엔 주소가 있다"는 모델과 일치시키기 위해, **publish 시 `domain` 미설정이면 `DOMAIN_REQUIRED` 로 차단**한다. 도메인 없는 active(공개 불가) 상태를 허용하지 않는다.

### 5. 링크/URL 중앙화

- 사용자용 "View Site" 링크는 `publicSiteUrl(domain, slug?)` → `https://${domain}.${ROOT_DOMAIN}/...` **단일 헬퍼**로 모은다(`DashboardClient`/`DomainsClient`/`ProjectsClient`/`DynamicEditor`).
- **`revalidatePath('/site/${domain}')` 는 내부 경로 그대로 유지**한다 — rewrite 후 실제 캐시되는 경로이므로 서브도메인 URL 로 바꾸면 안 된다. (사용자-facing href ↔ 내부 캐시 경로의 구분)

### 6. 레이어 배치

- **host → label 추출**은 `src/lib/subdomain.ts` 의 **순수 함수** `subdomainFor(host, rootDomain)` 에 둔다. `rootDomain` 을 인자로 주입받아 함수 자체는 env 를 읽지 않으므로 vitest 단위 테스트가 가능하다. env(`NEXT_PUBLIC_ROOT_DOMAIN`) 읽기는 미들웨어/호출부에서만.
- **label 규칙·예약어**는 도메인 엔티티(`validateDomainSlug`)에 그대로 둔다 — 순수 비즈니스 규칙이다.
- 미들웨어는 순수 함수 + env 를 조합만 하는 얇은 층으로 유지(테스트 대상 아님).

## 대안 검토

- **(b) `/site/[domain]` 경로 폐기 후 서브도메인 전용 라우트 신설** — 기존 SEO/preview/내부 링크·캐시 경로가 전부 깨진다. internal rewrite 로 핸들러를 재사용하면 변경 표면이 미들웨어 + 링크 헬퍼로 국한되므로 기각.
- **(c) `x-site-subdomain` 헤더로 이중 모드(apex 직접 렌더 + 서브도메인) 유지** — apex `/site/*` 를 살려두려는 목적이었으나, 공개 origin 을 서브도메인으로 단일화하면 불필요한 분기·캐시키 혼동만 남는다. 로컬 디버깅도 `<label>.localhost:3000` 으로 가능하므로 기각.
- **(d) 서브도메인별 sitemap/robots** — no-user 단계에서 과한 복잡도. 중앙 단일 sitemap(URL 만 서브도메인 origin)으로 충분.

## Consequences

- **인프라**: Vercel DNS 에 `*.layer0.studio` 와일드카드 도메인 등록(네임서버가 Vercel 이라 와일드카드 SSL 자동 발급). `NEXT_PUBLIC_ROOT_DOMAIN` 신규 env(dev `localhost:3000` / prod `layer0.studio`, 클라이언트 사용으로 `NEXT_PUBLIC_` 필수). `www → apex` 301 은 Vercel 도메인 설정으로(코드 불필요).
- **Preview 배포(`*.vercel.app`)에서는 서브도메인 동작을 테스트할 수 없다**(host 가 `ROOT_DOMAIN` 과 불일치 → 서브도메인 로직 비활성). 로컬(`*.localhost`)과 prod 에서만 검증. 수용된 트레이드오프.
- **예약어**: `RESERVED_DOMAINS` 를 플랫폼 서브도메인 기준으로 보강(`www, app, api, admin, auth, dashboard, cdn, assets, static, mail, status, blog, docs, help, support` + 기존). 예약 label 은 write-time 에 차단되고, 미설정 상태 접근 시 `findByDomain` null → 404.
- **SEO**: 중앙 단일 sitemap 유지(항목 URL 만 서브도메인 origin), Search Console 은 `layer0.studio` **Domain 속성**으로 등록(모든 서브도메인 포함). 서브도메인 `/robots.txt` 는 404(전체 허용) — 색인은 `page.tsx` 의 `robots` 메타로 페이지 단위 제어. `metadataBase` 는 apex 유지, 페이지는 절대 URL 기조.
- **DB 변경 없음** — `domain` unique 제약·부분 인덱스·공개 RLS 가 이미 존재. 마이그레이션 불필요.
- **마이그레이션/301 불필요** — 사용자·색인 이력이 없는 greenfield. 트래픽이 쌓이면 apex `/site/*` → 서브도메인 301 을 재검토.

## 관련

- CLAUDE.md "Supabase clients" / 미들웨어 서술 — 쿠키 host-only 불변식과 일치.
- `docs/migrations/004_public_site_rendering.sql` — `domain` unique 인덱스 + 공개 RLS(본 결정이 재사용).
- [ADR-0007](./0007-single-multi-site-type-structural-union.md) — `basePath` 기반 Multi 네비 projection(`deriveNav`)이 본 결정에서 `basePath=''` 로 동작.
