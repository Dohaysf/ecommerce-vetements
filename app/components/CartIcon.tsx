"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/app/store/cartStore";

export default function CartIcon() {
  const router = useRouter();
  const totalItems = useCartStore((state) => state.totalItems());
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setEmail(data.user?.email ?? null))
      .catch(() => setEmail(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setEmail(null);
    router.refresh();
  };

  const box =
    "flex h-11 items-center justify-center border border-[#D8C39A] bg-[#FCF8F0]/95 text-[#5A1E2E] backdrop-blur transition hover:border-[#5A1E2E]";
  const pill = `${box} px-5 text-[12px] uppercase tracking-[0.18em]`;

  return (
    <div className="fixed right-6 top-6 z-50 flex items-center gap-2">
      {mounted &&
        (email ? (
          <>
            <Link href="/mes-commandes" className={`${pill} hidden sm:flex`}>
              Mes commandes
            </Link>
            <button onClick={handleLogout} className={pill}>
              Déconnexion
            </button>
          </>
        ) : (
          <Link href="/connexion" className={pill}>
            Connexion
          </Link>
        ))}

      <Link
        href="/panier"
        aria-label="Voir le panier"
        className={`${box} relative w-11`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8h12l1 12H5L6 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
        {mounted && totalItems > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5A1E2E] px-1 text-[11px] text-[#F7F1E8]">
            {totalItems}
          </span>
        )}
      </Link>
    </div>
  );
}