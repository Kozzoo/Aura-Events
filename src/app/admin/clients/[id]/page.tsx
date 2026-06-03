import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";



export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id)) return null;
  const db = await readDb();
  const client = db.clients.find((c) => c.id === id);
  if (!client) return notFound();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Client Details</h1>
      <div className="space-y-2">
        <div><strong>Name:</strong> {client.fullName}</div>
        <div><strong>Company:</strong> {client.companyName}</div>
        <div><strong>Email:</strong> {client.email}</div>
        <div><strong>Phone:</strong> {client.phone}</div>
        <div><strong>Event Type:</strong> {client.eventType}</div>
        <div><strong>Event Date:</strong> {client.eventDate}</div>
        <div><strong>Location:</strong> {client.location}</div>
        <div><strong>Ushers Needed:</strong> {client.ushersNeeded}</div>
        <div><strong>Notes:</strong> {client.notes || "-"}</div>
        <div><strong>Created At:</strong> {client.createdAt}</div>
      </div>
    </div>
  );
}
