# `canPublishTemplates` capability — admin role 과 분리

> **Status: Accepted — 구현 완료.** `canPublishTemplates` 가 admin Template 관리(`src/app/admin/templates/`)의 라이브 status 토글을 게이팅한다.

> **스코프 업데이트 ([ADR-0012](./0012-template-publishing-pipeline.md), 2026-06-28):** 이 권한이 막는 **대상**이 바뀐다. 등록이 배포 후 CI 로 자동화되면서 `Sync(Apply)` 게이트는 사라지고(비상용으로만 축소), `canPublishTemplates` 는 **운영 중 라이브 status 토글(공개/내림/보관 = takedown·재공개)** 을 막는다. 분리 원칙 자체(admin role 과 별개)는 그대로 유지되며, 막는 행위가 "기계적 등록"에서 "의미 있는 라이브 공개"로 옮겨가 분리의 명분이 오히려 강해진다.

Template publish 권한 (`app_metadata.canPublishTemplates`) 은 admin role 과 **분리되어** 있다. 즉 `app_metadata.role === 'admin'` 이라고 자동으로 `Sync` 권한을 갖지 않는다.

**운영 권한** (사용자 사이트 관리, suspend, 사용자 지원 등) 과 **production-level template publication 권한** (카탈로그에 새 Template 을 노출하는 행위 — 코드 PR 의 효과와 동등) 을 구분하기 위한 결정. 일반 운영자가 사이트 모더레이션을 하다가 실수로 카탈로그에 미완성 Template 을 publish 하는 사고를 막는다.

## Naming caveat

`canPublishTemplates` 라는 이름은 이 분리 이전에 정해졌다. User 의 사이트 **Publish** 와 의미 충돌이 있지만 (한쪽은 카탈로그 발행, 한쪽은 사이트 공개) 코드 호환성 때문에 그대로 둔다 — CONTEXT.md "Flagged ambiguities" 의 publish overload 항목 참고.
