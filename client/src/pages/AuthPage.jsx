import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { languages } from "../data/languages";
import { useAuth } from "../state/AuthContext.jsx";
import { motion } from "framer-motion";

export function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    preferredLanguage: "en",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        await login(form.email, form.password);
        navigate("/");
      } else {
        await register(form);
        setMessage("Account created. Check your email for the verification link.");
        setIsLogin(true);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-converso-night bg-converso-light px-4 py-8 text-converso-text transition-colors duration-300 sm:px-6 lg:px-8">
      {/* Scenic Background Landmark Sketch (Only use this image, no new generated pictures) */}
      <div 
        className="auth-bg-image" 
        style={{ backgroundImage: "url('/themes/turkish.png')" }} 
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-glow absolute left-[-8rem] top-[-6rem] h-96 w-96 rounded-full bg-converso-purple/20 blur-[100px]" />
        <div className="animate-pulse-glow absolute bottom-[-4rem] right-[-2rem] h-96 w-96 rounded-full bg-converso-cyan/15 blur-[100px]" style={{ animationDelay: '-2s' }} />
        <div className="animate-pulse-glow absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-converso-gold/10 blur-[100px]" style={{ animationDelay: '-4s' }} />
      </div>
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="hidden rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-soft backdrop-blur-xl lg:block">
          <div className="mb-12 inline-flex animate-floaty items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-converso-subtext">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.8)]" />
            Live translation. Language learning. Premium messaging.
          </div>
          <div className="space-y-6">
            <p className="font-display text-5xl font-bold leading-tight text-white lg:text-6xl">
              Converso
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="gradient-text block"
              >
                Where Conversations Teach
              </motion.span>
            </p>
            <p className="max-w-xl text-lg leading-8 text-converso-subtext opacity-80">
              Step into a multilingual chat experience designed like a digital lounge: luminous gradients,
              elegant gold accents, and conversations that help people learn as they connect.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Realtime", "Typing presence and instant delivery keep every exchange alive."],
              ["Translate", "See translated meaning while keeping the original close at hand."],
              ["Moderate", "Report, block, and review with built-in safety affordances."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-black/10 p-5">
                <div className="mb-3 h-10 w-10 rounded-2xl bg-converso-gradient p-[1px]">
                  <div className="h-full w-full rounded-2xl bg-converso-night/95" />
                </div>
                <h2 className="mb-2 text-lg font-semibold text-white">{title}</h2>
                <p className="text-sm leading-6 text-converso-subtext">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card relative mx-auto w-full max-w-xl overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-converso-gradient" />
          <div className="mb-8">
            <div className="font-display text-3xl font-semibold text-white">
              {isLogin ? "Welcome back" : "Create your passport to Converso"}
            </div>
            <p className="mt-2 text-sm leading-6 text-converso-subtext">
              {isLogin
                ? "Sign in to continue your next beautifully translated conversation."
                : "Register, verify your email, and start chatting without exposing your private address."}
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-converso-subtext">
              Email
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-converso-cyan focus:ring-2 focus:ring-converso-cyan/30"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>
            <label className="block text-sm font-medium text-converso-subtext">
              Password
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-converso-purple focus:ring-2 focus:ring-converso-purple/30"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </label>
            {!isLogin && (
              <label className="block text-sm font-medium text-converso-subtext">
                Preferred language
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-converso-gold focus:ring-2 focus:ring-converso-gold/30"
                  value={form.preferredLanguage}
                  onChange={(event) => setForm({ ...form, preferredLanguage: event.target.value })}
                >
                  {languages.map((language) => (
                    <option key={language.value} value={language.value} className="bg-slate-900">
                      {language.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              className="w-full rounded-2xl bg-converso-gradient px-5 py-3 font-semibold text-white shadow-[0_0_25px_rgba(124,58,237,0.35)] transition hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(6,182,212,0.28)] disabled:opacity-70"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
            </button>
          </form>
          {message && <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">{message}</p>}
          {error && <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
          <button
            className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-converso-cyan/60 hover:bg-white/10"
            onClick={() => setIsLogin((current) => !current)}
          >
            {isLogin ? "Need an account? Register" : "Already verified? Sign in"}
          </button>
        </section>
      </div>
    </div>
  );
}
