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

export function MapPointIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
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

export function LeafIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M17 8C17 11 15 14 12 14C9 14 7 11 7 8C7 5 9 2 12 2C15 2 17 5 17 8ZM12 14V22M12 14L8 18M12 14L16 18" />
    </svg>
  );
}

export function CoffeeIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M18.5 7H17V5.5C17 4.12 15.88 3 14.5 3H5.5C4.12 3 3 4.12 3 5.5V14.5C3 15.88 4.12 17 5.5 17H14.5C15.88 17 17 15.88 17 14.5V13H18.5C20.43 13 22 11.43 22 9.5V10.5C22 8.57 20.43 7 18.5 7ZM18.5 11H17V9H18.5C19.33 9 20 9.67 20 10.5V8.5C20 9.33 19.33 10 18.5 10V11ZM3 19H17V21H3V19Z" />
    </svg>
  );
}

export function CupIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M4 19h16v2H4v-2zm14-12h-2V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v10c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4v-3h2c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-2 8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V5h10v10zm4-5h-2V9h2v1z" />
    </svg>
  );
}

export function PieChartIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L13 17.15v2.78zm.61-3.69l-3.32-3.32c.2-.07.41-.12.61-.12 1.1 0 2 .9 2 2 0 .2-.05.41-.12.61l.83.83zM18.79 15.21c-.49.33-1.02.61-1.58.83l-2.03-2.03c.51-.31.9-.81 1.09-1.4h3.18c-.14.93-.36 1.81-.66 2.6zm0-5.21h-3.18c-.19-.59-.58-1.09-1.09-1.4l2.03-2.03c.56.22 1.09.5 1.58.83.3.79.52 1.67.66 2.6zM13 3.07v2.78l-6.79 6.79c-.13-.58-.21-1.17-.21-1.79 0-4.08 3.06-7.44 7-7.93z" />
    </svg>
  );
}

export function SunIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37a.996.996 0 00-1.41-1.41l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zm-12.37 12.37a.996.996 0 00-1.41-1.41l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
    </svg>
  );
}

export function BuildingsIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
    </svg>
  );
}

export function LaptopIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
    </svg>
  );
}

export function BookIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
    </svg>
  );
}

export function VinylIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
    </svg>
  );
}

export function StarIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

export function PhoneIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.996 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.76 6.44 8.56 5.26 8.56 4.02c0-.55-.45-1-1-1H4.03c-.55 0-1 .45-1 1 0 9.39 7.62 17.01 17 17.01.55 0 1-.45 1-1v-3.62c0-.57-.45-1.03-1.02-1.03z" />
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

export function BlogIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-12.7 8.19 8.19 0 0 1 4.9 1.5l.3-.3a1 1 0 1 1 1.4 1.4l-.3.3A8.38 8.38 0 0 1 21 11.5z" />
      <path d="M11 15.5l-2.5-2.5L11 10.5l2.5 2.5z" />
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

export function FireIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 23a7.5 7.5 0 0 1-5.13-12.96c.21-.19.53-.15.7.07.18.23.16.55-.03.77a5.501 5.501 0 0 0-.7 7.15c.34.51.81 1 1.34 1.4.15.11.36.13.52.01.16-.11.23-.32.17-.51-.12-.39-.2-.79-.24-1.21a11.35 11.35 0 0 0-1.12-4.14c-.03-.07-.05-.14-.05-.21 0-.31.25-.56.56-.56.11 0 .21.03.3.09 1.25.86 2.37 2.06 3.03 3.44.07.14.22.21.36.19.14-.02.26-.13.29-.27.18-1.04.14-2.12-.13-3.15-.34-1.3-.98-2.5-1.92-3.52-.08-.09-.12-.22-.09-.34.03-.12.11-.23.23-.27.87-.27 1.76-.41 2.64-.41.36 0 .73.02 1.09.07.29.04.55-.17.59-.46.01-.06.01-.12 0-.17-.11-1.39-.77-2.67-1.85-3.57-.14-.11-.2-.3-.14-.47s.24-.29.41-.3c1.69-.05 3.32.61 4.47 1.83 1.15 1.22 1.76 2.85 1.67 4.54a7.5 7.5 0 0 1-7.5 7.5z" />
    </svg>
  );
}

export function HandHeartIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, rest)} fill="currentColor" stroke="none">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}
