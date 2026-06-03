import { redirect } from "next/navigation";
import { AdminClientsPage } from "@/components/admin-records";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export default async function AdminClientsRoute() {
  if (!(await requireAdmin())) {
    redirect("/admin/login");
  }

  return <AdminClientsPage />;
}
