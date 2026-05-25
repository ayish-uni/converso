import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    setResetLink("");

    try {
      const response = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      setMessage(
        response.message ||
          "If your email is registered, a password reset link has been sent.",
      );
      if (response.resetLink) {
        setResetLink(response.resetLink);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-converso-night text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-16">
        <div className="glass-card w-full max-w-xl p-8 md:p-10">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-white">
              Forgot Password
            </h1>
            <p className="mt-2 text-sm text-converso-subtext">
              Enter your email and we’ll send a secure reset link to help you
              regain access.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm text-converso-subtext">Email</span>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-converso-cyan/50"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <button
              className="w-full rounded-2xl bg-converso-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.01]"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Sending reset link..." : "Send reset link"}
            </button>
          </form>

          {message && (
            <div className="mt-4 space-y-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              <p>{message}</p>
              {resetLink ? (
                <a
                  className="block text-converso-cyan underline"
                  href={resetLink}
                >
                  Open reset link
                </a>
              ) : null}
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 text-sm text-converso-subtext sm:flex-row sm:items-center sm:justify-between">
            <Link
              className="text-converso-cyan transition hover:text-white"
              to="/login"
            >
              Back to login
            </Link>
            <button
              className="text-converso-subtext transition hover:text-white"
              onClick={() => navigate(-1)}
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
