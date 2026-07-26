# 저장은 optimistic concurrency RPC 로만 수행

> **Status: Accepted — 구현 완료** (migration 010).
>
> **→ 위협 모델은 [ADR-0015](./0015-edit-loss-paths-exhaustive-defense.md) 에서 확장되었다.** 이 결정 자체는 유효하나, 여기서 막는 것은 편집 손실의 **한 갈래(탭 간 silent overwrite)** 뿐이다. 화면 이탈·무한 디바운스·검증 함정문·**탭 내** 자기 충돌은 0015 가 다룬다. 이 문서만 읽고 "편집 손실은 해결되었다"고 결론내면 안 된다.

모든 site 저장은 `save_site_template_with_lock` RPC (migration 010) 를 통해서만 수행된다. 요청은 `expectedUpdatedAt` 값을 포함해야 하며, 현재 DB 상태와 다를 경우 RPC 가 `'STALE_VERSION'` 을 반환한다 — 에디터는 이 신호를 받아 **Conflict modal** 을 띄운다. 이는 multi-tab / multi-device 환경에서 발생할 수 있는 **silent overwrite** (다른 탭의 변경분이 조용히 사라지는 데이터 손실) 를 방지하기 위한 설계이다.

## Warning for future contributors

새 저장 경로 (예: 새 종류의 자동 생성, 백그라운드 정리 작업, 마이그 스크립트) 를 추가할 때 이 RPC 를 **우회하지 말 것**. 단순 `update` 로 바이패스하면 다른 탭에서 작성 중인 변경분이 조용히 사라지고, 그 사실을 사용자가 알아채는 데에 보통 며칠이 걸린다 (= 가장 무서운 잠재 버그). 새 저장 경로는 반드시 `expectedUpdatedAt` 을 받아 RPC 로 흘려야 한다.
