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

export function ShieldCheckIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 2L4 5V11C4 16.19 7.41 21.05 12 22C16.59 21.05 20 16.19 20 11V5L12 2ZM10.5 16.5L7 13L8.41 11.59L10.5 13.67L15.59 8.58L17 10L10.5 16.5Z" />
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

export function ArrowRightIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function ArrowDownIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

export function VerifiedCheckIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 2L15.09 5.26L19.5 6.1L20.25 10.5L23 13.5L20.25 16.5L19.5 20.9L15.09 21.74L12 25L8.91 21.74L4.5 20.9L3.75 16.5L1 13.5L3.75 10.5L4.5 6.1L8.91 5.26L12 2ZM10.5 16.5L16.5 10.5L15.09 9.09L10.5 13.68L8.41 11.59L7 13L10.5 16.5Z" />
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

export function DiplomaIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function StarIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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

export function CalculatorIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="16" y1="14" x2="16" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}

export function HomeIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function GraphIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export function UserHandsIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2" />
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function LawIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M2 20h20" />
      <path d="M7 10h10" />
      <path d="M12 4v16" />
      <path d="M7 10c0 3.3 2.7 6 6 6" />
      <path d="M17 10c0 3.3-2.7 6-6 6" />
    </svg>
  );
}

export function LockIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
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

export function DocumentTextIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

export function PlayCircleIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
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

export function PlusIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
