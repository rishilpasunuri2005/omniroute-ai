"use client";

import Link from "next/link";
import { GitBranch, Github } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Workflows", href: "#workflows" },
    { label: "Security", href: "#security" },
    { label: "Models", href: "#models" },
  ],
  Resources: [
    { label: "Documentation", href: "https://github.com/rishilpasunuri2005/omniroute-ai#readme" },
    { label: "API reference", href: "http://localhost:8000/docs" },
    { label: "Security audit", href: "https://github.com/rishilpasunuri2005/omniroute-ai/blob/master/REPORT.md" },
  ],
  Community: [
    { label: "GitHub repository", href: "https://github.com/rishilpasunuri2005/omniroute-ai" },
    { label: "Issue tracker", href: "https://github.com/rishilpasunuri2005/omniroute-ai/issues" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-rule)] bg-[var(--color-paper)]">
      <div className="mx-auto max-w-[var(--container)] px-4 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-[var(--color-ink)] active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
            >
              <div className="flex h-7 w-7 items-center justify-center bg-[var(--color-paper-2)] border border-[var(--color-rule)]">
                <GitBranch className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              </div>
              <span className="text-sm font-medium tracking-tight">OmniRoute AI</span>
            </Link>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-[var(--color-muted)]">
              Multi-model agent orchestration platform. Dynamically classify, route, and validate AI tasks with full cost and latency visibility.
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href="https://github.com/rishilpasunuri2005/omniroute-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center border border-[var(--color-rule)] text-[var(--color-muted)] hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)] active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Nav Categories */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <span className="text-xs font-medium text-[var(--color-ink)] block">
                {title}
              </span>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] hover:underline active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-[var(--color-rule)] flex flex-col items-center justify-between gap-4 sm:flex-row text-[11px] text-[var(--color-muted)]">
          <span>
            © {new Date().getFullYear()} OmniRoute AI. Architecture licensed under MIT.
          </span>
          <span className="num-tabular">
            Hallmark v2.0 · Midnight theme
          </span>
        </div>
      </div>
    </footer>
  );
}
