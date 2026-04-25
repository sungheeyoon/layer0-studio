'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#fafafa' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '0 1rem' }}>
            <h2 style={{ fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Application error
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '2rem' }}>
              A critical error occurred. Please refresh the page.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1.5rem',
                border: '1px solid #d1d5db',
                background: 'transparent',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
