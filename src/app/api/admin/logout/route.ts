import { clearAdminSessionCookie } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST() {
  await clearAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
