import { NextResponse } from "next/server";
import { CLIENT_COOKIE } from "@/lib/clientSession";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(CLIENT_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}