# Layer0 Studio

템플릿을 골라 콘텐츠를 바꾸고, 원하는 주소로 게시할 수 있는 노코드 웹사이트 빌더입니다.

[Layer0 Studio 바로가기](https://layer0-studio.vercel.app)

카페, 병원, 학원, 웨딩 등 업종별 템플릿에서 시작합니다. 텍스트와 이미지, 색상, 메뉴 구성을 편집한 뒤 `/site/<주소>` 형태의 공개 사이트로 게시할 수 있습니다. 한 화면으로 이어지는 사이트와 여러 페이지로 나뉜 사이트를 모두 지원합니다.

## 사용 흐름

1. 템플릿을 선택해 내 사이트를 만듭니다.
2. 에디터에서 콘텐츠, 메뉴, 디자인을 수정하고 미리보기로 결과를 확인합니다.
3. 작업을 이어갈 필요가 있으면 **임시 저장**합니다.
4. 방문자에게 보여줄 준비가 끝나면 **변경 사항 게시**를 누릅니다.

자동저장은 사용하지 않습니다. 임시 저장은 사용자의 작업본만 갱신하고, 게시해야 공개 사이트가 바뀝니다. 다시 에디터를 열면 저장해 둔 작업을 이어서 편집하거나 현재 공개된 내용으로 되돌릴 수 있습니다. 대시보드의 미리보기도 공개본이 아닌 저장된 작업본을 보여줍니다.

이 저장 방식은 [ADR-0017](docs/adr/0017-explicit-save-and-draft-published-split.md)에 정리되어 있습니다.

## 주요 기능

- 업종별 템플릿 카탈로그와 템플릿 미리보기
- 텍스트, 이미지, 색상, 글꼴 크기 편집
- 블록 순서와 노출 여부, 메뉴 위치 변경
- 단일 페이지와 다중 페이지 사이트 지원
- 작업본과 공개본을 분리한 저장·게시 방식
- 사이트 주소와 게시 상태를 관리하는 대시보드
- 한국어·영어 UI, 다크 모드
- 회원가입, 로그인, 비밀번호 재설정, 계정 삭제

## 기술 구성

Next.js 16 App Router와 TypeScript를 사용하며, 인증·데이터베이스·파일 저장소는 Supabase에서 처리합니다. UI는 Tailwind CSS v4와 Radix UI를 기반으로 만들고 Vercel에 배포합니다.

```text
src/app/         페이지, 라우트, Server Action
src/components/  Studio UI와 에디터 컴포넌트
src/domain/      엔티티, 유스케이스, 저장소 인터페이스
src/data/        Supabase 저장소 구현
src/lib/di/      요청별 의존성 조립
src/templates/   템플릿별 콘텐츠 모델과 렌더러
```

도메인 로직은 Supabase 구현을 직접 알지 않으며, 각 요청에서 필요한 저장소와 유스케이스를 조립합니다. 화면마다 필요한 데이터도 따로 읽습니다. 대시보드 목록은 이름·주소·상태 같은 요약 정보만 가져오고, 에디터는 작업본을, 공개 페이지는 공개본만 가져옵니다. 존재하지 않는 공개 주소와 미리보기 경로는 HTTP 404를 반환합니다.

읽기와 쓰기 경로를 나눈 배경은 [ADR-0008](docs/adr/0008-keep-explicit-di-factories.md), 프로젝트에서 사용하는 용어와 데이터 관계는 [CONTEXT.md](CONTEXT.md)에서 확인할 수 있습니다.

## 로컬 실행

Node.js 20.9 이상과 pnpm 11.9.0이 필요합니다.

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 됩니다.

`.env.local`에는 다음 값을 설정해야 합니다.

| 변수 | 용도 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저와 서버에서 사용하는 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 관리자 작업용 서버 키 |
| `NEXT_PUBLIC_SITE_URL` | 사이트 기준 URL. 로컬에서는 `http://localhost:3000` |
| `CRON_SECRET` | 이미지 정리 API 인증 토큰 |
| `TEMPLATE_SYNC_SECRET` | 배포 후 템플릿 동기화 API 인증 토큰 |

`UNSPLASH_ACCESS_KEY`와 `PEXELS_API_KEY`는 `pnpm template:image`를 사용할 때만 필요합니다. `SUPABASE_SERVICE_ROLE_KEY`는 브라우저에 노출하면 안 됩니다.

Supabase 스키마는 개발 서버를 실행한다고 자동으로 만들어지지 않습니다. 새 프로젝트를 연결할 때는 [docs/migrations](docs/migrations)의 번호 순서와 함께 제공되는 실행 절차를 확인하세요. 이미 운영 중인 환경에는 아직 적용하지 않은 마이그레이션만 적용해야 합니다.

## 확인 명령어

```bash
pnpm tsc --noEmit
pnpm lint
pnpm test
pnpm template:verify:ci
pnpm schema:manifest:check
pnpm build
```

초기 페이지의 에셋 구성이 다시 무거워지지 않았는지는 개발 서버를 띄운 상태에서 `pnpm performance:verify http://127.0.0.1:3000/`로 확인할 수 있습니다. 기존 측정 결과는 [Lighthouse 검증 기록](artifacts/lighthouse-2026-08-11/SUMMARY.md)에 남겨 두었습니다.

## 템플릿 작업

각 템플릿은 `src/templates/<카테고리>/<이름>/` 아래에 렌더러, 디자인 토큰, 기본 콘텐츠를 함께 둡니다. 템플릿끼리 컴포넌트를 공유하지 않아 한 템플릿의 수정이 다른 템플릿의 모양을 바꾸지 않도록 했습니다.

템플릿의 기준은 데이터베이스가 아니라 코드입니다. `pnpm template:sync`는 변경 내용을 먼저 미리보기만 하며, 실제 반영이 필요할 때 `--apply` 옵션을 사용합니다. 새 템플릿을 만들거나 기존 템플릿의 데이터 구조를 바꾸기 전에는 [템플릿 시스템 문서](docs/TEMPLATE_SYSTEM.md)를 먼저 확인하세요.

## 문서

- [CONTEXT.md](CONTEXT.md): 프로젝트 용어와 데이터 관계
- [템플릿 시스템](docs/TEMPLATE_SYSTEM.md): 템플릿 제작, 검증, 동기화 절차
- [디자인 시스템](docs/DESIGN_SYSTEM.md): Studio UI의 토큰과 컴포넌트 규칙
- [ADR](docs/adr): 주요 기술 결정과 변경 배경
- [마이그레이션](docs/migrations): 데이터베이스 변경 이력과 실행 절차

## 라이선스

이 저장소는 포트폴리오 공개용이며 별도 라이선스를 부여하지 않습니다. 코드는 열람할 수 있지만 복제, 재배포, 상업적 사용은 허용하지 않습니다.
