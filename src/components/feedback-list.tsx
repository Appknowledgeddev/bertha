import { VoteControls } from "@/components/vote-controls";
import Link from "next/link";
import type { FeedbackRequest } from "@/lib/types";

export function FeedbackList({
  items,
  userVotes = {},
}: {
  items: FeedbackRequest[];
  userVotes?: Record<string, -1 | 1>;
}) {
  if (!items.length) {
    return (
      <div className="emptyState">
        <h3>No requests yet</h3>
        <p>Start with one idea and build the board from there.</p>
      </div>
    );
  }

  return (
    <div className="feedbackList">
      {items.map((item) => (
        <article className="feedbackCard" key={item.id}>
          <VoteControls
            feedbackId={item.id}
            initialUpvotes={item.upvotes}
            initialDownvotes={item.downvotes}
            initialVote={userVotes[item.id] ?? 0}
          />

          <div className="feedbackBody">
            <div className="feedbackCardHeader">
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <span className="statusPill">{item.status}</span>
            </div>

            <div className="feedbackMeta">
              <span>{item.category}</span>
              <span>{item.author_name}</span>
              <span>{item.comments.length} comments</span>
            </div>

            <div className="feedbackActions">
              <Link href={`/feedback/${item.id}`} className="detailLink">
                View discussion
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
