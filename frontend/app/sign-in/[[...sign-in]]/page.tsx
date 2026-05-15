import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6 text-center">
        <div className="rounded-lg border border-border bg-card p-8">
          <h1 className="text-xl font-semibold text-foreground">Authentication Unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please configure your Clerk environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <SignIn />
    </div>
  );
}
