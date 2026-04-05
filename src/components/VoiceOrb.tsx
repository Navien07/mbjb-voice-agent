"use client";

import { useEffect, useRef } from "react";

type AgentState = "idle" | "connecting" | "listening" | "speaking";

interface VoiceOrbProps {
  state: AgentState;
  getInputVolume?: () => number;
  getOutputVolume?: () => number;
}

export default function VoiceOrb({
  state,
  getInputVolume,
  getOutputVolume,
}: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const size = 280;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let time = 0;

    const draw = () => {
      time += 0.02;
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const baseRadius = 70;

      let volume = 0;
      if (state === "listening" && getInputVolume) {
        volume = getInputVolume();
      } else if (state === "speaking" && getOutputVolume) {
        volume = getOutputVolume();
      }

      // Outer glow rings
      const ringCount = 3;
      for (let r = ringCount; r >= 1; r--) {
        const ringRadius = baseRadius + r * 20 + volume * 30;
        const alpha = 0.03 + volume * 0.04;
        const gradient = ctx.createRadialGradient(
          cx,
          cy,
          ringRadius * 0.5,
          cx,
          cy,
          ringRadius
        );
        gradient.addColorStop(0, `rgba(14, 165, 233, ${alpha})`);
        gradient.addColorStop(1, "rgba(14, 165, 233, 0)");
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Main orb with distortion
      const points = 128;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        let radius = baseRadius;

        if (state === "idle" || state === "connecting") {
          radius += Math.sin(time * 2 + angle * 3) * 3;
          radius += Math.sin(time * 1.5 + angle * 5) * 2;
        } else if (state === "listening") {
          radius += Math.sin(time * 3 + angle * 4) * (5 + volume * 25);
          radius += Math.cos(time * 2.5 + angle * 6) * (3 + volume * 15);
          radius += Math.sin(time * 4 + angle * 8) * volume * 10;
        } else if (state === "speaking") {
          radius += Math.sin(time * 4 + angle * 3) * (8 + volume * 30);
          radius += Math.cos(time * 3 + angle * 7) * (4 + volume * 20);
          radius += Math.sin(time * 5 + angle * 5) * volume * 15;
        }

        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Orb gradient fill
      const orbGradient = ctx.createRadialGradient(
        cx - 15,
        cy - 15,
        10,
        cx,
        cy,
        baseRadius + 20
      );
      if (state === "speaking") {
        orbGradient.addColorStop(0, "rgba(14, 165, 233, 0.9)");
        orbGradient.addColorStop(0.5, "rgba(3, 105, 161, 0.7)");
        orbGradient.addColorStop(1, "rgba(15, 23, 42, 0.5)");
      } else if (state === "listening") {
        orbGradient.addColorStop(0, "rgba(56, 189, 248, 0.8)");
        orbGradient.addColorStop(0.5, "rgba(14, 165, 233, 0.6)");
        orbGradient.addColorStop(1, "rgba(3, 105, 161, 0.3)");
      } else {
        orbGradient.addColorStop(0, "rgba(14, 165, 233, 0.5)");
        orbGradient.addColorStop(0.5, "rgba(3, 105, 161, 0.3)");
        orbGradient.addColorStop(1, "rgba(15, 23, 42, 0.2)");
      }
      ctx.fillStyle = orbGradient;
      ctx.fill();

      // Inner bright core
      const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
      const coreAlpha = state === "idle" ? 0.15 : 0.25 + volume * 0.3;
      coreGradient.addColorStop(0, `rgba(186, 230, 253, ${coreAlpha})`);
      coreGradient.addColorStop(1, "rgba(186, 230, 253, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [state, getInputVolume, getOutputVolume]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse ring when active */}
      {(state === "listening" || state === "speaking") && (
        <div
          className="absolute w-[200px] h-[200px] rounded-full border border-accent-light/20"
          style={{ animation: "pulse-ring 2s ease-out infinite" }}
        />
      )}
      <canvas
        ref={canvasRef}
        className="w-[180px] h-[180px] lg:w-[280px] lg:h-[280px]"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
