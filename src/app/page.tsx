"use client";

import dynamic from "next/dynamic";

const VoiceAgent = dynamic(() => import("@/components/VoiceAgent"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  ),
});

export default function Home() {
  return (
    <main className="flex flex-col h-screen overflow-hidden bg-gradient-to-b from-bg-base via-bg-deep to-bg-deep">
      <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-bg-elevated/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-lg shadow-accent-glow">
            <span className="text-white text-[10px] font-black tracking-tight leading-none">YTL</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-foreground">AI Labs</span>
              <span className="text-sm font-bold text-accent-light">Ilmu</span>
            </div>
            <p className="text-[10px] text-foreground-muted/60 leading-none mt-0.5">
              YTL AI Intelligence Platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-foreground-muted/50 hidden sm:block">
            Conversational AI Demo
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent-light font-medium">
            Demo
          </span>
        </div>
      </header>
      <VoiceAgent />
      <footer className="shrink-0 px-6 py-3 border-t border-border/50 flex items-center justify-center">
        <p className="text-[10px] text-foreground-muted/40">
          Demo Powered by{" "}
          <span className="text-accent-light/70 font-medium">YTL AI Labs (Ilmu)</span>
        </p>
      </footer>
    </main>
  );
}
