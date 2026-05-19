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

export function ArrowRightIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowDownIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}

export function HeartIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 21s-7.5-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2 4.4-9.5 9-9.5 9Z" />
    </svg>
  );
}

export function StarIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.2-3.6-3.6 1.4-1.4 2.2 2.2 4.6-4.6 1.4 1.4-6 6Z" />
    </svg>
  );
}

export function PlusIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function PhoneIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.4 2.3.6 3.6.6a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.25 1l-2.25 2.2Z" />
    </svg>
  );
}

export function ClockIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.8 10.5V7h-1.6v6.2l4.2 2.5.8-1.3-3.4-2Z" />
    </svg>
  );
}

export function MapIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    </svg>
  );
}

export function ChatIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 4V6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v9Z" />
      <path d="M9 11h6M9 8h6" />
    </svg>
  );
}

export function NotebookIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M6 2h11a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6V2Z" />
      <path d="M9 7h7M9 12h7M9 17h4" />
      <path d="M3 7h3M3 12h3M3 17h3" />
    </svg>
  );
}

export function PaletteIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M12 22a10 10 0 1 1 8-16c1.5 2 1 4.5-1 5.5-1.4.7-3 .2-3.7 1.5s.6 2.7-.4 3.8C13.7 18.6 11.7 22 12 22Z" />
      <circle cx="7" cy="11" r="1" fill="currentColor" />
      <circle cx="9" cy="6.5" r="1" fill="currentColor" />
      <circle cx="14" cy="6.5" r="1" fill="currentColor" />
      <circle cx="17.5" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export function SparkleIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 2 13.8 9 21 12 13.8 15 12 22 10.2 15 3 12 10.2 9 12 2Z" />
    </svg>
  );
}

export function GiftIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M3 12h18M12 8v13" />
      <path d="M12 8s-3-6-5-3.5C5.4 6.4 8 8 12 8Zm0 0s3-6 5-3.5C18.6 6.4 16 8 12 8Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function PlayIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <circle cx="12" cy="12" r="10" />
      <path d="m10 8 6 4-6 4V8Z" fill="currentColor" />
    </svg>
  );
}

export function ChatSquareIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <rect x="3" y="4" width="18" height="14" rx="3" />
      <path d="m7 18-2 3" />
    </svg>
  );
}

export function BookmarkIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 8v9l3-2 3 2V8H9Z" />
    </svg>
  );
}
