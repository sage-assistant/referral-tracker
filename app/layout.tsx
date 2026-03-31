import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Silicon Grip | Referral Tracker",
  description: "Premium referral tracking for Silicon Grip client partnerships."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@200;300;400;500&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="antialiased">
        <Sidebar session={session} />
        {children}
      </body>
    </html>
  );
}
