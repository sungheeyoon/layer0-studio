import { listAllSitesAction } from './actions';
import AdminProjectTable from './AdminProjectTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminPage() {
  const result = await listAllSitesAction();

  if (!Array.isArray(result)) {
    return (
      <main className="px-12 py-12 min-h-[calc(100vh-3.5rem)]">
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Failed to load projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{result.error}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const sites = result;
  const totalCount = sites.length;
  const activeCount = sites.filter((s) => s.status === 'active').length;
  const pendingCount = sites.filter((s) => s.status === 'draft').length;

  const stats = [
    { label: 'Total projects', value: totalCount },
    { label: 'Active', value: activeCount },
    { label: 'Pending', value: pendingCount },
  ];

  return (
    <main className="px-12 py-12 min-h-[calc(100vh-3.5rem)] pb-20">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Manage all user sites — domains, status, and termination.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-semibold tabular-nums">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminProjectTable sites={sites} />
    </main>
  );
}
