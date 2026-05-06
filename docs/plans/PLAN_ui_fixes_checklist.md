---
title: UI 문제 해결 체크리스트
status: in-progress
last-updated: 2026-05-05
owner: layer0-studio
---

# UI 문제 해결 체크리스트

이 문서는 현재 식별된 4가지 UI 문제를 절차적으로 해결하기 위한 워크리스트다.
각 항목은 **진단 → 원인 → 해결방안(체크박스) → 검증** 순서로 구성되어 있다.
한 항목씩 위에서 아래로 처리하고, 완료된 체크박스는 `[x]`로 갱신할 것.

---

## 1. 에디터 라이브 프리뷰 — `position: fixed` 누출 ✅ 해결됨

스크롤 래퍼에 `transform-gpu` 추가 + `p-6` 을 한 단계 상위 `<section>` 으로 이동, 2줄 수정으로 `position: fixed` 누출 격리 완료 (`fix/editor-fixed-navbar-containment` → main 머지).

---

## 2. 로그인 입력 폼 — 좌우 패딩 부재로 글자 밀착 ✅ 해결됨

인풋에 `px-2`, 라벨에 `pl-2`, status dot 을 `right-2` 로 이동; `/signup`, `/forgot-password`, `/update-password` 동일 패턴 일괄 적용 완료 (`fix/login-input-padding` → main 머지).

---

## 3. 에디터 라이브 프리뷰가 좁다 — 대시보드 사이드바 중복 ✅ 해결됨

Route Groups (`(authenticated)`, `(with-sidebar)`) 를 활용해 대시보드 레이아웃을 분리하고 에디터에서 사이드바를 제거함 (`fix/editor-workspace-layout` → main 머지).

### 규칙 준수 결과
- `editor/` 는 sidebar를 절대 import하지 않음: **준수**
- `dashboard/layout.tsx` 인증 가드 삭제 → `(authenticated)/layout.tsx` 로 단일화: **준수**
- `editor/page.tsx` 내부 padding: `p-4` → `p-0`, `h-[calc(100vh-124px)]` → `h-full`: **준수**
- `actions.ts` 는 이동 금지 (import 경로 깨짐 방지): **준수** (단, dashboard 폴더 전체 이동에 따른 하위 import 경로는 일괄 업데이트함)

---

## 4. `/dashboard/templates` 썸네일 잘림 — `/templates` 와 비율 불일치

> 증상: 공개 페이지 `/templates` 에서는 썸네일이 비율 맞게 보이는데, `/dashboard/templates` 에서는 썸네일이 위·아래 또는 좌·우가 잘려 보인다.

### 진단
- [ ] `src/components/templates/PublicTemplateGrid.tsx:95` — 썸네일 컨테이너 `aspect-video` (= 16:9 = 16/9)
- [ ] `src/components/templates/DynamicTemplateGrid.tsx:128` — 썸네일 컨테이너 `aspect-[16/10]` (= 16:10)
- [ ] 양쪽 모두 `<img className="... object-cover ...">` 사용 → *컨테이너 비율* 에 맞춰 이미지가 잘림
- [ ] 썸네일 캡처 스크립트: `pnpm template:capture` (Playwright) — 캡처 해상도 확인 필요 (`scripts/template-capture*.ts` 위치할 것으로 추정)

### 원인
1. 두 그리드의 컨테이너 종횡비가 **다르다** (`16/9` vs `16/10`).
2. 캡처된 썸네일 원본은 한 가지 해상도(추정 16:9)인데 `/dashboard/templates` 는 16:10 컨테이너에 `object-cover` 로 채우므로 *위/아래가 잘림*.
3. `/templates` 는 캡처 비율과 컨테이너 비율이 일치 → 잘림 없음.

### 해결방안

**전략: 그리드 컨테이너 비율을 캡처 원본 비율과 일치시킨다. 양쪽 그리드 모두 `aspect-video` 로 정렬.**

- [ ] 캡처 스크립트가 사용하는 viewport/스크린샷 해상도 확인 (`scripts/` 또는 `pnpm template:capture` 정의)
  - [ ] 만약 캡처가 1280×720 (16:9) → 그리드를 16:9로 통일
  - [ ] 만약 캡처가 1280×800 (16:10) → 그리드를 16:10으로 통일
  - [ ] 만약 임의의 해상도 → 캡처 스크립트를 16:9로 *고정* 한 뒤 재생성
- [ ] `DynamicTemplateGrid.tsx:128` 의 `aspect-[16/10]` 을 `aspect-video` 로 변경 (캡처 기준이 16:9 일 경우)
- [ ] `PublicTemplateGrid.tsx:95` 는 그대로 유지 (이미 일치)
- [ ] 썸네일 누락 시 placeholder div(line 104, 137) 의 비율도 동일한 컨테이너를 그대로 쓰므로 자동 일치
- [ ] `<img>` 는 그대로 `object-cover` 유지 (의도적인 cover 의도 — 비율이 맞으면 잘림 없음)
- [ ] 만약 *모든 잘림을 완전히 막고 싶다* 면 `object-contain bg-neutral-100` 으로 전환하는 옵션도 메모. 단 컨테이너에 빈 여백이 생기므로 디자인 영향 큼 → 기본은 위 비율 일치 방식 채택.

### 검증
- [ ] `/templates` 와 `/dashboard/templates` 양쪽에서 동일 템플릿이 동일하게 잘리지 않고 보이는지 좌우 비교
- [ ] 7개 테마(`corporate, cafe, fitness, interior, legal, medical, wedding`) 썸네일 모두 위·아래 잘림 없이 1차 hero 영역까지 노출되는지 확인
- [ ] 모바일 뷰포트(좁은 컬럼)에서도 비율이 유지되는지 확인 (Tailwind `aspect-video` 는 반응형으로 동작 — 별도 미디어쿼리 불필요)
- [ ] 신규 캡처 시 `pnpm template:capture` 결과 해상도가 의도한 비율과 일치하는지 한 번 더 검증

---

## 작업 순서 권고

1. ✅ **#1 fixed navbar 격리** — 완료
2. ✅ **#2 로그인 패딩** — 완료
3. **#4 썸네일 비율** ← 다음 (한 줄 수정, 회귀 위험 적음)
4. **#3 에디터 분리** (route group 변경 — URL 유지, actions.ts 이동 없음, 인증 가드 회귀 위험 있으므로 마지막)

각 항목은 *별도 브랜치 / 별도 PR* 로 분리해 회귀 시 bisect 가 쉽도록 한다.
