"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Summary = {
  totalClients: number;
  totalFreelancers: number;
  pendingApplications: number;
  approvedUshers: number;
};

const emptySummary: Summary = {
  totalClients: 0,
  totalFreelancers: 0,
  pendingApplications: 0,
  approvedUshers: 0,
};

export function AdminDashboard() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      const response = await fetch("/api/admin/summary");

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      setSummary((await response.json()) as Summary);
      setLoading(false);
    }

    void loadSummary();
  }, [router]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-black px-5 py-6 text-white sm:px-8 lg:px-10">
      <header className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-11 w-11 place-items-center rounded border border-yellow-300/50 bg-yellow-300 text-lg font-black text-black">
            A
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[0.38em]">AURA</span>
            <span className="block text-[10px] uppercase tracking-[0.42em] text-yellow-300">
              Admin
            </span>
          </span>
        </Link>
        <button className="btn-primary" onClick={logout} type="button">
          Logout
        </button>
      </header>

      <section className="grid gap-4 py-8 md:grid-cols-4">
        {[
          ["Total Clients", summary.totalClients],
          ["Total Freelancers", summary.totalFreelancers],
          ["Pending Applications", summary.pendingApplications],
          ["Approved Ushers", summary.approvedUshers],
        ].map(([label, value]) => (
          <div className="glass-card" key={label}>
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-3 text-4xl font-black text-yellow-300">
              {loading ? "..." : value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Link className="glass-panel block transition hover:border-yellow-300/50" href="/admin/clients">
          <p className="eyebrow">Client details</p>
          <h1 className="form-title">View all client registrations.</h1>
          <p className="mt-4 text-zinc-400">
            Search, review, export, and delete client event requests.
          </p>
        </Link>
        <Link className="glass-panel block transition hover:border-yellow-300/50" href="/admin/freelancers">
          <p className="eyebrow">Freelancer details</p>
          <h1 className="form-title">View all usher applications.</h1>
          <p className="mt-4 text-zinc-400">
            Search, filter, approve, reject, export, and delete freelancer records.
          </p>
        </Link>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <a className="btn-secondary" href="/api/admin/export?type=clients">
          Export Clients
        </a>
        <a className="btn-secondary" href="/api/admin/export?type=freelancers">
          Export Freelancers
        </a>
        <a className="btn-secondary" href="/api/admin/report" target="_blank">
          PDF Report
        </a>
      </section>
    </main>
  );
}
