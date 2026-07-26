# 포트폴리오 다이어그램

노션/PDF 포트폴리오에 삽입하는 설계 다이어그램. **원본은 `mmd/`, 산출물은 `png/` (3x)** 입니다. SVG는 만들지도 커밋하지도 않습니다 — 이유는 아래 "왜 PNG인가".

| 파일 | 들어가는 위치 | 캡션 |
|---|---|---|
| `1-architecture.png` | 아키텍처 | 요청마다 DI Factory가 Use Case를 조립합니다. **읽기 경로는 Template Registry를 참조하지 않습니다.** |
| `2-template-pipeline.png` | 프로젝트 소개 | 디렉터리 추가만으로 등록되고, 검증을 통과한 코드만 카탈로그에 반영됩니다. |
| `3-write-queue-before.png` | 핵심 개선 ① | **개선 전** — 화면 이탈은 저장 경로에 연결조차 되어 있지 않았습니다. |
| `4-write-queue-after.png` | 핵심 개선 ① | **개선 후** — 저장 진입점 4개가 하나의 큐를 통과합니다. |
| `5-delete-pipeline.png` | 핵심 개선 ② | 되돌릴 수 없는 지점은 하나뿐이고, 이후 단계는 어디서 멈춰도 워커가 이어받습니다. |
| `6-ai-guard.png` | **미사용(보류)** | 비결정적 생성물을 5개의 결정론적 게이트로 통과시킵니다. 강점을 3개로 축소하면서 본문에서 뺐습니다. |

본문은 [`../layer0-studio.md`](../layer0-studio.md) 입니다.

3번과 4번은 **반드시 위아래로 나란히** 배치하세요. 개선 후 그림만 보면 "큐를 썼구나"로 끝나지만, 개선 전 그림이 함께 있어야 붉은 박스 2개가 문제를 대신 설명합니다.

## 왜 PNG인가

Mermaid 는 벡터라 보통은 SVG 가 유리합니다. 여기서는 아닙니다. **SVG 를 내보낼지가 `htmlLabels` 설정을 결정하고, 그게 한글 렌더링 품질을 결정하기 때문입니다.** 둘은 독립 선택이 아닙니다.

- SVG 를 내보내려면 `htmlLabels: false` 가 강제됩니다. 기본값인 `foreignObject`(SVG 안의 HTML)는 유효한 XML 이 아니라 대부분의 SVG→PDF 변환기가 글자를 통째로 날립니다.
- 그런데 `htmlLabels: false` 에서는 mermaid 가 글자 폭을 자체 계산하는데 **한글을 반각으로 셉니다.** 라벨이 박스 테두리를 넘칩니다. (`(Template CSS 11개)` 가 실제로 잘렸습니다.)
- `htmlLabels: true` 면 브라우저가 레이아웃하므로 한글 폭이 정확합니다. 대신 산출물은 래스터여야 합니다.

여기에 폰트 문제가 더해집니다. mermaid SVG 는 폰트를 **임베딩하지 않고 이름으로 참조**하며, 일러스트레이터처럼 텍스트를 아웃라인으로 변환하는 단계도 없습니다. 즉 Pretendard 가 없는 수신자 환경에서는 서체가 명조 등으로 갈립니다(레이아웃은 버팁니다 — `htmlLabels: false` 가 단어별 좌표를 고정해서). 포트폴리오는 남의 노트북에서 PDF 로 열립니다.

**PNG 3x 로 구우면 셋 다 사라집니다.** 한글 폭 정확, 서체 고정, 변환기 무관. 3x면 전폭 다이어그램이 3000px 근처라 PDF 확대·인쇄에도 충분합니다.

> 노션에서 화면으로만 볼 거라면 노션 네이티브 `/mermaid` 코드 블록이 더 낫습니다(다크모드·무손실 확대 자동). 다만 다이어그램이 레포가 아니라 노션에 살게 됩니다.

## 다시 만들려면

소스는 mermaid 입니다. `mmd/` 를 고친 뒤:

```bash
node render.mjs   # mmd/ -> png/ (3x)
```

미리보기만 할 거면 [mermaid.live](https://mermaid.live) 에 붙여넣어도 됩니다. 단 거기는 `htmlLabels` 기본값이라 실제 산출물과 폭이 다르게 보입니다.

### 사전 준비 — mermaid 설치가 까다롭습니다

`node_modules/mermaid` 가 이 폴더에 있어야 합니다. **이 폴더에서 `npm i` 는 실패합니다** — 상위의 pnpm 워크스페이스를 타고 올라가 `Cannot read properties of null` 로 죽습니다. `pnpm add mermaid@11 --ignore-workspace` 도 안 됩니다. 루트 `package.json` 에 의존성을 추가해 버립니다. 루트에 잠깐 설치한 뒤 번들만 여기로 복사하고 루트를 되돌리세요:

```bash
cd ../../..                                  # repo root
pnpm add mermaid@11 --ignore-workspace
mkdir -p docs/portfolio/diagrams/node_modules/mermaid/dist
cp -r node_modules/mermaid/dist/. docs/portfolio/diagrams/node_modules/mermaid/dist/
git checkout package.json pnpm-lock.yaml     # 루트 오염 되돌리기
```

`node_modules/` 는 `.gitignore` 로 막아뒀습니다. 레포 루트의 `.gitignore` 는 `/node_modules` 로 앵커되어 있어서 이 중첩 폴더(82MB)를 안 막습니다.
