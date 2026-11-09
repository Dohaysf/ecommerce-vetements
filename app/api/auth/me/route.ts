import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/clientSession";

export async function GET() {
  const session = await getClientSession();
  return NextResponse.json({
    user: session ? { email: session.email } : null,
  });
}