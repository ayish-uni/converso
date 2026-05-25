import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Languages, 
  Layers, 
  BookOpen, 
  Sparkles, 
  Mic2, 
  Search, 
  BellOff, 
  Eraser, 
  Trash2,
  X,
  User,
  ChevronRight
} from 'lucide-react';

export function AntigravitySettings({ 
  isOpen, 
  onClose, 
  user, 
  partner,
  autoTranslate, 
  setAutoTranslate, 
  displayMode, 
  setDisplayMode,
  onClear,
  onDelete
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const menuVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      y: 10,
      rotateX: -10
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 10,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  const driftAnimation = {
    y: [0, -4, 0],
    rotate: [0, 0.5, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
        <motion.div
          ref={menuRef}
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-[380px] bg-[#121214]/85 border border-white/10 rounded-[32px] shadow-[0_0_40px_rgba(139,92,246,0.15)] overflow-hidden"
          style={{
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.02)'
          }}
        >
          {/* Breathing Glow */}
          <motion.div 
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -inset-4 bg-violet-500/5 blur-3xl pointer-events-none"
          />

          <motion.div animate={driftAnimation} className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-white tracking-tight">Linguistic Controls</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Partner Profile Section */}
              <motion.div variants={itemVariants} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-converso-gradient flex items-center justify-center text-white font-bold">
                    {partner?.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">@{partner?.username}</div>
                    <div className="text-[11px] text-white/40 uppercase tracking-widest">Partner Profile</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                    <div className="text-[10px] text-white/30 uppercase mb-1">Native</div>
                    <div className="text-xs text-white font-medium">{partner?.preferredLanguage?.toUpperCase()}</div>
                  </div>
                  <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                    <div className="text-[10px] text-white/30 uppercase mb-1">Fluency</div>
                    <div className="text-xs text-amber-400 font-medium">Advanced</div>
                  </div>
                </div>
              </motion.div>

              {/* Translation Engine */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="px-1 text-[11px] uppercase tracking-[0.2em] text-white/30 font-bold">Translation Engine</div>
                <div className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
                      <Languages className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Auto-Translate</div>
                      <div className="text-[11px] text-white/40">Real-time neural relay</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAutoTranslate(!autoTranslate)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${autoTranslate ? 'bg-violet-600' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      animate={{ x: autoTranslate ? 22 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </motion.div>

              {/* Display Modes */}
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="px-1 text-[11px] uppercase tracking-[0.2em] text-white/30 font-bold">Display Mode</div>
                <div className="flex p-1 bg-white/5 rounded-2xl">
                  {['classic', 'culture', 'modern'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDisplayMode(mode)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl capitalize transition-all ${
                        displayMode === mode 
                          ? 'bg-white/10 text-white shadow-lg' 
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                <button className="flex flex-col gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition group text-left">
                  <BookOpen className="h-5 w-5 text-converso-gold group-hover:scale-110 transition" />
                  <div>
                    <div className="text-xs font-semibold text-white">Ledger</div>
                    <div className="text-[10px] text-white/40">Saved words</div>
                  </div>
                </button>
                <button className="flex flex-col gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition group text-left">
                  <Sparkles className="h-5 w-5 text-converso-cyan group-hover:scale-110 transition" />
                  <div>
                    <div className="text-xs font-semibold text-white">Context</div>
                    <div className="text-[10px] text-white/40">Cultural tips</div>
                  </div>
                </button>
              </motion.div>

              {/* Danger Zone */}
              <motion.div variants={itemVariants} className="pt-4 border-t border-white/10 space-y-2">
                <button 
                  onClick={onClear}
                  className="flex w-full items-center gap-3 px-3 py-3 rounded-2xl text-rose-300/70 hover:text-rose-200 hover:bg-rose-500/10 transition group"
                >
                  <Eraser className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                  <span className="text-sm">Clear History</span>
                </button>
                <button 
                  onClick={onDelete}
                  className="flex w-full items-center gap-3 px-3 py-3 rounded-2xl text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/20 transition group shadow-[0_0_20px_rgba(244,63,94,0)] hover:shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">Delete Conversation</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
