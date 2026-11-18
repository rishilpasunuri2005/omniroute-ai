import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { GitBranch } from "lucide-react";

const clerkAppearance = {
  variables: {
    colorPrimary: "#FF8A3D",
    colorText: "#F2F2EE",
    colorTextSecondary: "#A0A0A8",
    colorBackground: "#151516",
    colorInputBackground: "#0E0E0F",
    colorInputText: "#F2F2EE",
    borderRadius: "0px",
    fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
  },
  elements: {
    card: "shadow-card border border-border",
    headerTitle: "font-display",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
    footerActionLink: "text-primary hover:underline",
  },
};

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center border border-border bg-primary/10">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display text-lg font-semibold">OmniRoute AI</span>
          </Link>
        </div>
        <SignUp appearance={clerkAppearance} />
      </div>
    </div>
  );
}
