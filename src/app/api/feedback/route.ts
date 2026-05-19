import { createFeedbackRequest } from "@/lib/feedback";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Could not create feedback request.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      category?: string;
      authorName?: string;
    };

    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400 },
      );
    }

    const item = await createFeedbackRequest({
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category?.trim() || "Feature Requests",
      author_name: body.authorName?.trim() || "Anonymous",
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[Birtha Feedback] Failed to create feedback", error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
