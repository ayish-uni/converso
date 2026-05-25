import { 
  Languages, 
  Layers, 
  BookOpen, 
  Sparkles, 
  Eraser, 
  Trash2,
  Settings,
  Flag,
  ShieldBan
} from 'lucide-react';
import { getTheme } from "../themes/conversoThemes.js";

export function StaticLinguisticControls({ 
  partner,
  autoTranslate, 
  setAutoTranslate, 
  displayMode, 
  setDisplayMode,
  onClear,
  onDelete,
  onBlock,
  onReport
}) {
  const theme = getTheme(partner?.preferredLanguage);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="h-4 w-4 text-white/40" />
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Linguistic Controls</h2>
      </div>

      <div className="space-y-4">
        {/* Partner Profile Card */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-converso-gradient flex items-center justify-center text-white font-bold shadow-lg">
              {partner?.username?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">@{partner?.username}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest">Partner</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/20 p-2 rounded-xl border border-white/5">
              <div className="text-[9px] text-white/30 uppercase mb-0.5">Native</div>
              <div className="text-xs text-white font-bold">{partner?.preferredLanguage?.toUpperCase()}</div>
            </div>
            <div className="bg-black/20 p-2 rounded-xl border border-white/5">
              <div className="text-[9px] text-white/30 uppercase mb-0.5">Relay</div>
              <div className="text-xs text-emerald-400 font-bold">Active</div>
            </div>
          </div>
        </div>

        {/* Auto-Translate Toggle */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                <Languages className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Auto-Relay</div>
                <div className="text-[10px] text-white/40">Neural translation</div>
              </div>
            </div>
            <button 
              onClick={() => setAutoTranslate(!autoTranslate)}
              className={`relative w-10 h-5 rounded-full transition-all duration-300 ${autoTranslate ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-white/10'}`}
            >
              <div 
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${autoTranslate ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <div className="px-1 text-[10px] uppercase tracking-widest text-white/30 font-bold">Immersion Mode</div>
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
            {['classic', 'culture'].map((mode) => (
              <button
                key={mode}
                onClick={() => setDisplayMode(mode)}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                  displayMode === mode 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button 
            onClick={onBlock}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10 transition group"
          >
            <ShieldBan className="h-4 w-4 text-amber-500/60 group-hover:text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Block User</span>
          </button>
          <button 
            onClick={onReport}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400/60 hover:text-rose-300 hover:bg-rose-500/10 transition group"
          >
            <Flag className="h-4 w-4 text-rose-400/60 group-hover:text-rose-300" />
            <span className="text-xs font-bold uppercase tracking-wider">Report User</span>
          </button>
          <button 
            onClick={onClear}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-rose-300/60 hover:text-rose-200 hover:bg-rose-500/10 transition group"
          >
            <Eraser className="h-4 w-4 opacity-50 group-hover:opacity-100" />
            <span className="text-xs font-bold uppercase tracking-wider">Clear Chat</span>
          </button>
          <button 
            onClick={onDelete}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/20 transition group"
          >
            <Trash2 className="h-4 w-4 text-rose-500/60 group-hover:text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Delete Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
