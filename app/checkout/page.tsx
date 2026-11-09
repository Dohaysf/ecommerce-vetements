import { redirect } from "next/navigation";
import Link from "next/link";
import CheckoutForm from "@/app/components/CheckoutForm";
import { getClientSession } from "@/lib/clientSession";

export default async function CheckoutPage() {
  const session = await getClientSession();
  if (!session) redirect("/connexion?redirect=/checkout");

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F6D5D0] via-[#FBE6DF] to-[#FFF8F3] px-6 py-12 text-[#3A2A2E] sm:px-12">
      <Link
        href="/panier"
        className="text-xs uppercase tracking-[0.3em] text-[#A08A8E] hover:text-[#C9566F]"
      >
        ← Retour au panier
      </Link>

      <h1 className="mb-10 mt-6 font-serif text-4xl italic text-[#5E2536]">
        Finaliser ma commande
      </h1>

      <CheckoutForm />
    </main>
  );
}