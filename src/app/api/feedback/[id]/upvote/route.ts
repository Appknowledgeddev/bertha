import { setFeedbackVote } from "@/lib/feedback";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const voterToken =
      cookieStore.get("birtha_voter_token")?.value ?? randomUUID();
    const { item, currentVote } = await setFeedbackVote({
      feedbackId: id,
      voterToken,
      voteValue: 1,
    });
    const response = NextResponse.json({
      id: item.id,
      upvotes: item.upvotes,
      downvotes: item.downvotes,
      currentVote,
    });

    response.cookies.set("birtha_voter_token", voterToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Birtha Feedback] Failed to upvote request", error);
    return NextResponse.json(
      { error: "Could not update upvotes." },
      { status: 500 },
    );
  }
}
