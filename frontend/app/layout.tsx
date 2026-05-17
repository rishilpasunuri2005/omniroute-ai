import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "OmniRoute AI — Intelligent Multi-Model Agent Orchestration",
    template: "%s | OmniRoute AI",
  },
  description:
    "Dynamically route tasks to the best AI models and agents based on complexity, cost, and performance. Build smarter agentic workflows.",
  keywords: ["AI", "orchestration", "multi-model", "agent", "routing", "LLM", "workflow"],
  openGraph: {
    title: "OmniRoute AI — Intelligent Multi-Model Agent Orchestration",
    description: "Dynamically route tasks to the best AI models and agents.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );

  if (!publishableKey) {
    return content;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {content}
    </ClerkProvider>
  );
}
