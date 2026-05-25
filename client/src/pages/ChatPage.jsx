import { useDeferredValue, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import { createSocket, getSocket } from "../lib/socket";
import { AdminPanel } from "../components/AdminPanel.jsx";
import { ChatComposer } from "../components/ChatComposer.jsx";
import { ChatHeader } from "../components/ChatHeader.jsx";
import { ConversationList } from "../components/ConversationList.jsx";
import { MessageList } from "../components/MessageList.jsx";
import { UserDirectory } from "../components/UserDirectory.jsx";
import { TranslationToolbar } from "../components/TranslationToolbar.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { useTheme } from "../state/ThemeContext.jsx";
import { useTranslationPrefs } from "../lib/useTranslationPrefs.js";
import { LivingBackground } from "../components/LivingBackground.jsx";
import { StaticLinguisticControls } from "../components/StaticLinguisticControls.jsx";
import { VocabularyLedger } from "../components/VocabularyLedger.jsx";
import { Avatar } from "../components/Avatar.jsx";
import { ExploreSpeakers } from "../components/ExploreSpeakers.jsx";
import { motion } from "framer-motion";

function updateMessagesByStatus(messages, payload) {
  const ids = new Set(payload.messageIds || []);
  return messages.map((message) =>
    ids.has(message._id) ? { ...message, status: payload.status } : message,
  );
}

export function ChatPage() {
  const { token, user, logout, setUser } = useAuth();
  const { autoTranslate, toggleAutoTranslate, displayMode, setDisplayMode } =
    useTranslationPrefs();
  const { setThemeForLanguage } = useTheme();
  const navigate = useNavigate();
  const shellRef = useRef(null);
  const pulseFrameRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [typingByChat, setTypingByChat] = useState({});
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("chats");
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeView, setActiveView] = useState("chat"); // 'chat' or 'explore'
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = createSocket(token);

    const handleReceiveMessage = (message) => {
      if (message.chatId === selectedChat?._id) {
        setMessages((current) => {
          const exists = current.some((entry) => entry._id === message._id);
          return exists ? current : [...current, message];
        });
      }

      if (message.receiverId === user?.id) {
        socket.emit("message_delivered", { chatId: message.chatId });
      }

      loadSidebarData();
    };

    const handleTyping = ({ chatId, fromId }) => {
      if (!chatId) {
        return;
      }

      setTypingByChat((current) => ({
        ...current,
        [chatId]: fromId,
      }));
    };

    const handleStopTyping = ({ chatId }) => {
      if (!chatId) {
        return;
      }

      setTypingByChat((current) => ({
        ...current,
        [chatId]: null,
      }));
    };

    const handleMessageDelivered = (payload) => {
      if (payload.chatId === selectedChat?._id) {
        setMessages((current) => updateMessagesByStatus(current, payload));
      }
      loadSidebarData();
    };

    const handleMessageRead = (payload) => {
      if (payload.chatId === selectedChat?._id) {
        setMessages((current) => updateMessagesByStatus(current, payload));
      }
      loadSidebarData();
    };

    const handleChatDeleted = ({ chatId }) => {
      setChats((current) => current.filter((c) => c._id !== chatId));
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    };

    const handleMessageDeleted = (payload) => {
      if (payload.deleteType === "everyone") {
        setMessages((current) =>
          current.map((m) =>
            (m._id || m.id) === payload.messageId
              ? {
                  ...m,
                  isDeleted: true,
                  displayText: "This message was deleted",
                  originalText: "This message was deleted",
                  translatedText: "This message was deleted",
                  messageType: "text",
                  mediaUrl: null,
                }
              : m,
          ),
        );
      } else {
        // Delete for me
        if (payload.deletedBy === user?.id) {
          setMessages((current) =>
            current.filter((m) => (m._id || m.id) !== payload.messageId),
          );
        }
      }
      loadSidebarData();
    };

    const handleMessageUpdated = (updatedMessage) => {
      if (updatedMessage.chatId === selectedChat?._id) {
        setMessages((current) =>
          current.map((m) =>
            m._id === updatedMessage._id ? updatedMessage : m,
          ),
        );
      }
    };

    const handleChatCleared = ({ chatId, clearedBy }) => {
      if (clearedBy === user?.id) {
        if (selectedChat?._id === chatId) {
          setMessages([]);
        }
        loadSidebarData();
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("message_delivered", handleMessageDelivered);
    socket.on("message_read", handleMessageRead);
    socket.on("chat_deleted", handleChatDeleted);
    socket.on("message_updated", handleMessageUpdated);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("chat_cleared", handleChatCleared);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("message_delivered", handleMessageDelivered);
      socket.off("message_read", handleMessageRead);
      socket.off("chat_deleted", handleChatDeleted);
      socket.off("message_updated", handleMessageUpdated);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("chat_cleared", handleChatCleared);
    };
  }, [selectedChat?._id, token, user?.id]);

  useEffect(() => {
    if (token) {
      loadSidebarData();
    }
  }, [token]);

  const handleDeleteMessage = (messageId) => {
    setMessages((current) => current.filter((m) => m._id !== messageId));
  };

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const handleForward = (message) => {
    navigator.clipboard.writeText(message.originalText).then(() => {
      alert("Message copied! Ready to forward.");
    });
  };

  useEffect(() => {
    if (selectedChat?.partner?.preferredLanguage) {
      setThemeForLanguage(selectedChat.partner.preferredLanguage);
    }
  }, [selectedChat?.partner?.preferredLanguage, setThemeForLanguage]);

  useEffect(() => {
    if (!selectedChat?._id) {
      setMessages([]);
      setNextCursor(null);
      return;
    }

    loadMessages(selectedChat._id);
    setSidebarOpen(false);
  }, [selectedChat?._id]);

  useEffect(() => {
    return () => {
      if (pulseFrameRef.current) {
        cancelAnimationFrame(pulseFrameRef.current);
      }
    };
  }, []);

  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredChats = chats.filter(({ partner, lastMessage }) => {
    const haystack =
      `${partner.username} ${partner.publicId} ${lastMessage?.translatedText || ""}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const filteredUsers = users.filter((entry) => {
    const haystack = `${entry.username} ${entry.publicId}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  function handleShellPointerMove(event) {
    if (!shellRef.current) {
      return;
    }

    const { innerWidth, innerHeight } = window;
    const x = (event.clientX / innerWidth - 0.5) * 24;
    const y = (event.clientY / innerHeight - 0.5) * 24;

    if (pulseFrameRef.current) {
      cancelAnimationFrame(pulseFrameRef.current);
    }

    pulseFrameRef.current = requestAnimationFrame(() => {
      shellRef.current?.style.setProperty("--pulse-x", `${x.toFixed(2)}px`);
      shellRef.current?.style.setProperty("--pulse-y", `${y.toFixed(2)}px`);
      shellRef.current?.style.setProperty(
        "--pulse-rotate-x",
        `${(-y / 6).toFixed(2)}deg`,
      );
      shellRef.current?.style.setProperty(
        "--pulse-rotate-y",
        `${(x / 6).toFixed(2)}deg`,
      );
    });
  }

  async function loadSidebarData() {
    try {
      const [userData, chatData] = await Promise.all([
        api.get("/users", token),
        api.get("/messages/chats", token),
      ]);

      setUsers(userData.users);
      setChats(chatData.chats);

      if (selectedChat) {
        const updatedChat = chatData.chats.find(
          (chat) => chat._id === selectedChat._id,
        );
        if (updatedChat) {
          setSelectedChat(updatedChat);
        } else {
          // Preserve the current open chat if the server response temporarily
          // does not include it. This prevents the chat window from closing
          // automatically during background refreshes.
          setSelectedChat(selectedChat);
        }
      } else if (chatData.chats[0]) {
        setSelectedChat(chatData.chats[0]);
      }
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  async function loadMessages(chatId, cursor) {
    try {
      const search = new URLSearchParams();
      search.set("limit", "30");
      if (cursor) {
        search.set("cursor", cursor);
      }

      const data = await api.get(
        `/messages/get/${chatId}?${search.toString()}`,
        token,
      );
      setNextCursor(data.nextCursor);

      if (cursor) {
        setMessages((current) => [...data.messages, ...current]);
      } else {
        setMessages(data.messages);
      }

      const socket = getSocket();
      socket?.emit("message_delivered", { chatId });
      socket?.emit("message_read", { chatId });
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  async function handleSelectUser(userEntry) {
    try {
      const data = await api.post(
        "/messages/chat",
        { receiverId: userEntry._id || userEntry.id },
        token,
      );
      setSelectedChat(data.chat);
      setActiveView("chat");
      await loadSidebarData();
    } catch (selectError) {
      setError(selectError.message);
    }
  }

  async function handleSend(text) {
    const socket = getSocket();

    if (!selectedChat?._id) {
      throw new Error("Choose a chat before sending a message.");
    }

    if (!socket) {
      const data = await api.post(
        "/chat/send",
        {
          receiverId: selectedChat.partner.id,
          text,
        },
        token,
      );
      return data.message;
    }

    return new Promise((resolve, reject) => {
      socket.emit(
        "send_message",
        {
          chatId: selectedChat._id,
          receiverId: selectedChat.partner.id,
          text,
        },
        (response) => {
          if (response?.error) {
            reject(new Error(response.error));
            return;
          }

          resolve(response.message);
        },
      );
    });
  }

  async function handleReport(messageId, reason) {
    await api.post(
      "/messages/reports",
      {
        reportedUserPublicId: selectedChat.partner.publicId,
        messageId,
        reason,
      },
      token,
    );
  }

  async function handleReportUser() {
    if (!selectedChat) {
      return;
    }

    const reason = window.prompt(
      `Report @${selectedChat.partner.username} for inappropriate behavior or spam. Please provide a short reason.`,
    );
    if (!reason || !reason.trim()) {
      return;
    }

    try {
      await handleReport(null, reason.trim());
      setError(`Report submitted for @${selectedChat.partner.username}.`);
      setTimeout(() => setError(""), 4000);
    } catch (reportError) {
      setError(reportError.message);
    }
  }

  async function handleBlock() {
    if (!selectedChat) {
      return;
    }

    const confirmed = window.confirm(
      `Block @${selectedChat.partner.username}? This will prevent them from sending you messages.`,
    );
    if (!confirmed) {
      return;
    }

    try {
      const partnerUsername = selectedChat.partner.username;
      await api.post(
        `/users/${selectedChat.partner.publicId}/block`,
        {},
        token,
      );
      const me = await api.get("/auth/me", token);
      setUser(me.user);
      setMessages([]);
      await loadSidebarData();
      setSelectedChat(null);
      setError(`@${partnerUsername} has been blocked.`);
      setTimeout(() => setError(""), 4000);
    } catch (blockError) {
      setError(blockError.message);
    }
  }

  async function handleDeleteChat() {
    if (!selectedChat) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the chat with @${selectedChat.partner.username}? This will hide the conversation from your list.`,
    );

    if (!confirmed) return;

    try {
      await api.delete(`/chat/${selectedChat._id}`, token);
      setChats((current) => current.filter((c) => c._id !== selectedChat._id));
      setSelectedChat(null);
      setMessages([]);
      setError("Chat deleted successfully.");
      setTimeout(() => setError(""), 3000);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleClearChat() {
    if (!selectedChat) return;

    const confirmed = window.confirm(
      `Are you sure you want to clear all messages in this chat? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await api.delete(`/messages/${selectedChat._id}/clear`, token);
      setMessages([]);
      setError("Chat cleared successfully.");
      setTimeout(() => setError(""), 3000);
    } catch (clearError) {
      setError(clearError.message);
    }
  }

  async function handleLoadOlder() {
    if (!nextCursor || !selectedChat) {
      return;
    }

    await loadMessages(selectedChat._id, nextCursor);
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-converso-night text-white">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-converso-cyan border-t-transparent shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>
        <div className="animate-pulse font-display text-xl font-medium tracking-widest text-converso-subtext">
          CONVERSO
        </div>
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className="converso-shell relative min-h-screen overflow-hidden text-converso-text transition-colors duration-300"
    >
      <LivingBackground
        culturalTheme={
          selectedChat?.partner?.culturalTheme ||
          user?.culturalTheme ||
          "english"
        }
        chatMode={displayMode}
      />

      <motion.div
        animate={
          autoTranslate ? { scale: [1, 1.02, 1], opacity: [0.2, 0.3, 0.2] } : {}
        }
        transition={{ duration: 2, repeat: autoTranslate ? Infinity : 0 }}
        className="life-background absolute inset-0"
        style={{ zIndex: "var(--z-atmosphere)" }}
      />
      <div
        className="converso-grid pointer-events-none absolute inset-0"
        style={{ zIndex: "var(--z-grid)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(59,130,246,0.18),transparent_18%),radial-gradient(circle_at_78%_16%,rgba(6,182,212,0.16),transparent_20%),radial-gradient(circle_at_66%_74%,rgba(59,130,246,0.14),transparent_18%)]"
        style={{ zIndex: "var(--z-atmosphere)" }}
      />

      <div
        className="relative flex flex-col lg:grid lg:grid-cols-[280px_1fr] h-screen overflow-hidden w-full"
        style={{ zIndex: "var(--z-stage)" }}
        onMouseMove={handleShellPointerMove}
      >
        <aside
          className={`flex-col border-white/10 bg-[#09090B]/60 backdrop-blur-[20px] px-5 py-6 transition-all duration-300
            ${selectedChat !== null ? "hidden lg:flex" : "flex"}
            ${activeView === "explore" ? "hidden lg:flex" : "flex"}
            lg:static lg:h-screen lg:w-[280px] lg:border-r w-full h-full pb-[88px] lg:pb-6`}
          style={{ zIndex: "var(--z-structural)" }}
        >
          <div className="pb-8">
            <div className="text-2xl font-bold tracking-tight text-white">
              Converso
            </div>
          </div>

          <div className="pb-4">
            <div className="relative">
              <input
                className="w-full rounded-2xl bg-white/5 px-4 py-3 pl-10 text-sm text-white outline-none placeholder:text-[#71717A] focus:bg-white/[0.07]"
                placeholder="Search chats or people"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <nav className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="flex min-h-full flex-col">
                <div className="space-y-2 py-2">
                  <button
                    onClick={() => {
                      setActiveView("chat");
                      setMobileTab("chats");
                    }}
                    className={`relative flex w-full items-center justify-between rounded-2xl px-3 py-3 transition ${
                      activeView === "chat"
                        ? "bg-white/5 text-white"
                        : "text-[#71717A] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {activeView === "chat" && (
                      <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#3B82F6]" />
                    )}
                    <div className="flex items-center gap-3">
                      <MessageSquare className={`h-4 w-4 ${activeView === "chat" ? "text-[#3B82F6]" : ""}`} />
                      <span className="text-sm font-medium">Chats</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${activeView === "chat" ? "bg-white/10 text-white/70" : "bg-white/8 text-white/55"}`}>
                      {filteredChats.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView("explore");
                      setMobileTab("explore");
                      setSelectedChat(null);
                    }}
                    className={`relative flex w-full items-center justify-between rounded-2xl px-3 py-3 transition ${
                      activeView === "explore"
                        ? "bg-white/5 text-white"
                        : "text-[#71717A] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {activeView === "explore" && (
                      <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#3B82F6]" />
                    )}
                    <div className="flex items-center gap-3">
                      <Compass className={`h-4 w-4 ${activeView === "explore" ? "text-[#3B82F6]" : ""}`} />
                      <span className="text-sm font-medium">Explore</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${activeView === "explore" ? "bg-white/10 text-white/70" : "bg-white/8 text-white/55"}`}>
                      {filteredUsers.length}
                    </span>
                  </button>
                </div>

                <div className="space-y-6 py-4">
                  <ConversationList
                    chats={filteredChats}
                    selectedChat={selectedChat}
                    onSelect={(chat) => {
                      setSelectedChat(chat);
                      setActiveView("chat");
                    }}
                  />
                  <UserDirectory
                    users={filteredUsers}
                    selectedChat={selectedChat}
                    onSelect={handleSelectUser}
                  />
                  {user.isAdmin && <AdminPanel token={token} />}
                </div>

                <div className="mt-auto border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between gap-3 px-1 py-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        user={user}
                        size="md"
                        className="!rounded-xl shadow-lg"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          @{user.username}
                        </p>
                        <p className="truncate text-[10px] uppercase tracking-wider text-[#71717A]">
                          {user.preferredLanguage.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        to="/settings"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-[#71717A] transition hover:bg-white/10 hover:text-white"
                        title="Settings"
                      >
                        <Settings className="h-4 w-4" />
                      </Link>
                      <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-500/60 transition hover:bg-rose-500/10 hover:text-rose-400"
                        onClick={logout}
                        title="Logout"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        <main
          className={`relative min-w-0 flex-1 flex-col overflow-hidden w-full h-full
            ${selectedChat === null && activeView === "chat" ? "hidden lg:flex" : "flex"}
            ${selectedChat !== null ? "fixed lg:static inset-0 z-50 bg-[#05070d] lg:bg-transparent" : "pb-[88px] lg:pb-0"}`}
          style={{ zIndex: "var(--z-stage)" }}
        >
          {error ? (
            <div className="border-b border-white/10 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 sm:px-6">
              {error}
            </div>
          ) : null}
          {activeView === "explore" ? (
            <ExploreSpeakers
              users={filteredUsers}
              onSelect={handleSelectUser}
              currentUser={user}
            />
          ) : selectedChat ? (
            <>
              <ChatHeader
                selectedChat={selectedChat}
                isTyping={Boolean(typingByChat[selectedChat._id])}
                onToggleSidebar={() => setSidebarOpen((current) => !current)}
                onToggleRightSidebar={() =>
                  setShowRightSidebar(!showRightSidebar)
                }
                onBlock={handleBlock}
                onReport={handleReportUser}
                chatMode={displayMode}
                setChatMode={setDisplayMode}
                autoTranslate={autoTranslate}
                setAutoTranslate={toggleAutoTranslate}
                onClear={() => handleClearChat(selectedChat?._id)}
                onDelete={() => handleDeleteChat(selectedChat?._id)}
                onBack={() => setSelectedChat(null)}
              />
              <div className="flex min-h-0 flex-1">
                <MessageList
                  currentUser={user}
                  messages={messages}
                  onReport={handleReport}
                  onLoadOlder={handleLoadOlder}
                  hasMore={Boolean(nextCursor)}
                  chatMode={displayMode}
                  autoTranslate={autoTranslate}
                  currentLanguage={user.preferredLanguage}
                  partnerLanguage={selectedChat.partner.preferredLanguage}
                  token={token}
                  onReply={handleReply}
                  onForward={handleForward}
                  onDeleteMessage={handleDeleteMessage}
                />

                <div className="hidden lg:flex w-80 flex-shrink-0 border-l border-white/10 bg-[#09090B]/70 p-4">
                  <VocabularyLedger
                    messages={messages}
                    userLanguage={user?.preferredLanguage}
                  />
                </div>

                {/* Right Sidebar Overlay: Linguistic Controls */}
                <div
                  className={`fixed inset-y-0 right-0 z-[60] w-80 transform transition-transform duration-500 ease-in-out border-l border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl ${showRightSidebar ? "translate-x-0" : "translate-x-full"}`}
                >
                  <div className="flex h-full flex-col p-6 gap-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                          Intelligence
                        </h2>
                      </div>
                      <button
                        onClick={() => setShowRightSidebar(false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <StaticLinguisticControls
                      partner={selectedChat?.participants?.find(
                        (p) => p._id !== user?.id,
                      )}
                      autoTranslate={autoTranslate}
                      setAutoTranslate={toggleAutoTranslate}
                      displayMode={displayMode}
                      setDisplayMode={setDisplayMode}
                      onClear={() => handleClearChat(selectedChat?._id)}
                      onDelete={() => handleDeleteChat(selectedChat?._id)}
                      onBlock={handleBlock}
                      onReport={handleReportUser}
                    />
                  </div>
                </div>

                {/* Click outside to close right sidebar */}
                {showRightSidebar && (
                  <div
                    className="fixed inset-0 z-[55] bg-black/5 lg:bg-transparent"
                    onClick={() => setShowRightSidebar(false)}
                  />
                )}
              </div>

              <ChatComposer
                selectedChat={selectedChat}
                onSend={handleSend}
                error={error}
                token={token}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                onMediaSent={(message) => {
                  setMessages((current) => {
                    const exists = current.some(
                      (entry) => entry._id === message._id,
                    );
                    return exists ? current : [...current, message];
                  });
                  loadSidebarData();
                }}
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 relative">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="global-pulse" />
              </div>
              <div className="start-card relative w-full max-w-xl p-10 text-center sm:p-12">
                <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[28px] bg-converso-gradient text-3xl font-bold text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                  C
                  <div className="absolute -inset-2 animate-pulse rounded-[32px] border border-white/20"></div>
                </div>
                <h2 className="mb-4 font-display text-4xl font-bold text-white tracking-tight">
                  Start a conversation
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-white/50 max-w-md mx-auto">
                  Choose a chat from the left to open a real-time multilingual
                  conversation powered by Converso's Neural Relay.
                </p>
                <div className="mb-8 flex justify-center space-x-3">
                  {[0, 0.1, 0.2].map((delay) => (
                    <div
                      key={delay}
                      className="h-2.5 w-2.5 animate-bounce rounded-full bg-violet-500"
                      style={{
                        animationDelay: `${delay}s`,
                        boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION TAB BAR */}
      {selectedChat === null && (
        <nav className="fixed inset-x-0 bottom-0 z-50 lg:hidden bg-[#04060d]/90 border-t border-white/10 backdrop-blur-xl px-4 py-3 pb-safe">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-1 rounded-2xl border border-white/10 bg-[#09101d]/85 px-3 py-2 shadow-2xl">
            <button
              className={`inline-flex flex-1 flex-col items-center justify-center rounded-xl py-1.5 text-[10px] font-bold tracking-wider uppercase transition ${
                mobileTab === "chats"
                  ? "bg-white/10 text-white"
                  : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => {
                setMobileTab("chats");
                setActiveView("chat");
                setSelectedChat(null);
              }}
            >
              <MessageSquare className="h-5 w-5 mb-0.5" />
              <span>Chats</span>
            </button>

            <button
              className={`inline-flex flex-1 flex-col items-center justify-center rounded-xl py-1.5 text-[10px] font-bold tracking-wider uppercase transition ${
                mobileTab === "explore"
                  ? "bg-white/10 text-white"
                  : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => {
                setMobileTab("explore");
                setActiveView("explore");
                setSelectedChat(null);
              }}
            >
              <Compass className="h-5 w-5 mb-0.5" />
              <span>Explore</span>
            </button>

            <button
              className={`inline-flex flex-1 flex-col items-center justify-center rounded-xl py-1.5 text-[10px] font-bold tracking-wider uppercase transition ${
                mobileTab === "settings"
                  ? "bg-white/10 text-white"
                  : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => {
                setMobileTab("settings");
                navigate("/settings");
              }}
            >
              <Settings className="h-5 w-5 mb-0.5" />
              <span>Settings</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
