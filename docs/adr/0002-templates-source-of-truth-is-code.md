# 템플릿의 Source of Truth 는 코드 (AI 저작 workflow 전제)

> **Status: Accepted — 구현 완료.** `scripts/sync-templates.ts` (`pnpm template:sync`) + codegen 레지스트리 `src/templates/_generated.ts`.
>
> **용어 note:** 이 결정은 "AI 가 Template 을 저작한다"는 전제 위에 있다. 작성 당시 그 저작기를 `Generate`(`pnpm template:generate`) 라는 **CLI 파이프라인**으로 구상했으나 그 형태로는 구현되지 않았고, 실제 저작기는 `new-template` **스킬**이다(`.claude/skills/new-template/`). 결정의 근거와 내용은 그대로 유효하다 — 저작기가 CLI 든 스킬이든 산출물이 *코드 파일* 이라는 점이 이 ADR 의 전제이기 때문이다.

**AI 가 Template 을 저작한다**는 전제로 설계했기 때문에, Template 의 Source of Truth 는 DB 가 아니라 **코드** 로 유지한다. `pnpm template:sync` 가 코드의 Preset 을 읽어 DB 의 `templates` 행을 upsert 하며, `content`(구 `template_json`, migration 021) / `thumbnail_url` / `version` 은 항상 코드값으로 덮어쓴다. admin 이 DB 에서 편집 가능한 필드는 `name` / `description` / `category` / `status` 뿐이며, 이 필드들은 sync 가 보존한다. admin UI 에서 sync 로 시드된 row 의 JSON 직접 편집은 차단되어 있다.

## Consequences

- AI 저작기가 새 Template 을 만들어도 결과물은 *코드 파일* 로 떨어지고, 이후 코드 리뷰 → 머지 → 배포 → `Sync` 를 거쳐야 카탈로그에 진입한다([ADR-0012](./0012-template-publishing-pipeline.md)). DB 가 권위 source 라면 저작기가 production 데이터에 직접 쓰는 빠른 경로가 가능했겠지만, 그 경로를 의도적으로 닫았다.
- "코드와 DB 가 다른데 어디가 맞나" 라는 질문의 답은 항상 **코드**.
- 사용자 사이트 (`user_sites`) 는 정반대 — DB 가 권위 source. 이 ADR 은 *Template* 에만 적용된다.
