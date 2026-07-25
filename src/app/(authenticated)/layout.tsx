import { getCurrentUser, isAccountErased } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || isAccountErased(user)) {
    // Preserve the path the user was trying to reach (injected by middleware)
    // so they land there after authenticating.
    const pathname = (await headers()).get('x-pathname');
    const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
    redirect(`/login${next}`);
  }

  return <>{children}</>;
}
