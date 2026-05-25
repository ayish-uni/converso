import { Inbox } from "lucide-react";
import { Avatar } from "./Avatar.jsx";

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initialsFrom(username) {
  return String(username || "CV")
    .slice(0, 2)
    .toUpperCase();
}

export function ConversationList({ chats, selectedChat, onSelect }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
          Recent chats
        </p>
        {chats.length > 0 ? (
          <span className="rounded-full bg-white/6 px-2.5 py-1 text-[11px] text-white/55">
            {chats.length}
          </span>
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/8 text-white/25">
            <Inbox className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {chats.length === 0 ? (
          <div className="rounded-2xl border border-white/8 px-3.5 py-4 text-sm text-white/34">
            No chats yet. Start a new exchange from Explore.
          </div>
        ) : null}
        {chats.map((chat) => {
          const { partner, lastMessage } = chat;
          const active = selectedChat?._id === chat._id;

          return (
            <button
              key={chat._id}
              className={`group relative w-full overflow-hidden rounded-2xl border px-3.5 py-3 text-left transition duration-200 backdrop-blur-sm ${
                active
                  ? "border-white/10 bg-white/5 brightness-110"
                  : "border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.04] hover:brightness-110"
              }`}
              onClick={() => onSelect(chat)}
            >
              {active ? (
                <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#8B5CF6]" />
              ) : null}
              <div className="flex items-center gap-3">
                <Avatar user={partner} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="truncate text-sm font-semibold text-white">
                      @{partner.username}
                    </strong>
                    {lastMessage?.createdAt && (
                      <span className="shrink-0 text-[11px] text-white/38">
                        {formatTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-white/45">
                    {lastMessage?.isHidden
                      ? `Start a new exchange with @${partner.username}`
                      : lastMessage?.displayText ||
                        lastMessage?.translatedText ||
                        `Start a new exchange with @${partner.username}`}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
