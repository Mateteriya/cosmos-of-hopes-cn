/**
 * Орнаменты для внутренней рамки амулета
 * Орнаменты повторяются по окружности внутри амулета
 * Каждый орнамент - это функция, которая рисует один элемент на canvas
 */

export interface AmuletOrnament {
  id: string;
  name: string;
  description: string;
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void; // Функция для рисования элемента орнамента
}

// Кеш для загруженных изображений орнаментов
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Загружает изображение и кеширует его
 */
function loadOrnamentImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error(`Failed to load ornament image: ${src}`));
    };
    img.src = src;
  });
}

/**
 * Рисует изображение орнамента (с fallback на программное рисование)
 */
async function drawOrnamentImage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  imageSrc: string,
  fallbackDraw: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void
) {
  try {
    const img = await loadOrnamentImage(imageSrc);
    ctx.save();
    ctx.translate(x, y);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
  } catch (error) {
    // Если не удалось загрузить изображение, используем fallback
    console.warn(`Failed to load ornament image ${imageSrc}, using fallback drawing`);
    fallbackDraw(ctx, x, y, size);
  }
}

/**
 * Рисует звёздочку
 */
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const spikes = 5; // Количество лучей
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.4;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

/**
 * Рисует круг
 */
function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

/**
 * Рисует треугольник
 */
function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 6); // Поворот для более симметричного вида
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.lineTo(-size / 2 * 0.866, size / 2 * 0.5);
  ctx.lineTo(size / 2 * 0.866, size / 2 * 0.5);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

/**
 * Рисует маленький цветок
 */
function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  const petals = 6;
  const petalRadius = size / 3;
  
  // Рисуем лепестки
  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / petals);
    ctx.beginPath();
    ctx.arc(0, -petalRadius, petalRadius / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  
  // Центр цветка
  ctx.beginPath();
  ctx.arc(0, 0, size / 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
  ctx.fill();
  ctx.restore();
}

/**
 * Рисует ромб
 */
function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4); // Поворот на 45 градусов
  ctx.beginPath();
  ctx.rect(-size / 2, -size / 2, size, size);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

/**
 * Рисует каплю (fallback - программное рисование)
 */
function drawDropFallback(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(0, -size / 4, size / 4, 0, Math.PI * 2);
  ctx.lineTo(0, size / 2);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

/**
 * Рисует каплю (использует изображение капля1.png)
 */
function drawDrop(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  // Пытаемся загрузить изображение синхронно (если уже в кеше)
  const imageSrc = '/pictures/капля1.png';
  const cachedImg = imageCache.get(imageSrc);
  
  if (cachedImg && cachedImg.complete) {
    // Изображение уже загружено - рисуем его без поворота (капля правильной ориентации)
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(cachedImg, -size / 2, -size / 2, size, size);
    ctx.globalAlpha = 1.0;
    ctx.restore();
  } else {
    // Изображение еще не загружено - используем fallback и загружаем асинхронно
    drawDropFallback(ctx, x, y, size);
    
    // Загружаем изображение для следующего раза
    if (!cachedImg) {
      loadOrnamentImage(imageSrc).catch(() => {
        // Игнорируем ошибки загрузки
      });
    }
  }
}

/**
 * Рисует крестик
 */
function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  const thickness = size / 4;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.lineWidth = 1;
  
  // Вертикальная линия
  ctx.fillRect(-thickness / 2, -size / 2, thickness, size);
  ctx.strokeRect(-thickness / 2, -size / 2, thickness, size);
  
  // Горизонтальная линия
  ctx.fillRect(-size / 2, -thickness / 2, size, thickness);
  ctx.strokeRect(-size / 2, -thickness / 2, size, thickness);
  
  ctx.restore();
}

// Список доступных орнаментов
export const AMULET_ORNAMENTS: AmuletOrnament[] = [
  {
    id: 'none',
    name: 'Без орнамента',
    description: 'Классический дизайн без орнамента',
    draw: () => {}, // Пустая функция - ничего не рисует
  },
  {
    id: 'star',
    name: 'Звёздочки',
    description: 'Золотые звёздочки по кругу',
    draw: drawStar,
  },
  {
    id: 'circle',
    name: 'Кружки',
    description: 'Простые круглые элементы',
    draw: drawCircle,
  },
  {
    id: 'triangle',
    name: 'Треугольники',
    description: 'Геометрические треугольники',
    draw: drawTriangle,
  },
  {
    id: 'flower',
    name: 'Цветочки',
    description: 'Нежные цветочные элементы',
    draw: drawFlower,
  },
  {
    id: 'diamond',
    name: 'Ромбы',
    description: 'Элегантные ромбы',
    draw: drawDiamond,
  },
  {
    id: 'drop',
    name: 'Капли',
    description: 'Капли росы',
    draw: drawDrop,
  },
  {
    id: 'cross',
    name: 'Крестики',
    description: 'Простые крестики',
    draw: drawCross,
  },
];

export function getOrnamentById(id: string): AmuletOrnament | undefined {
  return AMULET_ORNAMENTS.find(ornament => ornament.id === id);
}

export function getDefaultOrnament(): AmuletOrnament {
  return AMULET_ORNAMENTS[0]; // Возвращаем "Без орнамента" по умолчанию
}

/**
 * Предзагружает изображения орнаментов
 * Вызывается при инициализации приложения
 */
export function preloadOrnamentImages() {
  // Предзагружаем изображение капли
  loadOrnamentImage('/pictures/капля1.png').catch(() => {
    // Игнорируем ошибки - fallback будет использован
  });
}

// Предзагружаем изображения при загрузке модуля (только в браузере)
if (typeof window !== 'undefined') {
  preloadOrnamentImages();
}
