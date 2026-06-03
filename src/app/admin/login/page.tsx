import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export default async function AdminLoginPage() {
  if (await requireAdmin()) {
    redirect("/admin/dashboard");
  }

  return <AdminLogin />;
}
