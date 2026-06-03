import Link from "next/link";

const services = [
  "Corporate usher teams",
  "Exhibition reception desks",
  "VIP guest coordination",
  "Event staffing operations",
];

const why = [
  "Vetted multilingual ushers",
  "Fast staffing for urgent events",
  "Premium guest experience standards",
  "Clear reporting from request to delivery",
];

function StatRing({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded border border-white/10 bg-black/35 p-4 backdrop-blur">
      <div className="text-3xl font-semibold text-yellow-300">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.26em] text-zinc-400">{label}</div>
    </div>
  );
}

export function LandingExperience() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <section className="relative min-h-[92vh] px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(250,204,21,0.20),transparent_28%),linear-gradient(135deg,rgba(0,0,0,0.94),rgba(0,0,0,0.70)),url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black to-transparent" />

        <nav className="relative z-10 flex items-center justify-between">
          <a className="flex items-center gap-3" href="#home">
            <span className="grid h-11 w-11 place-items-center rounded border border-yellow-300/50 bg-yellow-300 text-lg font-black text-black shadow-[0_0_26px_rgba(250,204,21,0.35)]">
              A
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[0.38em] text-white">
                AURA
              </span>
              <span className="block text-[10px] uppercase tracking-[0.42em] text-yellow-300">
                Events
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-7 text-sm text-zinc-300 md:flex">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <Link href="/register/client">Clients</Link>
            <Link href="/register/freelancer">Freelancers</Link>
            <Link href="/admin/login" className="text-yellow-300">
              Admin
            </Link>
          </div>
        </nav>

        <div
          className="relative z-10 grid min-h-[76vh] items-center gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr]"
          id="home"
        >
          <div className="max-w-4xl animate-rise">
            <div className="mb-5 inline-flex rounded-full border border-yellow-300/30 bg-yellow-300/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-yellow-200">
              Luxury usher and event staffing
            </div>
            <h1 className="max-w-5xl text-5xl font-black leading-[0.92] tracking-normal text-white sm:text-7xl lg:text-8xl">
              AURA EVENTS
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">
              Premium event staffing, usher management, and guest-flow operations
              for brands that need every entrance, welcome desk, and VIP moment to
              feel deliberate.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link className="btn-primary" href="/register/client">
                Register as Client
              </Link>
              <Link className="btn-secondary" href="/register/freelancer">
                Join as Freelancer
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <StatRing value="24h" label="fast staffing" />
            <StatRing value="500+" label="usher network" />
            <StatRing value="VIP" label="guest protocol" />
          </div>
        </div>
      </section>

      <section className="section-grid" id="about">
        <div>
          <p className="eyebrow">About us</p>
          <h2 className="section-title">Operational polish for high-profile events.</h2>
        </div>
        <p className="section-copy">
          AURA EVENTS connects clients with trained ushers and on-ground event
          teams. The platform captures client requirements, screens freelancer
          applications, and gives admins a clear dashboard for decisions and
          reporting.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12" id="services">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Services</p>
            <h2 className="section-title">Built for events that cannot feel improvised.</h2>
          </div>
          <a className="text-sm font-semibold text-yellow-300" href="https://wa.me/201000000000">
            WhatsApp booking
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {services.map((service) => (
            <div className="glass-card" key={service}>
              <div className="mb-5 h-1 w-12 bg-yellow-300" />
              <h3 className="text-lg font-semibold text-white">{service}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Staffing plans, briefing details, and post-event visibility for
                a premium guest journey.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-grid" id="why">
        <div>
          <p className="eyebrow">Why choose us</p>
          <h2 className="section-title">A sharp process behind the shine.</h2>
        </div>
        <div className="grid gap-3">
          {why.map((item) => (
            <div className="flex items-center gap-3 rounded border border-white/10 bg-white/[0.04] p-4" key={item}>
              <span className="h-2 w-2 bg-yellow-300" />
              <span className="text-zinc-200">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-grid">
        <div>
          <p className="eyebrow">Registration</p>
          <h2 className="section-title">Choose the right path.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link className="glass-card block" href="/register/client">
            <h3 className="text-xl font-bold text-white">Register as Client</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Submit event details and usher requirements in a dedicated request page.
            </p>
          </Link>
          <Link className="glass-card block" href="/register/freelancer">
            <h3 className="text-xl font-bold text-white">Join as Freelancer</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Send your usher profile, availability, languages, photo, and CV.
            </p>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12" id="contact">
        <div className="rounded border border-yellow-300/20 bg-yellow-300 p-8 text-black md:flex md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em]">Contact</p>
            <h2 className="mt-3 text-3xl font-black">Ready to staff a premium event?</h2>
          </div>
          <div className="mt-6 grid gap-2 text-sm font-semibold md:mt-0">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=auraevents.egyptt@gmail.com&su=AURA%20EVENTS%20Inquiry"
              rel="noopener noreferrer"
              target="_blank"
            >
              auraevents.egyptt@gmail.com
            </a>
            <a href="tel:+201006266546">+20 100 6266 546</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-sm text-zinc-500 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p>© 2026 AURA EVENTS. Premium event and usher management.</p>
          <div className="flex gap-5">
            <a
              href="https://www.instagram.com/aura.events.eg?igsh=bGx5Z3d6bnJ4Zzdi"
              rel="noopener noreferrer"
              target="_blank"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/share/18kdDU6H83/?mibextid=wwXIfr"
              rel="noopener noreferrer"
              target="_blank"
            >
              Facebook
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
