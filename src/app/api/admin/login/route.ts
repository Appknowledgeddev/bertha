import {
  authenticateAdminWithSupabase,
  buildAdminSessionValue,
  setAdminSessionCookie,
} from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const adminUser = await authenticateAdminWithSupabase(
      body.email,
      body.password,
    );

    if (!adminUser) {
      return NextResponse.json(
        { error: "Those admin credentials do not match a Supabase user." },
        { status: 401 },
      );
    }

    await setAdminSessionCookie(buildAdminSessionValue(adminUser));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Birtha Feedback] Failed admin login", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not complete admin login.",
      },
      { status: 500 },
    );
  }
}
