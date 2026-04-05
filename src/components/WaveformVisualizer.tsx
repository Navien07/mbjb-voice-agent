"use client";

import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  isActive: boolean;
  getVolume?: () => number;
  barCount?: number;
  color?: string;
}

export default function WaveformVisualizer({
  isActive,
  getVolume,
  barCount = 40,
  color = "#0EA5E9",
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      // Fix 7: reset transform before scaling to prevent accumulation on resize
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();

    let time = 0;
    const draw = () => {
      time += 0.05;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const volume = isActive && getVolume ? getVolume() : 0;
      const barWidth = w / barCount - 2;
      const gap = 2;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + gap);
        let barHeight: number;

        if (isActive) {
          const wave1 = Math.sin(time * 3 + i * 0.3) * 0.5 + 0.5;
          const wave2 = Math.sin(time * 2 + i * 0.5) * 0.3 + 0.5;
          const center = 1 - Math.abs((i - barCount / 2) / (barCount / 2));
          barHeight =
            (wave1 * wave2 * center * (0.3 + volume * 0.7) + 0.05) * h;
        } else {
          barHeight = (Math.sin(time + i * 0.2) * 0.03 + 0.05) * h;
        }

        barHeight = Math.max(2, barHeight);
        const y = (h - barHeight) / 2;
        const alpha = isActive ? 0.4 + volume * 0.6 : 0.15;

        ctx.fillStyle =
          color +
          Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0");
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isActive, getVolume, barCount, color]);

  return <canvas ref={canvasRef} className="w-full h-12" />;
}
