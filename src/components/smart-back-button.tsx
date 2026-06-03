"use client";

import { useRouter } from "next/navigation";

export function SmartBackButton({
  fallbackHref,
  label,
  className = "text-sm font-semibold text-yellow-300",
}: {
  fallbackHref: string;
  label: string;
  className?: string;
}) {
  const router = useRouter();

  function goBack() {
    router.push(fallbackHref);
  }

  return (
    <button className={className} onClick={goBack} type="button">
      {label}
    </button>
  );
}
