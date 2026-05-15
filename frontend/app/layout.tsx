import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "OmniRoute AI",
  description: "Intelligent Multi-Model Agent Orchestration Platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_Y2xlcmsuZGV2ZWxvcG1lbnQk";

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" className="dark">
        <body>
          <div className="glass-grid min-h-screen">
            <Sidebar />
            <main className="px-4 pb-8 pt-24 lg:ml-72 lg:px-8 lg:pt-8">{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
