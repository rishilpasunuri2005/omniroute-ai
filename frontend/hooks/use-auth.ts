import { useAuth as useClerkAuth } from "@clerk/nextjs";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function useAuth() {
  if (hasClerk) {
    return useClerkAuth();
  }

  return {
    userId: null,
    sessionId: null,
    getToken: async () => null,
    isSignedIn: false,
    isLoaded: true,
    signOut: async () => {},
  };
}
