import Link from "next/link";
import { getIsAdminAuthenticated } from "@/lib/admin-auth";

const logo =
  "https://s3-eu-west-1.amazonaws.com/assets.knack-eu.com/assets/61eab488405181001e2450ee/logos/asset42.png";

export async function SiteHeader() {
  const isAdminAuthenticated = await getIsAdminAuthenticated();

  return (
    <header className="siteHeader">
      <div className="shell siteHeaderInner">
        <Link href="/" className="brandMark" aria-label="Birtha Feedback home">
          <img src={logo} alt="Birtha Feedback" />
        </Link>

        {isAdminAuthenticated ? (
          <nav className="mainNav">
            <Link href="/">Feedback</Link>
            <Link href="/roadmap">Roadmap</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        ) : (
          <nav className="mainNav">
            <Link href="/admin/login">Sign in</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
