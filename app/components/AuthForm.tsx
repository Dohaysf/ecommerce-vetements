"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  mode: "login" | "register";
  redirectTo: string;
};

const inputClass =
  "w-full rounded-full border border-[#E9CFC9] bg-[#FFF8F3] px-5 py-3 text-sm outline-none transition focus:border-[#C9566F]";

export default function AuthForm({ mode, redirectTo }: Props) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const otherHref =
    (isRegister ? "/connexion" : "/inscription") +
    (redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        isRegister ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isRegister ? { name, email, password } : { email, password }
          ),
        }
      );

      if (res.ok) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error || "Une erreur est survenue");
    } catch {
      setError("Impossible de joindre le serveur, réessaie");
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#F6D5D0] via-[#FBE6DF] to-[#FFF8F3] px-6 py-12 text-[#3A2A2E]">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 block text-center text-xs uppercase tracking-[0.3em] text-[#A08A8E] hover:text-[#C9566F]"
        >
          ← Retour à la boutique
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgba(201,86,111,0.15)]">
          <p className="text-center font-serif text-3xl italic text-[#5E2536]">
            {isRegister ? "Créer un compte" : "Connexion"}
          </p>
          <p className="mt-2 text-center text-xs uppercase tracking-widest text-[#C9566F]">
            Douceur &amp; Élégance
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            {isRegister && (
              <input
                type="text"
                required
                autoComplete="name"
                placeholder="Prénom et nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            )}

            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />

            <div>
              <input
                type="password"
                required
                minLength={isRegister ? 8 : undefined}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              {isRegister && (
                <p className="mt-2 px-2 text-xs text-[#A08A8E]">
                  8 caractères minimum
                </p>
              )}
            </div>

            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-full bg-[#C9566F] py-3.5 text-xs uppercase tracking-[0.25em] text-white shadow-[0_6px_18px_rgba(201,86,111,0.35)] transition hover:bg-[#B8445E] disabled:opacity-50"
            >
              {loading
                ? "Un instant..."
                : isRegister
                ? "Créer mon compte"
                : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#7A5A60]">
            {isRegister ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
            <Link
              href={otherHref}
              className="font-medium text-[#C9566F] hover:underline"
            >
              {isRegister ? "Se connecter" : "Créer un compte"}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}