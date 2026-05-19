import { createSupabaseAdmin, hasSupabaseEnv } from "@/lib/supabase/server";
import type { FeedbackComment, FeedbackRequest } from "@/lib/types";

export const feedbackStatuses = [
  "In Review",
  "Planned",
  "In Progress",
  "Completed",
] as const;

const demoFeedback: FeedbackRequest[] = [
  {
    id: "demo-1",
    title: "Send trip reminders automatically",
    description: "Let organisers schedule reminder nudges before payment and RSVP deadlines.",
    category: "Feature Requests",
    status: "In Review",
    author_name: "Bud",
    upvotes: 12,
    downvotes: 1,
    created_at: new Date().toISOString(),
    comments: [
      {
        id: "demo-comment-1",
        feedback_id: "demo-1",
        author_name: "Amy",
        body: "This would make event follow-up much easier.",
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "demo-2",
    title: "Show payment status on one timeline",
    description: "Put invites, payments, and follow-ups in one clear organiser view.",
    category: "Product Ideas",
    status: "Planned",
    author_name: "Amy",
    upvotes: 7,
    downvotes: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    comments: [],
  },
];

function attachCommentsToFeedback(
  feedbackRows: Omit<FeedbackRequest, "comments">[],
  comments: FeedbackComment[],
) {
  const commentsByFeedback = new Map<string, FeedbackComment[]>();

  for (const comment of comments) {
    const existing = commentsByFeedback.get(comment.feedback_id) ?? [];
    existing.push(comment);
    commentsByFeedback.set(comment.feedback_id, existing);
  }

  return feedbackRows.map((row) => ({
    ...row,
    downvotes: row.downvotes ?? 0,
    comments: commentsByFeedback.get(row.id) ?? [],
  })) as FeedbackRequest[];
}

export async function getFeedbackRequests(): Promise<FeedbackRequest[]> {
  if (!hasSupabaseEnv) {
    return demoFeedback;
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("feedback_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Birtha Feedback] Unable to load feedback requests", error);
    return demoFeedback;
  }

  const feedbackRows = (data ?? []) as Omit<FeedbackRequest, "comments">[];
  const feedbackIds = feedbackRows.map((row) => row.id);

  if (!feedbackIds.length) {
    return [];
  }

  const { data: commentRows, error: commentError } = await supabase
    .from("feedback_comments")
    .select("*")
    .in("feedback_id", feedbackIds)
    .order("created_at", { ascending: true });

  if (commentError) {
    console.error("[Birtha Feedback] Unable to load comments", commentError);
  }

  return attachCommentsToFeedback(
    feedbackRows,
    (commentRows ?? []) as FeedbackComment[],
  );
}

export async function getFeedbackRequestById(id: string) {
  if (!hasSupabaseEnv) {
    return demoFeedback.find((item) => item.id === id) ?? null;
  }

  const supabase = createSupabaseAdmin();
  const { data: feedbackRow, error } = await supabase
    .from("feedback_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[Birtha Feedback] Unable to load feedback request", error);
    return null;
  }

  if (!feedbackRow) {
    return null;
  }

  const { data: commentRows, error: commentError } = await supabase
    .from("feedback_comments")
    .select("*")
    .eq("feedback_id", id)
    .order("created_at", { ascending: true });

  if (commentError) {
    console.error("[Birtha Feedback] Unable to load comments", commentError);
  }

  return attachCommentsToFeedback(
    [feedbackRow as Omit<FeedbackRequest, "comments">],
    (commentRows ?? []) as FeedbackComment[],
  )[0];
}

export async function createFeedbackRequest(input: {
  title: string;
  description: string;
  category: string;
  author_name: string;
}) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("feedback_requests")
    .insert({
      ...input,
      status: "In Review",
      upvotes: 0,
      downvotes: 0,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as FeedbackRequest;
}

export async function getFeedbackUserVotes(voterToken?: string) {
  if (!hasSupabaseEnv || !voterToken) {
    return {} as Record<string, -1 | 1>;
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("feedback_votes")
    .select("feedback_id, vote_value")
    .eq("voter_token", voterToken);

  if (error) {
    console.error("[Birtha Feedback] Unable to load vote history", error);
    return {} as Record<string, -1 | 1>;
  }

  return Object.fromEntries(
    (data ?? []).map((row) => [row.feedback_id as string, row.vote_value as -1 | 1]),
  ) as Record<string, -1 | 1>;
}

export async function setFeedbackVote(input: {
  feedbackId: string;
  voterToken: string;
  voteValue: -1 | 1;
}) {
  const supabase = createSupabaseAdmin();
  const { feedbackId, voterToken, voteValue } = input;
  const { data: row, error: loadError } = await supabase
    .from("feedback_requests")
    .select("*")
    .eq("id", feedbackId)
    .single();

  if (loadError) {
    throw loadError;
  }

  const currentItem = row as FeedbackRequest;
  const currentUpvotes = currentItem.upvotes ?? 0;
  const currentDownvotes = currentItem.downvotes ?? 0;

  const { data: existingVote, error: voteLookupError } = await supabase
    .from("feedback_votes")
    .select("vote_value")
    .eq("feedback_id", feedbackId)
    .eq("voter_token", voterToken)
    .maybeSingle();

  if (voteLookupError) {
    throw voteLookupError;
  }

  const previousVote = existingVote?.vote_value as -1 | 1 | undefined;

  if (previousVote === voteValue) {
    return {
      item: currentItem,
      currentVote: previousVote,
    };
  }

  let nextUpvotes = currentUpvotes;
  let nextDownvotes = currentDownvotes;

  if (previousVote === 1) {
    nextUpvotes = Math.max(0, nextUpvotes - 1);
  }

  if (previousVote === -1) {
    nextDownvotes = Math.max(0, nextDownvotes - 1);
  }

  if (voteValue === 1) {
    nextUpvotes += 1;
  }

  if (voteValue === -1) {
    nextDownvotes += 1;
  }

  if (previousVote) {
    const { error: updateVoteError } = await supabase
      .from("feedback_votes")
      .update({ vote_value: voteValue })
      .eq("feedback_id", feedbackId)
      .eq("voter_token", voterToken);

    if (updateVoteError) {
      throw updateVoteError;
    }
  } else {
    const { error: insertVoteError } = await supabase.from("feedback_votes").insert({
      feedback_id: feedbackId,
      voter_token: voterToken,
      vote_value: voteValue,
    });

    if (insertVoteError) {
      throw insertVoteError;
    }
  }

  const { data, error } = await supabase
    .from("feedback_requests")
    .update({ upvotes: nextUpvotes, downvotes: nextDownvotes })
    .eq("id", feedbackId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    item: {
      ...(data as FeedbackRequest),
      comments: currentItem.comments ?? [],
    },
    currentVote: voteValue,
  };
}

export async function createFeedbackComment(input: {
  feedbackId: string;
  author_name: string;
  body: string;
}) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("feedback_comments")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as FeedbackComment;
}

export async function updateFeedbackStatus(id: string, status: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("feedback_requests")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as FeedbackRequest;
}
