/**
 * Узоры для внутренней рамки амулета
 * Узоры повторяются по окружности внутри амулета (отдельные элементы: звездочки, капли и т.д.)
 * Каждый узор - это функция, которая рисует один элемент на canvas
 */

export interface AmuletElement {
  id: string;
  name: string;
  description: string;
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void; // Функция для рисования элемента узора
}

// Кеш для загруженных изображений узоров
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Загружает изображение и кеширует его
 */
function loadElementImage(src: string): Promise<HTMLImageElement> {
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
      reject(new Error(`Failed to load element image: ${src}`));
    };
    img.src = src;
  });
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
  
  // Проверяем, есть ли изображение в кеше и оно загружено
  if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
    // Изображение уже загружено - рисуем его без поворота (капля правильной ориентации)
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(cachedImg, -size / 2, -size / 2, size, size);
    ctx.globalAlpha = 1.0;
    ctx.restore();
    return; // Успешно нарисовали изображение
  }
  
  // Изображение еще не загружено - используем fallback и загружаем асинхронно
  drawDropFallback(ctx, x, y, size);
  
  // Загружаем изображение для следующего раза
  if (!cachedImg) {
    loadElementImage(imageSrc).catch(() => {
      // Игнорируем ошибки загрузки - fallback уже нарисован
    });
  } else if (!cachedImg.complete) {
    // Изображение в кеше, но еще загружается - ждем
    cachedImg.onload = () => {
      // Изображение загружено, но мы не можем перерисовать здесь
      // Перерисовка произойдет при следующем вызове drawDrop
    };
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

// Список доступных узоров
export const AMULET_ELEMENTS: AmuletElement[] = [
  {
    id: 'none',
    name: 'Без узора',
    description: 'Классический дизайн без узоров',
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
    id: 'cross',
    name: 'Крестики',
    description: 'Простые крестики',
    draw: drawCross,
  },
];

// Специальные узоры для зарегистрированных пользователей
export const PREMIUM_ELEMENTS: AmuletElement[] = [
  {
    id: 'drop',
    name: 'Капля',
    description: 'Капли росы',
    draw: drawDrop,
  },
  {
    id: 'star-neon',
    name: 'Звезда Неон',
    description: 'Неоновая звезда',
    draw: drawStarNeon,
  },
  {
    id: 'star-red',
    name: 'Звезда Красная',
    description: 'Красная звезда',
    draw: drawStarRed,
  },
  {
    id: 'star-gold',
    name: 'Звезда Золотая',
    description: 'Золотая звезда',
    draw: drawStarGold,
  },
];

export function getElementById(id: string): AmuletElement | undefined {
  return AMULET_ELEMENTS.find(element => element.id === id) || 
         PREMIUM_ELEMENTS.find(element => element.id === id);
}

export function getDefaultElement(): AmuletElement {
  return AMULET_ELEMENTS[0]; // Возвращаем "Без узора" по умолчанию
}

/**
 * Рисует звезду из изображения (использует изображение звезда.png, звезда1.png или звезда3.png)
 */
function drawStarFromImage(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, imageSrc: string) {
  const cachedImg = imageCache.get(imageSrc);
  
  if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(cachedImg, -size / 2, -size / 2, size, size);
    ctx.globalAlpha = 1.0;
    ctx.restore();
    return;
  }
  
  // Fallback - простая звезда
  ctx.save();
  ctx.translate(x, y);
  const spikes = 5;
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.4;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  
  if (!cachedImg) {
    loadElementImage(imageSrc).catch(() => {});
  } else if (!cachedImg.complete) {
    cachedImg.onload = () => {};
  }
}

function drawStarNeon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawStarFromImage(ctx, x, y, size, '/pictures/звезда.png');
}

function drawStarRed(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawStarFromImage(ctx, x, y, size, '/pictures/звезда1.png');
}

function drawStarGold(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawStarFromImage(ctx, x, y, size, '/pictures/звезда2.png');
}

/**
 * Предзагружает изображения узоров
 * Вызывается при инициализации приложения
 */
export function preloadElementImages() {
  // Предзагружаем изображения
  loadElementImage('/pictures/капля1.png').catch(() => {});
  loadElementImage('/pictures/звезда.png').catch(() => {});
  loadElementImage('/pictures/звезда1.png').catch(() => {});
  loadElementImage('/pictures/звезда2.png').catch(() => {});
}

// Предзагружаем изображения при загрузке модуля (только в браузере)
if (typeof window !== 'undefined') {
  preloadElementImages();
}
