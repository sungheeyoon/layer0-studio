import { redirect } from "next/navigation";

// The dedicated "overview" home was folded into the Projects tab (site summary +
// resume-editing now live there). Landing on /dashboard sends the user straight
// to their project list.
export default function DashboardPage() {
  redirect("/dashboard/projects");
}
