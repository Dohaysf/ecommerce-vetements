import Link from "next/link";
import type { ReactNode } from "react";
import LogoutButton from "@/app/admin/components/LogoutButton";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FBF5F0] text-[#3D302C]">
      <div className="flex">
        <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-[#E8D5CE] p-6">
          <div>
            <p className="mb-8 font-serif text-lg italic text-[#C4877E]">
              Admin
            </p>
            <nav className="flex flex-col gap-1 text-sm">
              <Link
                href="/admin"
                className="rounded-full px-4 py-2 hover:bg-[#E8B4B0]/10"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/produits"
                className="rounded-full px-4 py-2 hover:bg-[#E8B4B0]/10"
              >
                Produits
              </Link>
              <Link
                href="/admin/commandes"
                className="rounded-full px-4 py-2 hover:bg-[#E8B4B0]/10"
              >
                Commandes
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}