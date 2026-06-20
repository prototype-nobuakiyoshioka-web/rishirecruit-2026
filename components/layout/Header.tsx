"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useState } from "react";
import {
  FooterCopyright,
  FooterLegalLinks,
  FooterOfficeInfo,
} from "@/components/layout/FooterInfo";

const NAV_ITEMS = [
  { label: "メッセージ", href: "/message" },
  { label: "移住者の声", href: "/voices" },
  { label: "求人", href: "/jobs" },
  { label: "観光地", href: "/spots" },
  { label: "イベント", href: "/events" },
  { label: "お問い合わせ", href: "/contact" },
];

const HEADER_CONTAINER_STYLE: CSSProperties = {
  backgroundColor: "rgba(250, 246, 238, 0.94)",
  borderRadius: "var(--radius-full)",
  boxShadow: "var(--shadow-md)",
  marginInline: "auto",
  paddingInline: "var(--space-6)",
  width: "min(calc(100vw - 48px), var(--container-max))",
};

const DESKTOP_NAV_STYLE: CSSProperties = {
  gap: "var(--space-6)",
};

const HEADER_SHELL_STYLE: CSSProperties = {
  paddingInline: "var(--space-6)",
  paddingTop: "var(--space-4)",
};

const MOBILE_MENU_STYLE: CSSProperties = {
  backgroundColor: "rgba(250, 246, 238, 0.96)",
  boxShadow: "var(--shadow-md)",
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={HEADER_SHELL_STYLE}
    >
      <div
        className="flex h-14 items-center justify-between border border-[color:var(--c-border-subtle)] backdrop-blur-md md:h-16"
        style={HEADER_CONTAINER_STYLE}
      >
        <Link
          href="/"
          className="flex min-h-11 items-center text-base font-bold tracking-normal text-[color:var(--c-deep-ocean)] md:text-lg"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          rishirecruit
        </Link>

        <nav className="hidden items-center md:flex" style={DESKTOP_NAV_STYLE}>
          {NAV_ITEMS.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex min-h-11 items-center rounded-[var(--radius-full)] px-[var(--space-3)] text-sm font-bold tracking-normal transition-colors",
                  isActive
                    ? "bg-[color:var(--c-deep-ocean)] text-[color:var(--c-text-inverse)]"
                    : "text-[color:var(--c-text-secondary)] hover:bg-[color:var(--c-border-subtle)] hover:text-[color:var(--c-deep-ocean)]",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-full)] text-[color:var(--c-deep-ocean)] transition-colors hover:bg-[color:var(--c-border-subtle)] md:hidden"
          aria-label={isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        >
          <span className="relative h-4 w-5" aria-hidden="true">
            <span
              className={[
                "absolute left-0 top-0 h-0.5 w-5 rounded-[var(--radius-full)] bg-current transition-transform",
                isMobileMenuOpen ? "translate-y-[7px] rotate-45" : "",
              ].join(" ")}
            />
            <span
              className={[
                "absolute left-0 top-[7px] h-0.5 w-5 rounded-[var(--radius-full)] bg-current transition-opacity",
                isMobileMenuOpen ? "opacity-0" : "opacity-100",
              ].join(" ")}
            />
            <span
              className={[
                "absolute left-0 top-3.5 h-0.5 w-5 rounded-[var(--radius-full)] bg-current transition-transform",
                isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : "",
              ].join(" ")}
            />
          </span>
        </button>
      </div>

      {isMobileMenuOpen ? (
        // 88px = mobile header height(56px) + shell top padding(16px) + menu gap(16px)。
        <nav
          id="mobile-navigation"
          className="mx-auto mt-[var(--space-2)] grid max-h-[calc(100vh-88px)] max-w-[var(--container-max)] gap-[var(--space-2)] overflow-y-auto rounded-[var(--radius-2xl)] border border-[color:var(--c-border-subtle)] p-[var(--space-2)] backdrop-blur-md md:hidden"
          style={MOBILE_MENU_STYLE}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex min-h-11 items-center rounded-[var(--radius-full)] px-[var(--space-4)] text-sm font-bold tracking-normal transition-colors",
                  isActive
                    ? "bg-[color:var(--c-deep-ocean)] text-[color:var(--c-text-inverse)]"
                    : "text-[color:var(--c-text-secondary)] hover:bg-[color:var(--c-border-subtle)] hover:text-[color:var(--c-deep-ocean)]",
                ].join(" ")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-[var(--space-2)] border-t border-[color:var(--c-border-subtle)] px-[var(--space-4)] pt-[var(--space-4)] text-xs leading-5 text-[color:var(--c-text-secondary)]">
            <FooterOfficeInfo />
            <FooterLegalLinks className="mt-[var(--space-3)] text-[color:var(--c-deep-ocean)]" />
            <FooterCopyright className="mt-[var(--space-3)] text-[color:var(--c-text-secondary)]" />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
