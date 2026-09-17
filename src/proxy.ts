import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public pages, APIs, static files, and assets pass through without checks
  if (
    pathname === "/" ||
    pathname.startsWith("/facilitator") ||
    pathname.startsWith("/dev") || // internal QA hub (US-03-R4); the page itself gates on ENABLE_DEV_HUB
    pathname.startsWith("/api") ||
    pathname.includes(".") // matches files like /favicon.ico, manifest.json, sw.js, etc.
  ) {
    return NextResponse.next();
  }

  // 1. Session / Onboarding Guard
  const sessionCookie = request.cookies.get("naplab_ml_session");
  let hasSession = false;
  let isTestingGroup = false;
  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      if (session.consentGiven && session.ageGroup) {
        hasSession = true;
        isTestingGroup = !!session.isTestingGroup;
      }
    } catch (e) {
      console.error("Middleware failed to parse session cookie:", e);
    }
  }

  // If trying to access protected paths and no valid onboarding exists, redirect to /consent
  // (registration is two steps: /consent = age, /consent/location = address + PDPA)
  if (!hasSession && !pathname.startsWith("/consent")) {
    const url = request.nextUrl.clone();
    url.pathname = "/consent";
    // If they tried to access /pretest, remember it so we can route them back after consent
    if (pathname === "/pretest") {
      url.searchParams.set("redirect", "/pretest");
    }
    return NextResponse.redirect(url);
  }

  // If already onboarded and trying to go back to registration, redirect to lessons selector
  if (hasSession && pathname.startsWith("/consent")) {
    const url = request.nextUrl.clone();
    url.pathname = "/lessons";
    return NextResponse.redirect(url);
  }

  // Auto-register as testing group if accessing test routes directly
  if ((pathname === "/pretest" || pathname === "/posttest") && hasSession && !isTestingGroup) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie!.value));
      session.isTestingGroup = true;
      isTestingGroup = true;
      const response = NextResponse.next();
      response.cookies.set("naplab_ml_session", encodeURIComponent(JSON.stringify(session)), {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });
      return response;
    } catch (e) {
      console.error("Middleware failed to update session cookie for testing group:", e);
    }
  }

  // 2. Pre-test completion Guard (Only enforced for testing group)
  if (isTestingGroup) {
    const pretestCompletedCookie = request.cookies.get("naplab_ml_pretest_completed");
    const isPretestCompleted = pretestCompletedCookie?.value === "true";

    const isProtectedLearningPath = 
      pathname === "/lessons" || 
      pathname.startsWith("/lessons/") || 
      pathname === "/posttest" || 
      pathname === "/certificate";

    if (isProtectedLearningPath && !isPretestCompleted && pathname !== "/pretest") {
      const url = request.nextUrl.clone();
      url.pathname = "/pretest";
      return NextResponse.redirect(url);
    }
  }

  // 3. Post-test completion Guard (Only enforced for testing group, for Certificate page access)
  if (pathname === "/certificate" && isTestingGroup) {
    const posttestCompletedCookie = request.cookies.get("naplab_ml_posttest_completed");
    const isPosttestCompleted = posttestCompletedCookie?.value === "true";

    if (!isPosttestCompleted) {
      const url = request.nextUrl.clone();
      url.pathname = "/posttest";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api routes
     * 2. /_next/static (static assets)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico, manifest.json, sw.js, audio/sprites files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.png$|.*\\.jpg$|.*\\.mp3$).*)",
  ],
};
