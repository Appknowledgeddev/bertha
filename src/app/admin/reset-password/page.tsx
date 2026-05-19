import Link from "next/link";
import { AdminResetPasswordForm } from "@/components/admin-reset-password-form";
import { SiteHeader } from "@/components/site-header";

export default function AdminResetPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main className="pageShell adminLoginShell">
        <div className="adminLoginStack">
          <div className="adminLoginActions">
            <Link href="/admin/login" className="backLink">
              ← Back to Sign in
            </Link>
          </div>

          <AdminResetPasswordForm />
        </div>
      </main>
    </>
  );
}
