"use client";

import Link from "next/link";
import { useState } from "react";
import { GitBranch, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#workflows", label: "Workflows" },
  { href: "#models", label: "Models" },
  { href: "#security", label: "Security" },
  { href: "https://github.com/rishilpasunuri2005/omniroute-ai", label: "Docs" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-[var(--z-sticky-nav)] surface-nav">
      <nav className="mx-auto flex h-14 max-w-[var(--container)] items-center justify-between px-4 sm:px-8 lg:px-12">
        {/* Brand Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[var(--color-ink)] hover:text-[var(--color-accent)] active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center bg-[var(--color-paper-2)] border border-[var(--color-rule)]">
            <GitBranch className="h-3.5 w-3.5 text-[var(--color-accent)]" />
          </div>
          <span className="text-sm font-medium tracking-tight">OmniRoute AI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] hover:underline active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (
            <Link
              href="/sign-in"
              className="text-xs text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/app/chat"
            className="btn-primary active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
          >
            Launch console
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-8 w-8 items-center justify-center border border-[var(--color-rule)] text-[var(--color-muted)] hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)] active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] md:hidden transition-colors disabled:opacity-50"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {/* Mobile Nav Drawer */}
      {open && (
        <div className="border-t border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-4 md:hidden">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-xs text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-[var(--color-rule)] flex flex-col gap-2">
              {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="text-xs text-[var(--color-muted)] py-1"
                >
                  Sign in
                </Link>
              )}
              <Link
                href="/app/chat"
                onClick={() => setOpen(false)}
                className="btn-primary text-center"
              >
                Launch console
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
