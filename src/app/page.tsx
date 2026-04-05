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

const TOPICS = [
  "Property Tax",
  "Licensing",
  "Complaints",
  "Waste Collection",
  "Building Permits",
  "Parking",
];

export default function Home() {
  return (
    <main className="flex flex-col h-screen overflow-hidden bg-gradient-to-b from-bg-base via-bg-deep to-bg-deep">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border bg-bg-elevated/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-accent-light"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground tracking-tight">
              MBJB Voice Agent
            </h1>
            <p className="text-[10px] text-foreground-muted leading-none mt-0.5">
              Majlis Bandaraya Johor Bahru
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-foreground-muted/60 hidden sm:block">
            Berkhidmat, Berbudaya, Berwawasan
          </span>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <span className="text-[10px] text-foreground-muted/40">
            Powered by AI
          </span>
        </div>
      </header>

      {/* Voice Agent (takes all remaining space) */}
      <VoiceAgent topics={TOPICS} />

      {/* Footer */}
      <footer className="shrink-0 px-5 py-2 border-t border-border/50 flex items-center justify-between">
        <p className="text-[9px] text-foreground-muted/30">
          &copy; {new Date().getFullYear()} Majlis Bandaraya Johor Bahru.
          Respons AI mungkin tidak sentiasa tepat. / AI responses may not always be accurate.
        </p>
        <p className="text-[9px] text-foreground-muted/30">v1.0</p>
      </footer>
    </main>
  );
}
