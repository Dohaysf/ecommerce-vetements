"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Erreur de connexion");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF5F0] px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_4px_24px_rgba(196,135,126,0.12)]">
        <p className="text-center font-serif text-2xl italic text-[#C4877E]">
          Admin
        </p>
        <p className="mt-1 text-center text-xs uppercase tracking-widest text-[#B0A29B]">
          Connexion
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-full border border-[#E8D5CE] bg-[#FBF5F0] px-5 py-3 text-sm outline-none focus:border-[#E8B4B0]"
          />
          <input
            type="password"
            required
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-full border border-[#E8D5CE] bg-[#FBF5F0] px-5 py-3 text-sm outline-none focus:border-[#E8B4B0]"
          />

          {error && (
            <p className="text-center text-xs text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-[#E8B4B0] py-3 text-sm uppercase tracking-widest text-white transition hover:bg-[#C4877E] disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}