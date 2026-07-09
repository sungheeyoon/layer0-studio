-- ============================================
-- Layer0 Studio: section JSONB 키 rename  data → fields
-- ADR-0013. 코드의 Section.data → Section.fields 리네임을 저장 데이터에 정합.
--
-- 대상 JSONB 컬럼 (migration 021 이후 이름):
--   templates.content
--   user_sites.content
--   user_sites.snapshot
--
-- 각 컬럼의 모든 Section 객체에서 최상위 키 `data` → `fields` 로 rename.
-- union 형태 모두 처리:
--   single: content.sections[]
--   multi : content.shared.header[], content.shared.footer[], content.pages[].sections[]
--
-- ⚠️ 파괴적. Section.fields 를 기대하는 코드 배포와 coordinated deploy (021 이후).
--    array Field 의 items 등 하위 구조는 건드리지 않는다(키 rename은 section 레벨만).
-- 멱등: `data` 키가 있을 때만 rename → 재실행/부분적용에 안전.
-- ============================================

BEGIN;

-- 섹션 배열의 각 원소에서 data → fields 로 rename (data 있을 때만).
CREATE OR REPLACE FUNCTION pg_temp._rename_sections(arr JSONB)
RETURNS JSONB LANGUAGE sql IMMUTABLE AS $$
  SELECT COALESCE(
    jsonb_agg(
      CASE WHEN s ? 'data'
        THEN (s - 'data') || jsonb_build_object('fields', s->'data')
        ELSE s
      END
    ),
    '[]'::jsonb
  )
  FROM jsonb_array_elements(arr) AS s
$$;

-- 하나의 content 문서(single/multi)를 mode 에 따라 변환.
CREATE OR REPLACE FUNCTION pg_temp._migrate_content(doc JSONB)
RETURNS JSONB LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  result JSONB := doc;
BEGIN
  IF doc->>'mode' = 'single' THEN
    result := jsonb_set(result, '{sections}', pg_temp._rename_sections(doc->'sections'));
  ELSIF doc->>'mode' = 'multi' THEN
    result := jsonb_set(result, '{shared,header}', pg_temp._rename_sections(doc#>'{shared,header}'));
    result := jsonb_set(result, '{shared,footer}', pg_temp._rename_sections(doc#>'{shared,footer}'));
    result := jsonb_set(
      result, '{pages}',
      (
        SELECT COALESCE(
          jsonb_agg(jsonb_set(page, '{sections}', pg_temp._rename_sections(page->'sections'))),
          '[]'::jsonb
        )
        FROM jsonb_array_elements(doc->'pages') AS page
      )
    );
  END IF;
  RETURN result;
END;
$$;

UPDATE templates  SET content  = pg_temp._migrate_content(content);
UPDATE user_sites SET content  = pg_temp._migrate_content(content);
UPDATE user_sites SET snapshot = pg_temp._migrate_content(snapshot);

COMMIT;

-- 검증 (실행 후 0 이어야 함 — 어떤 section 에도 'data' 키가 남지 않음):
--
--   SELECT count(*) FROM (
--     SELECT jsonb_path_query(content, '$.**.data') FROM templates
--     UNION ALL
--     SELECT jsonb_path_query(content, '$.**.data') FROM user_sites
--     UNION ALL
--     SELECT jsonb_path_query(snapshot, '$.**.data') FROM user_sites
--   ) q;
--
-- (주의: array Field 의 편집용 item 키에 우연히 'data' 라는 필드명이 있으면
--  위 `$.**.data` 가 잡을 수 있으나, 그것은 사용자 필드이지 section.data 가 아니다.
--  section 레벨만 보려면 mode 별 경로로 좁혀 확인.)
