import React, { useState } from "react";
import PropTypes from "prop-types";
import { API_URL } from "../config";

export function SmartChatBubble({
  message,
  isOwn,
  mode = "classic",
  currentLanguage,
  partnerLanguage,
}) {
  const [showTooltip, setShowTooltip] = useState(null);

  const renderClassicMode = () => (
    <div className="text-sm">{message.translatedText}</div>
  );

  const renderCultureMode = () => (
    <div className="space-y-2">
      <div className="text-xs text-white/50 flex items-center gap-2">
        <span className="text-lg">🌍</span>
        <span>{message.senderLanguage.toUpperCase()}</span>
      </div>
      <div className="text-xs font-medium text-white/70 italic line-clamp-2">
        {message.originalText}
      </div>
      <div className="text-sm font-medium text-white">
        {message.translatedText}
      </div>
    </div>
  );

  const renderModernMode = () => {
    const keywords = message.originalText
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 3);

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-white">
          {message.translatedText.split(/\s+/).map((word, idx) => {
            const isKeyword = keywords.some((k) =>
              word.toLowerCase().includes(k.toLowerCase()),
            );
            return (
              <span
                key={idx}
                className={`${
                  isKeyword
                    ? "text-converso-gold cursor-help underline decoration-dotted"
                    : ""
                }`}
                onMouseEnter={() =>
                  isKeyword && setShowTooltip({ index: idx, word })
                }
                onMouseLeave={() => setShowTooltip(null)}
              >
                {word}{" "}
              </span>
            );
          })}
        </div>

        {showTooltip && (
          <div className="text-xs bg-white/10 rounded px-2 py-1 border border-converso-gold/30">
            <div className="font-semibold text-converso-gold">
              {showTooltip.word}
            </div>
            <div className="text-white/70 mt-1">{message.originalText}</div>
            <div className="text-white/50 text-xs mt-1">
              Accuracy: {message.translationAccuracy}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              message.translationAccuracy === "high"
                ? "bg-green-500"
                : message.translationAccuracy === "medium"
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
            title={`Translation accuracy: ${message.translationAccuracy}`}
          />
          <span className="text-white/50">
            {message.translationAccuracy} accuracy
          </span>
        </div>
      </div>
    );
  };

  const apiHost = API_URL.replace(/\/api$/, "");

  const getAbsoluteUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiHost}${url}`;
  };

  const renderMedia = () => {
    const { messageType, mediaUrl, mediaFileName, mediaDuration } = message;
    const absoluteUrl = getAbsoluteUrl(mediaUrl);

    switch (messageType) {
      case "image":
        return (
          <a
            href={absoluteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-xs rounded-lg overflow-hidden hover:opacity-80 transition"
          >
            <img
              src={absoluteUrl}
              alt="Shared image"
              className="max-w-xs max-h-96 object-cover"
            />
          </a>
        );

      case "voice":
        return (
          <div className="space-y-2">
            <audio
              controls
              className="w-full max-w-xs rounded-lg"
              src={absoluteUrl}
            />
            <div className="text-xs text-white/50">
              {mediaDuration
                ? `${Math.round(mediaDuration)}s`
                : "Voice message"}
            </div>
          </div>
        );

      case "document":
        const downloadUrl = `${absoluteUrl}?download=1&filename=${encodeURIComponent(mediaFileName || "document")}`;
        return (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded px-3 py-2 transition max-w-xs"
          >
            <span className="text-lg">📄</span>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate text-white">
                {mediaFileName || "Document"}
              </div>
              <div className="text-xs text-white/50">Download</div>
            </div>
          </a>
        );

      case "video":
        return (
          <a
            href={absoluteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-xs rounded-lg overflow-hidden hover:opacity-80 transition"
          >
            <video
              controls
              className="max-w-xs max-h-96 object-cover"
              src={absoluteUrl}
            />
          </a>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3 gap-3`}
    >
      <div
        className={`max-w-xs rounded-3xl px-4 py-3 ${
          isOwn
            ? "bg-converso-gradient text-white rounded-br-none"
            : "bg-white/10 text-white rounded-bl-none"
        }`}
      >
        {message.messageType === "text" ? (
          <>
            {mode === "classic" && renderClassicMode()}
            {mode === "culture" && renderCultureMode()}
            {mode === "modern" && renderModernMode()}
          </>
        ) : (
          renderMedia()
        )}

        {message.originalText && message.messageType !== "text" && (
          <div className="mt-2 text-sm text-white/80">
            {message.originalText}
          </div>
        )}

        <div
          className={`text-xs mt-2 ${
            isOwn ? "text-white/50" : "text-white/40"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

SmartChatBubble.propTypes = {
  message: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    originalText: PropTypes.string,
    translatedText: PropTypes.string,
    messageType: PropTypes.string,
    mediaUrl: PropTypes.string,
    mediaFileName: PropTypes.string,
    mediaDuration: PropTypes.number,
    senderLanguage: PropTypes.string,
    translationAccuracy: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  isOwn: PropTypes.bool,
  mode: PropTypes.oneOf(["classic", "culture", "modern"]),
  currentLanguage: PropTypes.string,
  partnerLanguage: PropTypes.string,
};

SmartChatBubble.defaultProps = {
  isOwn: false,
  mode: "classic",
};
