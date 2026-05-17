"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  Bot,
  ChevronLeft,
  GitBranch,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/chat", label: "Chat", icon: MessageSquare, badge: "Live" },
  { href: "/app/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/app/models", label: "Models", icon: Bot },
  { href: "/app/workflows", label: "Workflows", icon: Workflow },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg glass text-muted-foreground lg:hidden"
        aria-label="Open sidebar"
      >
        <PanelLeftOpen className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 264 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/6 bg-[hsl(222,47%,4%)]",
          "max-lg:translate-x-[-100%] lg:translate-x-0",
          mobileOpen && "max-lg:translate-x-0"
        )}
        style={{ width: collapsed ? 72 : 264 }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/5 px-4">
          <Link href="/" className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 glow-border transition hover:bg-primary/25">
              <GitBranch className="h-4 w-4 text-primary" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <p className="truncate text-sm font-semibold transition hover:text-primary">OmniRoute AI</p>
                <p className="truncate text-[11px] text-muted-foreground">Orchestration</p>
              </motion.div>
            )}
          </Link>

          {/* Collapse toggle — desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-white/5 hover:text-foreground lg:flex"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          {/* Close — mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-white/5 lg:hidden flex"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-primary/10 text-primary glow-border"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/5 p-3">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && <UserButton />}
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">Workspace</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
