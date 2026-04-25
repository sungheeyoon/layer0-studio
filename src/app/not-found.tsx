import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <h1 className="text-6xl font-thin tracking-tight mb-4">404</h1>
        <p className="text-lg font-light text-gray-500 mb-8">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 border border-gray-300 text-sm tracking-wider uppercase hover:bg-gray-100 transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
