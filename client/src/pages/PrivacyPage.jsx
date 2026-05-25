import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Database, Share2, UserCheck, Shield, Mail, Fingerprint } from "lucide-react";
import { useAmbientSoundtrack } from "../hooks/useAmbientSoundtrack";

export function PrivacyPage() {
  const [activeTab, setActiveTab] = useState("collection");
  const { activate } = useAmbientSoundtrack();

  const sections = [
    { id: "collection", title: "1. Collection", icon: Database },
    { id: "usage", title: "2. Usage", icon: Shield },
    { id: "sharing", title: "3. Sharing", icon: Share2 },
    { id: "rights", title: "4. Your Rights", icon: UserCheck },
    { id: "security", title: "5. Security", icon: Fingerprint },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "collection":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
            </div>
            <p className="text-converso-subtext text-sm leading-relaxed">
              To provide our seamless multilingual experience, we collect specific information necessary for operation:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "Identity", desc: "Username, email, and avatar." },
                { title: "Communication", desc: "Encrypted chat logs for sync." },
                { title: "Preferences", desc: "Language and theme choices." },
                { title: "Technical", desc: "Device info for security." },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-wide">{item.title}</h3>
                  <p className="text-xs text-converso-subtext leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "usage":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-violet-400" />
              <h2 className="text-xl font-semibold text-white">How We Use Data</h2>
            </div>
            <p className="text-converso-subtext text-sm leading-relaxed">
              Your data is used exclusively to facilitate and protect your global communications:
            </p>
            <ul className="space-y-3">
              {[
                "Real-time message translation using optimized AI models.",
                "Automated moderation to prevent harassment and harm.",
                "Cross-device chat history synchronization.",
                "Developing better cross-cultural communication tools."
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-converso-subtext">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        );
      case "sharing":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Third-Party Services</h2>
            </div>
            <p className="text-converso-subtext text-sm leading-relaxed">
              Chat messages may be processed by trusted translation providers (like DeepL or Google Cloud) 
              anonymously. These services receive only the text necessary for translation and 
              do not store your personal identity.
            </p>
          </div>
        );
      case "rights":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Your Data, Your Choice</h2>
            </div>
            <p className="text-converso-subtext text-sm leading-relaxed">
              You maintain full control. You can access your profile, update your preferences, or 
              permanently delete your account at any time. Account deletion immediately removes 
              your identity and message history from our active systems.
            </p>
          </div>
        );
      case "security":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <Fingerprint className="h-5 w-5 text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Security Infrastructure</h2>
            </div>
            <p className="text-converso-subtext text-sm leading-relaxed">
              We implement robust encryption and multi-layered security protocols to safeguard your account. 
              While we take every precaution, we encourage users to maintain strong passwords and 
              monitor their account activity.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen bg-converso-night text-white selection:bg-violet-500/30 flex items-center justify-center p-4"
      onClick={activate}
    >
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-converso-cyan/10 rounded-full blur-[120px]" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8B5CF6,#6366F1)] shadow-glow">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Privacy</h1>
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
                      ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" 
                      : "text-converso-subtext hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${activeTab === item.id ? "text-violet-400" : "text-converso-subtext"}`} />
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
                    <Mail className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white">Privacy Concerns?</p>
                    <p className="text-[11px] text-converso-subtext">privacy@converso.chat</p>
                  </div>
                </div>
                <Link 
                  to="/register"
                  className="w-full sm:w-auto rounded-xl bg-[linear-gradient(135deg,#8B5CF6,#6366F1)] px-8 py-3 text-sm font-semibold text-white transition shadow-glow hover:brightness-110 text-center"
                >
                  I Understand
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
