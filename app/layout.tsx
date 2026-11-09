import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Douceur & Élégance | Prêt-à-porter féminin",
    template: "%s | Douceur & Élégance",
  },
  description:
    "Robes, jupes et blouses en matières naturelles, en petites séries. Livraison offerte dès 60 €.",
  openGraph: {
    title: "Douceur & Élégance",
    description:
      "Robes, jupes et blouses en matières naturelles, en petites séries.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}