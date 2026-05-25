import { useTheme } from "../state/ThemeContext.jsx";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-converso-purple/40 hover:bg-white/10"
      onClick={toggleTheme}
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
