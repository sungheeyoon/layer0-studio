import { redirect } from "next/navigation";

// The admin area is now Templates-only. The old global site-moderation table
// (suspend/terminate/domain override) was removed; /admin lands on Templates.
export default function AdminPage() {
  redirect("/admin/templates");
}
