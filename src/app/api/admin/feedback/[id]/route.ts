import { requireAdminSession } from "@/lib/admin-auth";
import { feedbackStatuses, updateFeedbackStatus } from "@/lib/feedback";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const body = (await request.json()) as { status?: string };

    if (!body.status || !feedbackStatuses.includes(body.status as never)) {
      return NextResponse.json(
        { error: "Choose a valid roadmap status." },
        { status: 400 },
      );
    }

    const item = await updateFeedbackStatus(id, body.status);
    return NextResponse.json(item);
  } catch (error) {
    console.error("[Birtha Feedback] Failed to update feedback status", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update feedback status.",
      },
      { status: 500 },
    );
  }
}
