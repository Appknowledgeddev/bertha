import { createSupabaseAuthClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };

    if (!body.email?.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAuthClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      body.email.trim(),
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Birtha Feedback] Failed password reset request", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not send reset instructions.",
      },
      { status: 500 },
    );
  }
}
