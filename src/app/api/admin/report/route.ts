import { requireAdmin } from "@/lib/auth";
import { getSummary, readDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [summary, db] = await Promise.all([getSummary(), readDb()]);
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>AURA EVENTS Admin Report</title>
    <style>
      body { font-family: Arial, sans-serif; color: #111; padding: 32px; }
      h1 { margin: 0 0 8px; }
      .meta { color: #555; margin-bottom: 28px; }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
      .card { border: 1px solid #ddd; padding: 16px; }
      .value { font-size: 28px; font-weight: 700; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
      th { background: #f4c430; }
      @media print { button { display: none; } body { padding: 0; } }
    </style>
  </head>
  <body>
    <button onclick="window.print()">Save as PDF</button>
    <h1>AURA EVENTS Admin Report</h1>
    <div class="meta">Generated ${new Date().toLocaleString()}</div>
    <section class="grid">
      <div class="card"><div>Total Clients</div><div class="value">${summary.totalClients}</div></div>
      <div class="card"><div>Total Freelancers</div><div class="value">${summary.totalFreelancers}</div></div>
      <div class="card"><div>Pending Applications</div><div class="value">${summary.pendingApplications}</div></div>
      <div class="card"><div>Approved Ushers</div><div class="value">${summary.approvedUshers}</div></div>
    </section>
    <h2>Recent Client Requests</h2>
    <table>
      <thead><tr><th>Name</th><th>Company</th><th>Event</th><th>Date</th><th>Ushers</th><th>Phone</th></tr></thead>
      <tbody>${db.clients
        .slice(0, 20)
        .map(
          (item) =>
            `<tr><td>${item.fullName}</td><td>${item.companyName}</td><td>${item.eventType}</td><td>${item.eventDate}</td><td>${item.ushersNeeded}</td><td>${item.phone}</td></tr>`,
        )
        .join("")}</tbody>
    </table>
    <h2>Freelancer Pipeline</h2>
    <table>
      <thead><tr><th>Name</th><th>City</th><th>Email</th><th>Availability</th><th>Status</th></tr></thead>
      <tbody>${db.freelancers
        .slice(0, 30)
        .map(
          (item) =>
            `<tr><td>${item.fullName}</td><td>${item.city}</td><td>${item.email}</td><td>${item.availability}</td><td>${item.status}</td></tr>`,
        )
        .join("")}</tbody>
    </table>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
