import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("Verifying your account...");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("Missing verification token.");
      return;
    }

    api
      .get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setStatus("Email verified. You can return to the login screen now."))
      .catch((error) => setStatus(error.message));
  }, [params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-converso-night bg-converso-light px-4 text-converso-text">
      <div className="glass-card max-w-lg p-8 text-center">
        <div className="font-display text-4xl font-semibold text-white">Converso</div>
        <p className="mt-2 text-sm uppercase tracking-[0.32em] text-converso-gold">Where Conversations Teach</p>
        <h1 className="mt-6 text-2xl font-semibold text-white">Email verification</h1>
        <p className="mt-4 text-converso-subtext">{status}</p>
        <Link className="mt-6 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-converso-cyan" to="/login">
          Return to login
        </Link>
      </div>
    </div>
  );
}
