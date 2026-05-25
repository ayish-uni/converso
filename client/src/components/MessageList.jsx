import { useMemo, useRef, useEffect } from "react";
import { ImmersiveChatBubble } from "./ImmersiveChatBubble.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { getTheme } from "../themes/conversoThemes.js";
import { CultureAtmosphere } from "./CultureAtmosphere.jsx";

export function MessageList({
  currentUser,
  messages,
  onReport,
  onLoadOlder,
  hasMore,
  chatMode,
  autoTranslate = true,
  currentLanguage,
  partnerLanguage,
  token,
  onReply,
  onForward,
  onDeleteMessage,
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { user } = useAuth();

  const renderedMessages = useMemo(() => [...messages].reverse(), [messages]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Layer 0: Geometric Grid & Cultural Atmosphere Layer (Statical / Non-scrollable) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" style={{ zIndex: 'var(--z-atmosphere)' }}>
        {/* Grid Layer */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Atmosphere Component */}
        <CultureAtmosphere 
          theme={getTheme(partnerLanguage?.toLowerCase())} 
          active={chatMode === 'culture'} 
        />

        {/* Fallback Blurs (if culture mode is off) */}
        {chatMode !== 'culture' && (
          <>
            <div className="absolute left-10 top-8 h-40 w-40 rounded-full bg-converso-purple/20 blur-[100px]" />
            <div className="absolute bottom-6 right-10 h-44 w-44 rounded-full bg-converso-cyan/20 blur-[100px]" />
          </>
        )}
      </div>

      <section
        className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 scrollbar-hide z-10"
        ref={messagesContainerRef}
      >
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col-reverse gap-2 min-h-full">
          <div ref={messagesEndRef} className="h-4" />

          {renderedMessages.map((message) => {
            const isOwn = message.senderId === currentUser.id;
            const theme = getTheme(partnerLanguage);

            return (
              <div
                key={message._id || message.id}
                className="flex gap-2 items-end group w-full"
              >
                <ImmersiveChatBubble
                  message={message}
                  isOwn={isOwn}
                  mode={chatMode || "classic"}
                  displayMode={chatMode || "classic"}
                  autoTranslate={autoTranslate}
                  currentUserId={user?.id}
                  theme={theme}
                  token={token}
                  onReply={onReply}
                  onForward={onForward}
                  onDelete={onDeleteMessage}
                />
              </div>
            );
          })}

          {hasMore && (
            <button
              className="mx-auto my-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white/50 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              onClick={onLoadOlder}
            >
              Load older memories
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
