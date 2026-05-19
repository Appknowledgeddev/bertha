import { createFeedbackComment } from "@/lib/feedback";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const body = (await request.json()) as {
      authorName?: string;
      body?: string;
    };

    if (!body.body?.trim()) {
      return NextResponse.json(
        { error: "A comment is required." },
        { status: 400 },
      );
    }

    const { id } = await context.params;
    const comment = await createFeedbackComment({
      feedbackId: id,
      author_name: body.authorName?.trim() || "Anonymous",
      body: body.body.trim(),
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("[Birtha Feedback] Failed to create comment", error);
    return NextResponse.json(
      { error: "Could not create comment." },
      { status: 500 },
    );
  }
}
