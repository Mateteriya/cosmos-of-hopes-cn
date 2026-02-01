'use client';

import { useEffect, useRef } from 'react';
import type { AmuletOrnament } from '@/lib/amulet-ornaments';

interface OrnamentPreviewProps {
  ornament: AmuletOrnament;
  size?: number;
}

export default function OrnamentPreview({ ornament, size = 48 }: OrnamentPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || ornament.id === 'none') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем canvas
    ctx.clearRect(0, 0, size, size);

    // Рисуем орнамент
    if (ornament.draw) {
      ornament.draw(ctx, size / 2, size / 2, size * 0.8);
    }
  }, [ornament, size]);

  if (ornament.id === 'none') {
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
