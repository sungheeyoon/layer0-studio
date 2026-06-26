/**
 * Korean message catalog — the **canonical** source of the `Messages` shape.
 *
 * `type Messages = typeof ko` widens string literals to `string`, so en.ts only
 * has to match the *keys* (not the values). Adding a key here without adding it
 * to en.ts is a compile error — that's how "반쪽 번역" is structurally blocked.
 *
 * Keep every value a plain string so the active dictionary stays serializable
 * across the Server→Client boundary (only one locale ships to the client). When
 * interpolation is needed, use a placeholder + a string-format helper rather
 * than a function value (functions can't cross the RSC boundary as props).
 */
export const ko = {
  auth: {
    login: {
      emailLabel: '이메일',
      passwordLabel: '비밀번호',
      submit: '로그인',
      submitting: '인증 중...',
      forgotLink: '비밀번호 찾기',
      signupLink: '가입 요청',
      errorPrefix: '오류',
    },
  },
  landing: {
    common: {
      browseTemplates: '템플릿 둘러보기',
    },
    cta: {
      authed: '대시보드 열기',
      guest: '시작하기',
    },
    hero: {
      titleLine1: '템플릿으로',
      titleEmphasis: '코드 없이',
      titleLine3: '웹사이트를 만드세요.',
      description:
        '템플릿을 고르고, 콘텐츠를 바꾸고, 즉시 배포하세요. 코드 없이 완성도 높은 디지털 경험을 만듭니다.',
    },
    features: {
      layouts: {
        title: '바로 쓰는 레이아웃',
        body: '전문적으로 디자인된 템플릿 중에서 선택하세요. 빈 페이지 대신 탄탄한 기반에서 시작하며, 성능과 SEO에 최적화되어 있습니다.',
      },
      editing: {
        title: '코드 없이 편집',
        body: '텍스트·이미지·스타일을 몇 초 만에 수정하세요. 직관적인 편집 인터페이스로 복잡함 없이 콘텐츠를 완벽하게 제어합니다.',
      },
      publishing: {
        title: '즉시 게시',
        body: '클릭 한 번으로 전 세계에 웹사이트를 배포하세요. 서버 관리도, 복잡한 설정도 없이 빠르고 안정적인 배포만 있습니다.',
      },
    },
    editorPreview: {
      title: '시각적으로 편집하세요.',
      titleEmphasis: '무엇이든 바꾸세요.',
      description:
        '텍스트·이미지·레이아웃을 실시간으로 수정하세요. 복잡한 메뉴나 코딩이 필요 없습니다. 직관적인 에디터로 사이트의 모든 디테일을 직접 제어합니다.',
      experienceLabel: '경험',
      experienceValue: '실시간 편집',
      feedbackLabel: '피드백',
      feedbackValue: '즉시 미리보기',
      step1: '01 템플릿 선택',
      step2: '02 콘텐츠 편집',
      step3: '03 게시하기',
    },
    howItWorks: {
      title: '이렇게 만듭니다.',
      subtitle: '아이디어에서 실제 사이트까지.',
      lead: '세 단계만 거치면 전문적인 웹 존재감을 전 세계에 선보일 수 있습니다.',
      chooseTitle: '템플릿 선택',
      chooseBody:
        '전문적으로 디자인된 레이아웃에서 시작하세요. 모든 템플릿은 바로 사용할 수 있고 모든 기기에 최적화되어 있습니다.',
      customizeTitle: '콘텐츠 편집',
      customizeBody:
        '비주얼 에디터로 텍스트·이미지·스타일을 몇 초 만에 편집하세요. 작업하는 즉시 변경 사항이 반영됩니다.',
      publishTitle: '즉시 게시',
      publishBody:
        '클릭 한 번으로 게시하세요. 최고의 사용자 경험을 위해 고속 글로벌 네트워크에 배포됩니다.',
    },
    templates: {
      title: '바로 시작할 수 있는 템플릿.',
      browseAll: '전체 템플릿 보기',
      bestForBusiness: '비즈니스에 최적',
      corporateTitle: '기업형 레이아웃.',
      corporateBody:
        '비즈니스와 서비스를 위한 전문적인 기반. 스토리·기능·연락처를 위한 임팩트 있는 섹션을 포함합니다.',
      bullet1: '포트폴리오 준비 완료',
      bullet2: '비즈니스 랜딩 페이지',
      bullet3: '완전 반응형',
      useThis: '이 템플릿 사용하기',
    },
    finalCta: {
      titleLine1: '당신의 사이트를',
      titleEmphasis: '몇 분 만에 완성.',
    },
    footer: {
      terms: '이용약관',
      privacy: '개인정보',
      security: '보안',
      status: '상태',
    },
  },
  nav: {
    templates: '템플릿',
    signIn: '로그인',
    getStarted: '시작하기',
  },
};

export type Messages = typeof ko;
