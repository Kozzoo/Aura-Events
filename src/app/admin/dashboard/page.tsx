import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export default async function AdminDashboardPage() {
  if (!(await requireAdmin())) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
