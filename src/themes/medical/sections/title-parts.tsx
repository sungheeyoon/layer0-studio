import { Fragment, ReactNode } from 'react';

export function renderAccentTitle(value: string, accentClassName: string): ReactNode {
  if (!value) return null;
  const parts = value.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <em key={i} className={accentClassName} style={{ fontStyle: 'normal' }}>
          {m[1]}
        </em>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
