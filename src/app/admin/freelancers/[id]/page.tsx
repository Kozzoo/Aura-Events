import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FreelancerStatusControls } from "@/components/freelancer-status-controls";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function uploadHref(value?: string | null) {
  if (!value) return undefined;
  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `/api/uploads/${encodeURIComponent(value)}`;
}

function DetailField({
  label,
  value,
  wide = false,
}: {
  label: string;
  value?: number | string | null;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </label>
      <div className="min-h-12 rounded border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-zinc-100">
        {value || "-"}
      </div>
    </div>
  );
}

export default async function FreelancerDetailsPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  if (!(await requireAdmin())) {
    redirect("/admin/login");
  }

  const { id: idStr } = await params;
  if (!idStr) return notFound();
  const id = Number(idStr);
  if (Number.isNaN(id)) return notFound();

  const { readDb } = await import("@/lib/db");
  const db = await readDb();
  const freelancer = db.freelancers.find((f) => f.id === id);
  if (!freelancer) return notFound();

  const profilePhotoHref = uploadHref(freelancer.profilePhoto);
  const cvHref = uploadHref(freelancer.cv);

  return (
    <main className="min-h-screen bg-black px-5 py-6 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              className="text-sm font-black uppercase tracking-[0.12em] text-yellow-300 hover:text-yellow-100"
              href="/admin/freelancers"
            >
              Back to Applications
            </Link>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-yellow-600">
              Usher Application
            </p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">
              {freelancer.fullName}
            </h1>
          </div>
          <div className="rounded border border-yellow-300/40 bg-yellow-300/10 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-yellow-100">
            {freelancer.status}
          </div>
        </header>

        <section className="grid gap-8 py-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <div className="rounded border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-4 lg:block">
                {profilePhotoHref ? (
                  <Image
                    src={profilePhotoHref}
                    alt={`${freelancer.fullName} profile photo`}
                    width={160}
                    height={160}
                    className="h-24 w-24 rounded object-cover ring-1 ring-white/15 lg:h-40 lg:w-40"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded bg-white/10 text-2xl font-black text-yellow-200 lg:h-40 lg:w-40">
                    {freelancer.fullName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="lg:mt-4">
                  <p className="text-lg font-black">{freelancer.fullName}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-400">
                    {freelancer.email || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                Submitted
              </p>
              <p className="mt-2 text-sm font-bold text-zinc-100">
                {new Date(freelancer.createdAt).toLocaleString()}
              </p>
            </div>

            <FreelancerStatusControls
              currentStatus={freelancer.status}
              freelancerId={freelancer.id}
            />

            {cvHref && (
              <a
                className="flex min-h-12 items-center justify-center rounded border border-yellow-300 bg-yellow-300 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-yellow-200"
                href={cvHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                Download CV
              </a>
            )}
          </aside>

          <div className="space-y-8">
            <section className="rounded border border-white/10 bg-white/[0.04] p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black text-white">Personal Information</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <DetailField label="Full Name" value={freelancer.fullName} />
                <DetailField label="Age" value={freelancer.age} />
                <DetailField label="Gender" value={freelancer.gender} />
                <DetailField label="City" value={freelancer.city} />
                <DetailField label="Phone" value={freelancer.phone} />
                <DetailField label="Email" value={freelancer.email} />
              </div>
            </section>

            <section className="rounded border border-white/10 bg-white/[0.04] p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black text-white">Application Details</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <DetailField label="Experience" value={freelancer.experience} wide />
                <DetailField label="Languages" value={freelancer.languages} />
                <DetailField label="Availability" value={freelancer.availability} />
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
