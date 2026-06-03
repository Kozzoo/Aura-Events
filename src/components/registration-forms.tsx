"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { SmartBackButton } from "./smart-back-button";

type Toast = {
  tone: "success" | "error";
  message: string;
};

type LocationSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

function ToastMessage({ toast }: { toast: Toast | null }) {
  if (!toast) {
    return null;
  }

  return (
    <div
      className={`fixed right-4 top-4 z-50 rounded border px-4 py-3 text-sm shadow-2xl backdrop-blur ${
        toast.tone === "success"
          ? "border-yellow-300/40 bg-yellow-300/15 text-yellow-100"
          : "border-red-400/40 bg-red-500/15 text-red-100"
      }`}
    >
      {toast.message}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
  as = "input",
  options = [],
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  as?: "input" | "textarea" | "select";
  options?: string[];
}) {
  const base =
    "mt-2 w-full rounded border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-300/70 focus:bg-white/[0.09]";

  return (
    <label className="block text-sm text-zinc-300">
      {label}
      {as === "textarea" ? (
        <textarea className={`${base} min-h-28 resize-y`} name={name} required={required} />
      ) : as === "select" ? (
        <select className={base} name={name} required={required} defaultValue="">
          <option value="" disabled>
            Select
          </option>
          {options.map((option) => (
            <option className="bg-zinc-950" key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input className={base} name={name} required={required} type={type} />
      )}
    </label>
  );
}

function formatDisplayDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function DateField({
  label,
  name,
  required = false,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  const [displayDate, setDisplayDate] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const wrapperRef = useRef<HTMLLabelElement>(null);
  const base =
    "mt-2 w-full rounded border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-300/70 focus:bg-white/[0.09]";
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 9 }, (_, index) => currentYear + index);

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const emptyDays = Array.from({ length: firstWeekday }, () => null);
    const days = Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1));

    return [...emptyDays, ...days];
  }, [visibleMonth]);

  useEffect(() => {
    function closeCalendar(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeCalendar);
    return () => document.removeEventListener("pointerdown", closeCalendar);
  }, []);

  useEffect(() => {
    const form = wrapperRef.current?.closest("form");

    function resetDate() {
      setDisplayDate("");
      setCalendarOpen(false);
      setVisibleMonth(new Date());
    }

    form?.addEventListener("reset", resetDate);
    return () => form?.removeEventListener("reset", resetDate);
  }, []);

  function moveMonth(amount: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
    setMonthPickerOpen(false);
    setYearPickerOpen(false);
  }

  function selectMonth(month: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), month, 1));
    setMonthPickerOpen(false);
  }

  function selectYear(year: number) {
    setVisibleMonth((current) => new Date(year, current.getMonth(), 1));
    setYearPickerOpen(false);
  }

  function selectDate(date: Date) {
    setDisplayDate(formatDisplayDate(date.toISOString()));
    setCalendarOpen(false);
    setMonthPickerOpen(false);
    setYearPickerOpen(false);
  }

  return (
    <label className="relative block text-sm text-zinc-300" ref={wrapperRef}>
      {label}
      <input name={name} readOnly type="hidden" value={displayDate} />
      <input
        className={base}
        onClick={() => setCalendarOpen(true)}
        onFocus={() => setCalendarOpen(true)}
        placeholder="dd/m/yyyy"
        readOnly
        required={required}
        type="text"
        value={displayDate}
      />
      {calendarOpen && (
        <div className="absolute left-0 top-full z-30 mt-3 w-full min-w-72 rounded border border-yellow-300/30 bg-zinc-950 p-4 text-white shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between">
            <button
              aria-label="Previous month"
              className="grid h-9 w-9 place-items-center rounded border border-white/10 bg-white/[0.06] text-sm font-black text-zinc-200 transition hover:border-yellow-300/60 hover:text-yellow-100"
              onClick={() => moveMonth(-1)}
              type="button"
            >
              {"<"}
            </button>
            <div className="relative flex min-w-0 items-center gap-2">
              <button
                className="min-h-9 rounded border border-yellow-300/30 bg-yellow-300/10 px-3 text-sm font-black text-yellow-100 transition hover:border-yellow-300 hover:bg-yellow-300 hover:text-black"
                onClick={() => {
                  setMonthPickerOpen((open) => !open);
                  setYearPickerOpen(false);
                }}
                type="button"
              >
                {visibleMonth.toLocaleString("en-US", { month: "long" })}
              </button>
              <button
                className="min-h-9 rounded border border-white/10 bg-white/[0.06] px-3 text-sm font-black text-zinc-100 transition hover:border-yellow-300/70 hover:text-yellow-100"
                onClick={() => {
                  setYearPickerOpen((open) => !open);
                  setMonthPickerOpen(false);
                }}
                type="button"
              >
                {visibleMonth.getFullYear()}
              </button>

              {monthPickerOpen && (
                <div className="absolute left-1/2 top-11 z-40 grid w-72 -translate-x-1/2 grid-cols-3 gap-2 rounded border border-yellow-300/30 bg-zinc-950 p-3 shadow-2xl shadow-black/60">
                  {Array.from({ length: 12 }, (_, index) => {
                    const isActive = visibleMonth.getMonth() === index;
                    return (
                      <button
                        className={`rounded border px-3 py-2 text-xs font-black uppercase tracking-[0.08em] transition ${
                          isActive
                            ? "border-yellow-300 bg-yellow-300 text-black"
                            : "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-yellow-300/60 hover:bg-yellow-300/10 hover:text-yellow-100"
                        }`}
                        key={index}
                        onClick={() => selectMonth(index)}
                        type="button"
                      >
                        {new Date(2026, index, 1).toLocaleString("en-US", { month: "short" })}
                      </button>
                    );
                  })}
                </div>
              )}

              {yearPickerOpen && (
                <div className="absolute left-1/2 top-11 z-40 grid w-60 -translate-x-1/2 grid-cols-3 gap-2 rounded border border-yellow-300/30 bg-zinc-950 p-3 shadow-2xl shadow-black/60">
                  {yearOptions.map((year) => {
                    const isActive = visibleMonth.getFullYear() === year;
                    return (
                      <button
                        className={`rounded border px-3 py-2 text-xs font-black tracking-[0.08em] transition ${
                          isActive
                            ? "border-yellow-300 bg-yellow-300 text-black"
                            : "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-yellow-300/60 hover:bg-yellow-300/10 hover:text-yellow-100"
                        }`}
                        key={year}
                        onClick={() => selectYear(year)}
                        type="button"
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              aria-label="Next month"
              className="grid h-9 w-9 place-items-center rounded border border-white/10 bg-white/[0.06] text-sm font-black text-zinc-200 transition hover:border-yellow-300/60 hover:text-yellow-100"
              onClick={() => moveMonth(1)}
              type="button"
            >
              {">"}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.68rem] font-black uppercase tracking-[0.08em] text-zinc-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) =>
              date ? (
                <button
                  className={`grid aspect-square place-items-center rounded border text-sm font-bold transition ${
                    formatDisplayDate(date.toISOString()) === displayDate
                      ? "border-yellow-300 bg-yellow-300 text-black"
                      : "border-transparent bg-white/[0.04] text-zinc-200 hover:border-yellow-300/60 hover:bg-yellow-300/10 hover:text-yellow-100"
                  }`}
                  key={date.toISOString()}
                  onClick={() => selectDate(date)}
                  type="button"
                >
                  {date.getDate()}
                </button>
              ) : (
                <span aria-hidden="true" key={`empty-${index}`} />
              ),
            )}
          </div>
        </div>
      )}
    </label>
  );
}

function LocationField({
  label,
  name,
  required = false,
  wide = false,
}: {
  label: string;
  name: string;
  required?: boolean;
  wide?: boolean;
}) {
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [locationError, setLocationError] = useState("");

  function openMapsSearch() {
    if (!location.trim()) return;

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  useEffect(() => {
    const query = location.trim();

    if (query.length < 3) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      setLocationError("");

      try {
        const egyptResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=eg&q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const globalResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );

        if (!egyptResponse.ok || !globalResponse.ok) {
          throw new Error("Location search failed.");
        }

        const egyptResults = (await egyptResponse.json()) as LocationSuggestion[];
        const globalResults = (await globalResponse.json()) as LocationSuggestion[];
        const mergedResults = [...egyptResults, ...globalResults].filter(
          (suggestion, index, results) =>
            results.findIndex(
              (item) => item.lat === suggestion.lat && item.lon === suggestion.lon,
            ) === index,
        );

        setSuggestions(mergedResults.slice(0, 6));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setLocationError("Location suggestions could not be loaded.");
        }
      } finally {
        setLoadingSuggestions(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [location]);

  function selectSuggestion(suggestion: LocationSuggestion) {
    setLocation(suggestion.display_name);
    setSuggestions([]);
  }

  function updateLocation(value: string) {
    setLocation(value);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      setLocationError("");
    }
  }

  return (
    <label className={`relative block text-sm text-zinc-300 ${wide ? "md:col-span-2" : ""}`}>
      {label}
      <div className="mt-2 flex gap-2">
        <input
          className="min-w-0 flex-1 rounded border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-300/70 focus:bg-white/[0.09]"
          name={name}
          onChange={(event) => updateLocation(event.currentTarget.value)}
          placeholder="Search venue, address, or Google Maps link"
          required={required}
          type="text"
          value={location}
        />
        <button
          className="shrink-0 rounded border border-yellow-300/40 px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-yellow-100 transition hover:border-yellow-300 hover:bg-yellow-300 hover:text-black disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!location.trim()}
          onClick={openMapsSearch}
          type="button"
        >
          Maps
        </button>
      </div>
      {(loadingSuggestions || suggestions.length > 0) && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded border border-yellow-300/30 bg-zinc-950 shadow-2xl shadow-black/60">
          {loadingSuggestions ? (
            <div className="px-4 py-3 text-sm font-semibold text-zinc-400">
              Searching locations...
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <button
                className="block w-full border-b border-white/10 px-4 py-3 text-left text-sm font-semibold text-zinc-200 transition last:border-b-0 hover:bg-yellow-300/10 hover:text-yellow-100"
                key={`${suggestion.lat}-${suggestion.lon}-${suggestion.display_name}`}
                onClick={() => selectSuggestion(suggestion)}
                type="button"
              >
                {suggestion.display_name}
              </button>
            ))
          )}
        </div>
      )}
      {locationError && <p className="mt-2 text-xs font-semibold text-red-200">{locationError}</p>}
    </label>
  );
}

function RegistrationShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black px-5 py-6 text-white sm:px-8 lg:px-12">
      <header className="mx-auto flex max-w-5xl items-center justify-between border-b border-white/10 pb-6">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-11 w-11 place-items-center rounded border border-yellow-300/50 bg-yellow-300 text-lg font-black text-black">
            A
          </span>
          <span className="text-sm font-semibold tracking-[0.38em]">AURA EVENTS</span>
        </Link>
        <SmartBackButton fallbackHref="/" label="Back Home" />
      </header>
      <section className="mx-auto grid max-w-5xl gap-8 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="section-title">{title}</h1>
          <p className="mt-5 max-w-md text-zinc-400">
            Submit the details here. The information is stored for admin review
            inside the protected dashboard.
          </p>
        </div>
        {children}
      </section>
    </main>
  );
}

export function ClientRegistrationForm() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setToast(null);

    const form = event.currentTarget;
    const response = await fetch("/api/client-requests", {
      method: "POST",
      body: new FormData(form),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setToast({ tone: "error", message: payload.error ?? "Something went wrong." });
    } else {
      form.reset();
      setToast({ tone: "success", message: "Client request saved. Our team will contact you soon." });
    }

    setLoading(false);
    window.setTimeout(() => setToast(null), 4500);
  }

  return (
    <RegistrationShell eyebrow="Client registration" title="Request ushers for your next event.">
      <ToastMessage toast={toast} />
      <form className="glass-panel" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full Name" name="fullName" />
          <Field label="Company Name" name="companyName" required={false} />
          <Field label="Email" name="email" type="email" required={false} />
          <Field label="Phone Number" name="phone" />
          <Field
            label="Event Type"
            name="eventType"
            as="select"
            required={false}
            options={["Conference", "Exhibition", "Wedding", "Launch", "Gala", "Other"]}
          />
          <DateField label="Event Date" name="eventDate" required={false} />
          <LocationField label="Location" name="location" required={false} wide />
          <Field label="Number of Ushers Needed" name="ushersNeeded" type="number" required={false} />
        </div>
        <div className="mt-4">
          <Field label="Notes" name="notes" as="textarea" required={false} />
        </div>
        <button className="btn-primary mt-6 w-full" disabled={loading} type="submit">
          {loading ? "Saving request..." : "Submit Client Request"}
        </button>
      </form>
    </RegistrationShell>
  );
}

export function FreelancerRegistrationForm() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setToast(null);

    const form = event.currentTarget;
    const response = await fetch("/api/freelancers", {
      method: "POST",
      body: new FormData(form),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setToast({ tone: "error", message: payload.error ?? "Something went wrong." });
    } else {
      form.reset();
      setToast({ tone: "success", message: "Application received. Status is now Pending." });
    }

    setLoading(false);
    window.setTimeout(() => setToast(null), 4500);
  }

  return (
    <RegistrationShell eyebrow="Freelancer registration" title="Join the AURA usher network.">
      <ToastMessage toast={toast} />
      <form className="glass-panel" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full Name" name="fullName" />
          <Field label="Age" name="age" type="number" required={false} />
          <Field
            label="Gender"
            name="gender"
            as="select"
            required={false}
            options={["Female", "Male"]}
          />
          <Field label="Phone Number" name="phone" />
          <Field label="Email" name="email" type="email" required={false} />
          <Field label="City" name="city" required={false} />
          <Field label="Languages" name="languages" required={false} />
          <Field
            label="Availability"
            name="availability"
            as="select"
            required={false}
            options={["Weekdays", "Weekends", "Full availability"]}
          />
        </div>
        <div className="mt-4">
          <Field label="Experience" name="experience" as="textarea" required={false} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Upload Photo" name="profilePhoto" type="file" required={false} />
        </div>
        <button className="btn-primary mt-6 w-full" disabled={loading} type="submit">
          {loading ? "Sending application..." : "Submit Application"}
        </button>
      </form>
    </RegistrationShell>
  );
}
