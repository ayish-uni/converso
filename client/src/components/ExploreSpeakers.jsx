import React, { useState } from "react";
import { Search, Compass, Globe, Sparkles, UserCheck, Languages, Check, ArrowRight } from "lucide-react";
import { Avatar } from "./Avatar.jsx";
import { motion, AnimatePresence } from "framer-motion";

export function ExploreSpeakers({ users, onSelect, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [onlineOnly, setOnlineOnly] = useState(false);

  // Filter users based on search and filters
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.publicId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLanguage =
      selectedLanguage === "all" ||
      u.preferredLanguage?.toLowerCase() === selectedLanguage.toLowerCase();

    const matchesOnline = !onlineOnly || u.isOnline;

    return matchesSearch && matchesLanguage && matchesOnline;
  });

  // Extract all unique languages from speakers
  const languages = Array.from(
    new Set(users.map((u) => u.preferredLanguage?.toUpperCase()).filter(Boolean))
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#090b11] to-[#04060a]">
      {/* Header section with ambient pulse */}
      <div className="relative px-6 py-10 md:px-8 md:py-12 border-b border-white/5 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-violet-600/10 blur-[80px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-cyan-600/10 blur-[80px] animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-[22px] bg-converso-gradient text-white shadow-glow">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-converso-cyan font-black">Community</span>
                <span className="h-1.5 w-1.5 rounded-full bg-converso-cyan animate-pulse" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Explore Speakers</h1>
            </div>
          </div>
          <p className="text-white/50 text-sm leading-relaxed max-w-2xl">
            Meet language exchange partners around the world. Connect, chat instantly, and bridge cultural barriers using Converso's Neural Relay.
          </p>

          {/* Interactive Search & Filter Controls */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] items-center bg-white/5 p-2 rounded-[24px] border border-white/10 shadow-2xl">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search username or public ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent px-4 py-3 pl-11 text-sm text-white outline-none placeholder-white/30"
              />
              <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/30" />
            </div>

            {/* Language filter dropdown */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-2xl border border-white/5">
              <Languages className="h-4 w-4 text-white/40" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-[#090b11] text-white">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang.toLowerCase()} className="bg-[#090b11] text-white">
                    Native: {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Online only switcher */}
            <div className="flex items-center justify-between gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-xs text-white/60">Online Only</span>
              <button
                type="button"
                onClick={() => setOnlineOnly(!onlineOnly)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${onlineOnly ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-white/10'}`}
              >
                <div
                  className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${onlineOnly ? 'translate-x-5' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Speakers Grid Panel */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
              Available Partners ({filteredUsers.length})
            </h2>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredUsers.length > 0 ? (
              <motion.div
                layout
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
              >
                {filteredUsers.map((partner, idx) => {
                  const partnerNative = partner.preferredLanguage?.toUpperCase() || "EN";
                  // HelloTalk-like target language calculation: if native is TR, learns EN (or vice versa)
                  const partnerLearning = partnerNative === "TR" ? "EN" : "TR";

                  return (
                    <motion.div
                      key={partner.publicId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.3 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group relative flex flex-col justify-between bg-white/[0.03] hover:bg-white/[0.05] p-5 rounded-[28px] border border-white/5 hover:border-white/15 backdrop-blur-xl transition-all duration-300 shadow-2xl"
                    >
                      {/* Ambient background glow for online users */}
                      {partner.isOnline && (
                        <div className="absolute inset-0 rounded-[28px] bg-emerald-500/[0.01] pointer-events-none group-hover:bg-emerald-500/[0.02] transition-colors duration-300" />
                      )}

                      <div>
                        {/* Upper card row: User Identity */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar user={partner} size="lg" className="!rounded-2xl group-hover:scale-105 transition-transform shadow-lg" />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#090b11] ${
                                  partner.isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                                }`}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-white truncate">@{partner.username}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${partner.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                                  {partner.isOnline ? "Online" : "Away"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Country Globe Indicator */}
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/40 group-hover:text-white/60 transition-colors">
                            <Globe className="h-4 w-4" />
                          </div>
                        </div>

                        {/* Language Exchange Badges (HelloTalk Style) */}
                        <div className="space-y-2 mb-4 bg-black/20 p-3 rounded-2xl border border-white/5">
                          {/* Speaks Native */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/40 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Speaks
                            </span>
                            <span className="font-black text-cyan-400 font-mono bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg text-[10px]">
                              {partnerNative}
                            </span>
                          </div>
                          {/* Learns */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/40 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> Learns
                            </span>
                            <span className="font-black text-violet-400 font-mono bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-lg text-[10px]">
                              {partnerLearning}
                            </span>
                          </div>
                        </div>

                        {/* Small bio segment */}
                        <p className="text-xs text-white/50 leading-relaxed italic line-clamp-2 px-1 mb-5">
                          "Hi there! Let's practice {partnerNative} and {partnerLearning} together. Let's make friendship! 🗣️🌍"
                        </p>
                      </div>

                      {/* Card Button to open conversation */}
                      <button
                        onClick={() => onSelect(partner)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 hover:bg-converso-gradient text-white text-xs font-bold transition-all duration-300 border border-white/10 group-hover:border-transparent group-hover:shadow-[0_10px_20px_rgba(99,102,241,0.25)]"
                      >
                        <span>Start Conversation</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="p-4 rounded-full bg-white/5 border border-white/10 text-white/30 mb-4 animate-bounce">
                  <Globe className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No speakers found</h3>
                <p className="text-sm text-white/45 max-w-sm">
                  Try adjusting your search terms or filters to find other native speakers.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
