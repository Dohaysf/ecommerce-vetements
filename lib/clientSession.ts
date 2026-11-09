import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export const CLIENT_COOKIE = "client_session";

export async function getClientSession() {
  const store = await cookies();
  const token = store.get(CLIENT_COOKIE)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  return session && session.role === "CLIENT" ? session : null;
}