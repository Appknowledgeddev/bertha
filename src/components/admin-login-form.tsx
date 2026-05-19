"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Could not sign in.");
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <form className="submitCard adminAuthCard" onSubmit={handleSubmit}>
      <div className="submitCardHeader">
        <h2>Admin login</h2>
        <p>Normal users stay anonymous. Only roadmap admins need to sign in.</p>
      </div>

      <label className="field">
        <span>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="hello@birtha.com"
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />
      </label>

      {error ? <p className="formError">{error}</p> : null}

      <button className="primaryButton" type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </button>

      <p className="helperText">
        Need access?{" "}
        <a href="mailto:hello@birtha.earth?subject=Birtha%20feedback%20admin%20account%20request">
          Request an account
        </a>
      </p>

      <p className="helperText">
        Forgotten your password?{" "}
        <Link href="/admin/reset-password">
          Reset password
        </Link>
      </p>
    </form>
  );
}
