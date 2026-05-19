import { SiteHeader } from "@/components/site-header";
import { getFeedbackRequests } from "@/lib/feedback";

const roadmapOrder = ["In Review", "Planned", "In Progress", "Completed"];

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const feedback = await getFeedbackRequests();

  return (
    <>
      <SiteHeader />
      <main className="pageShell roadmapShell">
        <section className="contentColumn roadmapColumn">
          <div className="pageIntro">
            <p className="eyebrow">Birtha roadmap</p>
            <h1>What we are tracking next</h1>
            <p>A simple, public roadmap grouped by progress.</p>
          </div>

          <div className="roadmapGrid">
            {roadmapOrder.map((status) => {
              const items = feedback.filter((entry) => entry.status === status);

              return (
                <section className="roadmapLane" key={status}>
                  <header>
                    <h2>{status}</h2>
                    <span>{items.length}</span>
                  </header>
                  <div className="roadmapStack">
                    {items.length ? (
                      items.map((item) => (
                        <article className="roadmapCard" key={item.id}>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                        </article>
                      ))
                    ) : (
                      <p className="laneEmpty">Nothing here yet.</p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
