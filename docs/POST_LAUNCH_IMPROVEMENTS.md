# Post-Launch Improvements — Layer0 Studio

_작성일: 2026-04-25 / 최근 갱신: 2026-04-26 (P3 3.2 / 3.3 코어 완료 · `010_optimistic_concurrency.sql` prod 적용) / 브랜치: `main` / 운영: https://layer0-studio.vercel.app_

`PRE_LAUNCH_REVIEW.md` 의 P0~P2, 본 문서 이전판 P1 1.1~1.8, P1 후속 1.1~1.3, P2 2.1~2.6 모두 종결(2026-04-26). 2026-04-26 재오픈된 P2 2.4 (DynamicEditor 영문 ternary)도 동일자 재종결. P3 3.2 (auto-save 코어) / 3.3 (낙관적 동시성 RPC + `010_optimistic_concurrency.sql` prod 적용) 도 동일자 완료 — debounce 4s auto-save / `beforeunload` 가드 / `expectedUpdatedAt` 비교 / Conflict 모달 동작 확인. 본 문서는 코어 완료 후 남은 잔존 race 항목과 P3 잔여 작업만 유지합니다.

> 우선순위 기준
> - **P3**: 아키텍처·테스트·확장성. 별도 스프린트.

---

## 3. P3 — 아키텍처 / 확장성

### 3.2 Editor 저장 race — 잔존 single-flight 미적용

`src/components/editor/DynamicEditor.tsx`

Auto-save (debounce 4s) / `beforeunload` 가드 / Conflict 모달은 적용 완료. 다음 잔존 리스크 처리 필요:

1. **In-flight save 와 수동 Save Draft 간 single-flight 미보장** — `handleSave` (`DynamicEditor.tsx:171`) 가 `clearTimeout` 만 호출하고 이미 dispatch 되어 비행 중인 auto-save 는 못 막음. 두 요청이 같은 `expectedUpdatedAt` 으로 동시에 비행하면 늦게 도착한 쪽이 STALE_VERSION false-positive 로 잘못된 충돌 모달을 띄움. **조치**: `isSavingRef` 플래그 또는 in-flight Promise 직렬화로 동시 1개만 비행하도록 보장.

2. **Conflict 모달 "Keep Editing" 후 stuck 상태** — `knownUpdatedAtRef` 가 stale 인 채로 남아 이후 모든 저장이 STALE_VERSION 반환. 사용자는 reload 외 탈출 불가. **조치**: Keep Editing 선택 시 Save 버튼 disable + 상단 banner 지속 표시, 또는 force-save (expectedUpdatedAt 무시) 옵션 제공.

3. **(경미) `handleSave` 진행 중 `autoSaveStatus='saving'` 미설정** — 버튼 텍스트만 변하고 상태 인디케이터는 직전 값 유지. UX 일관성 차원의 소소한 정리.

---

### 3.3 Save RPC 응답에 updated_at 미포함 — post-RPC SELECT race

`src/data/repositories/supabase-user-site.repository.impl.ts:152-179`

`save_site_template_with_lock` RPC 는 `'OK'` / `'STALE_VERSION'` TEXT 만 반환하고, 새 `updated_at` 은 직후 별도 SELECT 로 가져옴. RPC 와 SELECT 사이에 다른 탭이 또 저장하면 SELECT 가 더 새로운 `updated_at` 을 반환 → 클라이언트 `knownUpdatedAtRef` 가 본인 저장 시점이 아닌 다른 탭 시점으로 동기화 → 그 다음 저장이 충돌 감지 없이 OK 처리되며 다른 탭 변경을 덮어쓰는 작은 race window.

**조치**: RPC 시그니처를 `RETURNS TEXT` 대신 JSON 또는 OUT 파라미터로 변경하여 새 `updated_at` 을 함께 반환. 후속 마이그레이션 `011_save_rpc_return_updated_at.sql` 로 분리.

---

### 3.4 `templateSnapshot` 컬럼이 dead weight

매 사이트 생성 시 `template_snapshot` 을 DB 에 저장(`SupabaseUserSiteRepoImpl::create`)하지만 사용 지점 0. DB 저장량만 증가.

**조치**: 6개월 내 활용 계획 없으면 컬럼 자체 제거 마이그레이션. 활용 계획 있으면 갱신 정책(템플릿 업그레이드 시 갱신 vs 영원히 동결) 결정.

---

### 3.5 Asset 업로드 race window — storage-only orphan

업로드 흐름:
1. `initUploadAction` → DB `pending` 레코드 생성
2. 클라이언트가 Supabase Storage 직접 업로드
3. `confirmUploadAction` → DB `active` 전환

현재 흐름은 안전 (init 이 항상 먼저). 하지만 `user_assets` 버킷 정책이 admin-only 외 케이스가 추가되면 storage-prefix 스캔 cron 추가 검토.

---

### 3.6 Sitemap 페이지네이션 부재

`src/app/sitemap.ts:22` — `LIMIT 500`. 운영 사이트가 500개를 넘기면 나머지는 sitemap 누락 → SEO 손실. Next.js `MetadataRoute.Sitemap` 분할 / sitemap-index 패턴 도입은 트래픽이 그 규모에 가까워지면 검토.

---

### 3.7 Publish rate limit 이 user 전체에 글로벌

`src/app/dashboard/editor/actions.ts` `publishSiteAction`

```ts
.eq('user_id', user.id)
.not('published_at', 'is', null)
.order('published_at', { ascending: false })
.limit(1)
```

사용자가 사이트 3개 운영 시 사이트 A 발행 직후 사이트 B 발행은 30초 대기. 의도라면 OK, 사이트별 rate limit 이 의도라면 `eq('site_id', siteId)` 도 함께 검사. 결정 로그 부재 → 명시 필요.

---

### 3.8 Theme 변경 흐름 미정의

`src/themes/registry.ts` 는 다중 테마 등록 가능하지만, 사이트 생성 후 `themeKey` 변경 UI 없음. 향후 테마 추가 시(현재 `corporate` 1종) 사용자가 갈아탈 수 있는 흐름 필요. 단순 `themeKey` 교체만 하면 섹션 ID 매핑 깨질 수 있어 마이그레이션 정책 함께 설계.

---

### 3.9 홈 "Use This Template" CTA 가 카탈로그로 우회

`src/app/page.tsx` (Templates You Can Start With 섹션, "Corporate Layout" 카드)

현재 카드 CTA 는 단일 하드코딩 카드인데도 `/templates` 카탈로그로 보냄(임시 연결, 2026-04-27). 의도는 카드에 표시된 그 템플릿으로 바로 `/dashboard/projects/create?templateId=<id>` 로 직진하는 것. 

**조치**: 시드된 "Corporate" 템플릿 ID 확정 후 직결로 교체, 또는 카드 자체를 DB 의 "featured" 템플릿 1건을 fetch 해서 동적 렌더로 전환. 코드에 `TODO(post-launch)` 주석 마킹됨.

### 3.10 Footer Security / Status 링크 비활성

`src/components/Footer.tsx` — 대상 페이지 부재로 비활성 (`<span aria-disabled>`). 정책 결정 후 (a) 페이지 신설 / (b) 외부 status page 연동 / (c) 영구 제거 중 택1.

---

### 3.11 Admin 템플릿 썸네일 업로드 — 1MB 초과 시 "Uploading..." 영구 고정

`src/app/admin/templates/TemplateEditorPanel.tsx:138-150` / `src/app/admin/templates/actions.ts:27-49`

`uploadThumbnailAction` 이 Server Action 이라 Next.js 기본 본문 한도(`serverActions.bodySizeLimit`, 1MB) 에 걸림. 1MB 초과 이미지 업로드 시 프레임워크가 reject → `await uploadThumbnailAction(fd)` 가 throw → `setIsUploading(false)` 가 영영 호출되지 않아 "Uploading..." 오버레이가 박제됨. 클라이언트에 try/catch 도 사이즈 사전 검증도 없음.

**조치 (셋 중 택1 또는 조합)**:
- (a) `next.config.ts` 에 `experimental.serverActions.bodySizeLimit: '10mb'` 설정 — 가장 간단, but Server Action 일반 한도가 같이 풀림
- (b) `user_assets` 흐름처럼 **브라우저 → Supabase Storage 직접 업로드** 로 전환 — Server Action 우회, 정석. `template-thumbnails` 버킷에 admin-only INSERT 정책은 이미 있음(009 마이그레이션)
- (c) 클라이언트에 사이즈 사전 검증 + try/catch/finally 로 `setIsUploading(false)` 보장 — 최소한의 UX 픽스

권장: (c) 즉시 + (b) 차후. (a) 는 권장하지 않음(다른 Server Action 까지 한도 풀림).

---

## 4. 다음 리뷰 권장 시점

- **P2 정합성 패치 완료**: P2 전 항목 종결.
- **P3 3.2 / 3.3 코어 완료** (2026-04-26): auto-save + 낙관적 동시성 적용. 잔존 race 항목(3.2 single-flight, 3.3 RPC updated_at 반환)은 위 섹션 참조 — 첫 외부 사용자 동시 편집 시점에 즉시 체감되므로 다음 스프린트 우선 처리 권장.
