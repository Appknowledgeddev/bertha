import { FeedbackList } from "@/components/feedback-list";
import { SiteHeader } from "@/components/site-header";
import { SubmitIdeaForm } from "@/components/submit-idea-form";
import { getFeedbackRequests, getFeedbackUserVotes } from "@/lib/feedback";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const voterToken = cookieStore.get("birtha_voter_token")?.value;
  const feedback = await getFeedbackRequests();
  const userVotes = await getFeedbackUserVotes(voterToken);

  return (
    <>
      <SiteHeader />
      <main className="pageShell roadmapShell">
        <section className="contentColumn">
          <div className="pageIntro">
            <div className="pageIntroRow">
              <div>
                <p className="eyebrow">Birtha feedback board</p>
                <h1>All Requests</h1>
                <p>Vote on existing requests or suggest the next feature.</p>
              </div>

              <div className="pageActions">
                <SubmitIdeaForm />
              </div>
            </div>
          </div>

          <FeedbackList items={feedback} userVotes={userVotes} />
        </section>
      </main>
    </>
  );
}
