import { AdminDashboard } from "@/components/admin-dashboard";
import { SiteHeader } from "@/components/site-header";
import { requireAdminSession } from "@/lib/admin-auth";
import { getFeedbackRequests } from "@/lib/feedback";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminSession();
  const feedback = await getFeedbackRequests();

  return (
    <>
      <SiteHeader />
      <main className="pageShell roadmapShell">
        <AdminDashboard items={feedback} />
      </main>
    </>
  );
}
