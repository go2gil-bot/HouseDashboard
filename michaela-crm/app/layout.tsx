import type { Metadata } from "next";
import {
  Frank_Ruhl_Libre,
  Heebo,
  Inter,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { DIR, LOCALE } from "@/lib/i18n";

// adjustFontFallback is off on the two Latin faces on purpose. Next's metric
// fallback is Arial, which HAS Hebrew glyphs — with it in the stack, Hebrew
// would render in Arial instead of falling through to Heebo below.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  adjustFontFallback: false,
});
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  adjustFontFallback: false,
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});
const frankRuhl = Frank_Ruhl_Libre({
  variable: "--font-frank-ruhl",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "Michaela Hotels",
  description: "Boutique hotel chain — book a room across five properties.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={LOCALE}
      dir={DIR}
      className={`${inter.variable} ${playfair.variable} ${heebo.variable} ${frankRuhl.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
