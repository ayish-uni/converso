import { createContext, useContext, useEffect, useState } from "react";
import { culturalThemes, getThemeForLanguage } from "../data/themes.js";
import { api } from "../lib/api.js";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("chat_theme") || "dark",
  );
  const [culturalTheme, setCulturalTheme] = useState(
    localStorage.getItem("chat_cultural_theme") || "english",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("chat_theme", theme);
  }, [theme]);

  useEffect(() => {
    const themeData = culturalThemes[culturalTheme] || culturalThemes.english;
    const root = document.documentElement;

    root.style.setProperty("--bg", themeData.colors.bg);
    root.style.setProperty("--surface", themeData.colors.surface);
    root.style.setProperty("--primary", themeData.colors.primary);
    root.style.setProperty("--accent", themeData.colors.accent);
    root.style.setProperty("--text", themeData.colors.text);
    root.style.setProperty("--muted", themeData.colors.muted);
    root.style.setProperty("--bubble", themeData.colors.bubble);
    root.style.setProperty("--border-color", themeData.colors.border);
    root.style.setProperty("--font-heading", themeData.font.heading);
    root.style.setProperty("--font-body", themeData.font.body);
    root.style.setProperty("--glow", themeData.effects.glow);
    root.style.setProperty("--blur", themeData.effects.blur);

    localStorage.setItem("chat_cultural_theme", culturalTheme);
  }, [culturalTheme]);

  const setThemeForLanguage = (language) => {
    const themeKey = getThemeForLanguage(language);
    setCulturalTheme(themeKey);
  };

  const updateCulturalTheme = async (newTheme) => {
    try {
      await api.patch("/users/preferences", { culturalTheme: newTheme });
      setCulturalTheme(newTheme);
    } catch (error) {
      console.error("Failed to update cultural theme:", error);
      // Still update locally even if server update fails
      setCulturalTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        culturalTheme,
        toggleTheme: () =>
          setTheme((current) => (current === "dark" ? "light" : "dark")),
        setCulturalTheme: updateCulturalTheme,
        setThemeForLanguage,
        availableThemes: Object.keys(culturalThemes),
        currentThemeData:
          culturalThemes[culturalTheme] || culturalThemes.english,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
