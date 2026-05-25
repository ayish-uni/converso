import { Avatar } from "./Avatar.jsx";

function initialsFrom(username) {
  return String(username || "CV")
    .slice(0, 2)
    .toUpperCase();
}

function isLikelyOnline(lastSeenAt) {
  return Date.now() - new Date(lastSeenAt || 0).getTime() < 5 * 60 * 1000;
}

export function UserDirectory({ users, selectedChat, onSelect }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">Explore speakers</p>
        <span className="rounded-full bg-white/6 px-2.5 py-1 text-[11px] text-white/55">
          {users.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {users.map((user) => {
          const active = selectedChat?.partner?.id === (user._id || user.id);
          const online = isLikelyOnline(user.lastSeenAt);

          return (
            <button
              key={user.publicId}
              className={`relative w-full rounded-2xl border px-3.5 py-3 text-left transition duration-200 backdrop-blur-sm ${
                active
                  ? "border-white/10 bg-white/5 brightness-110"
                  : "border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.04] hover:brightness-110"
              }`}
              onClick={() => onSelect(user)}
            >
              {active ? (
                <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#8B5CF6]" />
              ) : null}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar user={user} size="md" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0e14] ${
                      online ? "bg-emerald-400" : "bg-slate-500"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">@{user.username}</div>
                  <div className="flex items-center gap-2 text-xs text-white/45">
                    <span>{user.preferredLanguage.toUpperCase()}</span>
                    <span className="h-1 w-1 rounded-full bg-white/20" />
                    <span>{online ? "Online" : "Away"}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
