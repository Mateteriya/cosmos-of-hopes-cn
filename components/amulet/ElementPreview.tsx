'use client';

import { useEffect, useRef } from 'react';
import type { AmuletElement } from '@/lib/amulet-elements';

interface ElementPreviewProps {
  element: AmuletElement;
  size?: number;
}

export default function ElementPreview({ element, size = 48 }: ElementPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || element.id === 'none') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawElement = () => {
      // Очищаем canvas
      ctx.clearRect(0, 0, size, size);

      // Рисуем узор
      if (element.draw) {
        element.draw(ctx, size / 2, size / 2, size * 0.8);
      }
    };

    // Если это элемент с изображением, проверяем загрузку
    const imageElements: { [key: string]: string } = {
      'drop': '/pictures/капля1.png',
      'star-neon': '/pictures/звезда.png',
      'star-red': '/pictures/звезда1.png',
      'star-gold': '/pictures/звезда3.png',
    };
    
    const imageSrc = imageElements[element.id];
    
    if (imageSrc) {
      const img = new Image();
      
      // Проверяем, есть ли изображение уже в кеше браузера
      const cachedImg = document.querySelector(`img[src="${imageSrc}"]`) as HTMLImageElement;
      
      if (cachedImg && cachedImg.complete) {
        // Изображение уже загружено - рисуем сразу
        drawElement();
      } else {
        // Загружаем изображение
        img.onload = () => {
          // Изображение загружено - рисуем
          drawElement();
        };
        img.onerror = () => {
          // Ошибка загрузки - все равно рисуем (будет fallback)
          drawElement();
        };
        img.src = imageSrc;
        
        // Если изображение уже загружено (из кеша), рисуем сразу
        if (img.complete) {
          drawElement();
        }
      }
    } else {
      // Для других элементов рисуем сразу
      drawElement();
    }
  }, [element, size]);

  if (element.id === 'none') {
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
