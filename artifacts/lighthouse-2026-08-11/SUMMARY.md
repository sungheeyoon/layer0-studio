# Layer0 Studio Lighthouse 검증 — 2026-08-11

## 결론

포트폴리오의 성능 수치는 **Lighthouse Mobile 72 → 97**로 표기할 수 있습니다. 다만 이 결과는 범용 벤치마크나 실제 사용자 지표가 아니라, **최적화 전·직후의 보존된 프로덕션 배포를 동일한 Lighthouse 조건으로 비교한 결과**입니다.

- Before: 72 / 68 / 74 → 중앙값 **72**
- After: 98 / 81 / 97 → 중앙값 **97**
- LCP 중앙값: **13.068초 → 2.574초**
- 초기 stylesheet 요청: **13개 → 1개**
- Pretendard 요청 리소스: **2,061,242 → 232,628 bytes**

기존 `55 → 90`과 `FCP 13.3초 → 2.3초`는 당시 원본 리포트·버전·전체 조건이 남아 있지 않고 이번 동일 조건 측정으로 재현되지 않았습니다. 성능 개선 자체는 재현됐지만, 포트폴리오에는 이번에 검증된 `72 → 97`과 `LCP 13.1초 → 2.6초`를 사용합니다.

## 비교 대상

| 상태 | Commit | Vercel deployment | 상태 |
|---|---|---|---|
| Before | `6c05bc6` | `dpl_4QZYPE4mySwn1qMogkk4uYAMKZhv` | Production · READY |
| After | `c16de48` | `dpl_28AsPKSZo9xqvAKZNcZuzzMCKLvu` | Production · READY |

두 URL은 GitHub commit status와 Vercel deployment 기록을 통해 커밋에 연결했습니다. 모든 실행에서 요청 URL과 최종 표시 URL이 해당 immutable deployment URL과 일치했습니다.

## 고정 조건

- 측정일: 2026-08-11 KST
- Lighthouse: 13.4.1
- Chrome: 142.0.0.0, headless
- Category: Performance only
- Form factor: Mobile
- Viewport: 412 × 823, DPR 1.75
- Throttling: simulated, RTT 150 ms, throughput 1,638.4 Kbps, CPU slowdown 4×
- 표본: 대상별 독립 실행 3회
- 실행 무결성: 6회 모두 runtime error 0, warning 0

## 원시 결과

| 상태 | Run | Performance | FCP | LCP | Speed Index | TBT | CLS | TTI |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Before | 1 | 72 | 2.106 s | 13.340 s | 3.569 s | 15 ms | 0 | 13.355 s |
| Before | 2 | 68 | 1.826 s | 13.068 s | 6.106 s | 9 ms | 0 | 13.083 s |
| Before | 3 | 74 | 1.839 s | 12.810 s | 1.871 s | 6.5 ms | 0 | 12.826 s |
| **Before** | **Median** | **72** | **1.839 s** | **13.068 s** | **3.569 s** | **9 ms** | **0** | **13.083 s** |
| After | 1 | 98 | 1.524 s | 1.903 s | 3.264 s | 16 ms | 0 | 3.842 s |
| After | 2 | 81 | 2.601 s | 3.999 s | 4.734 s | 7 ms | 0 | 4.036 s |
| After | 3 | 97 | 1.224 s | 2.574 s | 2.302 s | 9.5 ms | 0 | 3.137 s |
| **After** | **Median** | **97** | **1.524 s** | **2.574 s** | **3.264 s** | **9.5 ms** | **0** | **3.842 s** |

After 표본의 98 / 81 / 97 편차 때문에 단일 최고점이 아니라 사전에 정한 3회 중앙값을 사용했습니다.

## 자산 교차검증

원시 JSON 6개의 Lighthouse network records를 같은 방식으로 집계했으며, 전후 각 3회에서 같은 값이 재현됐습니다.

- Before stylesheet 13개: Template CSS 11개와 외부 Pretendard CSS 2개
- After stylesheet 1개
- Before Pretendard 관련 요청 리소스: full WOFF2 2,057,688 bytes + 외부 CSS 3,554 bytes = **2,061,242 bytes**
- After Pretendard subset 요청 리소스 합계: **232,628 bytes**

구현 의도인 Template Registry 의존성 분리와 Pretendard dynamic subset 전환이 실제 네트워크 자산 감소와 같은 방향으로 관찰됐습니다.

## 보안 및 무결성

두 historical deployment는 Vercel Deployment Protection 뒤에 있습니다. 측정을 위해 격리된 Chrome 프로필에 일시적인 Automation Bypass 쿠키를 설정했으며, 랜딩 본문은 사전 로드하지 않았습니다. 모든 임시 bypass는 측정 뒤 폐기했고 최종 개수는 0입니다. 기존 SSO·Git fork protection은 유지됐으며, 저장한 JSON에 bypass secret은 없습니다.

## 포트폴리오 권장 문구

> Lighthouse Mobile **72 → 97**, LCP **13.1초 → 2.6초** — 보존된 최적화 전·직후 프로덕션 배포를 Lighthouse 13.4.1 Mobile의 동일 조건으로 각각 3회 측정한 중앙값. 범용 벤치마크나 실제 사용자 지표가 아님.

## 보존 파일

재검증에 필요한 최소 증빙만 남깁니다.

- `historical/before-6c05bc6/run-1.report.json`
- `historical/before-6c05bc6/run-2.report.json`
- `historical/before-6c05bc6/run-3.report.json`
- `historical/after-c16de48/run-1.report.json`
- `historical/after-c16de48/run-2.report.json`
- `historical/after-c16de48/run-3.report.json`

## SHA-256

```text
be5895879c31e33c049e1ab774e38dae6b6c5123360309ec422db0b3febf2d85  historical/before-6c05bc6/run-1.report.json
5dbb58012d40a4fff40c021112e134e44d09d5fd372a8a9ad10ad4eb1aaadf5a  historical/before-6c05bc6/run-2.report.json
a24451fdb979d4b4d4ebdc89ee63f804fedd149689724dfcca59af63898de784  historical/before-6c05bc6/run-3.report.json
24193d7104ac1e19388d69c8687045400afc65b7b5eaebf96507c5b2a0043c13  historical/after-c16de48/run-1.report.json
1cb5afdd88aabeda6cfa2451118a36d90f0bb02eebd6138cb72c93f17bc05554  historical/after-c16de48/run-2.report.json
e4fac9cd68e677a8f8db9f0338b6917d7a400498834f6d38a40a65626dca52af  historical/after-c16de48/run-3.report.json
```
