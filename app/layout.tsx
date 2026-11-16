import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Jost, La_Belle_Aurore } from "next/font/google";
import CartDrawer from "@/app/components/CartDrawer";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const hand = La_Belle_Aurore({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hand",
});
const sans = Jost({ subsets: ["latin"], variable: "--font-body" });

// Décide si l'écran d'accueil se joue : page d'accueil, première fois dans cet onglet,
// et seulement si la personne n'a pas demandé de réduire les animations.
const INTRO_SCRIPT = `(function(){var d=document.documentElement;try{var seen=sessionStorage.getItem("rv-intro");var calm=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(location.pathname==="/"&&!seen&&!calm){d.setAttribute("data-intro","pending");sessionStorage.setItem("rv-intro","1");setTimeout(function(){d.setAttribute("data-intro","opening")},1900);setTimeout(function(){d.setAttribute("data-intro","done")},3000)}else{d.setAttribute("data-intro","done")}}catch(e){d.setAttribute("data-intro","done")}})();`;

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
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body
        className={`${display.variable} ${hand.variable} ${sans.variable} antialiased`}
      >
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}