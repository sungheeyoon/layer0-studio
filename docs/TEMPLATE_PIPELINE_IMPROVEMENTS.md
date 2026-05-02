# Template Pipeline — 남은 작업

_최초 작성: 2026-05-02 / 컴팩트화: 2026-05-02_
_상태: Phase 1~4 완료, Phase 5 진행 중, Phase 6 미착수_

> Phase 1~4의 구현 세부와 시드 워크플로우 가이드는 `docs/TEMPLATE_AUTHORING_GUIDE.md`로 이전됨. 이 문서는 **남은 작업과 Phase 6 (Composition 모델) 설계**만 다룬다.

---

## 1. 완료 요약 (Phase 1~4)

| Phase | 결과물 | 커밋 |
|---|---|---|
| 1 | `TemplatePreset` 타입, 7테마 preset, `validateTemplateJson` (10규칙), codegen `_generated.ts`, `predev`/`prebuild` 훅 | `b11bfb2` |
| 2 | `pnpm template:sync` (default dry-run, `--apply`), `/api/admin/template-sync`, `template_sync_audit` 테이블 (마이그레이션 011) | `24fba85` |
| 3 | `pnpm template:capture` (Playwright + sharp + pixelmatch), `thumbnail.config.ts`, `preview://` 스킴, `/preview/preset/[...key]` 라우트, sync→Storage 자동 업로드 | `e35963b` |
| 4 | `registry.ts` 자동화, 어드민 2단계 sync UI, `code`/`manual` 배지, preset row read-only, super-admin (`canPublishTemplates`) 게이트 | `34617e2` |

---

## 2. Phase 5 — 잔여 정리

### 2.1 가이드/UX

- [x] `TEMPLATE_AUTHORING_GUIDE.md` 새 흐름 반영 완료
- [ ] `--apply` 단독 사용 시 5초 카운트다운 + 변경 row 수 표시 (CI는 `--apply --yes`로 우회) — 안전장치
- [ ] `pnpm template:capture --check` 모드 (변경 없이 해시 검증, CI용)
- [ ] HTML→preset scaffold (`pnpm template:scaffold <key> --from templates-ui/<key>.html`) — 1차 PR 외 PoC

### 2.2 `section.order` 처리
현재 validate가 warn만 출력. Phase 6 composition 모델로 가면 자동 해소되므로, **Phase 6 도입 시 schema에서 즉시 제거**(별도 정리 안 함). Phase 6 미착수 동안은 warn 유지.

---

## 3. Phase 6 — Composition 모델 전환 (가장 큰 작업, 5~8일)

### 3.1 문제 재진술

현재 `slots.ts`가 "테마 = 고정 슬롯 배열"을 강제 → 같은 cafe 안에서도 구조가 다른 템플릿(cafe-modern, cafe-cozy, cafe-minimal)을 표현 못함. 새 테마로 우회하면 컴포넌트 폭발.

### 3.2 새 정의

| 개념 | 새 정의 |
|---|---|
| **Theme** | 시각 톤(컬러/폰트/여백) + **재사용 가능한 섹션 컴포넌트 라이브러리** |
| **Section Component** | 자기 메타(label/category/dataSchema)를 export하는 self-describing 컴포넌트 |
| **Preset** | 라이브러리에서 골라 배열한 **composition** + 각 슬라이스 데이터 + 토큰 오버라이드 |

`slots.ts`의 고정 배열·`required` 플래그는 사라짐. **렌더 순서·종류·필수 여부는 모두 preset이 결정.**

### 3.3 디렉터리 (revised)

```
src/themes/cafe/
├── tokens.ts              # globalStyles 시드 + 시각 토큰
├── library/
│   ├── index.ts           # componentKey → 컴포넌트 매핑
│   ├── HeroVideo.tsx      # componentKey='hero-video', dataSchema 동봉
│   ├── HeroImage.tsx
│   ├── MenuList.tsx
│   ├── MenuGrid.tsx
│   └── ...
├── presets/
│   ├── modern.preset.ts   # composition: [hero-video, menu-grid, reservation]
│   ├── cozy.preset.ts     # composition: [hero-image, story, menu-list, gallery]
│   └── minimal.preset.ts
├── thumbnail.config.ts
└── index.tsx              # 얇아짐: 라이브러리·토큰만 묶어 export
```

### 3.4 인터페이스

```ts
export interface TemplatePreset {
  slug: string;
  globalStyles?: Partial<GlobalStyles>;     // 토큰 오버라이드
  composition: PresetSection[];              // ★ 자유 composition
  thumbnailPath: string;
  version: string;
  defaults: { name: string; description: string; category: string };
}

export interface PresetSection {
  id: string;                                // 사용자 사이트에서도 보존되는 안정 ID
  componentKey: string;                      // theme.library에 존재해야 함
  visible?: boolean;
  data: Record<string, TemplateField>;       // dataSchema 만족 필요
}

interface PageJson {
  id: string;
  slug: string;
  title: string;
  composition: PresetSection[];              // pages[].sections → composition
}

// 컴포넌트가 자기 메타 동봉:
HeroVideo.meta = {
  componentKey: 'hero-video',
  category: 'hero',
  label: 'Hero (Video Background)',
  dataSchema: { /* 필드별 type/required/label */ },
  previewImage: '/component-previews/cafe/hero-video.webp',
};
```

### 3.5 Renderer 변경

```ts
// Before
slots.map((slot) => sections.find((s) => s.type === slot.type))

// After
page.composition.map((section) => {
  const Component = theme.library[section.componentKey];
  return <Component key={section.id} data={section.data} />;
});
```

부수 효과: `section.order` gotcha 자동 해소 (배열 순서가 곧 렌더 순서).

### 3.6 Validate 보강

기존 §2.4 1~2번이 교체됨:
1. `themeKey`가 `_generated.ts`에 존재
2. 각 `composition[i].componentKey`가 그 `theme.library`에 존재
2-bis. `composition[i].data`가 컴포넌트의 `dataSchema` 만족 (required 누락 = error, 미지의 키 = warn, 타입 mismatch)

`section.order` 필드는 schema에서 즉시 제거.

### 3.7 점진 마이그레이션

| 서브-Phase | 작업 | 추정 |
|---|---|---|
| **6a — 어댑터** | `SectionComponent.meta`/`SectionDataSchema` 타입 신설. `library/` 어댑터: 기존 `slots.ts` + `sectionComponentMap`을 자동으로 라이브러리 형태로 감쌈. Renderer를 composition-walking으로 교체. preset의 `composition`은 `defaultTemplateJson.pages[].sections`로부터 자동 변환. | 1~2일 |
| **6b — 라이브러리 확장** | cafe 한 테마에서 동일 카테고리에 variant 컴포넌트 2~3개 추가 (`HeroVideo`/`HeroImage`/`HeroSplit`). 각 컴포넌트에 `meta` 동봉. 어드민 카탈로그에 composition 다이어그램. | 2~3일 |
| **6c — preset 분화** | cafe에 새 preset 2개 (`cafe-modern`, `cafe-cozy`) — composition이 서로 다른 것을 시연. DX·검증 비용 검증. | 1~2일 |
| **6d — 정리** | `slots.ts` 완전 제거, 어댑터 삭제, `section.order` 필드 제거 + DB JSONB 정리 마이그레이션. 기존 6테마 라이브러리 확장은 후속 PR. | 1일 |

기존 사용자 사이트 데이터는 어댑터가 `section.type` → `componentKey`로 1:1 매핑하여 무손실 호환.

### 3.8 트레이드오프

- ✅ 같은 theme 안에서 구조 자유도 무한
- ✅ 컴포넌트 재사용 극대화 (cafe·restaurant·hotel이 같은 `HeroVideo` 공유 가능)
- ✅ 사용자 에디터에서 섹션 추가/순서 변경 가능성 열림
- ⚠️ Theme 폴더가 두꺼워짐
- ⚠️ 각 컴포넌트 `dataSchema` 작성 비용 (단, 이건 *어차피* 어딘가에 정의해야 할 정보)
- ⚠️ 마이그레이션 비용 (Phase 6a~d, 각 1~2일)

---

## 4. 비-목표 (이번 리팩터에서 안 함)

- 시각적 WYSIWYG preset 빌더 (Figma-like) — 코드-PR 워크플로우가 의도된 게이트
- 다중 페이지(`pages.length > 1`) 공개 사이트 네비게이션 — 별도 이슈
- 사용자별 커스텀 테마 업로드 — 보안·격리 비용 큼
- **크로스-테마 섹션 공유** (`src/sections/` 공용 풀) — Phase 6 정착 후 별도 RFC
- **사용자 에디터에서 섹션 추가/삭제·순서 변경** — Phase 6 데이터 모델로 가능해지지만 UX·검증 추가 비용. 1차는 preset 구조 고정.

---

## 5. 한 줄 요약

> Phase 1~4로 **"코드가 진실, sync로 DB 반영"** 파이프라인 완성. 남은 건 Phase 5 잔여 정리(버그 2건 + UX 안전장치)와 Phase 6 composition 모델로 **"같은 테마 = 다양한 구조"** 해방.
