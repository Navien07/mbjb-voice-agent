"use client";

import { useState, useCallback, useRef } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import VoiceOrb from "./VoiceOrb";
import WaveformVisualizer from "./WaveformVisualizer";
import ConversationPanel, { Message } from "./ConversationPanel";

const AGENT_ID = "agent_8201kmjh9h1re1dt1471cdypnx4t";

type OrbState = "idle" | "connecting" | "listening" | "speaking";

function VoiceAgentInner({ topics }: { topics: string[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [textInput, setTextInput] = useState("");
  const messageIdRef = useRef(0);

  const addMessage = useCallback((role: "user" | "agent", text: string) => {
    const id = String(++messageIdRef.current);
    setMessages((prev) => [
      ...prev,
      { id, role, text, timestamp: new Date() },
    ]);
  }, []);

  const conversation = useConversation({
    onConnect: () => setOrbState("listening"),
    onDisconnect: () => setOrbState("idle"),
    onMessage: (message) => {
      const msg = message as { source?: string; message?: string };
      if (msg.message) {
        addMessage(msg.source === "user" ? "user" : "agent", msg.message);
      }
    },
    onError: (error) => {
      console.error("Voice agent error:", error);
      setOrbState("idle");
    },
    onModeChange: (mode) => {
      const m = mode as { mode?: string };
      if (m.mode === "speaking") setOrbState("speaking");
      else if (m.mode === "listening") setOrbState("listening");
    },
  });

  const isConnected = conversation.status === "connected";

  const handleStart = async () => {
    try {
      setOrbState("connecting");
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId: AGENT_ID });
    } catch (err) {
      console.error("Failed to start:", err);
      setOrbState("idle");
    }
  };

  const handleStop = async () => {
    await conversation.endSession();
    setOrbState("idle");
  };

  const handleTextSend = () => {
    const text = textInput.trim();
    if (!text || !isConnected) return;
    conversation.sendUserMessage(text);
    setTextInput("");
  };

  const getInputVolume = useCallback(() => {
    if (typeof conversation.getInputVolume === "function")
      return conversation.getInputVolume();
    return 0;
  }, [conversation]);

  const getOutputVolume = useCallback(() => {
    if (typeof conversation.getOutputVolume === "function")
      return conversation.getOutputVolume();
    return 0;
  }, [conversation]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
      {/* Left: Orb + Controls */}
      <div className="flex flex-col items-center lg:w-1/2 py-4 lg:py-0 px-6 lg:justify-center">
        {/* Topic pills - only on left panel */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto w-full justify-center lg:absolute lg:top-4 lg:left-0 lg:right-0 lg:w-auto lg:px-6">
          <span className="text-[10px] text-foreground-muted/40 shrink-0">
            Ask about:
          </span>
          {topics.map((topic) => (
            <span
              key={topic}
              className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-border text-foreground-muted"
            >
              {topic}
            </span>
          ))}
        </div>

        {/* Status label */}
        <div className="mb-2 lg:mb-4 mt-1 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-400" : "bg-foreground-muted/40"
            }`}
          />
          <span className="text-xs font-medium uppercase tracking-widest text-foreground-muted">
            {orbState === "idle" && "Ready"}
            {orbState === "connecting" && "Connecting..."}
            {orbState === "listening" && "Listening"}
            {orbState === "speaking" && "Speaking"}
          </span>
        </div>

        {/* Orb */}
        <div
          className="relative cursor-pointer"
          onClick={isConnected ? undefined : handleStart}
        >
          <VoiceOrb
            state={orbState}
            getInputVolume={getInputVolume}
            getOutputVolume={getOutputVolume}
          />
        </div>

        {/* Waveform */}
        <div className="w-full max-w-xs mt-2 lg:mt-4">
          <WaveformVisualizer
            isActive={isConnected}
            getVolume={
              orbState === "speaking" ? getOutputVolume : getInputVolume
            }
          />
        </div>

        {/* Connect/Disconnect button */}
        <button
          onClick={isConnected ? handleStop : handleStart}
          className={`mt-3 lg:mt-5 px-8 py-3 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer ${
            isConnected
              ? "bg-white/10 text-white hover:bg-destructive/80 border border-border"
              : "bg-accent text-white hover:bg-accent-light shadow-lg shadow-accent-glow"
          }`}
        >
          {isConnected ? (
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              End Conversation
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              Start Conversation
            </span>
          )}
        </button>

        <p className="mt-2 text-[11px] text-foreground-muted/50 text-center max-w-xs hidden lg:block">
          Click to start or tap the orb. Speak in Bahasa Melayu or English.
        </p>
      </div>

      {/* Right: Conversation Panel */}
      <div className="flex flex-col flex-1 lg:w-1/2 min-h-0 border-t lg:border-t-0 lg:border-l border-border">
        {/* Panel header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-light">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Transcript
            </span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-[10px] text-foreground-muted/50 hover:text-foreground-muted cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Messages */}
        <ConversationPanel messages={messages} isConnected={isConnected} />

        {/* Text input */}
        <div className="shrink-0 px-4 py-3 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
              placeholder={
                isConnected ? "Type a message..." : "Connect to start chatting..."
              }
              disabled={!isConnected}
              className="flex-1 bg-white/[0.04] border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-foreground-muted/40 focus:outline-none focus:ring-1 focus:ring-accent/50 disabled:opacity-30 transition-all"
            />
            <button
              onClick={handleTextSend}
              disabled={!isConnected || !textInput.trim()}
              className="p-2.5 rounded-xl bg-accent text-white disabled:opacity-20 hover:bg-accent-light transition-colors cursor-pointer disabled:cursor-default"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VoiceAgent({ topics = [] }: { topics?: string[] }) {
  return (
    <ConversationProvider>
      <VoiceAgentInner topics={topics} />
    </ConversationProvider>
  );
}
