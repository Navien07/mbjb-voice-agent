"use client";

import { useState, useCallback, useRef } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import VoiceOrb from "./VoiceOrb";
import WaveformVisualizer from "./WaveformVisualizer";
import ConversationPanel, { Message } from "./ConversationPanel";

const AGENT_ID = "agent_1901kk43j8a2egc9r00f3zbrendx";

type OrbState = "idle" | "connecting" | "listening" | "speaking";

function VoiceAgentInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [textInput, setTextInput] = useState("");
  const messageIdRef = useRef(0);

  const addMessage = useCallback((role: "user" | "agent", text: string) => {
    const id = String(++messageIdRef.current);
    setMessages((prev) => [...prev, { id, role, text, timestamp: new Date() }]);
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

  const handleStart = useCallback(async () => {
    setOrbState("connecting");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId: AGENT_ID });
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        console.error("Voice agent: microphone permission denied");
      } else {
        console.error("Voice agent: failed to start session:", e.message);
      }
      setOrbState("idle");
    }
  }, [conversation]);

  const handleStop = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error("Voice agent: error ending session:", err);
    } finally {
      setOrbState("idle");
    }
  }, [conversation]);

  const handleTextSend = useCallback(async () => {
    const trimmed = textInput.trim();
    if (!trimmed) return;
    setTextInput("");
    try {
      await conversation.sendUserMessage(trimmed);
    } catch (err) {
      console.error("Voice agent: failed to send message:", err);
    }
  }, [conversation, textInput]);

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

  const showTranscript = messages.length > 0 || isConnected;

  return (
    <div className="flex-1 flex flex-col items-center min-h-0 overflow-y-auto py-8 px-4">
      <div
        className={isConnected ? "cursor-default" : "cursor-pointer"}
        onClick={isConnected ? undefined : handleStart}
      >
        <VoiceOrb
          state={orbState}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
        />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mt-4">Asyraf Ptptn</h2>
      <p className="text-sm text-foreground-muted mt-1">PTPTN AI Assistant</p>
      <div className="flex items-center gap-2 mt-3 mb-6">
        <div
          className={`w-2 h-2 rounded-full transition-colors ${
            isConnected ? "bg-emerald-400 animate-pulse" : "bg-foreground-muted/30"
          }`}
        />
        <span className="text-xs text-foreground-muted">
          {orbState === "idle" && "Ready"}
          {orbState === "connecting" && "Connecting..."}
          {orbState === "listening" && "Listening..."}
          {orbState === "speaking" && "Speaking..."}
        </span>
      </div>
      {isConnected && (
        <div className="w-full max-w-xs mb-5">
          <WaveformVisualizer
            isActive={isConnected}
            getVolume={orbState === "speaking" ? getOutputVolume : getInputVolume}
          />
        </div>
      )}
      <button
        onClick={isConnected ? handleStop : handleStart}
        className={`px-10 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 cursor-pointer mb-8 ${
          isConnected
            ? "bg-white/10 text-white hover:bg-red-500/20 border border-border"
            : "bg-accent text-white hover:bg-accent-light shadow-xl shadow-accent-glow"
        }`}
      >
        {isConnected ? (
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            End Conversation
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            Start Conversation
          </span>
        )}
      </button>
      {showTranscript && (
        <div className="w-full max-w-2xl rounded-2xl border border-border bg-bg-elevated/50 overflow-hidden mb-4">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-light">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                Conversation
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
          <div className="max-h-72">
            <ConversationPanel messages={messages} isConnected={isConnected} />
          </div>
          <div className="px-4 py-3 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
                placeholder={isConnected ? "Type a message..." : "Connect to start chatting..."}
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
      )}
    </div>
  );
}

export default function VoiceAgent() {
  return (
    <ConversationProvider>
      <VoiceAgentInner />
    </ConversationProvider>
  );
}
