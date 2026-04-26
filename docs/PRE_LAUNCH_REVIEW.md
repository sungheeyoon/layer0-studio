# Pre-Launch Review — Layer0 Studio

_검토일: 2026-04-25 / 브랜치: `main` / 배포 URL: https://layer0-studio-cms.vercel.app_

**상태:** P0·P1·P2 모든 코드 항목 ✅ — 운영 배포 완료. 잔여 항목은 §5 체크리스트의 디자인 의존 항목(`/legal/*`)뿐.

---

## 0. 이전 리뷰 반영 현황

| 항목 | 상태 |
|---|---|
| 에디터 라우트 `/editor` → `/dashboard/editor` 통일 (6개소) | ✅ 완료 |
| 템플릿 생성 후 리다이렉트(`templates/actions.ts`) | ✅ 완료 |
| 템플릿 그리드 `Select` 이동 경로 `/dashboard/projects/create` | ✅ 완료 |
| `ContactSection.tsx` → `'use client'` 추가 (서버 렌더 크래시 해소) | ✅ 완료 |

아래는 위 수정 이후 **남아 있는** 이슈입니다.

---

## 1. P0 — 출시 전 반드시 처리

### 1.1 `NEXT_PUBLIC_SITE_URL` 미설정 시 localhost로 새는 SEO ✅ 완료

- `next.config.ts`: production 빌드 시 미설정이면 `throw Error`로 빌드 차단
- `CLAUDE.md` / `README.md`: 필수 env 목록에 추가 및 주의문 병기
- 잔여 조치: **Vercel 프로젝트 환경변수에 `NEXT_PUBLIC_SITE_URL=https://<실도메인>` 등록** (배포 전 수동)

### 1.2 CRON_SECRET 환경변수 미문서화 + `Bearer undefined` 취약점 ✅ 완료

- `src/app/api/cron/cleanup-assets/route.ts`: 미설정 시 500 반환 가드 추가
- `CLAUDE.md` / `README.md`: 필수 env 목록에 추가
- 잔여 조치: **Vercel 환경변수에 `CRON_SECRET` 등록** (배포 전 수동)

### 1.3 README 마이그레이션 경로 오기재 ✅ 완료

`scripts/` → `docs/migrations/` 정정 반영.

### 1.4 Signup 후 재로그인 요구 + 에러코드 그대로 노출 ✅ 완료

- 에러코드 → 한국어 메시지 맵핑 (`ERROR_MESSAGES` 상수) 추가
- 가입 성공 시 이메일 확인 안내 화면(`ACCOUNT_CREATED`) 표시 후 로그인 버튼으로 이동
- `console.log('회원가입 성공', result.user)` 제거

---

## 2. P1 — 품질/UX, 출시 직후 패치 가능

### 2.1 Projects 페이지 "View" 버튼이 draft 사이트에서 dead UI ✅ 완료

`src/app/dashboard/projects/ProjectsClient.tsx:156-172`

```tsx
{isPublished && site.domain ? (
  <a href={`/site/${site.domain}`} ...>View</a>
) : (
  <button disabled>View</button>
)}
```

도메인 설정 안 된 상태에서 **draft 미리보기 경로가 없음**. `/preview/${site.id}` 로 떨어뜨리면 의도 명확.

### 2.2 템플릿 Preview 윈도우를 `window.open` 으로 여는데 팝업 차단에 취약 ✅ 완료

`src/components/templates/DynamicTemplateGrid.tsx:48`, `PublicTemplateGrid.tsx:33`

```ts
window.open(`/preview/${templateId}`, '_blank');
```

버튼 클릭 핸들러 안에서 호출되므로 대개 차단되지 않지만, 모바일 브라우저/일부 iOS Safari에서 조용히 막힘. `<a target="_blank" rel="noopener">`로 래핑하는 쪽이 안전.

### 2.3 `CreateProjectClient` 에러 UI가 `alert()` ✅ 완료

`src/app/dashboard/projects/create/CreateProjectClient.tsx:18, 25, 28`

```ts
alert('Please enter a site name.');
```

다른 화면은 전부 인라인 에러 박스를 쓰는데 이 페이지만 alert. 출시 전 톤 통일.

### 2.4 Footer의 Privacy / Terms가 링크가 아님 ✅ 완료

`src/themes/corporate/sections/FooterSection.tsx:48-51`

```tsx
<span className="... cursor-pointer ...">Privacy</span>
<span className="... cursor-pointer ...">Terms</span>
```

`cursor-pointer`는 있고 핸들러는 없음. 사용자가 클릭하면 아무 반응 없음 → 사이트 신뢰도 손상. 임시로라도 `/legal/privacy` 플레이스홀더 페이지 연결.

### 2.5 에러 바운더리 메시지 leak 가능성 ✅ 완료

`src/app/error.tsx:20`

```tsx
{error.message || 'An unexpected error occurred.'}
```

Next.js는 서버 컴포넌트 에러는 prod에서 message를 마스킹하지만, 클라이언트 사이드에서 raw 예외를 던지면 내부 메시지/스택이 그대로 노출될 수 있음. 운영에서는 `error.digest`만 보여주고 고정 문구로 교체 권장.

### 2.6 편집 중 deep clone 비용 ✅ 완료

`src/components/editor/DynamicEditor.tsx:84`

```ts
const updated = JSON.parse(JSON.stringify(prev)) as TemplateJson;
```

매 키스트로크마다 전체 `TemplateJson` 직렬/역직렬화. MVP 스케일에선 체감 어려우나 섹션/페이지가 늘어나면 입력 지연의 원인이 됨. `structuredClone` 또는 불변성 라이브러리(immer)로 점진 교체.

### 2.7 Publish rate limit이 마지막 publish 기준 ✅ 완료

`src/app/dashboard/editor/actions.ts:93-100`

```ts
const existing = await createGetUserSiteUseCase(supabase).execute(siteId);
if (existing?.publishedAt) {
  const elapsed = (Date.now() - new Date(existing.publishedAt).getTime()) / 1000;
  if (elapsed < 30) return { error: 'RATE_LIMITED' };
}
```

최초 발행 이후에만 작동. 반복 "처음 발행"을 여러 사이트에서 연속으로 때리는 시나리오는 막히지 않음. 운영 트래픽 초기에만 의미 있는 구멍이지만, 차후 상위 레벨 사용자별 레이트 리밋으로 일원화 필요.

---

## 3. P2 — 정리/거버넌스

### 3.1 `next.config.ts`가 빈 객체 ✅ 완료

`next.config.ts`

```ts
const nextConfig: NextConfig = { /* config options here */ };
```

현재는 모든 이미지를 `<img>` 태그로 렌더하므로 무해하지만, 향후 `next/image` 전환 시 Supabase CDN / Unsplash 도메인을 `images.remotePatterns`에 등록해야 함. 지금은 문제 없음 — 추후 과제 메모.

### 3.2 Sitemap 품질 ✅ 완료

`src/app/sitemap.ts:18-20`

```ts
.eq('status', 'active')
.not('domain', 'is', null);
```

- `lastModified` 에 `updated_at` → `published_at` 순으로 fallback 하는데, 발행 후 수정만 한 경우(드래프트) `status: 'active'` 유지 + `updated_at` 갱신 → 실제 공개 버전과 sitemap lastmod가 어긋날 수 있음. 정확도 높이려면 `published_at` 기준이 맞음.
- 전체 로우를 제한 없이 조회 → 사이트 10만 개 넘어가기 전에 페이지네이션/분할 sitemap 필요.

### 3.3 `loadSiteAction`이 Unauthorized/Not Found를 동일하게 `null`로 반환 ✅ 완료

`src/app/dashboard/editor/actions.ts:17-33`

타인 사이트 ID를 URL에 넣으면 "Site not found"로 표시 → 존재 여부를 분별할 수 있는 채널은 없어서 실질적 leak은 아니지만, 로그/계측 측면에서 FORBIDDEN과 NOT_FOUND는 구분하는 게 건전.

### 3.4 Admin 클라이언트가 sitemap에서 service_role 키 사용 ✅ 완료

`src/app/sitemap.ts:15` → `createAdminClient()`

공개 조회(published only)라 굳이 service_role 키를 쓸 필요 없음. 일반 anon 클라이언트로 교체하면 키 노출 표면이 한 칸 줄어듦 (서버 사이드지만 원칙상 최소 권한).

### 3.5 중복된 `updateSiteDomainAction` 선언 ✅ 완료

- `src/app/dashboard/editor/actions.ts:119`
- `src/app/admin/actions.ts:85` (admin 버전)

동일 이름으로 서로 다른 권한 체크 로직. admin 쪽을 `adminUpdateSiteDomainAction` 등으로 리네임하면 import 실수 시 권한 혼동을 막을 수 있음.

### 3.6 `templateSnapshot` 활용 미비 ✅ 완료

`src/domain/entities/user-site.entity.ts:12`

```ts
templateSnapshot: TemplateJson;
```

템플릿 버전 고정을 위한 필드로 보이나, 현재 편집/발행 흐름에서 참조 지점이 명확하지 않음. 로드맵에 두지 않을 거라면 제거, 유지한다면 언제 스냅샷을 갱신하는지 주석화.

---

## 4. 보안 체크리스트 — 통과

| 항목 | 상태 | 비고 |
|---|---|---|
| Admin 권한 체크 (`app_metadata.role === 'admin'`) | ✅ | `app_metadata`는 클라이언트가 수정 불가 |
| Middleware로 세션 리프레시 | ✅ | `src/middleware.ts` |
| 에셋 버킷 MIME/Size bucket-level 제약 | ✅ | `009_storage_bucket_hardening.sql` |
| `template-thumbnails` 업로드 admin 제한 | ✅ | 009 마이그레이션에서 강화 |
| Cron 엔드포인트 Bearer 시크릿 | ✅ | 1.2의 env 누락만 보완하면 OK |
| Server Action CSRF (Next.js 기본) | ✅ | Origin 검증 자동 |
| Domain slug validation + 예약어 차단 | ✅ | `validateDomainSlug` + `RESERVED_DOMAINS` |
| Asset 소유권 검증 (uploadPath에 user_id 포함) | ✅ | `${user.id}/${asset.id}/${filename}` |

---

## 5. 출시 전 체크리스트

- [x] Vercel 환경변수 등록: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, **`NEXT_PUBLIC_SITE_URL`**, **`CRON_SECRET`**
- [x] 마이그레이션 001–009 모두 운영 Supabase에 적용되었는지 확인
- [x] `user_assets` / `template-thumbnails` 버킷 생성 및 RLS 정책 반영
- [x] Signup 에러 메시지 한국어화 및 이메일 확인 안내 UI 추가
- [x] README / CLAUDE.md env 목록 및 migration 경로 수정
- [ ] `/legal/privacy`, `/legal/terms` 플레이스홀더 페이지 연결 (P1 2.4)

---

## 6. 배포 직후 모니터링 대상

1. `/api/cron/cleanup-assets` 로그 — 10분 간격 실패/재시도 추이
2. 퍼블리시 후 `/site/[domain]` SSR 타임, 메타태그 canonical 값
3. 이메일 회원가입 → 로그인 전환율 (1.4의 UX 갭 반영)
4. 에디터 편집 중 콘솔 에러 (특히 다른 테마 추가 시 2.6의 deep clone 성능)

---

_다음 리뷰 권장 시점: P0 항목 처리 후 / 첫 외부 사용자 유입 1주 후._
