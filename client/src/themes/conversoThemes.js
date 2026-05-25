export const CONVERSO_THEMES = {
  english: {
    name: "London Fog",
    landmark: "London/Westminster",
    bgImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    elements: ["📚", "🏮", "☁️", "💂", "☕"],
    accentColor: "#60a5fa", // Bright Sky Blue
    secondaryAccent: "#f87171", // Crimson
    glowColor: "rgba(96, 165, 250, 0.4)",
    palette: {
      bg: "from-slate-950 via-slate-900 to-slate-950",
      accent: "text-blue-400",
      accentBg: "bg-blue-500/10",
      glow: "shadow-[0_0_30px_rgba(96,165,250,0.25)]",
      border: "border-blue-500/20",
    },
    typography: { family: '"Inter", sans-serif', weight: 500, size: "text-base" },
    patterns: { type: "grid", opacity: "opacity-5", animation: "none" },
  },
  spanish: {
    name: "Madrid Sunset",
    landmark: "Alhambra Palace",
    bgImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    elements: ["🏺", "💃", "🍊", "🌹", "☀️"],
    accentColor: "#fb923c", // Warm Orange
    secondaryAccent: "#2dd4bf", // Teal
    glowColor: "rgba(251, 146, 60, 0.4)",
    palette: {
      bg: "from-orange-950 via-amber-950 to-orange-950",
      accent: "text-orange-300",
      accentBg: "bg-orange-500/10",
      glow: "shadow-[0_0_30px_rgba(251,146,60,0.25)]",
      border: "border-orange-500/20",
    },
    typography: { family: '"Galeano", serif', weight: 400, size: "text-base" },
    patterns: { type: "flamenco", opacity: "opacity-5", animation: "animate-pulse" },
  },
  french: {
    name: "Parisian Night",
    landmark: "Eiffel Tower/Paris",
    bgImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    elements: ["⚜️", "🪻", "🎨", "🍷", "🥖"],
    accentColor: "#818cf8", // Royal Indigo
    secondaryAccent: "#fde68a", // Cream Gold
    glowColor: "rgba(129, 140, 248, 0.4)",
    palette: {
      bg: "from-indigo-950 via-[#1e1b4b] to-indigo-950",
      accent: "text-indigo-300",
      accentBg: "bg-indigo-500/10",
      glow: "shadow-[0_0_30px_rgba(129,140,248,0.25)]",
      border: "border-indigo-500/20",
    },
    typography: { family: '"Lora", serif', weight: 400, size: "text-base" },
    patterns: { type: "ornate", opacity: "opacity-6", animation: "animate-shimmer" },
  },
  german: {
    name: "Bavarian Forest",
    landmark: "Neuschwanstein Castle",
    bgImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
    elements: ["🍃", "⚙️", "🌲", "🍺", "🥨"],
    accentColor: "#34d399", // Emerald Green
    secondaryAccent: "#94a3b8", // Silver Slate
    glowColor: "rgba(52, 211, 153, 0.4)",
    palette: {
      bg: "from-[#064e3b] via-[#022c22] to-[#064e3b]",
      accent: "text-emerald-300",
      accentBg: "bg-emerald-500/10",
      glow: "shadow-[0_0_30px_rgba(52,211,153,0.25)]",
      border: "border-emerald-500/20",
    },
    typography: { family: '"IBM Plex Sans", sans-serif', weight: 600, size: "text-base" },
    patterns: { type: "bauhaus", opacity: "opacity-5", animation: "none" },
  },
  italian: {
    name: "Tuscan Wine",
    landmark: "Rome/Colosseum",
    bgImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    elements: ["🎭", "🏛️", "🍇", "🍕", "🎻"],
    accentColor: "#f87171", // Rose Red
    secondaryAccent: "#fbbf24", // Tuscan Gold
    glowColor: "rgba(248, 113, 113, 0.4)",
    palette: {
      bg: "from-[#450a0a] via-[#2d0606] to-[#450a0a]",
      accent: "text-rose-300",
      accentBg: "bg-rose-500/10",
      glow: "shadow-[0_0_30px_rgba(248,113,113,0.25)]",
      border: "border-rose-500/20",
    },
    typography: { family: '"Cinzel", serif', weight: 400, size: "text-base" },
    patterns: { type: "mosaic", opacity: "opacity-6", animation: "animate-pulse" },
  },
  portuguese: {
    name: "Oceanic Lisbon",
    landmark: "Lisbon / Belém Tower",
    bgImage: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=1200&q=80",
    elements: ["💠", "🧭", "🌊", "🍷", "⛵"],
    accentColor: "#38bdf8", // Sky Blue
    secondaryAccent: "#f8fafc", // Pure White
    glowColor: "rgba(56, 189, 248, 0.4)",
    palette: {
      bg: "from-[#0c4a6e] via-[#082f49] to-[#0c4a6e]",
      accent: "text-sky-300",
      accentBg: "bg-sky-500/10",
      glow: "shadow-[0_0_30px_rgba(56,189,248,0.25)]",
      border: "border-sky-500/20",
    },
    typography: { family: '"Cormorant Garamond", serif', weight: 400, size: "text-base" },
    patterns: { type: "azulejos", opacity: "opacity-6", animation: "animate-pulse" },
  },
  chinese: {
    name: "Imperial Dynasty",
    landmark: "Forbidden City",
    bgImage: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=80",
    elements: ["🏮", "🐉", "🎋", "🍜", "🥠"],
    accentColor: "#ef4444", // Bright Red
    secondaryAccent: "#fbbf24", // Imperial Gold
    glowColor: "rgba(239, 68, 68, 0.4)",
    palette: {
      bg: "from-[#450a0a] via-[#2d0606] to-[#450a0a]",
      accent: "text-red-400",
      accentBg: "bg-red-500/10",
      glow: "shadow-[0_0_30px_rgba(239, 68, 68, 0.25)]",
      border: "border-red-500/20",
    },
    typography: { family: '"Noto Sans CJK SC", sans-serif', weight: 400, size: "text-base" },
    patterns: { type: "tai-chi", opacity: "opacity-5", animation: "animate-glow-rotate" },
  },
  japanese: {
    name: "Kyoto Sakura",
    landmark: "Mt. Fuji / Pagodas",
    bgImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    elements: ["🌸", "🪭", "🪨", "🍣", "🏮"],
    accentColor: "#f472b6", // Sakura Pink
    secondaryAccent: "#4338ca", // Indigo
    glowColor: "rgba(244, 114, 182, 0.4)",
    palette: {
      bg: "from-[#4d1d39] via-[#2d0f1e] to-[#4d1d39]",
      accent: "text-pink-300",
      accentBg: "bg-pink-500/10",
      glow: "shadow-[0_0_30px_rgba(244, 114, 182, 0.25)]",
      border: "border-pink-500/20",
    },
    typography: { family: '"Hiragino Mincho Pro", serif', weight: 300, size: "text-base" },
    patterns: { type: "sakura", opacity: "opacity-8", animation: "animate-float" },
  },
  korean: {
    name: "Seoul Neon",
    landmark: "Seoul Palaces",
    bgImage: "https://images.unsplash.com/photo-1538485399081-7c89750b1db6?auto=format&fit=crop&w=1200&q=80",
    elements: ["⛩️", "🌲", "🪭", "🍱", "📜"],
    accentColor: "#6366f1", // Neon Indigo
    secondaryAccent: "#f43f5e", // Rose
    glowColor: "rgba(99, 102, 241, 0.4)",
    palette: {
      bg: "from-[#1e1b4b] via-[#0f172a] to-[#1e1b4b]",
      accent: "text-indigo-400",
      accentBg: "bg-indigo-500/10",
      glow: "shadow-[0_0_30px_rgba(99,102,241,0.25)]",
      border: "border-indigo-500/20",
    },
    typography: { family: '"Noto Sans CJK KR", sans-serif', weight: 500, size: "text-base" },
    patterns: { type: "hangeul", opacity: "opacity-6", animation: "animate-shimmer" },
  },
  arabic: {
    name: "Desert Oasis",
    landmark: "Dubai / Old Cairo",
    bgImage: "https://images.unsplash.com/photo-1547989453-11e67ffb3885?auto=format&fit=crop&w=1200&q=80",
    elements: ["🖋️", "⭐", "💨", "🕌", "🐪"],
    accentColor: "#fbbf24", // Amber Gold
    secondaryAccent: "#2dd4bf", // Turquoise
    glowColor: "rgba(251, 191, 36, 0.4)",
    palette: {
      bg: "from-[#422006] via-[#1c1917] to-[#422006]",
      accent: "text-amber-300",
      accentBg: "bg-amber-500/10",
      glow: "shadow-[0_0_30px_rgba(251,191,36,0.25)]",
      border: "border-amber-500/20",
    },
    typography: { family: '"Droid Arabic Naskh", serif', weight: 400, size: "text-base" },
    patterns: { type: "mashrabiya", opacity: "opacity-5", animation: "animate-glow-rotate" },
  },
  hindi: {
    name: "Varanasi Glow",
    landmark: "Taj Mahal",
    bgImage: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
    elements: ["☸️", "🏵️", "🧣", "🍛", "🪔"],
    accentColor: "#f59e0b", // Saffron
    secondaryAccent: "#db2777", // Pink Magenta
    glowColor: "rgba(245, 158, 11, 0.4)",
    palette: {
      bg: "from-[#451a03] via-[#2d0a01] to-[#451a03]",
      accent: "text-orange-400",
      accentBg: "bg-orange-500/10",
      glow: "shadow-[0_0_30px_rgba(245, 158, 11, 0.25)]",
      border: "border-orange-500/20",
    },
    typography: { family: '"Noto Sans Devanagari", sans-serif', weight: 400, size: "text-base" },
    patterns: { type: "mandala", opacity: "opacity-7", animation: "animate-glow-rotate" },
  },
  turkish: {
    name: "Bosphorus Dream",
    landmark: "Istanbul/Blue Mosque",
    bgImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
    elements: ["🧿", "🍵", "🌷", "🕌", "☕"],
    accentColor: "#2563eb", // Royal Blue
    secondaryAccent: "#fbbf24", // Golden Horn
    glowColor: "rgba(37, 99, 235, 0.4)",
    palette: {
      bg: "from-[#1e3a8a] via-[#0f172a] to-[#1e3a8a]",
      accent: "text-blue-400",
      accentBg: "bg-blue-500/10",
      glow: "shadow-[0_0_30px_rgba(37,99,235,0.25)]",
      border: "border-blue-500/20",
    },
    typography: { family: '"Poppins", sans-serif', weight: 500, size: "text-base" },
    patterns: { type: "iznik", opacity: "opacity-6", animation: "animate-glow-rotate" },
  },
  russian: {
    name: "Siberian Frost",
    landmark: "St. Basil's Cathedral",
    bgImage: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=1200&q=80",
    elements: ["❄️", "🪆", "🌳", "🎻", "🕯️"],
    accentColor: "#22d3ee", // Frost Cyan
    secondaryAccent: "#f43f5e", // Deep Red
    glowColor: "rgba(34, 211, 238, 0.4)",
    palette: {
      bg: "from-[#083344] via-[#020617] to-[#083344]",
      accent: "text-cyan-300",
      accentBg: "bg-cyan-500/10",
      glow: "shadow-[0_0_30px_rgba(34, 211, 238, 0.25)]",
      border: "border-cyan-500/20",
    },
    typography: { family: '"PT Serif", serif', weight: 400, size: "text-base" },
    patterns: { type: "snowflake", opacity: "opacity-6", animation: "animate-float" },
  },
  dutch: {
    name: "Delft Canal",
    landmark: "Amsterdam Canals",
    bgImage: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=80",
    elements: ["🌷", "🪁", "🏺", "🧀", "🚲"],
    accentColor: "#f97316", // Bright Orange
    secondaryAccent: "#1d4ed8", // Delft Blue
    glowColor: "rgba(249, 115, 22, 0.4)",
    palette: {
      bg: "from-[#0f172a] via-[#020617] to-[#0f172a]",
      accent: "text-orange-400",
      accentBg: "bg-orange-500/10",
      glow: "shadow-[0_0_30px_rgba(249,115,22,0.25)]",
      border: "border-orange-500/20",
    },
    typography: { family: '"Source Sans Pro", sans-serif', weight: 500, size: "text-base" },
    patterns: { type: "grid", opacity: "opacity-4", animation: "none" },
  },
  thai: {
    name: "Siam Emerald",
    landmark: "Wat Arun",
    bgImage: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
    elements: ["🪷", "⛱️", "🕌", "🐘", "🥥"],
    accentColor: "#10b981", // Emerald
    secondaryAccent: "#fbbf24", // Golden Parasol
    glowColor: "rgba(16, 185, 129, 0.4)",
    palette: {
      bg: "from-[#064e3b] via-[#022c22] to-[#064e3b]",
      accent: "text-emerald-400",
      accentBg: "bg-emerald-500/10",
      glow: "shadow-[0_0_30px_rgba(16, 185, 129, 0.25)]",
      border: "border-emerald-500/20",
    },
    typography: { family: '"Lora", serif', weight: 400, size: "text-base" },
    patterns: { type: "batik", opacity: "opacity-6", animation: "animate-pulse" },
  },
  swedish: {
    name: "Nordic Aurora",
    landmark: "Stockholm Archipelago",
    bgImage: "https://images.unsplash.com/photo-1600189020840-e9db18c32782?auto=format&fit=crop&w=1200&q=80",
    elements: ["🌲", "🌌", "🐎", "🐟", "🪵"],
    accentColor: "#0ea5e9", // Ice Blue
    secondaryAccent: "#4ade80", // Aurora Green
    glowColor: "rgba(14, 165, 233, 0.4)",
    palette: {
      bg: "from-[#0c4a6e] via-[#020617] to-[#0c4a6e]",
      accent: "text-sky-300",
      accentBg: "bg-sky-500/10",
      glow: "shadow-[0_0_30px_rgba(14, 165, 233, 0.25)]",
      border: "border-sky-500/20",
    },
    typography: { family: '"Inter", sans-serif', weight: 400, size: "text-base" },
    patterns: { type: "nordic", opacity: "opacity-5", animation: "none" },
  },
  vietnamese: {
    name: "Indochina Jade",
    landmark: "Ha Long Bay",
    bgImage: "https://images.unsplash.com/photo-1555661530-68c8e98db4e6?auto=format&fit=crop&w=1200&q=80",
    elements: ["🪷", "⛰️", "👒", "🍜", "☕"],
    accentColor: "#84cc16", // Lime Green
    secondaryAccent: "#b45309", // Clay Brown
    glowColor: "rgba(132, 204, 22, 0.4)",
    palette: {
      bg: "from-[#365314] via-[#022c22] to-[#365314]",
      accent: "text-lime-300",
      accentBg: "bg-lime-500/10",
      glow: "shadow-[0_0_30px_rgba(132,204,22,0.25)]",
      border: "border-lime-500/20",
    },
    typography: { family: '"Lora", serif', weight: 400, size: "text-base" },
    patterns: { type: "paddy", opacity: "opacity-6", animation: "animate-pulse" },
  },
  greek: {
    name: "Aegean Azure",
    landmark: "The Parthenon",
    bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?auto=format&fit=crop&w=1200&q=80",
    elements: ["🌿", "🏺", "🏛️", "🫒", "⛵"],
    accentColor: "#3b82f6", // Aegean Blue
    secondaryAccent: "#ffffff", // Marble White
    glowColor: "rgba(59, 130, 246, 0.4)",
    palette: {
      bg: "from-[#1e3a8a] via-[#0f172a] to-[#1e3a8a]",
      accent: "text-blue-300",
      accentBg: "bg-blue-500/10",
      glow: "shadow-[0_0_30px_rgba(59, 130, 246, 0.25)]",
      border: "border-blue-500/20",
    },
    typography: { family: '"Cinzel", serif', weight: 400, size: "text-base" },
    patterns: { type: "meander", opacity: "opacity-6", animation: "animate-pulse" },
  },
  polish: {
    name: "Royal Wawel",
    landmark: "Wawel Castle / Kraków",
    bgImage: "https://images.unsplash.com/photo-1587244141726-17b5e40e6c6b?auto=format&fit=crop&w=1200&q=80",
    elements: ["🏰", "🦅", "🐉", "🥟", "🍁"],
    accentColor: "#f87171", // Crimson
    secondaryAccent: "#f1f5f9", // Silver White
    glowColor: "rgba(248, 113, 113, 0.4)",
    palette: {
      bg: "from-[#450a0a] via-[#1c1917] to-[#450a0a]",
      accent: "text-red-300",
      accentBg: "bg-red-500/10",
      glow: "shadow-[0_0_30px_rgba(248, 113, 113, 0.25)]",
      border: "border-red-500/20",
    },
    typography: { family: '"Lora", serif', weight: 500, size: "text-base" },
    patterns: { type: "royal", opacity: "opacity-6", animation: "animate-pulse" },
  },
  urdu: {
    name: "Mughal Majesty",
    landmark: "Badshahi Mosque / Lahore",
    bgImage: "https://images.unsplash.com/photo-1627838377317-062e241764eb?auto=format&fit=crop&w=1200&q=80",
    elements: ["🕌", "🌙", "🎨", "🖋️", "☕"],
    accentColor: "#10b981", // Emerald Green
    secondaryAccent: "#fbbf24", // Gold
    glowColor: "rgba(16, 185, 129, 0.4)",
    palette: {
      bg: "from-[#064e3b] via-[#1c1917] to-[#064e3b]",
      accent: "text-emerald-300",
      accentBg: "bg-emerald-500/10",
      glow: "shadow-[0_0_30px_rgba(16, 185, 129, 0.25)]",
      border: "border-emerald-500/20",
    },
    typography: { family: '"Inter", sans-serif', weight: 400, size: "text-base" },
    patterns: { type: "arabesque", opacity: "opacity-5", animation: "animate-glow-rotate" },
  },
  bengali: {
    name: "Golden Bengal",
    landmark: "Lalbagh Fort / Dhaka",
    bgImage: "https://images.unsplash.com/photo-1596422846543-75c6fc18a513?auto=format&fit=crop&w=1200&q=80",
    elements: ["🐅", "🌾", "⛵", "🪷", "🍲"],
    accentColor: "#22c55e", // Forest Green
    secondaryAccent: "#f43f5e", // Red Rose
    glowColor: "rgba(34, 197, 94, 0.4)",
    palette: {
      bg: "from-[#064e3b] via-[#111827] to-[#064e3b]",
      accent: "text-green-300",
      accentBg: "bg-green-500/10",
      glow: "shadow-[0_0_30px_rgba(34, 197, 94, 0.25)]",
      border: "border-green-500/20",
    },
    typography: { family: '"Inter", sans-serif', weight: 500, size: "text-base" },
    patterns: { type: "mandala", opacity: "opacity-5", animation: "none" },
  },
  indonesian: {
    name: "Nusantara Sunset",
    landmark: "Borobudur Temple / Java",
    bgImage: "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1200&q=80",
    elements: ["🌋", "🌴", "🥥", "🎭", "🌾"],
    accentColor: "#f97316", // Warm Orange
    secondaryAccent: "#06b6d4", // Ocean Cyan
    glowColor: "rgba(249, 115, 22, 0.4)",
    palette: {
      bg: "from-[#431407] via-[#0f172a] to-[#431407]",
      accent: "text-orange-300",
      accentBg: "bg-orange-500/10",
      glow: "shadow-[0_0_30px_rgba(249, 115, 22, 0.25)]",
      border: "border-orange-500/20",
    },
    typography: { family: '"Poppins", sans-serif', weight: 400, size: "text-base" },
    patterns: { type: "batik", opacity: "opacity-6", animation: "animate-pulse" },
  },
};

const languageMap = {
  en: "english",
  english: "english",
  es: "spanish",
  spanish: "spanish",
  fr: "french",
  french: "french",
  de: "german",
  german: "german",
  it: "italian",
  italian: "italian",
  pt: "portuguese",
  portuguese: "portuguese",
  nl: "dutch",
  dutch: "dutch",
  pl: "polish",
  polish: "polish",
  ur: "urdu",
  urdu: "urdu",
  hi: "hindi",
  hindi: "hindi",
  ar: "arabic",
  arabic: "arabic",
  zh: "chinese",
  chinese: "chinese",
  ja: "japanese",
  japanese: "japanese",
  ko: "korean",
  korean: "korean",
  bn: "bengali",
  bengali: "bengali",
  tr: "turkish",
  turkish: "turkish",
  id: "indonesian",
  indonesian: "indonesian",
  ru: "russian",
  russian: "russian",
};

export function getTheme(languageCode) {
  if (!languageCode) return CONVERSO_THEMES.english;
  const cleanCode = languageCode.toLowerCase().trim();
  const themeKey = languageMap[cleanCode] || cleanCode;
  const theme = CONVERSO_THEMES[themeKey] || CONVERSO_THEMES.english;
  return theme;
}

export function getThemeByName(culturalTheme) {
  const themeMap = {
    english: "english",
    spanish: "spanish",
    french: "french",
    german: "german",
    italian: "italian",
    portuguese: "portuguese",
    dutch: "dutch",
    polish: "polish",
    chinese: "chinese",
    japanese: "japanese",
    korean: "korean",
    arabic: "arabic",
    hindi: "hindi",
    urdu: "urdu",
    bengali: "bengali",
    turkish: "turkish",
    indonesian: "indonesian",
    russian: "russian",
  };

  return getTheme(themeMap[culturalTheme] || "english");
}
