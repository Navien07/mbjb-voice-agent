"use client";

import { useEffect, useRef } from "react";

export interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

interface ConversationPanelProps {
  messages: Message[];
  isConnected: boolean;
}

export default function ConversationPanel({
  messages,
  isConnected,
}: ConversationPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-foreground-muted px-6 py-8">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mb-4 opacity-30"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-sm text-center">
          {isConnected
            ? "Listening... Ask your question"
            : "Start a conversation to get help with PTPTN services"}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-accent text-white rounded-br-sm"
                : "bg-white/[0.06] text-foreground border border-border rounded-bl-sm"
            }`}
          >
            <p>{msg.text}</p>
            <p
              className={`text-[10px] mt-1 ${
                msg.role === "user"
                  ? "text-white/50"
                  : "text-foreground-muted/50"
              }`}
            >
              {msg.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
