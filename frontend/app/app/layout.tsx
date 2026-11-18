"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
      <main
        className={cn(
          "min-h-screen px-4 pb-8 pt-20 transition-[margin-left] duration-200 ease-in-out lg:px-8 lg:pt-8",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[264px]"
        )}
      >
        {children}
      </main>
    </div>
  );
}
