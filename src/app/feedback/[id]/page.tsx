import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { FeedbackComments } from "@/components/feedback-comments";
import { SiteHeader } from "@/components/site-header";
import { VoteControls } from "@/components/vote-controls";
import {
  getFeedbackRequestById,
  getFeedbackUserVotes,
} from "@/lib/feedback";

export const dynamic = "force-dynamic";

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const voterToken = cookieStore.get("birtha_voter_token")?.value;
  const [item, userVotes] = await Promise.all([
    getFeedbackRequestById(id),
    getFeedbackUserVotes(voterToken),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="pageShell roadmapShell">
        <section className="contentColumn">
          <div className="detailTopbar">
            <Link href="/" className="backLink">
              ← Back to Feedback
            </Link>
          </div>

          <article className="feedbackCard feedbackDetailCard">
            <VoteControls
              feedbackId={item.id}
              initialUpvotes={item.upvotes}
              initialDownvotes={item.downvotes}
              initialVote={userVotes[item.id] ?? 0}
            />

            <div className="feedbackBody">
              <div className="feedbackCardHeader">
                <div>
                  <p className="eyebrow">Request detail</p>
                  <h1 className="detailTitle">{item.title}</h1>
                  <p>{item.description}</p>
                </div>
                <span className="statusPill">{item.status}</span>
              </div>

              <div className="feedbackMeta">
                <span>{item.category}</span>
                <span>{item.author_name}</span>
                <span>{item.comments.length} comments</span>
              </div>

              <FeedbackComments
                feedbackId={item.id}
                initialComments={item.comments}
              />
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
