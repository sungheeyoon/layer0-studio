# 029 런북 — 작업본/공개본 분리

`029_draft_published_split.sql` 은 **coordinated deploy** 다. 구 코드와 신 스키마는
공존할 수 없다. 아래 순서를 지킨다.

## 왜 공존할 수 없나

| 깨지는 지점 | 구 코드 | 신 스키마 |
|---|---|---|
| 공개 사이트 렌더 | `user_sites` 를 직접 SELECT (`status='active'` RLS 정책에 의존) | 그 정책이 사라짐 → 익명 SELECT 가 0행 |
| 사이트맵 | `user_sites.content` 읽음 | `published_sites.published_content` 로 이동 |
| 저장 RPC | `p_expected_updated_at` 생략 가능 | NULL 거절 (028) |
| 저장 RPC 반환 | `'OK' \| 'STALE_VERSION'` | `'NOT_FOUND'` 추가 |

즉 SQL 을 먼저 적용하면 **구 코드의 공개 사이트가 전부 404** 가 된다. 반대로 코드를
먼저 배포하면 `published_sites` 뷰가 없어 마찬가지로 404 다. 창을 짧게 가져가는 것
외의 방법은 없다(ADR-0007 과 같은 판단 — 초기 규모라 수용).

## 순서

1. **028 을 먼저 적용한다.** 029 는 028 이 만든 함수 본문 위에 얹힌다.
   확인은 `proacl` 을 읽는 게 아니라 롤별로 물어봐야 한다 — `proacl IS NULL`
   자체가 "PUBLIC EXECUTE" 를 뜻하므로 ACL 이 비어 보이는 것은 안전 신호가
   아니라 그 반대다. 기대값 표는 028 헤더에 있다.
   ```sql
   SELECT p.oid::regprocedure AS fn,
          has_function_privilege('anon',          p.oid, 'EXECUTE') AS anon,
          has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated,
          has_function_privilege('service_role',  p.oid, 'EXECUTE') AS service_role
   FROM   pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE  n.nspname = 'public' AND p.prosecdef
   ORDER  BY 1;
   ```

2. **트래픽이 가장 적은 시간대에 029 를 적용한다.** 단일 트랜잭션이며,
   백필은 `user_sites` 전량 UPDATE 한 번 + `asset_usages` INSERT 한 번이다.
   현재 규모에서는 초 단위로 끝난다.

3. **즉시 코드를 배포한다.** (Vercel 프로덕션 배포)

4. **확인**
   ```sql
   -- 게시된 적이 있는 사이트는 전부 공개본을 가져야 한다. missing 은 0 이어야 한다.
   SELECT count(*) FILTER (WHERE status = 'active')                                     AS active,
          count(*) FILTER (WHERE published_at IS NOT NULL AND status <> 'active')       AS taken_down,
          count(*) FILTER (WHERE (status = 'active' OR published_at IS NOT NULL)
                             AND published_content IS NULL)                             AS missing
   FROM public.user_sites;

   -- 공개 참조가 백필됐는지
   SELECT scope, count(*) FROM public.asset_usages GROUP BY scope;

   -- 뷰가 익명에게 열려 있는지 (anon 키로 호출)
   -- curl "$SUPABASE_URL/rest/v1/published_sites?select=domain" -H "apikey: $ANON"
   ```
   그리고 실제 게시된 사이트 URL 을 브라우저로 한 번 연다.

5. **에디터에서 한 바퀴 돈다.** 저장 → 공개 사이트 변화 없음 → 게시 → 반영됨.
   이 세 단계가 이 마이그레이션이 사려던 것 전부다.

## 롤백

3번까지 갔다가 되돌려야 하면, 코드를 이전 배포로 롤백한 뒤 아래를 적용한다.
`published_content` 컬럼과 `asset_usages.scope` 는 **남겨둔다** — 구 코드는 둘 다
읽지 않으므로 무해하고, 지우면 백필을 다시 해야 한다.

```sql
BEGIN;

-- 익명 읽기 정책 복구
DROP VIEW IF EXISTS public.published_sites;
CREATE POLICY "read active published sites"
  ON public.user_sites FOR SELECT
  USING (status = 'active' AND domain IS NOT NULL);

-- 저장 RPC 를 028 상태(스코프 없음)로 되돌린다 —
-- 028_harden_security_definer_rpcs.sql 의 1번 블록을 그대로 다시 실행한다.
-- 단 asset_usages 의 draft/published 행이 이미 공존하므로,
-- 되돌린 함수의 `DELETE ... WHERE site_id = p_site_id` 는 공개본 참조까지 지운다.
-- 롤백 후 첫 저장 전에 아래로 공개 참조를 정리해 상태를 일치시킨다.
DELETE FROM public.asset_usages WHERE scope = 'published';

DROP FUNCTION IF EXISTS public.publish_site_content(UUID, TIMESTAMPTZ);

COMMIT;
```

롤백하면 "저장이 곧 게시"인 원래 동작으로 돌아간다는 점을 인지할 것. 그게 애초에
고치려던 문제다.
