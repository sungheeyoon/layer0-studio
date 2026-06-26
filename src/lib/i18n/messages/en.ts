import type { Messages } from './ko';

/**
 * English catalog. Typed as `Messages` so the compiler enforces exact key
 * parity with ko.ts (missing or extra keys both fail to compile).
 *
 * English values intentionally preserve the login screen's existing techno
 * styling, so `en` renders the page as it looked before this change.
 */
export const en: Messages = {
  auth: {
    login: {
      emailLabel: 'USER_EMAIL',
      passwordLabel: 'SECURE_KEY',
      submit: 'INITIATE_SESSION',
      submitting: 'AUTHENTICATING...',
      forgotLink: 'FORGOT_KEY?',
      signupLink: 'REQUEST_ACCESS',
      errorPrefix: 'ERROR',
    },
  },
  landing: {
    common: {
      browseTemplates: 'Browse Templates',
    },
    cta: {
      authed: 'Open Dashboard',
      guest: 'Get Started',
    },
    hero: {
      titleLine1: 'Build Websites',
      titleEmphasis: 'Without Code',
      titleLine3: 'Using Templates.',
      description:
        'Choose a template, customize your content, and launch instantly. High-fidelity digital experiences with no code required.',
    },
    features: {
      layouts: {
        title: 'Ready-to-Use Layouts',
        body: 'Choose from professionally designed templates. Start with a solid foundation instead of a blank page, optimized for performance and SEO.',
      },
      editing: {
        title: 'Edit Without Code',
        body: "Modify text, images, and styles in seconds. Our direct editing interface gives you full control over your site's content without any complexity.",
      },
      publishing: {
        title: 'Instant Publishing',
        body: 'Launch your website globally with a single click. No servers to manage, no complex setup—just fast, reliable deployment.',
      },
    },
    editorPreview: {
      title: 'Edit Visually.',
      titleEmphasis: 'Change Everything.',
      description:
        'Modify text, images, and layouts in real-time. No complex menus or coding required. Our intuitive editor gives you direct control over every detail of your site.',
      experienceLabel: 'Experience',
      experienceValue: 'Real-time Editing',
      feedbackLabel: 'Feedback',
      feedbackValue: 'Instant Preview',
      step1: '01 Select Template',
      step2: '02 Customize Content',
      step3: '03 Go Live',
    },
    howItWorks: {
      title: 'How It Works.',
      subtitle: 'From idea to live site.',
      lead: 'Follow three simple steps to build and launch your professional presence globally.',
      chooseTitle: 'Choose a Template',
      chooseBody:
        'Start with a professionally designed layout. Each template is ready-to-use and optimized for all devices.',
      customizeTitle: 'Customize Your Content',
      customizeBody:
        'Edit text, images, and styles in seconds using our visual editor. See your changes instantly as you work.',
      publishTitle: 'Publish Instantly',
      publishBody:
        'Go live with one click. Your site is deployed to a high-speed global network for the best user experience.',
    },
    templates: {
      title: 'Templates You Can Start With.',
      browseAll: 'Browse all templates',
      bestForBusiness: 'Best for Business',
      corporateTitle: 'The Corporate Layout.',
      corporateBody:
        'A professional foundation for businesses and services. Includes high-impact sections for your story, features, and contact information.',
      bullet1: 'Portfolio ready',
      bullet2: 'Business landing page',
      bullet3: 'Fully responsive',
      useThis: 'Use This Template',
    },
    finalCta: {
      titleLine1: 'Create Your Site',
      titleEmphasis: 'In Minutes.',
    },
    footer: {
      terms: 'Terms',
      privacy: 'Privacy',
      security: 'Security',
      status: 'Status',
    },
  },
  nav: {
    templates: 'Templates',
    signIn: 'Sign In',
    getStarted: 'Get Started',
  },
};
