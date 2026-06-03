"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientRequest, Freelancer, FreelancerStatus } from "@/lib/types";
import { SmartBackButton } from "./smart-back-button";

type ActionMessage = {
  tone: "success" | "error";
  text: string;
};

function statusClass(status: FreelancerStatus) {
  if (status === "Approved") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-200";
  }

  if (status === "Rejected") {
    return "border-red-300/30 bg-red-300/10 text-red-200";
  }

  return "border-yellow-300/30 bg-yellow-300/10 text-yellow-200";
}

function ActionNotice({ message }: { message: ActionMessage | null }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`admin-notice ${
        message.tone === "success" ? "admin-notice-success" : "admin-notice-error"
      }`}
    >
      <span className="admin-notice-dot" />
      <span>{message.text}</span>
    </div>
  );
}

function AdminPageShell({
  title,
  exportType,
  children,
}: {
  title: string;
  exportType: "clients" | "freelancers";
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black px-5 py-6 text-white sm:px-8 lg:px-10">
      <header className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <SmartBackButton fallbackHref="/admin/dashboard" label="Back to Dashboard" />
          <h1 className="mt-3 text-3xl font-black">{title}</h1>
        </div>
        <a className="btn-secondary" href={`/api/admin/export?type=${exportType}`}>
          Export CSV
        </a>
      </header>
      {children}
    </main>
  );
}

export function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientRequest[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState("");
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);

  async function loadClients() {
    const response = await fetch("/api/admin/clients");

    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }

    const data = (await response.json()) as { clients: ClientRequest[] };
    setClients(data.clients);
    setLoading(false);
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadClients());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredClients = useMemo(() => {
    const needle = query.toLowerCase();
    return clients.filter((item) =>
      [item.fullName, item.companyName, item.email, item.phone, item.eventType, item.location]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [clients, query]);

  async function deleteClient(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this client registration? This action cannot be undone.",
    );

    if (!confirmed) {
      setActionMessage({
        tone: "error",
        text: "Delete cancelled. Client registration was not changed.",
      });
      return;
    }

    setActingId(String(id));
    setActionMessage(null);
    const response = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });

    if (response.ok) {
      await loadClients();
      setActionMessage({
        tone: "success",
        text: "Client registration deleted successfully.",
      });
    } else {
      setActionMessage({
        tone: "error",
        text: "Client registration could not be deleted.",
      });
    }

    setActingId("");
  }

  return (
    <AdminPageShell title="Client Registrations" exportType="clients">
      <div className="py-6">
        <input
          className="w-full rounded border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-yellow-300 md:w-96"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search client registrations"
          value={query}
        />
      </div>
      <ActionNotice message={actionMessage} />
      <div className="overflow-x-auto rounded border border-white/10 bg-white/[0.04]">
        {loading ? (
          <div className="py-16 text-center text-zinc-400">Loading clients...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Company</th>
                <th>Event</th>
                <th>Date</th>
                <th>Location</th>
                <th>Ushers</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.fullName}</strong>
                    <span>{item.email}</span>
                    <span>{item.phone}</span>
                  </td>
                  <td>{item.companyName}</td>
                  <td>{item.eventType}</td>
                  <td>{item.eventDate}</td>
                  <td>{item.location}</td>
                  <td>{item.ushersNeeded}</td>
                  <td>{item.notes || "-"}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/admin/clients/${item.id}`}
                        className="table-action table-action-view"
                        style={{ background: '#f3f4f6', color: '#111', border: '1px solid #ccc', borderRadius: 4, padding: '4px 12px', textDecoration: 'none' }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                      <button
                        className="table-action table-action-danger"
                        disabled={actingId === String(item.id)}
                        onClick={() => deleteClient(item.id)}
                        type="button"
                      >
                        {actingId === String(item.id) ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageShell>
  );
}

export function AdminFreelancersPage() {
  const router = useRouter();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | FreelancerStatus>("All");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState("");
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);

  async function loadFreelancers() {
    const response = await fetch("/api/admin/freelancers");

    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }

    const data = (await response.json()) as { freelancers: Freelancer[] };
    setFreelancers(data.freelancers);
    setLoading(false);
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadFreelancers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFreelancers = useMemo(() => {
    const needle = query.toLowerCase();
    return freelancers.filter((item) => {
      const matchesStatus = status === "All" || item.status === status;
      const matchesQuery = [
        item.fullName,
        item.email,
        item.phone,
        item.city,
        item.languages,
        item.availability,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);

      return matchesStatus && matchesQuery;
    });
  }, [freelancers, query, status]);

  async function changeStatus(id: number, nextStatus: FreelancerStatus) {
    setActingId(`${id}-${nextStatus}`);
    setActionMessage(null);
    const response = await fetch(`/api/admin/freelancers/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (response.ok) {
      await loadFreelancers();
      setActionMessage({
        tone: "success",
        text: `Freelancer application marked as ${nextStatus.toLowerCase()}.`,
      });
    } else {
      setActionMessage({
        tone: "error",
        text: "Freelancer status could not be updated.",
      });
    }

    setActingId("");
  }

  async function deleteFreelancer(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this freelancer application? This action cannot be undone.",
    );

    if (!confirmed) {
      setActionMessage({
        tone: "error",
        text: "Delete cancelled. Freelancer application was not changed.",
      });
      return;
    }

    setActingId(`${id}-delete`);
    setActionMessage(null);
    const response = await fetch(`/api/admin/freelancers/${id}`, { method: "DELETE" });

    if (response.ok) {
      await loadFreelancers();
      setActionMessage({
        tone: "success",
        text: "Freelancer application deleted successfully.",
      });
    } else {
      setActionMessage({
        tone: "error",
        text: "Freelancer application could not be deleted.",
      });
    }

    setActingId("");
  }

  return (
    <AdminPageShell title="Freelancer Applications" exportType="freelancers">
      <div className="flex flex-col gap-3 py-6 sm:flex-row">
        <input
          className="rounded border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-yellow-300 sm:w-96"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search freelancer registrations"
          value={query}
        />
        <select
          className="rounded border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-yellow-300"
          onChange={(event) => setStatus(event.target.value as "All" | FreelancerStatus)}
          value={status}
        >
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>
      <ActionNotice message={actionMessage} />
      <div className="overflow-x-auto rounded border border-white/10 bg-white/[0.04]">
        {loading ? (
          <div className="py-16 text-center text-zinc-400">Loading freelancers...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Freelancer</th>
                <th>Profile</th>
                <th>Experience</th>
                <th>Availability</th>
                <th>Files</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFreelancers.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.fullName}</strong>
                    <span>{item.email}</span>
                    <span>{item.phone}</span>
                  </td>
                  <td>
                    <span>{item.age} years</span>
                    <span>{item.gender}</span>
                    <span>{item.city}</span>
                    <span>{item.languages}</span>
                  </td>
                  <td>{item.experience}</td>
                  <td>{item.availability}</td>
                  <td>
                    <span>Photo: {item.profilePhoto ?? "-"}</span>
                    <span>CV: {item.cv ?? "-"}</span>
                  </td>
                  <td>
                    <span className={`rounded border px-3 py-1 text-xs ${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/admin/freelancers/${item.id}`}
                        className="table-action table-action-view"
                        style={{ background: '#f3f4f6', color: '#111', border: '1px solid #ccc', borderRadius: 4, padding: '4px 12px', textDecoration: 'none' }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                      <button
                        className="table-action table-action-approve"
                        disabled={actingId === `${item.id}-Approved`}
                        onClick={() => changeStatus(item.id, "Approved")}
                        type="button"
                      >
                        {actingId === `${item.id}-Approved` ? "Approving..." : "Approve"}
                      </button>
                      <button
                        className="table-action table-action-reject"
                        disabled={actingId === `${item.id}-Rejected`}
                        onClick={() => changeStatus(item.id, "Rejected")}
                        type="button"
                      >
                        {actingId === `${item.id}-Rejected` ? "Rejecting..." : "Reject"}
                      </button>
                      <button
                        className="table-action table-action-danger"
                        disabled={actingId === `${item.id}-delete`}
                        onClick={() => deleteFreelancer(item.id)}
                        type="button"
                      >
                        {actingId === `${item.id}-delete` ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageShell>
  );
}
