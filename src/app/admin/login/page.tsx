import Link from "next/link";
import { AdminLoginForm } from "@/components/admin-login-form";
import { SiteHeader } from "@/components/site-header";

export default function AdminLoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="pageShell adminLoginShell">
        <div className="adminLoginStack">
          <div className="adminLoginActions">
            <Link href="/" className="secondaryButton">
              Back to Feedback
            </Link>
          </div>

          <AdminLoginForm />
        </div>
      </main>
    </>
  );
}
