import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const baseProps = (size: number, rest: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...rest,
});

export function HomeIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function ChatIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function PhoneIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function MedalIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M12 15l-2 5l-2-1l-2 1l2-5" />
      <path d="M12 15l2 5l2-1l2 1l-2-5" />
      <circle cx="12" cy="9" r="6" />
      <circle cx="12" cy="9" r="2" />
    </svg>
  );
}

export function ShieldCheckIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function StarIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function PenIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export function DiamondIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M6 3h12l4 6l-10 12L2 9z" />
      <path d="M11 3l-4 6l5 12" />
      <path d="M13 3l4 6l-5 12" />
      <path d="M2 9h20" />
    </svg>
  );
}

export function ClockIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function RulerIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M21.3 15.3l-5.4-5.4l-10.6 10.6l5.4 5.4l10.6-10.6z" />
      <path d="M14.5 13.5l1.4 1.4" />
      <path d="M11.5 10.5l1.4 1.4" />
      <path d="M8.5 7.5l1.4 1.4" />
      <path d="M5.5 4.5l1.4 1.4" />
      <path d="M21 3L3 21" />
    </svg>
  );
}

export function HammerIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="m15 5l6 6l-4 4l-6-6l4-4z" />
      <path d="m2 22l7-7" />
      <path d="M11 8v3" />
      <path d="M15 12h3" />
    </svg>
  );
}

export function KeyIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M21 2l-2 2l-2-2l-2 2l-2-2l-2 2L7 7" />
      <circle cx="5" cy="17" r="3" />
      <path d="M7 15l5-5" />
    </svg>
  );
}

export function MapPinIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function LetterIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function InstagramIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function YoutubeIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

export function MonitorIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export function BuildingsIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  );
}

export function PaletteIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M12 22a10 10 0 1 1 8-10c0 1.5-1 3.5-3 3.5s-3-2-3-3.5c0-1.1.9-2 2-2s2 .9 2 2" />
      <circle cx="12" cy="18" r="7" />
    </svg>
  );
}
