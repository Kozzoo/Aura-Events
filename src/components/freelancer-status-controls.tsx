"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FreelancerStatus } from "@/lib/types";

const statuses: FreelancerStatus[] = ["Pending", "Approved", "Rejected"];

const statusClasses: Record<FreelancerStatus, string> = {
  Pending: "border-yellow-300/40 bg-yellow-300/10 text-yellow-100",
  Approved: "border-emerald-300/40 bg-emerald-300/10 text-emerald-100",
  Rejected: "border-red-300/40 bg-red-300/10 text-red-100",
};

export function FreelancerStatusControls({
  freelancerId,
  currentStatus,
}: {
  freelancerId: number;
  currentStatus: FreelancerStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [savingStatus, setSavingStatus] = useState<FreelancerStatus | null>(null);
  const [message, setMessage] = useState("");

  async function updateStatus(nextStatus: FreelancerStatus) {
    setSavingStatus(nextStatus);
    setMessage("");

    const response = await fetch(`/api/admin/freelancers/${freelancerId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (response.ok) {
      setStatus(nextStatus);
      setMessage(`Status changed to ${nextStatus}.`);
      router.refresh();
    } else {
      setMessage("Status could not be changed.");
    }

    setSavingStatus(null);
  }

  return (
    <section className="rounded border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
        Change Status
      </p>
      <div
        className={`mt-3 rounded border px-4 py-3 text-sm font-black uppercase tracking-[0.14em] ${statusClasses[status]}`}
      >
        {status}
      </div>
      <div className="mt-4 grid gap-2">
        {statuses.map((item) => (
          <button
            className={`min-h-11 rounded border px-4 py-2 text-sm font-black uppercase tracking-[0.1em] transition ${
              item === status
                ? "border-yellow-300 bg-yellow-300 text-black"
                : "border-white/10 bg-white/[0.06] text-zinc-200 hover:border-yellow-300/70 hover:bg-yellow-300/10 hover:text-yellow-100"
            }`}
            disabled={savingStatus !== null || item === status}
            key={item}
            onClick={() => updateStatus(item)}
            type="button"
          >
            {savingStatus === item ? "Saving..." : item}
          </button>
        ))}
      </div>
      {message && <p className="mt-3 text-sm font-semibold text-zinc-300">{message}</p>}
    </section>
  );
}
