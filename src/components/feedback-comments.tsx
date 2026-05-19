"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FeedbackComment } from "@/lib/types";

export function FeedbackComments({
  feedbackId,
  initialComments,
}: {
  feedbackId: string;
  initialComments: FeedbackComment[];
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch(`/api/feedback/${feedbackId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authorName: authorName || "Anonymous",
        body,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Could not add comment.");
      return;
    }

    const comment = (await response.json()) as FeedbackComment;
    setComments((current) => [...current, comment]);
    setAuthorName("");
    setBody("");
    startTransition(() => router.refresh());
  };

  return (
    <section className="commentsSection">
      <div className="commentsHeader">
        <h4>Comments</h4>
        <span>{comments.length}</span>
      </div>

      <div className="commentsList">
        {comments.length ? (
          comments.map((comment) => (
            <article className="commentCard" key={comment.id}>
              <div className="commentMeta">
                <strong>{comment.author_name}</strong>
              </div>
              <p>{comment.body}</p>
            </article>
          ))
        ) : (
          <p className="commentEmpty">No comments yet. Start the discussion.</p>
        )}
      </div>

      <form className="commentForm" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name (optional)</span>
          <input
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="Anonymous"
          />
        </label>

        <label className="field">
          <span>Add comment</span>
          <textarea
            required
            rows={3}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Share context, edge cases, or why this matters."
          />
        </label>

        {error ? <p className="formError">{error}</p> : null}

        <button className="secondaryButton commentButton" type="submit" disabled={isPending}>
          {isPending ? "Posting..." : "Add Comment"}
        </button>
      </form>
    </section>
  );
}
