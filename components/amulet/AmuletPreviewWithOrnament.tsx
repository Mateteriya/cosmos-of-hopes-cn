'use client';

import { useEffect, useRef } from 'react';
import { AmuletSymbolIcon, AmuletSymbolIconWithChoice } from './AmuletSymbolIcons';
import { getElementById } from '@/lib/amulet-elements';
import { getPatternById } from '@/lib/amulet-patterns';

interface AmuletPreviewWithOrnamentProps {
  symbolId: string;
  color: string;
  elementId?: string; // ID выбранного узора
  patternId?: string; // ID выбранного орнамента (непрерывной линии)
  size?: number;
  scalesImageIndex?: number;
  onScalesImageChange?: (index: number) => void;
}

export default function AmuletPreviewWithOrnament({
  symbolId,
  color,
  elementId,
  patternId,
  size = 160,
  scalesImageIndex = 0,
  onScalesImageChange,
}: AmuletPreviewWithOrnamentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем canvas
    ctx.clearRect(0, 0, size, size);

    // Пропорции для масштабирования из 3D (1024x1024) в предпросмотр (size x size)
    const scale = size / 1024;
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Парсим цвет (обрабатываем градиенты и обычные hex-цвета)
    let r = 128, g = 128, b = 160; // Значения по умолчанию
    let actualColor = color;
    const isGradient = color.startsWith('linear-gradient');
    
    if (isGradient) {
      // Для градиентов извлекаем оба цвета
      const hexMatches = color.match(/#([0-9A-Fa-f]{6})/g);
      if (hexMatches && hexMatches.length >= 2) {
        const hex1 = hexMatches[0].replace('#', '');
        const hex2 = hexMatches[1].replace('#', '');
        const r1 = parseInt(hex1.substring(0, 2), 16);
        const g1 = parseInt(hex1.substring(2, 4), 16);
        const b1 = parseInt(hex1.substring(4, 6), 16);
        const r2 = parseInt(hex2.substring(0, 2), 16);
        const g2 = parseInt(hex2.substring(2, 4), 16);
        const b2 = parseInt(hex2.substring(4, 6), 16);
        
        // Используем средний цвет для расчетов
        r = Math.floor((r1 + r2) / 2);
        g = Math.floor((g1 + g2) / 2);
        b = Math.floor((b1 + b2) / 2);
        actualColor = `#${Math.floor((r1 + r2) / 2).toString(16).padStart(2, '0')}${Math.floor((g1 + g2) / 2).toString(16).padStart(2, '0')}${Math.floor((b1 + b2) / 2).toString(16).padStart(2, '0')}`;
      } else {
        const hexMatch = color.match(/#([0-9A-Fa-f]{6})/);
        if (hexMatch) {
          const hex = hexMatch[1];
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
          actualColor = `#${hex}`;
        } else {
          r = 102; g = 126; b = 234;
          actualColor = '#667eea';
        }
      }
    } else if (color.startsWith('#')) {
      // Обычный hex-цвет
      const hex = color.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      actualColor = color;
    }

    // Фон - радиальный градиент цвета элемента (как в 3D)
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 2);
    
    if (isGradient) {
      // Для градиентов создаем реальный градиент с двумя цветами
      const hexMatches = color.match(/#([0-9A-Fa-f]{6})/g);
      if (hexMatches && hexMatches.length >= 2) {
        const hex1 = hexMatches[0].replace('#', '');
        const hex2 = hexMatches[1].replace('#', '');
        const r1 = parseInt(hex1.substring(0, 2), 16);
        const g1 = parseInt(hex1.substring(2, 4), 16);
        const b1 = parseInt(hex1.substring(4, 6), 16);
        const r2 = parseInt(hex2.substring(0, 2), 16);
        const g2 = parseInt(hex2.substring(2, 4), 16);
        const b2 = parseInt(hex2.substring(4, 6), 16);
        
        gradient.addColorStop(0, `rgb(${Math.min(255, r1 + 150)}, ${Math.min(255, g1 + 150)}, ${Math.min(255, b1 + 150)})`);
        gradient.addColorStop(0.3, `rgb(${r1}, ${g1}, ${b1})`);
        gradient.addColorStop(0.5, `rgb(${Math.floor((r1 + r2) / 2)}, ${Math.floor((g1 + g2) / 2)}, ${Math.floor((b1 + b2) / 2)})`);
        gradient.addColorStop(0.7, `rgb(${r2}, ${g2}, ${b2})`);
        gradient.addColorStop(1, `rgb(${Math.max(0, r2 - 30)}, ${Math.max(0, g2 - 30)}, ${Math.max(0, b2 - 30)})`);
      } else {
        // Fallback
        const lightR = Math.min(255, r + 150);
        const lightG = Math.min(255, g + 150);
        const lightB = Math.min(255, b + 150);
        const midR = Math.min(255, r + 90);
        const midG = Math.min(255, g + 90);
        const midB = Math.min(255, b + 90);
        const darkR = Math.max(0, r - 30);
        const darkG = Math.max(0, g - 30);
        const darkB = Math.max(0, b - 30);
        gradient.addColorStop(0, `rgb(${lightR}, ${lightG}, ${lightB})`);
        gradient.addColorStop(0.15, `rgb(${midR}, ${midG}, ${midB})`);
        gradient.addColorStop(0.4, actualColor);
        gradient.addColorStop(1, `rgb(${darkR}, ${darkG}, ${darkB})`);
      }
    } else {
      // Обычный цвет
      // ОЧЕНЬ яркий центр
      const lightR = Math.min(255, r + 150);
      const lightG = Math.min(255, g + 150);
      const lightB = Math.min(255, b + 150);
      
      // Средний тон (яркий)
      const midR = Math.min(255, r + 90);
      const midG = Math.min(255, g + 90);
      const midB = Math.min(255, b + 90);
      
      // Темные края
      const darkR = Math.max(0, r - 30);
      const darkG = Math.max(0, g - 30);
      const darkB = Math.max(0, b - 30);
      
      gradient.addColorStop(0, `rgb(${lightR}, ${lightG}, ${lightB})`);
      gradient.addColorStop(0.15, `rgb(${midR}, ${midG}, ${midB})`);
      gradient.addColorStop(0.4, actualColor);
      gradient.addColorStop(1, `rgb(${darkR}, ${darkG}, ${darkB})`);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Радиусы в масштабе (из 3D: 450, 435, 415, 400)
    const outerFrameRadius = 450 * scale; // Внешняя рамка
    const reliefCircle1Radius = 435 * scale; // Первый контрастный круг
    const reliefCircle2Radius = (415 / 1.7) * 1.3 * scale; // Второй контрастный круг (уменьшен в 1.7 раза, затем увеличен в 1.3 раза)
    const innerFrameRadius = 400 * scale; // Внутренняя рамка

    // Рельефная внешняя рамка (тоньше, контрастная)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 35 * scale;
    ctx.shadowOffsetX = 8 * scale;
    ctx.shadowOffsetY = 8 * scale;
    
    ctx.strokeStyle = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
    ctx.lineWidth = 35 * scale; // Тоньше
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerFrameRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
    
    // Внутренняя рамка (рельефная, контрастная)
    ctx.strokeStyle = `rgb(${Math.max(0, r - 15)}, ${Math.max(0, g - 15)}, ${Math.max(0, b - 15)})`;
    ctx.lineWidth = 38 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerFrameRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Дополнительный рельеф - яркая выпуклость по краю (светлая линия для объема)
    ctx.strokeStyle = `rgb(${Math.min(255, r + 150)}, ${Math.min(255, g + 150)}, ${Math.min(255, b + 150)})`;
    ctx.lineWidth = 24 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, reliefCircle1Radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Еще одна светлая линия ближе к центру (для дополнительного рельефа)
    ctx.strokeStyle = `rgb(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)})`;
    ctx.lineWidth = 16 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, reliefCircle2Radius, 0, Math.PI * 2);
    ctx.stroke();

    // Рисуем орнамент (непрерывную линию) у самой границы амулета (если выбран)
    if (patternId && patternId !== 'none') {
      const pattern = getPatternById(patternId);
      if (pattern && pattern.draw) {
        const patternRadius = innerFrameRadius * 1.2; // Радиус для орнамента - увеличен в 1.2 раза, у самой границы
        const lineWidth = 8 * scale; // Толщина линии (как в 3D)
        pattern.draw(ctx, centerX, centerY, patternRadius, lineWidth);
      }
    }

    // Рисуем узоры (элементы) по окружности (если выбран)
    if (elementId && elementId !== 'none') {
      const element = getElementById(elementId);
      if (element && element.draw) {
        const elementRadius = 380 * scale; // Радиус для узоров (как в 3D)
        let elementSize = 60 * scale; // Размер каждого элемента (как в 3D)
        
        // Увеличиваем размер звездочек (в 1.54 раза от обычного, т.е. в 2/1.3 раза)
        if (element.id === 'star-neon' || element.id === 'star-red' || element.id === 'star-gold') {
          elementSize = elementSize * (2 / 1.3);
        }
        // Увеличиваем размер капли в 1.7 раза
        if (element.id === 'drop') {
          elementSize = elementSize * 1.7;
        }
        
        const elementCount = 12; // Количество элементов

        ctx.save();
        ctx.translate(centerX, centerY);

        const angleStep = (Math.PI * 2) / elementCount;

        for (let i = 0; i < elementCount; i++) {
          ctx.save();
          ctx.rotate(i * angleStep);
          ctx.translate(0, -elementRadius);

          // Рисуем элемент узора
          element.draw(ctx, 0, 0, elementSize);

          ctx.restore();
        }

        ctx.restore();
      }
    }
  }, [symbolId, color, elementId, patternId, size]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="absolute inset-0 rounded-full"
        style={{ width: size, height: size }}
      />
      {/* Символ поверх узоров и орнамента */}
      <div className="absolute inset-0 flex items-center justify-center">
        {symbolId === 'scales' ? (
          <AmuletSymbolIconWithChoice
            symbolId={symbolId}
            size={size * 0.6}
            selectedImageIndex={scalesImageIndex}
            onImageChange={onScalesImageChange}
          />
        ) : (
          <AmuletSymbolIcon symbolId={symbolId} size={size * 0.6} />
        )}
      </div>
    </div>
  );
}
