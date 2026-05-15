import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

const hasClerkKeys = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;

// Create the handler function separately
const clerkHandler = async (auth: any, req: any) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
};

// If we don't have keys, export a simple pass-through middleware
// This prevents clerkMiddleware from throwing an initialization error
export default hasClerkKeys
  ? clerkMiddleware(clerkHandler)
  : () => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
