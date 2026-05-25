import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Eraser,
  Flag,
  Globe,
  Menu,
  MoreVertical,
  Palette,
  Settings,
  Share2,
  ShieldBan,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { ShareProfile } from "./ShareProfile.jsx";
import { AntigravitySettings } from "./AntigravitySettings.jsx";
import { Avatar } from "./Avatar.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { getTheme } from "../themes/conversoThemes.js";

function isLikelyOnline(lastSeenAt) {
  return Date.now() - new Date(lastSeenAt || 0).getTime() < 5 * 60 * 1000;
}

export function ChatHeader({
  selectedChat,
  isTyping,
  onBlock,
  onReport,
  onToggleSidebar,
  chatMode,
  setChatMode,
  autoTranslate,
  setAutoTranslate,
  onDelete,
  onClear,
  onToggleRightSidebar,
  onBack,
}) {
  const [showShareProfile, setShowShareProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const online = isLikelyOnline(selectedChat.partner.lastSeenAt);
  const navigate = useNavigate();

  const theme = selectedChat?.partner?.preferredLanguage
    ? getTheme(selectedChat.partner.preferredLanguage)
    : null;

  return (
    <>
      <header
        className="border-b border-white/10 px-4 py-4 backdrop-blur-2xl sm:px-6 transition-all duration-700"
        style={{
          borderBottomColor:
            chatMode === "culture" && theme
              ? `${theme.accentColor}33`
              : "rgba(255,255,255,0.1)",
          boxShadow:
            chatMode === "culture" && theme
              ? `0 4px 20px -10px ${theme.accentColor}22`
              : "none",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {onBack ? (
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
                onClick={onBack}
                aria-label="Back to conversations"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : (
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
                onClick={onToggleSidebar}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            <div className="relative transition-all duration-700">
              <Avatar
                user={selectedChat.partner}
                size="lg"
                className="!rounded-2xl"
                style={{
                  boxShadow:
                    chatMode === "culture" && theme
                      ? `0 0 20px ${theme.accentColor}66`
                      : "0 0 20px rgba(124,58,237,0.3)",
                  background:
                    chatMode === "culture" && theme
                      ? `linear-gradient(135deg, ${theme.accentColor}, ${theme.secondaryAccent || "#7c3aed"})`
                      : undefined,
                }}
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#09090b] z-10 ${
                  online ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
            </div>

            <div className="min-w-0">
              <h2
                className="truncate text-lg font-bold text-white tracking-tight"
                style={{
                  fontFamily:
                    chatMode === "culture" && theme
                      ? theme.typography?.family
                      : "inherit",
                }}
              >
                @{selectedChat.partner.username}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-converso-subtext">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${online ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`}
                  />
                  {isTyping ? "Typing..." : online ? "Online" : "Offline"}
                </span>
                <span className="h-1 w-1 rounded-full bg-converso-subtext/40" />
                <span
                  className="rounded-full border px-2 py-0.5 text-[11px] font-bold tracking-tighter transition-all duration-700"
                  style={{
                    borderColor:
                      chatMode === "culture" && theme
                        ? `${theme.accentColor}44`
                        : "rgba(245,200,108,0.2)",
                    backgroundColor:
                      chatMode === "culture" && theme
                        ? `${theme.accentColor}11`
                        : "rgba(245,200,108,0.1)",
                    color:
                      chatMode === "culture" && theme
                        ? theme.accentColor
                        : "#f5c86c",
                  }}
                >
                  {selectedChat.partner.preferredLanguage.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Translation Toggle */}
            <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 sm:flex hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2">
                <Globe
                  className={`h-4 w-4 transition-all duration-500 ${autoTranslate ? "text-emerald-400 scale-110" : "text-white/40"}`}
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                  Relay
                </span>
              </div>
              <button
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`relative h-6 w-11 rounded-full transition-all duration-500 ${
                  autoTranslate
                    ? "bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : "bg-white/10"
                }`}
              >
                <div
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-lg transition-transform duration-500 ${
                    autoTranslate ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Display Mode Toggle */}
            <div className="hidden items-center p-1 rounded-2xl border border-white/10 bg-white/5 md:flex">
              <button
                onClick={() => setChatMode("classic")}
                className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${chatMode === "classic" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white"}`}
              >
                Classic
              </button>
              <button
                onClick={() => setChatMode("culture")}
                className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${chatMode === "culture" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white"}`}
              >
                Culture
              </button>
            </div>

            <button
              type="button"
              onClick={onToggleRightSidebar}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 transition-all active:scale-95 shadow-lg ${
                menuOpen
                  ? "bg-emerald-500 text-white border-emerald-400"
                  : "bg-white/5 text-converso-subtext hover:border-white/30 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AntigravitySettings
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        partner={selectedChat.partner}
        autoTranslate={autoTranslate}
        setAutoTranslate={setAutoTranslate}
        displayMode={chatMode}
        setDisplayMode={setChatMode}
        onClear={() => {
          setMenuOpen(false);
          onClear();
        }}
        onDelete={() => {
          setMenuOpen(false);
          onDelete();
        }}
      />

      {showShareProfile ? (
        <ShareProfile
          user={selectedChat.partner}
          onClose={() => setShowShareProfile(false)}
        />
      ) : null}
    </>
  );
}
