import { useState } from "react";
import { useTheme } from "../state/ThemeContext.jsx";
import { culturalThemes } from "../data/themes.js";

export function CulturalThemeSelector() {
  const { culturalTheme, setCulturalTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-converso-subtext transition hover:border-converso-gold/50 hover:text-converso-gold"
        title="Cultural Theme"
      >
        Theme
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-converso-surface p-4 shadow-lg z-50">
          <h3 className="mb-3 text-sm font-semibold text-white">
            Cultural Themes
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {availableThemes.map((themeKey) => {
              const theme = culturalThemes[themeKey];
              return (
                <button
                  key={themeKey}
                  onClick={() => {
                    setCulturalTheme(themeKey);
                    setIsOpen(false);
                  }}
                  className={`rounded-lg border p-3 text-left transition ${
                    culturalTheme === themeKey
                      ? "border-converso-cyan bg-converso-cyan/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <span className="text-xs font-medium text-white">
                      {theme.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
