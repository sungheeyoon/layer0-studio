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

export function DumbbellIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M6.5 3c-1.1 0-2 .9-2 2v2H3c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h1.5v2c0 1.1.9 2 2 2s2-.9 2-2v-2h5v2c0 1.1.9 2 2 2s2-.9 2-2v-2H19c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1h-1.5V5c0-1.1-.9-2-2-2s-2 .9-2 2v2h-5V5c0-1.1-.9-2-2-2zm0 2c0-.55.45-1 1-1s1 .45 1 1v12c0 .55-.45 1-1 1s-1-.45-1-1V5zm9 0c0-.55.45-1 1-1s1 .45 1 1v12c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowUpRightIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export function HamburgerIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function BoxingIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M6 18h12a2 2 0 0 0 2-2v-6a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v6a2 2 0 0 0 2 2z" />
      <path d="M8 6v4" />
      <path d="M16 6v4" />
      <path d="M12 18v3" />
    </svg>
  );
}

export function YogaIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <circle cx="12" cy="5" r="3" />
      <path d="M6 20c0-2 2-4 6-4s6 2 6 4" />
      <path d="M12 16v-5l-4-3" />
      <path d="M12 11l4-3" />
    </svg>
  );
}

export function ChefHatIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M6 18h12a2 2 0 0 0 2-2v-2a6 6 0 0 0-16 0v2a2 2 0 0 0 2 2z" />
      <path d="M9 18v3" />
      <path d="M15 18v3" />
    </svg>
  );
}

export function RulerIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="7" y1="3" x2="7" y2="8" />
      <line x1="12" y1="3" x2="12" y2="5" />
      <line x1="17" y1="3" x2="17" y2="8" />
    </svg>
  );
}

export function ShowerIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M7 4h10" />
      <path d="M12 4v16" />
      <path d="M12 7c-2.5 0-4.5 2-4.5 4.5S10 16 12.5 16s4.5-2 4.5-4.5S15 7 12.5 7z" />
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

export function ParkingIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  );
}

export function CupIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M6 2h12v10a6 6 0 0 1-12 0V2z" />
      <path d="M6 5H4v4a2 2 0 0 0 2 2" />
      <path d="M18 5h2v4a2 2 0 0 1-2 2" />
      <path d="M12 18v4" />
      <path d="M8 22h8" />
    </svg>
  );
}

export function DiplomaIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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

export function PhoneIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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

export function ChatIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
