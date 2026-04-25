'use client';

import { useEffect } from 'react';

export default function Error({
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
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center max-w-md px-4">
        <h2 className="text-2xl font-light tracking-tight mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono">ref: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-6 py-2 border border-gray-300 text-sm tracking-wider uppercase hover:bg-gray-100 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
