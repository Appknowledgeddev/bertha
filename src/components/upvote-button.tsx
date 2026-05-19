"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function UpvoteButton({
  feedbackId,
  initialCount,
  initiallyVoted = false,
}: {
  feedbackId: string;
  initialCount: number;
  initiallyVoted?: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(initiallyVoted);
  const [isPending, startTransition] = useTransition();

  const handleClick = async () => {
    if (hasVoted || isPending) {
      return;
    }

    const response = await fetch(`/api/feedback/${feedbackId}/upvote`, {
      method: "POST",
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as {
      upvotes: number;
      alreadyVoted: boolean;
    };

    setCount(payload.upvotes);
    setHasVoted(true);
    startTransition(() => router.refresh());
  };

  return (
    <button
      className={`voteRail${hasVoted ? " voteRailLocked" : ""}`}
      onClick={handleClick}
      disabled={isPending || hasVoted}
      title={hasVoted ? "You have already voted for this request." : "Upvote this request"}
    >
      <span className="voteIcon">+</span>
      <span className="voteCount">{count}</span>
    </button>
  );
}
