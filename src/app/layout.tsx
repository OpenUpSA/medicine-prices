import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: "MPR (Medicine Price Registry)",
  description:
    "Look up regulated South African medicine prices (Single Exit Price), find generic alternatives and check what you should be paying.",
  icons: {
    icon: "/favicon.ico",
    apple: "/images/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Runs before React hydration to avoid a flash of the wrong theme */}
      <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}` }} />
      <body>
        <a id="top" />
        <main className="container">
          <header className="page-header">
            <h1>What should your medicines cost?</h1>
            <ThemeToggle />
          </header>
          {children}
        </main>
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
