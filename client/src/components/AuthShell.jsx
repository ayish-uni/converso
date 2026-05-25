import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { languages } from "../data/languages";
import { startAmbientSoundtrack } from "../utils/audio";

const greetings = [
  "Hello",
  "Hola",
  "Bonjour",
  "سلام",
  "Ciao",
  "नमस्ते",
  "你好",
  "Ola",
  "Hallo",
  "Merhaba",
  "Hej",
  "Привет",
];

const teachTranslations = [
  "Teach",
  "Enseña",
  "Enseigne",
  "Insegna",
  "Lehrt",
  "Ensina",
  "Uczy",
  "Öğretir",
  "याद दिलाता",
  "सिखाता",
  "يعلم",
  "آموزش می‌دهد",
  "教授",
  "教える",
  "가르친다",
  "Преподает",
  "Nagtuturo",
  "Inafundisha",
];

const backgroundImages = [
  {
    city: "Paris",
    country: "France",
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "Venice",
    country: "Italy",
    url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "Tokyo",
    country: "Japan",
    url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "New York City",
    country: "United States",
    url: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "Istanbul",
    country: "Turkey",
    url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "Seoul",
    country: "South Korea",
    url: "https://images.unsplash.com/photo-1538485399081-7c89750b1db6?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "London",
    country: "United Kingdom",
    url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "Singapore",
    country: "Singapore",
    url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "Dubai",
    country: "United Arab Emirates",
    url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "Barcelona",
    country: "Spain",
    url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "Rome",
    country: "Italy",
    url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "Hong Kong",
    country: "China",
    url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "Sydney",
    country: "Australia",
    url: "https://images.unsplash.com/photo-1506973035872-a4f23ef3556d?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    url: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1800&q=80",
  },
  {
    city: "San Francisco",
    country: "United States",
    url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1800&q=80",
  },
];

function createHello(id) {
  let left = Math.random() * 100;
  let top = 8 + Math.random() * 84;

  if (typeof window !== "undefined") {
    if (window.innerWidth >= 1024) {
      // ONLY avoid the strict bounding box of the Converso text itself on the left side
      // The exact center (50vw) and right side (50-100vw) remain fully populated.
      if (left >= 5 && left <= 42 && top >= 30 && top <= 75) {
        // Just bump it slightly higher or lower so it frames the text instead of overlapping
        top =
          Math.random() > 0.5 ? Math.max(8, top - 35) : Math.min(92, top + 35);
      }
    } else {
      // Mobile text is in the top-center
      if (top >= 10 && top <= 45 && left >= 10 && left <= 90) {
        top = Math.min(92, top + 40);
      }
    }
  }

  return {
    id,
    text: greetings[Math.floor(Math.random() * greetings.length)],
    left: `${left}vw`,
    top: `${top}vh`,
    duration: `${14.0 + Math.random() * 4.0}s`,
    pulseDuration: `${12.0 + Math.random() * 4.0}s`,
    size: `${12 + Math.random() * 8}px`,
  };
}

function createParticle(id) {
  const edge = id % 4;
  const start =
    edge === 0
      ? { x: `${Math.random() * 100}%`, y: "-8%" }
      : edge === 1
        ? { x: "108%", y: `${Math.random() * 100}%` }
        : edge === 2
          ? { x: `${Math.random() * 100}%`, y: "108%" }
          : { x: "-8%", y: `${Math.random() * 100}%` };

  let durationMultiplier = 1;
  if (typeof window !== "undefined" && window.innerWidth < 1024) {
    durationMultiplier = 1.4; // Reduce speed slightly on mobile
  }

  return {
    id,
    startX: start.x,
    startY: start.y,
    driftX: `${(Math.random() - 0.5) * 22}vw`,
    driftY: `${(Math.random() - 0.5) * 22}vh`,
    duration: `${(24 + Math.random() * 12) * durationMultiplier}s`,
    delay: `${Math.random() * 8}s`,
    size: `${1 + Math.random() * 1.5}px`,
    opacity: 0.06 + Math.random() * 0.12,
    color:
      Math.random() > 0.72
        ? "rgba(167, 139, 250, 0.35)"
        : "rgba(255,255,255,0.25)",
  };
}

function findNextLoadedIndex(startIndex, loadedMap) {
  for (let offset = 1; offset <= backgroundImages.length; offset += 1) {
    const candidate = (startIndex + offset) % backgroundImages.length;
    if (loadedMap[candidate]) {
      return candidate;
    }
  }

  return startIndex;
}

export function AuthShell({
  mode,
  form,
  submitting,
  message,
  error,
  onChange,
  onSubmit,
}) {
  const isRegister = mode === "register";
  const [activeBackground, setActiveBackground] = useState(0);
  const [isFrontVisible, setIsFrontVisible] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [hellos, setHellos] = useState([]);
  const [highlightedHelloIds, setHighlightedHelloIds] = useState([]);
  const [loadedBackgrounds, setLoadedBackgrounds] = useState(() => ({
    0: true,
  }));
  const [teachIndex, setTeachIndex] = useState(0);
  const [particles] = useState(() =>
    Array.from({ length: 12 }, (_, index) => createParticle(index + 1)),
  );
  const soundtrackRef = useRef(null);
  const soundtrackStartedRef = useRef(false);

  function activateSoundtrack() {
    if (soundtrackStartedRef.current) {
      soundtrackRef.current?.context?.resume?.().catch(() => {});
      return;
    }

    if (!soundtrackRef.current) {
      soundtrackRef.current = startAmbientSoundtrack();
    }

    if (soundtrackRef.current?.context) {
      soundtrackRef.current.context
        .resume()
        .then(() => {
          soundtrackStartedRef.current = true;
          console.log("Ambient soundtrack started.");
        })
        .catch((err) => {
          console.error("Ambient soundtrack failed to resume:", err);
        });
    }
  }

  useEffect(() => {
    backgroundImages.forEach(({ url }, index) => {
      const image = new window.Image();
      image.onload = () => {
        setLoadedBackgrounds((current) =>
          current[index] ? current : { ...current, [index]: true },
        );
      };
      image.onerror = () => {
        setLoadedBackgrounds((current) =>
          current[index] ? current : { ...current, [index]: false },
        );
      };
      image.src = url;
    });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveBackground((current) => {
        const nextIndex = findNextLoadedIndex(current, loadedBackgrounds);
        if (nextIndex !== current) {
          setIsFrontVisible((visible) => !visible);
        }
        return nextIndex;
      });
    }, 14000);

    return () => window.clearInterval(interval);
  }, [loadedBackgrounds]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTeachIndex((current) => (current + 1) % teachTranslations.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let helloId = 0;
    const interval = window.setInterval(() => {
      helloId += 1;
      const nextHello = createHello(helloId);
      setHellos((current) => [...current.slice(-8), nextHello]);
      window.setTimeout(() => {
        setHellos((current) =>
          current.filter((item) => item.id !== nextHello.id),
        );
      }, 18000);
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHighlightedHelloIds(() => {
        if (hellos.length === 0) return [];
        const pool = [...hellos];
        const selected = [];
        const count = Math.min(3, pool.length);
        while (selected.length < count) {
          const index = Math.floor(Math.random() * pool.length);
          const [item] = pool.splice(index, 1);
          selected.push(item.id);
        }
        return selected;
      });
    }, 1600);

    return () => window.clearInterval(interval);
  }, [hellos]);

  useEffect(() => {
    const handleFirstStart = () => {
      activateSoundtrack();
      window.removeEventListener("pointerdown", handleFirstStart);
      window.removeEventListener("mousedown", handleFirstStart);
      window.removeEventListener("touchstart", handleFirstStart);
      window.removeEventListener("keydown", handleFirstStart);
    };

    window.addEventListener("pointerdown", handleFirstStart, { passive: true });
    window.addEventListener("mousedown", handleFirstStart, { passive: true });
    window.addEventListener("touchstart", handleFirstStart, { passive: true });
    window.addEventListener("keydown", handleFirstStart);

    return () => {
      window.removeEventListener("pointerdown", handleFirstStart);
      window.removeEventListener("mousedown", handleFirstStart);
      window.removeEventListener("touchstart", handleFirstStart);
      window.removeEventListener("keydown", handleFirstStart);
    };
  }, []);

  useEffect(() => {
    return () => {
      soundtrackRef.current?.stop?.();
      soundtrackRef.current = null;
    };
  }, []);

  const nextBackgroundIndex = findNextLoadedIndex(
    activeBackground,
    loadedBackgrounds,
  );
  const frontImage = backgroundImages[activeBackground].url;
  const backImage = backgroundImages[nextBackgroundIndex].url;

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#020617] text-converso-text"
      onPointerDownCapture={activateSoundtrack}
      onKeyDownCapture={activateSoundtrack}
    >
      <div className="pointer-events-none fixed inset-0">
        <div
          className={`auth-photo-layer transition-opacity duration-1000 ${isFrontVisible ? "opacity-80" : "opacity-0"}`}
          style={{ backgroundImage: `url(${frontImage})` }}
        />
        <div
          className={`auth-photo-layer transition-opacity duration-1000 ${isFrontVisible ? "opacity-0" : "opacity-80"}`}
          style={{ backgroundImage: `url(${backImage})` }}
        />
        <div className="auth-photo-lighting" />
        <div className="auth-blue-nebula" />
        <div className="auth-blue-bokeh" />
        <div className="converso-grid absolute inset-0" />
        <div className="auth-photo-overlay" />
        <div className="auth-photo-grain" />

        {/* Mobile Background Darkener Overlay */}
        <div className="lg:hidden absolute inset-0 bg-[#020617]/40 pointer-events-none z-10" />

        <div className="auth-particle-field z-10">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="auth-particle-dot"
              style={{
                left: particle.startX,
                top: particle.startY,
                width: particle.size,
                height: particle.size,
                opacity: particle.opacity,
                background: particle.color,
                "--particle-x": particle.driftX,
                "--particle-y": particle.driftY,
                "--particle-duration": particle.duration,
                "--particle-delay": particle.delay,
              }}
            />
          ))}
        </div>

        {hellos.map((hello) => (
          <span
            key={hello.id}
            className={`auth-floating-hello z-10 ${highlightedHelloIds.includes(hello.id) ? "auth-floating-hello-active" : ""}`}
            style={{
              left: hello.left,
              top: hello.top,
              animationDuration: `${hello.duration}, ${hello.pulseDuration}`,
              fontSize: hello.size,
            }}
          >
            {hello.text}
          </span>
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 z-20">
        {/* DESKTOP LAYOUT (Strictly untouched & hidden on mobile) */}
        <div className="hidden lg:grid w-full items-center gap-6 md:gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:gap-16">
          <section className="relative z-10 flex min-h-[140px] items-start justify-center pt-3 md:min-h-[200px] md:pt-8 lg:min-h-[420px] lg:items-center lg:justify-start lg:pt-0">
            <div className="auth-brand-lockup">
              <h1 className="auth-brand-title text-white">Converso</h1>
              <p className="auth-brand-description">
                Chat across languages in real time.
              </p>
              <p className="auth-brand-body">
                Understand, learn, and connect without barriers.
              </p>

              <div className="auth-feature-list mt-4">
                <span className="auth-feature-pill">Instant translation</span>
                <span className="auth-feature-pill">Real-time messaging</span>
                <span className="auth-feature-pill">Safe and moderated</span>
              </div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-white/48">
                Secure • Private • Global
              </p>
            </div>
          </section>

          <div className="absolute right-0 top-0 z-10 hidden pr-4 pt-1 text-[11px] uppercase tracking-[0.22em] text-white/45 lg:block">
            Global Communication Platform
          </div>

          <section className="relative z-10 w-full max-w-lg justify-self-end animate-fade-in">
            <div className="auth-form-panel auth-floating-card mx-auto w-full rounded-[24px] p-3.5 shadow-soft sm:p-4 lg:p-8">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

              <div className="mb-4 sm:mb-6">
                <div className="auth-kicker mb-2 inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-converso-subtext">
                  Secure Access
                </div>
                <div className="auth-form-title auth-shimmer-glitch text-3xl font-semibold text-white sm:text-[2.2rem]">
                  {isRegister ? "Create account" : "Welcome back"}
                </div>
                <div className="mt-1.5 max-w-sm text-sm leading-5 text-converso-subtext">
                  {isRegister
                    ? "Create your account to start conversations across languages."
                    : "Sign in to continue your conversations."}
                </div>
              </div>

              <form className="space-y-3" onSubmit={onSubmit}>
                {isRegister && (
                  <label className="relative block group">
                    <input
                      className="auth-input peer w-full rounded-[18px] px-4 pb-3 pt-6 text-white outline-none transition duration-200 placeholder:text-transparent"
                      name="username"
                      type="text"
                      value={form.username}
                      onChange={onChange}
                      placeholder="Username"
                      required
                    />
                    <span className="pointer-events-none absolute left-4 top-3 text-xs uppercase tracking-[0.16em] text-converso-subtext transition-all duration-200 peer-placeholder-shown:top-[1.15rem] peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-focus:top-3 peer-focus:text-xs peer-focus:uppercase peer-focus:tracking-[0.16em]">
                      Username
                    </span>
                  </label>
                )}

                <label className="relative block group">
                  <input
                    className="auth-input peer w-full rounded-[18px] px-4 pb-3 pt-6 text-white outline-none transition duration-200 placeholder:text-transparent"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="Email"
                    required
                  />
                  <span className="pointer-events-none absolute left-4 top-3 text-xs uppercase tracking-[0.16em] text-converso-subtext transition-all duration-200 peer-placeholder-shown:top-[1.15rem] peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-focus:top-3 peer-focus:text-xs peer-focus:uppercase peer-focus:tracking-[0.16em]">
                    Email
                  </span>
                </label>

                <label className="relative block group">
                  <div className="relative">
                    <input
                      className="auth-input auth-input-password peer w-full rounded-[18px] px-4 pb-3 pt-6 text-white outline-none transition duration-200 placeholder:text-transparent"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={onChange}
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/60 hover:text-white"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                  <span className="pointer-events-none absolute left-4 top-3 text-xs uppercase tracking-[0.16em] text-converso-subtext transition-all duration-200 peer-placeholder-shown:top-[1.15rem] peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-focus:top-3 peer-focus:text-xs peer-focus:uppercase peer-focus:tracking-[0.16em]">
                    Password
                  </span>
                </label>

                {isRegister && (
                  <p className="auth-field-hint -mt-1 px-1">
                    Use at least 8 characters with uppercase, lowercase, number,
                    and special character.
                  </p>
                )}

                {isRegister && (
                  <label className="relative block">
                    <select
                      className="auth-input w-full rounded-[18px] px-4 pb-3 pt-6 text-white outline-none transition duration-200"
                      name="preferredLanguage"
                      value={form.preferredLanguage}
                      onChange={onChange}
                    >
                      {languages.map((language) => (
                        <option
                          key={language.value}
                          value={language.value}
                          className="bg-slate-900"
                        >
                          {language.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute left-4 top-3 text-xs uppercase tracking-[0.16em] text-converso-subtext">
                      Language
                    </span>
                  </label>
                )}

                {isRegister && (
                  <div className="flex items-start gap-3 px-1 py-2">
                    <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                      <input
                        type="checkbox"
                        name="acceptedTerms"
                        checked={form.acceptedTerms}
                        onChange={onChange}
                        className="peer h-full w-full cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 transition-all checked:bg-converso-cyan checked:border-converso-cyan hover:border-white/40"
                        required
                      />
                      <svg
                        className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="text-[13px] leading-tight text-converso-subtext">
                      I accept the{" "}
                      <Link
                        to="/terms"
                        className="text-white hover:text-converso-cyan transition underline underline-offset-4 decoration-white/20"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-white hover:text-converso-cyan transition underline underline-offset-4 decoration-white/20"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                )}

                <div className="grid gap-3 pt-2 sm:grid-cols-[1fr_auto]">
                  <button
                    className="auth-primary-button w-full rounded-[18px] px-5 py-3.5 font-semibold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-70"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Please wait..."
                      : isRegister
                        ? "Create account"
                        : "Sign in"}
                  </button>
                  <Link
                    className="auth-secondary-button flex items-center justify-center rounded-[18px] px-5 py-3.5 text-sm font-medium text-converso-text transition duration-200"
                    to={isRegister ? "/login" : "/register"}
                  >
                    {isRegister ? "Back to login" : "Create account"}
                  </Link>
                </div>

                {!isRegister && (
                  <div className="mt-3 text-right">
                    <Link
                      className="text-sm font-medium text-converso-cyan transition hover:text-white"
                      to="/forgot-password"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 text-[11px] uppercase tracking-[0.2em] text-converso-subtext">
                  <span>Encrypted access</span>
                  <span>Global presence</span>
                </div>
              </form>

              {message && (
                <p className="mt-4 rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                  {message}
                </p>
              )}

              {error && (
                <p className="mt-4 rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* MOBILE LAYOUT (Bottom Sheet Style) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-auto w-full rounded-t-[24px] border-t border-cyan-300/20 bg-slate-900/55 p-6 shadow-2xl backdrop-blur-[25px] animate-slide-up">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Converso
            </h1>
            <p className="text-sm mt-2 text-cyan-100/70 whitespace-pre-line leading-relaxed max-w-xs mx-auto">
              Chat across languages in real time.

Understand, learn, and connect without barriers.
            </p>
          </div>

          <form className="flex flex-col gap-4 text-center" onSubmit={onSubmit}>
            {isRegister && (
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-cyan-300/35"
                name="username"
                type="text"
                value={form.username}
                onChange={onChange}
                placeholder="Username"
                required
              />
            )}

            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-cyan-300/35"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email"
              required
            />

            <div className="relative">
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-cyan-300/35"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/60 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            {isRegister && (
              <select
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-sm text-white outline-none transition-colors focus:border-cyan-300/35"
                name="preferredLanguage"
                value={form.preferredLanguage}
                onChange={onChange}
                style={{ textAlignLast: "center" }}
              >
                <option value="en" className="bg-slate-900">
                  English (EN)
                </option>
                <option value="es" className="bg-slate-900">
                  Spanish (ES)
                </option>
                <option value="fr" className="bg-slate-900">
                  French (FR)
                </option>
                <option value="ar" className="bg-slate-900">
                  Arabic (AR)
                </option>
                <option value="ur" className="bg-slate-900">
                  Urdu (UR)
                </option>
                <option value="hi" className="bg-slate-900">
                  Hindi (HI)
                </option>
                <option value="zh" className="bg-slate-900">
                  Chinese (ZH)
                </option>
                <option value="ja" className="bg-slate-900">
                  Japanese (JA)
                </option>
                <option value="ko" className="bg-slate-900">
                  Korean (KO)
                </option>
              </select>
            )}
            {isRegister && (
              <div className="flex items-start gap-3 px-2 py-1">
                <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                  <input
                    type="checkbox"
                    name="acceptedTerms"
                    checked={form.acceptedTerms}
                    onChange={onChange}
                    className="peer h-full w-full cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 transition-all checked:bg-converso-cyan checked:border-converso-cyan"
                    required
                  />
                  <svg
                    className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-left text-xs leading-tight text-cyan-100/60">
                  I accept the{" "}
                  <Link
                    to="/terms"
                    className="text-white underline decoration-white/20"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-white underline decoration-white/20"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            )}

            <button
              className="mt-2 w-full rounded-xl bg-[linear-gradient(135deg,#3B82F6,#06B6D4)] px-5 py-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Please wait..."
                : isRegister
                  ? "Create Account"
                  : "Sign In"}
            </button>

            <Link
              className="mt-2 inline-block text-sm font-medium text-white/70 transition hover:text-white"
              to={isRegister ? "/login" : "/register"}
            >
              {isRegister
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Link>
            {!isRegister && (
              <Link
                className="mt-2 inline-block text-sm font-medium text-cyan-100/70 transition hover:text-white"
                to="/forgot-password"
              >
                Forgot password?
              </Link>
            )}
          </form>

          {message && (
            <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-center text-emerald-300">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-center text-rose-300">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
