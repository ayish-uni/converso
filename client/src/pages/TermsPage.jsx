import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, UserCheck, MessageSquare, AlertTriangle, XCircle, Mail, FileText } from "lucide-react";
import { useAmbientSoundtrack } from "../hooks/useAmbientSoundtrack";

export function TermsPage() {
  const [activeTab, setActiveTab] = useState("acceptance");
  const { activate } = useAmbientSoundtrack();

  const sections = [
    { id: "acceptance", title: "1. Acceptance", icon: UserCheck },
    { id: "community", title: "2. Guidelines", icon: MessageSquare },
    { id: "moderation", title: "3. Moderation", icon: ShieldCheck },
    { id: "accuracy", title: "4. Accuracy", icon: AlertTriangle },
    { id: "termination", title: "5. Termination", icon: XCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "acceptance":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-converso-cyan" />
              <h2 className="text-xl font-semibold text-white">Acceptance of Terms</h2>
            </div>
            <p className="text-converso-subtext text-sm leading-relaxed">
              By creating an account on Converso, you enter into a legally binding agreement. 
              These terms govern your access to and use of the Converso platform, including any content, 
              functionality, and services offered.
            </p>
            <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/10 p-4">
              <p className="text-[11px] text-yellow-200/70 italic">
                If you do not agree to these terms, you must not access or use the application.
              </p>
            </div>
          </div>
        );
      case "community":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-converso-cyan" />
              <h2 className="text-xl font-semibold text-white">Community Guidelines</h2>
            </div>
            <p className="text-converso-subtext text-sm leading-relaxed mb-4">
              To maintain a safe and respectful global environment, we strictly prohibit:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "Zero Harassment", desc: "No hate speech or targeted abuse." },
                { title: "Safe Content", desc: "No violent or explicit material." },
                { title: "Authenticity", desc: "No impersonation or deception." },
                { title: "Human Only", desc: "No bots, spam, or scraping." },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <h3 className="text-[10px] font-bold text-white mb-1 uppercase tracking-wide">{item.title}</h3>
                  <p className="text-xs text-converso-subtext leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "moderation":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-converso-cyan" />
              <h2 className="text-xl font-semibold text-white">Smart Moderation</h2>
            </div>
            <p className="text-converso-subtext text-sm leading-relaxed">
              We utilize automated filtering to protect users. Messages containing prohibited content 
              (Self-harm, Extreme Violence, Adult material) are blocked at the source and never stored. 
              Repeated violations will result in account termination.
            </p>
          </div>
        );
      case "accuracy":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-converso-cyan" />
              <h2 className="text-xl font-semibold text-white">Translation Liability</h2>
            </div>
            <p className="text-converso-subtext text-sm leading-relaxed">
              Converso provides AI-driven translations to bridge cultural gaps. While we strive for 
              linguistic precision, we do not guarantee that translations are accurate or 
              reliable. You use translation features at your own risk.
            </p>
          </div>
        );
      case "termination":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-converso-cyan" />
              <h2 className="text-xl font-semibold text-white">Account Termination</h2>
            </div>
            <p className="text-converso-subtext text-sm leading-relaxed">
              You are free to delete your account at any time in Settings. Converso reserves 
              the right to suspend or terminate accounts that compromise the safety or 
              integrity of the community.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen bg-converso-night text-white selection:bg-converso-cyan/30 flex items-center justify-center p-4"
      onClick={activate}
    >
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-converso-cyan/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-4xl">
        <div className="mb-6">
          <Link 
            to="/register" 
            className="group inline-flex items-center gap-2 text-xs font-medium text-converso-subtext transition hover:text-white"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            Back to Registration
          </Link>
        </div>

        <div className="glass-card flex flex-col md:flex-row overflow-hidden min-h-[500px]">
          {/* Sidebar Tabs */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-white/5 p-6 space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-converso-gradient shadow-glow">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Terms</h1>
                <p className="text-[10px] text-converso-subtext uppercase tracking-widest">Policy</p>
              </div>
            </div>

            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible no-scrollbar pb-2 md:pb-0">
              {sections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition whitespace-nowrap md:whitespace-normal w-full ${
                    activeTab === item.id 
                      ? "bg-converso-cyan/10 text-converso-cyan border border-converso-cyan/20" 
                      : "text-converso-subtext hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${activeTab === item.id ? "text-converso-cyan" : "text-converso-subtext"}`} />
                  {item.title.split('. ')[1]}
                </button>
              ))}
            </nav>

            <div className="hidden md:block pt-8 border-t border-white/10">
               <p className="text-[11px] text-converso-subtext leading-relaxed italic">
                Last updated: May 10, 2026
              </p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col">
            <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[400px] md:max-h-none no-scrollbar">
              {renderContent()}
            </div>

            {/* Footer inside the card */}
            <div className="p-6 md:p-8 border-t border-white/10 bg-white/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5">
                    <Mail className="h-4 w-4 text-converso-cyan" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white">Questions?</p>
                    <p className="text-[11px] text-converso-subtext">legal@converso.chat</p>
                  </div>
                </div>
                <Link 
                  to="/register"
                  className="w-full sm:w-auto rounded-xl bg-converso-gradient px-8 py-3 text-sm font-semibold text-white transition shadow-glow hover:brightness-110 text-center"
                >
                  Accept & Return
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
