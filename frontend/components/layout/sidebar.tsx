"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { BarChart3, Bot, GitBranch, MessageSquare, Settings, Workflow } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/models", label: "Models", icon: Bot },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-x-0 top-0 z-30 border-b border-border bg-background/82 backdrop-blur-xl lg:inset-y-0 lg:left-0 lg:right-auto lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center gap-3 px-4 lg:h-20 lg:px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/40 bg-primary/15">
          <GitBranch className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">OmniRoute AI</p>
          <p className="truncate text-xs text-muted-foreground">Multi-model orchestration</p>
        </div>
        <div className="ml-auto">
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && <UserButton />}
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 shrink-0 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition hover:bg-white/8 hover:text-foreground",
                active && "bg-primary/14 text-primary",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
