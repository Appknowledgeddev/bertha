import { setFeedbackVote } from "@/lib/feedback";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const body = (await request.json()) as { voteValue?: number };
    const voteValue =
      body.voteValue === -1 ? -1 : body.voteValue === 1 ? 1 : body.voteValue === 0 ? 0 : null;

    if (voteValue === null) {
      return NextResponse.json(
        { error: "A vote direction is required." },
        { status: 400 },
      );
    }

    const { id } = await context.params;
    const cookieStore = await cookies();
    const voterToken =
      cookieStore.get("birtha_voter_token")?.value ?? randomUUID();
    const { item, currentVote } = await setFeedbackVote({
      feedbackId: id,
      voterToken,
      voteValue,
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
    console.error("[Birtha Feedback] Failed to update vote", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update vote.",
      },
      { status: 500 },
    );
  }
}
