import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export async function requireAdmin() {
  const store = await cookies();
  const token = store.get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  return session && session.role === "ADMIN" ? session : null;
}