import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { PwaRuntime } from "@/components/pwa/pwa-runtime";
import { publicEnv } from "@/lib/env";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const title = "Wayzo — Upload your tickets. We'll run the trip.";
const description =
  "Wayzo is an AI trip dashboard for group travel. Drop in your bookings and get stays, food picks, a day-by-day plan, a shared budget and a morning brief for your group.";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.appUrl),
  title: { default: title, template: "%s · Wayzo" },
  description,
  applicationName: "Wayzo",
  keywords: ["group travel", "trip planner", "AI itinerary", "split expenses", "travel dashboard"],
  openGraph: {
    type: "website",
    siteName: "Wayzo",
    title,
    description,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description },
  appleWebApp: { capable: true, title: "Wayzo", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0B1020",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <AnalyticsProvider>
          {children}
          <Toaster />
          <PwaRuntime />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
