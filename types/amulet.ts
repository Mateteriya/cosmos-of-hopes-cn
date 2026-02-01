/**
 * Типы для амулетов (китайская версия)
 */

// Старые символы для обратной совместимости
export type AmuletSymbol = 'horse' | 'dragon' | 'coin' | 'phoenix' | string; // string для новых символов из библиотеки
export type BaziElement = 'fire' | 'wood' | 'water' | 'earth' | 'metal';

export interface Amulet {
  id: string;
  user_id: string;
  room_id?: string;
  
  // Параметры амулета
  symbol: AmuletSymbol;
  color: string; // HEX цвет из палитры элемента
  bazi_element: BaziElement; // Элемент удачи пользователя
  
  // Желание
  wish_text?: string; // До 200 символов
  
  // Бацзы данные
  birth_date?: string; // ISO date
  birth_time?: string; // HH:mm
  birth_place?: string;
  
  // Метаданные
  created_at: string;
  updated_at: string;
  
  // Для финального события
  lantern_card_url?: string; // URL открытки-фонарика (после 12 февраля)
}

export interface AmuletParams {
  symbol: AmuletSymbol;
  color: string;
  bazi_element: BaziElement;
  wish_text: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  room_id?: string;
  // Новые поля для уровня 2
  symbol_id?: string; // ID символа из библиотеки
  symbol_name?: string; // Название символа для отображения
  material_id?: string; // ID материала
  level?: 1 | 2; // Уровень создания (1 - незарегистрированные, 2 - зарегистрированные)
  personalized?: boolean; // Персонализирован ли амулет
  task?: string; // Задача амулета
  priority_elements?: BaziElement[]; // Приоритетные элементы
}

// Цветовые палитры для каждого элемента
export const ELEMENT_COLORS: Record<BaziElement, Array<{ value: string; label: string; color: string }>> = {
  fire: [
    { value: '#DC2626', label: 'Красный', color: 'bg-red-600' },
    { value: '#EA580C', label: 'Оранжевый', color: 'bg-orange-600' },
    { value: '#F97316', label: 'Светло-оранжевый', color: 'bg-orange-500' },
    { value: '#EF4444', label: 'Ярко-красный', color: 'bg-red-500' },
    { value: '#B91C1C', label: 'Тёмно-красный', color: 'bg-red-700' },
  ],
  wood: [
    { value: '#16A34A', label: 'Зелёный', color: 'bg-green-600' },
    { value: '#22C55E', label: 'Светло-зелёный', color: 'bg-green-500' },
    { value: '#15803D', label: 'Тёмно-зелёный', color: 'bg-green-700' },
    { value: '#65A30D', label: 'Лайм', color: 'bg-lime-600' },
    { value: '#84CC16', label: 'Светло-лайм', color: 'bg-lime-500' },
  ],
  water: [
    { value: '#2563EB', label: 'Синий', color: 'bg-blue-600' },
    { value: '#3B82F6', label: 'Светло-синий', color: 'bg-blue-500' },
    { value: '#1E40AF', label: 'Тёмно-синий', color: 'bg-blue-700' },
    { value: '#0EA5E9', label: 'Голубой', color: 'bg-sky-500' },
    { value: '#0284C7', label: 'Тёмно-голубой', color: 'bg-sky-600' },
  ],
  earth: [
    { value: '#CA8A04', label: 'Золотой', color: 'bg-yellow-600' },
    { value: '#EAB308', label: 'Жёлтый', color: 'bg-yellow-500' },
    { value: '#A16207', label: 'Тёмно-жёлтый', color: 'bg-yellow-700' },
    { value: '#92400E', label: 'Коричневый', color: 'bg-amber-800' },
    { value: '#B45309', label: 'Светло-коричневый', color: 'bg-amber-700' },
  ],
  metal: [
    { value: '#64748B', label: 'Серебряный', color: 'bg-slate-500' },
    { value: '#475569', label: 'Тёмно-серебряный', color: 'bg-slate-600' },
    { value: '#F1F5F9', label: 'Белый', color: 'bg-slate-100' },
    { value: '#CBD5E1', label: 'Светло-серый', color: 'bg-slate-300' },
    { value: '#334155', label: 'Тёмно-серый', color: 'bg-slate-700' },
  ],
};

// Символы амулетов
export const AMULET_SYMBOLS: Array<{ value: AmuletSymbol; label: string; icon: string; description: string }> = [
  { value: 'horse', label: 'Лошадь', icon: '🐴', description: 'Символ года - Огненная Лошадь' },
  { value: 'dragon', label: 'Дракон', icon: '🐉', description: 'Сила и могущество' },
  { value: 'coin', label: 'Монета', icon: '🪙', description: 'Богатство и процветание' },
  { value: 'phoenix', label: 'Феникс', icon: '🦅', description: 'Удача и возрождение' },
];

// Элементы Бацзы
export const BAZI_ELEMENTS: Array<{ value: BaziElement; label: string; icon: string; description: string }> = [
  { value: 'fire', label: 'Огонь', icon: '🔥', description: 'Страсть, энергия, активность' },
  { value: 'wood', label: 'Дерево', icon: '🌳', description: 'Рост, развитие, творчество' },
  { value: 'water', label: 'Вода', icon: '💧', description: 'Мудрость, гибкость, поток' },
  { value: 'earth', label: 'Земля', icon: '⛰️', description: 'Стабильность, надёжность, практичность' },
  { value: 'metal', label: 'Металл', icon: '⚡', description: 'Сила, решительность, структура' },
];

