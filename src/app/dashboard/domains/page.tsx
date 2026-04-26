import DomainsClient from './DomainsClient';

export default function DomainsPage() {
  return (
    <main className="p-10 min-h-[calc(100vh-124px)]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-light text-primary tracking-tight uppercase mb-2">Domains Management</h1>
          <p className="text-outline text-sm font-light tracking-wide">
            Manage custom domains for your published sites.
          </p>
        </header>

        <DomainsClient />
      </div>
    </main>
  );
}
