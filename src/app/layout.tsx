import type { Metadata } from "next";
import "./globals.css";
import "@fontsource-variable/manrope";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "./shop.css";
import "./refinement.css";
import "./palette.css";
import "./commerce-refresh.css";
export const metadata: Metadata = {
  title: {
    default: "Poseidon Akvaryum | Suyun altında, bambaşka bir dünya.",
    template: "%s | Poseidon Akvaryum",
  },
  description:
    "Denizli Poseidon Akvaryum. Akvaryumlar, canlılar, ekipmanlar ve doğal bir sualtı dünyası için ihtiyaç duyduğunuz her şey.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
