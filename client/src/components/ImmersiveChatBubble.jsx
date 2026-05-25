import React, { useState } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
  Reply,
  Trash2,
  Download,
  Plus,
  FileText,
  MoreVertical,
} from "lucide-react";
import { LearningTooltip } from "./LearningTooltip";
import { MessageContextMenu } from "./MessageContextMenu";
import { SOCKET_URL } from "../config";

export function ImmersiveChatBubble({
  message,
  isOwn = false,
  mode = "classic",
  theme,
  autoTranslate = true,
  currentUserId,
  displayMode = "classic",
  token,
  onReply,
  onForward,
  onDelete,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  // The translation target is the receiver's translation (which is the message translated to the receiver's preferred language)
  const displayedTranslation = message.receiverTranslatedText || message.translatedText;
  const hasTranslation =
    Boolean(message.originalText) &&
    Boolean(displayedTranslation) &&
    message.originalText.trim().toLowerCase() !==
      displayedTranslation.trim().toLowerCase();

  const containerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Primary text: for sender, it is the original text. For receiver, it is the translated text.
  // Secondary text: for sender, it is the translated text. For receiver, it is the original text.
  const primaryText = isOwn
    ? message.originalText
    : (autoTranslate && hasTranslation ? displayedTranslation : message.originalText);
  const secondaryText = isOwn
    ? displayedTranslation
    : message.originalText;

  const getAbsoluteUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    // Use the SOCKET_URL from config which points to the backend base
    return `${SOCKET_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleDocumentDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rawUrl = message.mediaUrl;
    const url = getAbsoluteUrl(rawUrl);
    const filename = message.mediaFileName || "document";

    // If it's a Cloudinary URL, we can force download by adding fl_attachment
    if (url && url.includes("cloudinary.com")) {
      const parts = url.split("/upload/");
      if (parts.length === 2) {
        const safeName = encodeURIComponent(filename.replace(/\.[^/.]+$/, ""));
        const attachmentUrl = `${parts[0]}/upload/fl_attachment:${safeName}/${parts[1]}`;
        window.open(attachmentUrl, "_blank");
        return;
      }
    }

    // Local file download using backend middleware
    const downloadUrl = `${url}?download=1&filename=${encodeURIComponent(filename)}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`group flex ${isOwn ? "justify-end" : "justify-start"} mb-6 w-full relative`}
    >
      {/* Action Pill (Hover Overlay) */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? "right-[calc(92%+10px)] sm:right-[calc(85%+10px)] md:right-[calc(80%+10px)] flex-row-reverse" : "left-[calc(92%+10px)] sm:left-[calc(85%+10px)] md:left-[calc(80%+10px)] flex-row"} opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1.5 shadow-xl z-20`}
      >
        <button
          className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          title="Reply"
          onClick={() => onReply && onReply(message)}
        >
          <Reply className="h-3.5 w-3.5" />
        </button>
        <button
          className="p-1.5 text-white/50 hover:text-indigo-400 hover:bg-white/10 rounded-full transition-colors"
          title="Forward"
          onClick={() => onForward && onForward(message)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 17 20 12 15 7"></polyline>
            <path d="M4 18v-2a4 4 0 0 1 4-4h12"></path>
          </svg>
        </button>
        {!isOwn && (
          <button
            className="p-1.5 text-white/50 hover:text-emerald-400 hover:bg-white/10 rounded-full transition-colors"
            title="Save to Ledger"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
        {message.messageType === "document" && (
          <button
            className="p-1.5 text-white/50 hover:text-converso-cyan hover:bg-white/10 rounded-full transition-colors"
            title="Download"
            onClick={handleDocumentDownload}
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        )}
        {isOwn && (
          <button
            className="p-1.5 text-white/50 hover:text-rose-400 hover:bg-white/10 rounded-full transition-colors"
            title="More Options"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleContextMenu(e);
            }}
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div
        className={`relative flex flex-col ${isOwn ? "items-end" : "items-start"} w-[92%] sm:max-w-[85%] md:max-w-[80%]`}
      >
        <div className={`flex items-start gap-2 w-full ${isOwn ? "justify-end" : "justify-start"}`}>
          <motion.div
            layout
            className={`relative px-5 py-3.5 shadow-2xl backdrop-blur-xl transition-all duration-300 w-fit max-w-full ${
              displayMode === "culture"
                ? `rounded-[2rem] ${isOwn ? "rounded-tr-none bg-gradient-to-br from-indigo-500/90 via-purple-600/90 to-indigo-700/90 border-t border-l border-white/20" : "rounded-tl-none bg-white/5 border-t border-r border-white/10"}`
                : `rounded-3xl ${isOwn ? "rounded-tr-none bg-gradient-to-br from-indigo-600 to-purple-700 border border-white/10" : "rounded-tl-none bg-[#1e293b]/60 border border-white/5"}`
            } ${autoTranslate && hasTranslation ? "ring-1 ring-white/10" : ""}`}
            style={{
              boxShadow:
                displayMode === "culture"
                  ? isOwn
                    ? `0 20px 40px -15px rgba(79, 70, 229, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)`
                    : `0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)`
                  : "none",
              color: "white",
            }}
            onContextMenu={handleContextMenu}
          >
            {message.messageType === "image" ? (
              /* Image Message Rendering */
              <div className="flex flex-col gap-2">
                <img
                  src={getAbsoluteUrl(message.mediaUrl)}
                  alt={message.mediaFileName || "Shared image"}
                  className="rounded-xl max-h-64 object-contain cursor-pointer border border-white/10"
                  onClick={() =>
                    window.open(getAbsoluteUrl(message.mediaUrl), "_blank")
                  }
                  title="Click to view full image"
                />
                {primaryText && primaryText !== "[image]" && (
                  <p className="text-[15px] font-semibold leading-relaxed text-white px-1">
                    {primaryText}
                  </p>
                )}
              </div>
            ) : message.messageType === "document" ? (
              /* Document Card */
              <div
                className="flex items-center gap-4 bg-black/20 rounded-2xl p-3 border border-white/5 backdrop-blur-xl cursor-pointer hover:bg-black/30 transition-colors"
                onClick={() =>
                  window.open(getAbsoluteUrl(message.mediaUrl), "_blank")
                }
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {message.mediaFileName || "Document"}
                  </p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">
                    {message.mediaSize
                      ? `${(message.mediaSize / 1024 / 1024).toFixed(1)} MB`
                      : "FILE"}
                  </p>
                </div>
                <button
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition hover:scale-105"
                  onClick={handleDocumentDownload}
                  title="Download File"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ) : message.messageType === "voice" ? (
              /* Voice Message Player */
              <div className="flex flex-col gap-2 min-w-[200px]">
                <div className="flex items-center gap-3 bg-black/20 rounded-2xl p-2 border border-white/5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-converso-purple text-white shadow-lg">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  </div>
                  <audio
                    src={getAbsoluteUrl(message.mediaUrl)}
                    controls
                    className="flex-1 min-w-[180px] outline-none"
                  />
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest px-2">
                  Voice Message
                </p>
              </div>
            ) : message.messageType === "video" ? (
              /* Video Message Player */
              <div className="flex flex-col gap-2">
                <video
                  src={getAbsoluteUrl(message.mediaUrl)}
                  controls
                  className="rounded-xl max-h-64 w-full border border-white/10"
                />
                {primaryText && primaryText !== "[video]" && (
                  <p className="text-[14px] font-medium leading-relaxed text-white px-1">
                    {primaryText}
                  </p>
                )}
              </div>
            ) : (
              /* Text Bubble with Dual-View Hierarchy */
              <div className="flex flex-col gap-1.5">
                <div className="text-[15px] font-semibold leading-relaxed text-white">
                  {primaryText}
                </div>
                {autoTranslate && hasTranslation && (
                  <div className="text-[0.8rem] italic text-white/50 border-t border-white/10 pt-1.5 mt-0.5">
                    {secondaryText}
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  {autoTranslate && hasTranslation && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  )}
                </div>
              </div>
            )}

            <div className="mt-2 flex items-center justify-end gap-2">
              <span
                className={`text-[10px] font-bold ${isOwn ? "text-white/50" : "text-white/30"}`}
              >
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {isOwn && (
                <span className="text-[10px] text-emerald-400">
                  {message.status === "read"
                    ? "✓✓"
                    : message.status === "delivered"
                      ? "✓"
                      : "•"}
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Reactions Display */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`mt-1 flex flex-wrap gap-1 ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <div className="flex -space-x-1">
              {Array.from(new Set(message.reactions.map((r) => r.emoji))).map(
                (emoji, idx) => (
                  <div
                    key={idx}
                    className="flex h-5 items-center justify-center rounded-full bg-[#1e293b] px-1.5 py-0.5 text-[10px] shadow-lg ring-1 ring-white/10"
                  >
                    {emoji}
                  </div>
                ),
              )}
              {message.reactions.length > 1 && (
                <div className="flex h-5 items-center justify-center rounded-full bg-[#1e293b] px-1.5 text-[8px] font-bold text-white/50 ring-1 ring-white/10">
                  {message.reactions.length}
                </div>
              )}
            </div>
          </div>
        )}

        {contextMenu && (
          <MessageContextMenu
            message={message}
            isOwn={isOwn}
            position={contextMenu}
            onClose={closeContextMenu}
            token={token}
          />
        )}
      </div>
    </motion.div>
  );
}

ImmersiveChatBubble.propTypes = {
  message: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    originalText: PropTypes.string,
    translatedText: PropTypes.string,
    senderTranslatedText: PropTypes.string,
    receiverTranslatedText: PropTypes.string,
    displayText: PropTypes.string,
    senderLanguage: PropTypes.string,
    translationAccuracy: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  isOwn: PropTypes.bool,
  mode: PropTypes.oneOf(["classic", "culture", "modern"]),
  theme: PropTypes.object,
};
