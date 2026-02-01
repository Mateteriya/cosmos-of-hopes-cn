/**
 * Орнаменты (непрерывные линии) для внутренней границы амулета
 * Орнаменты - это непрерывная линия, которая идет по внутренней границе амулета
 * Это повторяющийся узор: волна, квадратная, зубчатая, пунктирная
 */

export interface AmuletPattern {
  id: string;
  name: string;
  description: string;
  draw: (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, lineWidth: number) => void;
}

/**
 * Рисует волнообразный орнамент (непрерывная волнистая линия)
 */
function drawWavePattern(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, lineWidth: number) {
  ctx.save();
  ctx.translate(centerX, centerY);
  
  // Неон фиолетовый цвет (яркий, светящийся)
  ctx.strokeStyle = 'rgba(192, 132, 252, 1.0)'; // Яркий неон фиолетовый (violet-400 - более яркий)
  ctx.shadowColor = 'rgba(192, 132, 252, 1.0)'; // Яркое свечение
  ctx.shadowBlur = lineWidth * 1.5;
  ctx.lineWidth = lineWidth * 0.7; // Менее жирная линия (70% от исходной толщины)
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const segments = 120; // Количество сегментов для плавности
  const waveAmplitude = lineWidth * 0.5; // Амплитуда волны
  const waveFrequency = 32; // Количество волн по кругу (волны будут чаще, расстояние между ними меньше)
  
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const waveOffset = Math.sin(angle * waveFrequency) * waveAmplitude;
    const currentRadius = radius + waveOffset;
    const x = Math.cos(angle) * currentRadius;
    const y = Math.sin(angle) * currentRadius;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/**
 * Рисует квадратный орнамент (непрерывная линия с квадратными зубцами)
 */
function drawSquarePattern(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, lineWidth: number) {
  ctx.save();
  ctx.translate(centerX, centerY);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';
  
  const teeth = 24; // Количество зубцов
  const toothSize = lineWidth * 2; // Размер зуба
  
  ctx.beginPath();
  for (let i = 0; i <= teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const baseRadius = radius;
    const toothRadius = i % 2 === 0 ? baseRadius + toothSize : baseRadius;
    
    const x = Math.cos(angle) * toothRadius;
    const y = Math.sin(angle) * toothRadius;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/**
 * Рисует зубчатый орнамент (непрерывная линия с треугольными зубцами)
 */
function drawZigzagPattern(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, lineWidth: number) {
  ctx.save();
  ctx.translate(centerX, centerY);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const teeth = 32; // Количество зубцов
  const toothSize = lineWidth * 1.8; // Размер зуба
  
  ctx.beginPath();
  for (let i = 0; i <= teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const baseRadius = radius;
    const toothRadius = i % 2 === 0 ? baseRadius + toothSize : baseRadius;
    
    const x = Math.cos(angle) * toothRadius;
    const y = Math.sin(angle) * toothRadius;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/**
 * Рисует пунктирный орнамент (непрерывная пунктирная линия)
 */
function drawDashedPattern(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, lineWidth: number) {
  ctx.save();
  ctx.translate(centerX, centerY);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  
  // Устанавливаем пунктир
  const dashLength = lineWidth * 3;
  const gapLength = lineWidth * 2;
  ctx.setLineDash([dashLength, gapLength]);
  
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.setLineDash([]); // Сбрасываем пунктир
  ctx.restore();
}

// Список доступных орнаментов
export const AMULET_PATTERNS: AmuletPattern[] = [
  {
    id: 'none',
    name: 'Без орнамента',
    description: 'Классический дизайн без орнамента',
    draw: () => {}, // Пустая функция - ничего не рисует
  },
  {
    id: 'wave',
    name: 'Волна',
    description: 'Непрерывная волнистая линия',
    draw: drawWavePattern,
  },
  {
    id: 'square',
    name: 'Квадратная',
    description: 'Непрерывная линия с квадратными зубцами',
    draw: drawSquarePattern,
  },
  {
    id: 'zigzag',
    name: 'Зубчатая',
    description: 'Непрерывная линия с треугольными зубцами',
    draw: drawZigzagPattern,
  },
  {
    id: 'dashed',
    name: 'Пунктирная',
    description: 'Непрерывная пунктирная линия',
    draw: drawDashedPattern,
  },
];

export function getPatternById(id: string): AmuletPattern | undefined {
  return AMULET_PATTERNS.find(pattern => pattern.id === id);
}

export function getDefaultPattern(): AmuletPattern {
  return AMULET_PATTERNS[0]; // Возвращаем "Без орнамента" по умолчанию
}
