# 게시된 Site의 서브도메인 서빙을 무기한 보류한다

> **Status: Deferred indefinitely** (2026-08-11). 공개 Site는 현재와 같이 `/site/<slug>` 경로에서 서빙한다. `<slug>.layer0.studio` 서브도메인 서빙은 활성 로드맵과 구현 범위에서 제외한다.

## 맥락

2026-07-21에는 공개 Site를 `<slug>.layer0.studio`의 read-only origin으로 분리하는 방안을 채택했다. 기존 `/site/[domain]` 렌더러 앞에 host 기반 internal rewrite를 두고, 사용자-facing 링크와 sitemap도 서브도메인 origin으로 전환하는 설계였다.

그러나 이 설계는 커스텀 루트 도메인, 와일드카드 DNS/SSL, 운영 환경 변수 설정을 먼저 요구한다. Vercel preview의 `*.vercel.app` origin에서는 실제 host 분기를 검증할 수도 없다. 현재의 `/site/<slug>` 경로가 공개 서빙 요구를 충족하는 상황에서 이 인프라와 검증 제약을 감수할 제품상 필요가 확정되지 않았다.

관련 구현은 `main`에 병합되지 않았다. draft PR #78의 단일 커밋에서만 시도되었으며, 이 결정과 함께 PR과 구현 브랜치를 닫는다.

## 현재 결정

- 공개 Site의 정식 URL은 `/site/<slug>`다.
- `user_sites.domain`은 hostname이나 custom domain이 아니라 공개 경로에 쓰는 slug를 저장하는 레거시 이름이다.
- middleware에 host 분기나 서브도메인 internal rewrite를 추가하지 않는다.
- `NEXT_PUBLIC_ROOT_DOMAIN`, Vercel wildcard domain, 서브도메인별 sitemap/robots 전략을 도입하지 않는다.
- dashboard session과 공개 Site를 별도 origin으로 분리하는 설계를 현재 아키텍처의 불변식으로 취급하지 않는다.

## 재검토 조건

다음 조건이 모두 구체화되면 새 ADR과 새 이슈로 다시 결정한다. 이 문서의 과거 구현안을 그대로 재개하지 않는다.

- path 기반 URL로 해결되지 않는 명확한 사용자 또는 제품 요구가 있다.
- production custom root domain과 wildcard DNS/SSL의 운영 주체가 정해졌다.
- preview를 포함해 host routing, 세션 격리, canonical URL을 검증할 방법이 있다.
- 당시의 Next.js, Vercel, 인증 및 캐시 동작을 기준으로 설계를 다시 검토했다.

## 정리된 작업

- #72 — Vercel wildcard domain 및 root-domain 환경 변수
- #73 — middleware host 분기와 internal rewrite
- #74 — 사용자-facing Site 링크의 서브도메인 전환
- #75 — 서브도메인 필수 publish 정책과 예약 label 확장
- #76 — sitemap URL의 서브도메인 전환
- #78 — #73 구현 draft PR (미병합)
