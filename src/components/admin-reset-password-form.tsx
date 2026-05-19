"use client";

import { useState } from "react";

export function AdminResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    setIsSuccess(false);

    const response = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Could not send reset instructions.");
      return;
    }

    setIsSuccess(true);
  };

  return (
    <form className="submitCard adminAuthCard" onSubmit={handleSubmit}>
      <div className="submitCardHeader">
        <h2>Reset password</h2>
        <p>
          Enter the admin email connected to your Supabase account and we will
          send reset instructions.
        </p>
      </div>

      <label className="field">
        <span>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="johnny@appknowledged.co.uk"
        />
      </label>

      {error ? <p className="formError">{error}</p> : null}
      {isSuccess ? (
        <p className="helperText">
          Reset instructions have been sent if that email exists in Supabase
          Auth.
        </p>
      ) : null}

      <button className="primaryButton" type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
