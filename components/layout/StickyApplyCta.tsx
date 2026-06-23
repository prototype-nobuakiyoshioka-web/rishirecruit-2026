"use client";

import Link from "next/link";

export function StickyApplyCta({ jobSlug }: { jobSlug: string }) {
  return (
    <Link
      href={`/apply?job=${jobSlug}`}
      aria-label="この求人に応募する"
      className="fixed inset-x-[var(--space-4)] bottom-[var(--space-4)] z-40 flex min-h-14 items-center justify-center rounded-[var(--radius-full)] bg-[color:var(--c-pin-job)] px-[var(--space-6)] text-base font-bold tracking-normal text-[color:var(--c-snow)] shadow-[var(--shadow-pop-coral)] transition-[filter] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--c-deep-ocean)] md:inset-x-auto md:bottom-auto md:right-[var(--space-6)] md:top-1/2 md:min-h-16 md:w-40 md:-translate-y-1/2"
    >
      応募する
    </Link>
  );
}
