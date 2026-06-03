import { redirect } from "next/navigation";
import { AdminFreelancersPage } from "@/components/admin-records";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export default async function AdminFreelancersRoute() {
  if (!(await requireAdmin())) {
    redirect("/admin/login");
  }

  return <AdminFreelancersPage />;
}
