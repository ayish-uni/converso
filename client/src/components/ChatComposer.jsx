import { useEffect, useState, useRef } from "react";
import { Smile } from "lucide-react";
import { getSocket } from "../lib/socket";
import { MediaUpload } from "./MediaUpload.jsx";

const EMOJIS = ["👋", "✨", "🌍", "🗣️", "💬", "😊", "👍", "❤️", "🎉", "🤔"];

// Simple language detection based on common patterns
function detectLanguageSimple(text) {
  if (!text || text.length < 3) return null;

  const patterns = {
    en: /[a-zA-Z\s]{3,}/,
    es: /[áéíóúñüs]{1,}|^(hola|qué|cómo|dónde)/i,
    fr: /[àâäæçéèêëïîôöœùûüœ]{1,}|^(bonjour|quoi|comment)/i,
    de: /[äöüß]{1,}|^(hallo|wie|was)/i,
    ja: /[\u3040-\u309F\u30A0-\u30FF]/,
    zh: /[\u4E00-\u9FFF]/,
    ar: /[\u0600-\u06FF]/,
    pt: /[ãõç]{1,}|^(oi|olá|como)/i,
    it: /^(ciao|grazie|come)/i,
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }

  return null;
}

export function ChatComposer({
  selectedChat,
  onSend,
  error,
  token,
  onMediaSent,
  replyingTo,
  onCancelReply,
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const detectionTimeoutRef = useRef(null);

  // Language name map
  const languageNames = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    ja: "日本語",
    zh: "中文",
    ar: "العربية",
    pt: "Português",
    it: "Italiano",
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      return undefined;
    }

    if (!value.trim()) {
      socket.emit("stop_typing", {
        receiverId: selectedChat.partner.id,
        chatId: selectedChat._id,
      });
      setDetectedLanguage(null);
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
      return undefined;
    }

    socket.emit("typing", {
      receiverId: selectedChat.partner.id,
      chatId: selectedChat._id,
    });

    // Debounced language detection
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }

    detectionTimeoutRef.current = setTimeout(() => {
      const detected = detectLanguageSimple(value);
      setDetectedLanguage(detected);
    }, 500);

    const typingTimeout = window.setTimeout(() => {
      socket.emit("stop_typing", {
        receiverId: selectedChat.partner.id,
        chatId: selectedChat._id,
      });
    }, 1200);

    return () => {
      window.clearTimeout(typingTimeout);
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    };
  }, [selectedChat, value]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!value.trim()) {
      return;
    }

    setSending(true);
    setLocalError("");

    try {
      const finalValue = replyingTo
        ? `> [Replying to: "${replyingTo.originalText.substring(0, 50)}${replyingTo.originalText.length > 50 ? "..." : ""}"]\n\n${value.trim()}`
        : value.trim();

      await onSend(finalValue);
      setValue("");
      setShowEmojis(false);
      setDetectedLanguage(null);
      if (onCancelReply) onCancelReply();
    } catch (sendError) {
      setLocalError(
        sendError?.message || String(sendError) || "Failed to send message.",
      );
    } finally {
      setSending(false);
    }
  }

  const handleEmojiClick = (emoji) => {
    setValue((current) => current + emoji);
    setShowEmojis(false);
  };

  return (
    <form className="px-4 pb-6 sm:px-6 mt-auto" onSubmit={handleSubmit}>
      <MediaUpload
        selectedChat={selectedChat}
        token={token}
        onMediaSent={onMediaSent}
        error={localError}
        setError={setLocalError}
      />

      <div className="mx-auto flex max-w-4xl flex-col gap-2 rounded-[32px] border border-white/10 bg-white/5 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl ring-1 ring-white/5">
        {replyingTo && (
          <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-2 mx-2 mt-2 border border-white/5 backdrop-blur-md">
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-bold text-converso-gold uppercase tracking-wider">
                Replying to message
              </span>
              <p className="truncate text-xs text-white/70 italic">
                "{replyingTo.originalText}"
              </p>
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-center gap-3 w-full">
          <div className="relative pl-1">
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-converso-subtext transition hover:border-converso-gold/30 hover:text-converso-gold hover:bg-white/10"
              onClick={() => setShowEmojis(!showEmojis)}
              type="button"
            >
              <Smile className="h-5 w-5" />
            </button>
            {showEmojis && (
              <div className="absolute bottom-full left-0 mb-4 w-64 rounded-3xl border border-white/10 bg-converso-night/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl ring-1 ring-white/10">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-converso-subtext/60">
                  Quick Reactions
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-xl transition hover:bg-white/10 hover:scale-110 active:scale-95"
                      type="button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <textarea
            rows="1"
            className="max-h-40 min-h-[52px] flex-1 resize-none rounded-2xl border border-transparent bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-converso-subtext"
            placeholder={`Send a message to @${selectedChat.partner.username}`}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />

          <button
            className="inline-flex h-11 min-w-[100px] items-center justify-center rounded-2xl bg-converso-gradient px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.2)] transition hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-70 mr-1"
            type="submit"
            disabled={sending}
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
      {(localError || error) && (
        <p className="mx-auto mt-3 max-w-4xl text-sm text-rose-300">
          {localError || error}
        </p>
      )}
    </form>
  );
}
