import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import AudioProvider from "@/components/AudioProvider";
import { DEV_APP_MODE_COOKIE, getServerAppMode } from "@/lib/appMode";
import { notoLoopedThai } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "รู้ทันสื่อ - Interactive Learning",
  description: "สื่อการเรียนรู้ออนไลน์แบบตอบโต้เพื่อพัฒนาความรู้ดิจิทัลและการรู้เท่าทันสื่อสำหรับผู้สูงอายุ",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

// Safari on iPhone puts its URL/tab bar at the bottom, over the page — mark <html> so bottom action
// bars keep extra room there (pb-action-bar in globals.css). Runs inline before first paint so the bar
// never jumps. Only real Safari: other iPhone browsers/in-app views (Chrome, Firefox, Edge, LINE, FB, IG…)
// share WebKit but not that bar, so they are excluded by name; iPad Safari has its bar at the top.
const IOS_SAFARI_SCRIPT = String.raw`try{var u=navigator.userAgent;if(/iPhone|iPod/.test(u)&&/Version\/[\d.]+.* Safari\//.test(u)&&!/CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|YaBrowser|DuckDuckGo|GSA\/|Line\/|FBAN|FBAV|Instagram|Twitter|MicroMessenger/.test(u))document.documentElement.setAttribute("data-ios-safari","")}catch(e){}`;

// Dev only: a service worker left over from a production run on localhost (PWA is disabled in dev but
// that doesn't unregister one) serves /_next/static/*.js CacheFirst — dev chunk names never change, so it
// keeps old code next to fresh HTML (e.g. a client component missing → crash → reload loop). Remove it and
// its caches, then reload once; HTML always comes from the network, so this runs even when the JS is stale.
const DEV_UNREGISTER_SW_SCRIPT = String.raw`try{navigator.serviceWorker&&navigator.serviceWorker.getRegistrations().then(function(r){if(!r.length)return;Promise.all(r.map(function(x){return x.unregister()})).then(function(){return window.caches?caches.keys().then(function(k){return Promise.all(k.map(function(n){return caches.delete(n)}))}):0}).then(function(){if(navigator.serviceWorker.controller)location.reload()})})}catch(e){}`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("naplab_ml_session");

  // Theme is always purple regardless of province (retained for future use)
  const theme = "purple";

  // if (sessionCookie?.value) {
  //   try {
  //     const session = JSON.parse(decodeURIComponent(sessionCookie.value));
  //     const province = session?.location?.province || "";
  //     if (province.includes("เชียงใหม่")) {
  //       theme = "purple";
  //     } else if (province.includes("แพร่")) {
  //       theme = "orange";
  //     } else if (province.includes("น่าน")) {
  //       theme = "green";
  //     } else if (province.includes("mint")) {
  //       theme = "mint";
  //     }
  //   } catch (e) {
  //     console.error("Failed to parse session cookie for theme server-side:", e);
  //   }
  // }

  return (
    // suppressHydrationWarning: IOS_SAFARI_SCRIPT adds data-ios-safari to <html> before React hydrates
    <html lang="th" data-theme={theme} className={notoLoopedThai.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: IOS_SAFARI_SCRIPT }} />
        {process.env.NODE_ENV === "development" && <script dangerouslySetInnerHTML={{ __html: DEV_UNREGISTER_SW_SCRIPT }} />}
      </head>
      <body className="min-h-full flex justify-center bg-[#f8fafc]">
        {/* ระบบเสียงกลางระบบเดียว (docs/software/11) — mount ครั้งเดียว อยู่ข้ามทุก route */}
        <AudioProvider />
        <AppLayout initialTheme={theme} appMode={getServerAppMode(cookieStore.get(DEV_APP_MODE_COOKIE)?.value)}>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
