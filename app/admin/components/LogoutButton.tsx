"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/connexion");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="mt-8 w-full rounded-full border border-[#E8D5CE] px-4 py-2 text-xs uppercase tracking-widest text-[#7A6B65] hover:border-[#C4877E] hover:text-[#C4877E]"
    >
      Déconnexion
    </button>
  );
}