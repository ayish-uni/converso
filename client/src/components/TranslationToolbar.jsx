import React, { useState, useEffect } from "react";
import { useAuth } from "../state/AuthContext";
import { useTranslationPrefs } from "../lib/useTranslationPrefs";
import "../styles.css";

/**
 * TranslationToolbar Component
 * Displays translation settings with:
 * - Auto-Translate toggle (soft blue glow when ON)
 * - Display Mode dropdown (Classic/Culture/Modern)
 * - My Language selector (flag + language name)
 * Features glassmorphism design with 12px spacing
 */
export function TranslationToolbar() {
  const { user } = useAuth();
  const { autoTranslate, displayMode, toggleAutoTranslate, setDisplayMode } =
    useTranslationPrefs();
  const [isOpen, setIsOpen] = useState(false);

  // Language data with flags
  const languages = {
    en: { label: "English", flag: "🇬🇧" },
    es: { label: "Español", flag: "🇪🇸" },
    fr: { label: "Français", flag: "🇫🇷" },
    de: { label: "Deutsch", flag: "🇩🇪" },
    it: { label: "Italiano", flag: "🇮🇹" },
    pt: { label: "Português", flag: "🇵🇹" },
    nl: { label: "Nederlands", flag: "🇳🇱" },
    pl: { label: "Polski", flag: "🇵🇱" },
    zh: { label: "中文", flag: "🇨🇳" },
    ja: { label: "日本語", flag: "🇯🇵" },
    ko: { label: "한국어", flag: "🇰🇷" },
    ar: { label: "العربية", flag: "🇸🇦" },
    hi: { label: "हिन्दी", flag: "🇮🇳" },
    ur: { label: "اردو", flag: "🇵🇰" },
    bn: { label: "বাংলা", flag: "🇧🇩" },
    tr: { label: "Türkçe", flag: "🇹🇷" },
    id: { label: "Bahasa Indonesia", flag: "🇮🇩" },
    ru: { label: "Русский", flag: "🇷🇺" },
  };

  const currentLang =
    languages[user?.preferredLanguage?.toLowerCase() || "en"] || languages.en;

  const displayModes = [
    {
      id: "classic",
      label: "Classic",
      icon: "✎",
      description: "Translated Only",
    },
    {
      id: "culture",
      label: "Culture",
      icon: "◆",
      description: "Original + Translated",
    },
    { id: "modern", label: "Modern", icon: "✦", description: "Full Context" },
  ];

  return (
    <div
      className="translation-toolbar"
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        padding: "12px 16px",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "12px",
        marginBottom: "12px",
      }}
    >
      {/* Auto-Translate Toggle */}
      <div
        className="auto-translate-toggle"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <label
          htmlFor="auto-translate"
          style={{ fontSize: "12px", fontWeight: "500", opacity: 0.8 }}
        >
          Auto-Translate
        </label>
        <button
          id="auto-translate"
          onClick={toggleAutoTranslate}
          style={{
            width: "44px",
            height: "24px",
            borderRadius: "12px",
            border: "none",
            background: autoTranslate ? "#60a5fa" : "rgba(255, 255, 255, 0.2)",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.3s ease",
            boxShadow: autoTranslate
              ? "0 0 12px rgba(96, 165, 250, 0.6)"
              : "none",
          }}
          aria-label={
            autoTranslate ? "Auto-translate enabled" : "Auto-translate disabled"
          }
        >
          <div
            style={{
              position: "absolute",
              width: "20px",
              height: "20px",
              borderRadius: "10px",
              background: "white",
              top: "2px",
              left: autoTranslate ? "22px" : "2px",
              transition: "left 0.3s ease",
            }}
          />
        </button>
      </div>

      {/* Display Mode Dropdown */}
      <div
        className="display-mode-selector"
        style={{
          position: "relative",
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: "6px 12px",
            background: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "8px",
            color: "white",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
          }}
        >
          <span>{displayModes.find((m) => m.id === displayMode)?.icon}</span>
          <span>{displayModes.find((m) => m.id === displayMode)?.label}</span>
          <span style={{ fontSize: "10px", opacity: 0.7 }}>▼</span>
        </button>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: "6px",
              background: "rgba(30, 30, 40, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              minWidth: "180px",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
              zIndex: 1000,
            }}
          >
            {displayModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setDisplayMode(mode.id);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "8px 12px",
                  background:
                    mode.id === displayMode
                      ? "rgba(96, 165, 250, 0.2)"
                      : "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "13px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.2s ease",
                  borderBottom:
                    mode.id !== displayModes[displayModes.length - 1].id
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    mode.id === displayMode
                      ? "rgba(96, 165, 250, 0.2)"
                      : "transparent";
                }}
              >
                <span style={{ fontSize: "16px" }}>{mode.icon}</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "500" }}>{mode.label}</span>
                  <span style={{ fontSize: "11px", opacity: 0.6 }}>
                    {mode.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* My Language Selector */}
      <div
        className="language-selector"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          background: "rgba(255, 255, 255, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          marginLeft: "auto",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
        }}
      >
        <span style={{ fontSize: "18px" }}>{currentLang.flag}</span>
        <span style={{ fontSize: "12px", fontWeight: "500" }}>
          {currentLang.label}
        </span>
      </div>
    </div>
  );
}
