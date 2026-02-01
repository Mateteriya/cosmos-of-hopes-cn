'use client';

import { useEffect, useRef } from 'react';
import type { AmuletPattern } from '@/lib/amulet-patterns';

interface PatternPreviewProps {
  pattern: AmuletPattern;
  size?: number;
}

export default function PatternPreview({ pattern, size = 48 }: PatternPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || pattern.id === 'none') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем canvas
    ctx.clearRect(0, 0, size, size);

    // Рисуем орнамент (непрерывную линию по окружности)
    if (pattern.draw) {
      const radius = size * 0.35; // Радиус для орнамента
      const lineWidth = size * 0.08; // Толщина линии
      pattern.draw(ctx, size / 2, size / 2, radius, lineWidth);
    }
  }, [pattern, size]);

  if (pattern.id === 'none') {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="w-3/4 h-3/4 rounded-full border-2 border-white/30 flex items-center justify-center">
          <span className="text-white/50 text-xl">○</span>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
    />
  );
}
