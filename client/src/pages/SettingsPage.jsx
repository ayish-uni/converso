import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Globe, QrCode, Shield, Sparkles, UserRound, Lock } from "lucide-react";
import { useAuth } from "../state/AuthContext.jsx";
import { useTheme } from "../state/ThemeContext.jsx";
import { api } from "../lib/api.js";
import { ThemeToggle } from "../components/ThemeToggle.jsx";
import { CulturalThemeSelector } from "../components/CulturalThemeSelector.jsx";
import { ShareProfile } from "../components/ShareProfile.jsx";
import { Avatar } from "../components/Avatar.jsx";
import { SOCKET_URL } from "../config";

function SettingsToggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/10 p-4">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-sm text-converso-subtext">{hint}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? "bg-converso-cyan" : "bg-white/10"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const { token, user, logout, setUser } = useAuth();
  const { theme, currentThemeData } = useTheme();
  const [showShareProfile, setShowShareProfile] = useState(false);
  const [preferences, setPreferences] = useState(() => ({
    notifications: localStorage.getItem("chat_notifications") !== "false",
    readReceipts: localStorage.getItem("chat_read_receipts") !== "false",
    incognitoMode: localStorage.getItem("chat_incognito_mode") === "true",
    profileDiscoverable:
      localStorage.getItem("chat_profile_discoverable") !== "false",
  }));
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [activeTab, setActiveTab] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768 ? "profile" : null);

  useEffect(() => {
    localStorage.setItem(
      "chat_notifications",
      String(preferences.notifications),
    );
    localStorage.setItem(
      "chat_read_receipts",
      String(preferences.readReceipts),
    );
    localStorage.setItem(
      "chat_incognito_mode",
      String(preferences.incognitoMode),
    );
    localStorage.setItem(
      "chat_profile_discoverable",
      String(preferences.profileDiscoverable),
    );
  }, [preferences]);

  function togglePreference(key) {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  async function handleUnblock(publicId) {
    if (!publicId) return;

    await api.delete(`/users/${publicId}/block`, token);
    setUser((current) => ({
      ...current,
      blockedUsers: (current.blockedUsers || []).filter(
        (blocked) => blocked.publicId !== publicId,
      ),
    }));
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Delete your Converso account? This action cannot be undone.",
    );

    if (!confirmed) return;

    await api.delete("/users/me", token);
    logout();
  }

  async function handleChangePassword() {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    setChangingPassword(true);
    try {
      await api.patch(
        "/users/password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        token,
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Password changed successfully!");
    } catch (error) {
      alert(error.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleResendVerification() {
    setResendingVerification(true);
    try {
      await api.post("/auth/resend-verification", {}, token);
      alert("Verification email sent successfully!");
    } catch (error) {
      alert(error.message || "Failed to resend verification email.");
    } finally {
      setResendingVerification(false);
    }
  }

  const profileUrl = `${window.location.origin}/profile/${user.publicId}`;

  return (
    <>
      <div className="min-h-screen w-screen flex items-center justify-center bg-[#05070d] p-4 sm:p-6 text-white relative overflow-hidden settings-container-wrap">
        {/* Glowing glass background accents */}
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[130px] pointer-events-none" />

        <div className="glass-card w-full max-w-4xl h-[640px] flex flex-col p-6 md:p-8 relative z-10 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
          {/* Header Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-5 shrink-0">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Settings</span>
                <span className="h-1.5 w-1.5 rounded-full bg-converso-cyan animate-pulse" />
              </h1>
              <p className="mt-1 text-xs text-converso-subtext">
                Customize Converso account sharing, privacy, and visual skins.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:border-white/20 hover:bg-white/10"
                to="/"
              >
                Back to chat
              </Link>
              <button
                className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-xs font-bold text-rose-200 transition hover:bg-rose-400/15"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="flex-1 grid gap-8 md:grid-cols-[250px_1fr] min-h-0 mt-6 overflow-hidden">
            {/* Left Sidebar Pane */}
            <div className={`space-y-5 flex flex-col min-h-0 ${activeTab !== null ? "hidden md:flex" : "flex"}`}>
              {/* User badge */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 shadow-md shrink-0">
                <Avatar user={user} size="lg" className="!rounded-2xl shadow-glow" />
                <div className="min-w-0">
                  <p className="text-xs font-black text-white truncate">@{user.username}</p>
                  <p className="text-[9px] text-converso-cyan font-black uppercase tracking-widest mt-0.5">{user.preferredLanguage.toUpperCase()}</p>
                </div>
              </div>

              {/* Tab Selector List */}
              <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs font-bold transition border ${
                    activeTab === "profile"
                      ? "bg-converso-gradient text-white border-transparent shadow-glow"
                      : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  <UserRound className="h-4.5 w-4.5 shrink-0" />
                  <span>Profile Info</span>
                </button>

                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs font-bold transition border ${
                    activeTab === "security"
                      ? "bg-converso-gradient text-white border-transparent shadow-glow"
                      : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  <Lock className="h-4.5 w-4.5 shrink-0" />
                  <span>Security & Account</span>
                </button>

                <button
                  onClick={() => setActiveTab("theme")}
                  className={`flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs font-bold transition border ${
                    activeTab === "theme"
                      ? "bg-converso-gradient text-white border-transparent shadow-glow"
                      : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  <Sparkles className="h-4.5 w-4.5 shrink-0" />
                  <span>Theme & Visuals</span>
                </button>

                <button
                  onClick={() => setActiveTab("privacy")}
                  className={`flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs font-bold transition border ${
                    activeTab === "privacy"
                      ? "bg-converso-gradient text-white border-transparent shadow-glow"
                      : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  <Shield className="h-4.5 w-4.5 shrink-0" />
                  <span>Privacy & Safety</span>
                </button>

                <button
                  onClick={() => setActiveTab("share")}
                  className={`flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs font-bold transition border ${
                    activeTab === "share"
                      ? "bg-converso-gradient text-white border-transparent shadow-glow"
                      : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  <QrCode className="h-4.5 w-4.5 shrink-0" />
                  <span>Share QR Profile</span>
                </button>
              </div>
            </div>

            {/* Right Active Pane Content Area */}
            <div className={`min-h-0 flex flex-col ${activeTab === null ? "hidden md:flex" : "flex"}`}>
              {/* Mobile Back Header */}
              {activeTab !== null && (
                <button
                  onClick={() => setActiveTab(null)}
                  className="flex md:hidden items-center gap-2 text-xs font-black text-converso-cyan mb-4 px-1"
                >
                  <span>← Back to Categories</span>
                </button>
              )}

              {/* Scrollable container for forms */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 h-full">
                <div className="space-y-6">
                  {activeTab === "profile" && (
                    <section className="space-y-6 rounded-[28px] border border-white/10 bg-white/5 p-6 animate-fade-in">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <UserRound className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            Profile Picture
                          </h2>
                          <p className="mt-2 text-sm text-converso-subtext">
                            Update your avatar to help friends recognize you.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-6 sm:flex-row">
                        <div className="relative">
                          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl bg-converso-gradient text-4xl font-bold text-white shadow-glow">
                            {user.avatarUrl ? (
                              <img 
                                src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${SOCKET_URL}${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`} 
                                alt={user.username} 
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '';
                                  e.target.parentElement.innerHTML = user.username.slice(0, 2).toUpperCase();
                                }}
                              />
                            ) : (
                              user.username.slice(0, 2).toUpperCase()
                            )}
                          </div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap gap-3">
                            <label className="cursor-pointer rounded-2xl bg-converso-cyan px-6 py-3 text-xs font-bold text-white transition hover:bg-converso-cyan/80">
                              Upload Photo
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  const formData = new FormData();
                                  formData.append("file", file);

                                  try {
                                    const data = await api.patch("/users/avatar", formData, token);
                                    setUser((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
                                    alert("Avatar updated!");
                                  } catch (error) {
                                    alert(error.message || "Failed to upload avatar.");
                                  }
                                }}
                              />
                            </label>
                            {user.avatarUrl && (
                              <button
                                onClick={async () => {
                                  // Remove avatar logic if needed
                                }}
                                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-medium text-white transition hover:bg-white/10"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-converso-subtext">
                            JPG, PNG or WebP. Max size 2MB.
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-converso-subtext">
                              Username
                            </p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              @{user.username}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-converso-subtext">
                              Public ID
                            </p>
                            <p className="mt-1 break-all text-sm font-semibold text-white font-mono">
                              {user.publicId}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/10 p-4 sm:col-span-2">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-converso-subtext">
                              Email Address
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-white">
                              {user.email}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-converso-subtext">
                              Preferred Language
                            </p>
                            <p className="mt-1 text-sm font-semibold text-white font-mono">
                              {user.preferredLanguage.toUpperCase()}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-converso-subtext">
                              Member Since
                            </p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {activeTab === "security" && (
                    <section className="space-y-6 rounded-[28px] border border-white/10 bg-white/5 p-6 animate-fade-in">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <Lock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            Security & Account
                          </h2>
                          <p className="mt-2 text-sm text-converso-subtext">
                            Manage password modifications and status verification controls.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-converso-subtext">
                          Account Status
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm font-semibold text-white">
                            {user.isVerified ? (
                              <span className="text-green-400 font-bold">Verified</span>
                            ) : (
                              <span className="text-yellow-400 font-bold">Unverified</span>
                            )}
                          </p>
                          {!user.isVerified && (
                            <button
                              onClick={handleResendVerification}
                              disabled={resendingVerification}
                              className="rounded-lg bg-converso-cyan px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-converso-cyan/80 disabled:opacity-50"
                            >
                              {resendingVerification ? "Sending..." : "Resend Link"}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <p className="text-xs font-semibold text-white mb-3">
                          Change Password
                        </p>
                        <div className="space-y-3">
                          <input
                            type="password"
                            placeholder="Current password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-converso-cyan"
                          />
                          <input
                            type="password"
                            placeholder="New password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-converso-cyan"
                          />
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-converso-cyan"
                          />
                          <button
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                            className="w-full rounded-lg bg-converso-cyan px-4 py-2 text-xs font-bold text-white transition hover:bg-converso-cyan/80 disabled:opacity-50"
                          >
                            {changingPassword ? "Changing..." : "Change Password"}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-bold text-white">
                              Delete account
                            </p>
                            <p className="mt-1 text-[11px] text-rose-100/80 leading-relaxed">
                              Permanently remove your profile, chats, and settings.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="rounded-2xl bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-glow transition hover:bg-rose-400"
                          >
                            Delete account
                          </button>
                        </div>
                      </div>
                    </section>
                  )}

                  {activeTab === "share" && (
                    <section className="space-y-6 rounded-[28px] border border-white/10 bg-white/5 p-6 animate-fade-in">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <QrCode className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            Share Profile
                          </h2>
                          <p className="mt-2 text-sm text-converso-subtext">
                            Let friends scan your QR code or open your public profile directly, like HelloTalk.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-white/10 bg-black/10 p-5">
                        <div className="flex items-center gap-4">
                          <Avatar user={user} size="xl" className="!rounded-3xl shadow-glow" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">
                              @{user.username}
                            </p>
                            <p className="mt-1 truncate text-xs text-converso-subtext">
                              {profileUrl}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => setShowShareProfile(true)}
                            className="rounded-2xl bg-converso-gradient px-4 py-3 text-xs font-bold text-white shadow-glow transition hover:brightness-110"
                          >
                            Open QR Card
                          </button>
                          <Link
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs font-bold text-white transition hover:border-white/20 hover:bg-white/10"
                            to={`/profile/${user.publicId}`}
                          >
                            View Public Profile
                          </Link>
                        </div>
                      </div>
                    </section>
                  )}

                  {activeTab === "theme" && (
                    <section className="space-y-6 rounded-[28px] border border-white/10 bg-white/5 p-6 animate-fade-in">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            Theme & Experience
                          </h2>
                          <p className="mt-2 text-sm text-converso-subtext">
                            Tune visuals and daily behavior across the platform.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                Color mode
                              </p>
                              <p className="text-xs text-converso-subtext">
                                Current: {theme}
                              </p>
                            </div>
                            <ThemeToggle />
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                          <p className="text-sm font-semibold text-white">
                            Cultural theme
                          </p>
                          <p className="mt-1 text-xs text-converso-subtext">
                            Current: {currentThemeData.name}
                          </p>
                          <div className="mt-4">
                            <CulturalThemeSelector />
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                          <p className="text-sm font-semibold text-white">
                            Theme preview
                          </p>
                          <div 
                            className="mt-3 rounded-3xl border border-white/10 p-4 relative overflow-hidden"
                            style={{
                              backgroundColor: currentThemeData.colors.bg,
                            }}
                          >
                            {/* Theme Landmark Background Sketch Preview */}
                            {currentThemeData.name && (
                              <div 
                                className="absolute inset-0 opacity-[0.20] pointer-events-none bg-cover bg-center transition-all duration-500"
                                style={{
                                  backgroundImage: `url(${
                                    ["English", "Japanese", "Turkish"].includes(currentThemeData.name)
                                      ? `/themes/${currentThemeData.name.toLowerCase()}.png`
                                      : `/themes/turkish.png`
                                  })`
                                }}
                              />
                            )}
                            <div
                              className="h-24 rounded-3xl p-4 relative z-10"
                              style={{
                                backgroundColor: currentThemeData.colors.surface,
                              }}
                            >
                              <div className="mb-3 flex items-center gap-2">
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{
                                    backgroundColor: currentThemeData.colors.primary,
                                  }}
                                />
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{
                                    backgroundColor: currentThemeData.colors.accent,
                                  }}
                                />
                              </div>
                              <p className="text-xs text-white">
                                {currentThemeData.name} profile skin
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {activeTab === "privacy" && (
                    <section className="space-y-6 rounded-[28px] border border-white/10 bg-white/5 p-6 animate-fade-in">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            Privacy & Notifications
                          </h2>
                          <p className="mt-2 text-sm text-converso-subtext">
                            Control how visible and responsive your profile feels.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <SettingsToggle
                          label="Push notifications"
                          hint="Receive alerts when new messages or invites arrive."
                          checked={preferences.notifications}
                          onChange={() => togglePreference("notifications")}
                        />
                        <SettingsToggle
                          label="Read receipts"
                          hint="Let chat partners know when you have seen their messages."
                          checked={preferences.readReceipts}
                          onChange={() => togglePreference("readReceipts")}
                        />
                        <SettingsToggle
                          label="Incognito traveler mode"
                          hint="Hide your activity while joining quick cultural exchanges."
                          checked={preferences.incognitoMode}
                          onChange={() => togglePreference("incognitoMode")}
                        />
                        <SettingsToggle
                          label="Discoverable public profile"
                          hint="Allow your public profile and QR card to be shared easily."
                          checked={preferences.profileDiscoverable}
                          onChange={() => togglePreference("profileDiscoverable")}
                        />
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-start gap-3">
                          <Bell className="mt-0.5 h-5 w-5 text-converso-cyan shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Platform status
                            </p>
                            <p className="mt-1 text-xs text-converso-subtext">
                              These controls are stored locally for now and shape the way your app behaves on this device.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-start gap-3">
                          <Globe className="mt-0.5 h-5 w-5 text-converso-gold shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Global profile sharing
                            </p>
                            <p className="mt-1 text-xs text-converso-subtext">
                              Your QR code opens the same public profile route across web and mobile for quick adds with friends.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Blocked people
                            </p>
                            <p className="mt-1 text-xs text-converso-subtext">
                              Review and unblock users you've blocked.
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {(user.blockedUsers || []).length > 0 ? (
                            user.blockedUsers.map((blocked) => (
                              <div
                                key={blocked.publicId}
                                className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#0B1220] p-4"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    @{blocked.username}
                                  </p>
                                  <p className="text-xs text-converso-subtext font-mono">
                                    {blocked.publicId}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUnblock(blocked.publicId)}
                                  className="rounded-2xl border border-converso-cyan/30 bg-converso-cyan/10 px-3 py-2 text-xs font-bold text-converso-cyan transition hover:bg-converso-cyan/20"
                                >
                                  Unblock
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-converso-subtext">
                              You haven't blocked anyone yet.
                            </p>
                          )}
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showShareProfile ? (
        <ShareProfile user={user} onClose={() => setShowShareProfile(false)} />
      ) : null}
    </>
  );
}
