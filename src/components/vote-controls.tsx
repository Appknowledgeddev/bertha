"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function VoteControls({
  feedbackId,
  initialUpvotes,
  initialDownvotes,
  initialVote = 0,
}: {
  feedbackId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialVote?: -1 | 0 | 1;
}) {
  const router = useRouter();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [currentVote, setCurrentVote] = useState<-1 | 0 | 1>(initialVote);
  const [burstVote, setBurstVote] = useState<-1 | 0 | 1>(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!burstVote) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setBurstVote(0);
    }, 520);

    return () => window.clearTimeout(timeout);
  }, [burstVote]);

  const handleVote = async (voteValue: -1 | 1) => {
    if (isPending) {
      return;
    }

    const nextVoteValue = currentVote === voteValue ? 0 : voteValue;
    setError(null);

    const response = await fetch(`/api/feedback/${feedbackId}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voteValue: nextVoteValue }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Could not update vote.");
      return;
    }

    const payload = (await response.json()) as {
      upvotes: number;
      downvotes: number;
      currentVote: -1 | 0 | 1;
    };

    setUpvotes(payload.upvotes);
    setDownvotes(payload.downvotes);
    setCurrentVote(payload.currentVote);
    setBurstVote(payload.currentVote);
    startTransition(() => router.refresh());
  };

  return (
    <div className="voteStack">
      <motion.button
        className={`voteRail${currentVote === 1 ? " voteRailActive" : ""}`}
        onClick={() => handleVote(1)}
        disabled={isPending}
        title={currentVote === 1 ? "Remove upvote" : "Upvote this request"}
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.94 }}
        animate={
          currentVote === 1
            ? { scale: [1, 1.08, 1], y: [0, -3, 0] }
            : { scale: 1, y: 0 }
        }
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence>
          {burstVote === 1 ? (
            <motion.span
              className="voteBurst"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.9, scale: 1.18 }}
              exit={{ opacity: 0, scale: 1.52 }}
              transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : null}
        </AnimatePresence>
        <motion.span
          className="voteIcon"
          aria-hidden="true"
          animate={
            currentVote === 1
              ? { rotate: [-8, 0, 8, 0], scale: [1, 1.34, 1] }
              : { rotate: 0, scale: 1 }
          }
          transition={{ duration: 0.42, ease: "easeOut" }}
        >
          👍
        </motion.span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`up-${upvotes}`}
            className="voteCount"
            initial={{ opacity: 0, y: 10, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 1.08 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            {upvotes}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <motion.button
        className={`voteRail voteRailDown${currentVote === -1 ? " voteRailActive" : ""}`}
        onClick={() => handleVote(-1)}
        disabled={isPending}
        title={currentVote === -1 ? "Remove downvote" : "Downvote this request"}
        whileHover={{ y: 2, scale: 1.02 }}
        whileTap={{ scale: 0.94 }}
        animate={
          currentVote === -1
            ? { scale: [1, 1.08, 1], y: [0, 3, 0] }
            : { scale: 1, y: 0 }
        }
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence>
          {burstVote === -1 ? (
            <motion.span
              className="voteBurst voteBurstDown"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.9, scale: 1.18 }}
              exit={{ opacity: 0, scale: 1.52 }}
              transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : null}
        </AnimatePresence>
        <motion.span
          className="voteIcon voteIconDown"
          aria-hidden="true"
          animate={
            currentVote === -1
              ? { rotate: [8, 0, -8, 0], scale: [1, 1.34, 1] }
              : { rotate: 0, scale: 1 }
          }
          transition={{ duration: 0.42, ease: "easeOut" }}
        >
          👎
        </motion.span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`down-${downvotes}`}
            className="voteCount"
            initial={{ opacity: 0, y: 10, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 1.08 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            {downvotes}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {error ? <p className="voteError">{error}</p> : null}
    </div>
  );
}
