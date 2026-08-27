import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThermalGuard | AI Industrial Fire & Thermal Source Intelligence (SIH 26162)",
  description:
    "AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources using NASA FIRMS VIIRS/MODIS satellite data.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-background text-slate-100 min-h-screen antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

