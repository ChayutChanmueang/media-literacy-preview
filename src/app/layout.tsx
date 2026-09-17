import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("naplab_ml_session");
  const sizeCookie = cookieStore.get("naplab_ml_size");

  // Theme is always purple regardless of province (retained for future use)
  let theme = "purple";
  let size = "normal";

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

  if (sizeCookie?.value) {
    size = sizeCookie.value;
  }

  return (
    <html lang="th" data-theme={theme} data-size={size}>
      <body className="min-h-full flex justify-center bg-[#f8fafc]">
        <AppLayout initialTheme={theme} initialSize={size}>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
