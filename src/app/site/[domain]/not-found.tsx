import Link from 'next/link';

export default function SiteNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-thin tracking-tight mb-4">404</h1>
        <p className="text-lg font-light text-gray-500 mb-8">
          This site doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 border border-gray-300 text-sm tracking-wider uppercase hover:bg-gray-100 transition"
        >
          Go to Layer0 Studio
        </Link>
      </div>
    </div>
  );
}
