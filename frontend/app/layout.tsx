import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
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
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
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
