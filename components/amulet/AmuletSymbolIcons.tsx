/**
 * Компонент для отображения иконок символов амулетов
 * Использует картинки из папки /pictures
 */

'use client';

import Image from 'next/image';
import type { BaziElement } from '@/types/amulet';
import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Маппинг символов на файлы картинок
export const SYMBOL_IMAGE_MAP: Record<string, string[]> = {
  // Дерево
  'tree': ['дерево.png'],
  'anchor': ['якорь.png'],
  'roots': ['корни.png'],
  'bridge': ['мост.png'],
  'ship': ['корабль.png'],
  'tree_world': ['мировое дерево.png'],
  'axe': ['топор.png'],
  'bow': ['лук и стрела.png'], // Лук использует ту же картинку, что и лук со стрелой
  'bow_arrow': ['лук и стрела.png'],
  'sprout': ['росток..png'],
  'leaf': ['лист.png'],
  'nest': ['гнездо.png'],
  'blossom': ['цветущая веточкаr.png'],
  'rainbow': ['радуга.png'],
  'vine': ['виноградная лоза.png'],
  'fruit': ['плод.png'],

  // Огонь
  'hammer': ['молот.png'],
  'campfire': ['костер.png'],
  'fortress': ['крепость.png'],
  'sun': ['солнце.png'],
  'torch': ['факел.png'],
  'ring': ['кольцо.png'],
  'volcano': ['вулкан.gif'], // GIF для панельки выбора символов
  'dragon': ['дракон.png'],
  'phoenix': ['феникс.png'],
  'candle': ['свеча.png'],
  'heart': ['сердце.png'],
  'lotus': ['цветок лотоса.png'],
  'butterfly': ['бабочка.png'],
  'eye': ['глаз.png'],
  'crown': ['корона27.png'],

  // Земля
  'mountain': ['гора.png'],
  'tower': ['башня.png'],
  'crystal': ['кристалл.png'],
  'labyrinth': ['лабиринт.png'],
  'scales': ['весы.png', 'весы1.png'], // ДВЕ картинки для выбора
  'gear': ['шестерня.png'],
  'compass': ['компас.png'],
  'garden': ['сад.png'],
  'house': ['дом.png'],
  'crystal_lattice': ['КРИСТАЛЛИЧЕСКАЯ РЕШЕТКА.png'],
  'dreamcatcher': ['КРИСТАЛЛИЧЕСКАЯ РЕШЕТКА.png'], // Старый ID для обратной совместимости

  // Металл
  'nail': ['гвоздь.png'],
  'cube': ['куб.png'],
  'bell': ['колокол.png'],
  'circle': ['круг.png'],
  'sword': ['кинжал.png'],
  'anvil': ['наковальня.png'],
  'clock': ['часы.png'],
  'key': ['ключ.png'],
  'lock': ['замок.png'],
  'small_bell': ['колоколчик.png'],
  'mirror': ['зеркало.png'],
  'coin': ['моента.png'],
  'dagger': ['кинжал.png'],
  'scissors': ['ножницы.png'],
  'turtle': ['черепаха.png'],

  // Вода
  'helm': ['штурвал.png'],
  'sail': ['парус.png'],
  'fish': ['рыба.png'],
  'wave': ['волна.png'],
  'ice': ['лед.png'],
  'trident': ['трезубец.png'],
  'shell': ['раковина.png'],
  'drop': ['капля.png'],
  'swan': ['лебедь.png'],
  'moon': ['луна.png'],
  'pearl': ['жемчужина.png'],
  'vase': ['кувшин.png'],

  // Уровень 1
  'horse': ['лошадь.png'],
  'horseshoe': ['подкова.png'],
  'fire_horse': ['огненная лошадь.png'], // Огненная лошадь для уровня 1 и уровня 2
};

// Маппинг символов для 3D преобразования (использует PNG вместо GIF для вулкана)
export const SYMBOL_IMAGE_MAP_3D: Record<string, string[]> = {
  ...SYMBOL_IMAGE_MAP,
  'volcano': ['вулкан.png'], // PNG для 3D преобразования и дальнейшего использования
};

// Компонент для отображения иконки символа
export function AmuletSymbolIcon({ 
  symbolId, 
  className = '', 
  size = 48,
  use3D = false // Если true, использует PNG для вулкана (для 3D и дальнейшего использования)
}: { 
  symbolId: string; 
  className?: string; 
  size?: number;
  use3D?: boolean;
}) {
  // Для 3D и дальнейшего использования используем отдельный маппинг (PNG для вулкана)
  const imageMap = use3D ? SYMBOL_IMAGE_MAP_3D : SYMBOL_IMAGE_MAP;
  const imageFiles = imageMap[symbolId];
  
  if (!imageFiles || imageFiles.length === 0) {
    // Если картинка не найдена, возвращаем простой круг
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="w-3/4 h-3/4 rounded-full border-2 border-current"></div>
      </div>
    );
  }

  // Если есть несколько картинок (например, для весов), используем первую по умолчанию
  // Пользователь сможет выбрать другую через отдельный компонент
  const imageFile = imageFiles[0];
  
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={`/pictures/${imageFile}`}
        alt={symbolId}
        width={size}
        height={size}
        className="object-contain"
        style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}

// Компонент для выбора между несколькими вариантами картинок (для весов)
export function AmuletSymbolIconWithChoice({ 
  symbolId, 
  className = '', 
  size = 48,
  selectedImageIndex = 0,
  onImageChange,
  use3D = false // Если true, использует PNG для вулкана (для 3D и дальнейшего использования)
}: { 
  symbolId: string; 
  className?: string; 
  size?: number;
  selectedImageIndex?: number;
  onImageChange?: (index: number) => void;
  use3D?: boolean;
}) {
  // Для 3D и дальнейшего использования используем отдельный маппинг (PNG для вулкана)
  const imageMap = use3D ? SYMBOL_IMAGE_MAP_3D : SYMBOL_IMAGE_MAP;
  const imageFiles = imageMap[symbolId];
  
  if (!imageFiles || imageFiles.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="w-3/4 h-3/4 rounded-full border-2 border-current"></div>
      </div>
    );
  }

  // Если есть только одна картинка, используем обычный компонент
  if (imageFiles.length === 1) {
    return <AmuletSymbolIcon symbolId={symbolId} className={className} size={size} use3D={use3D} />;
  }

  // Если есть несколько картинок, показываем все варианты для выбора
  const currentImage = imageFiles[selectedImageIndex] || imageFiles[0];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div 
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Image
          src={`/pictures/${currentImage}`}
          alt={symbolId}
          width={size}
          height={size}
          className="object-contain"
          style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
      {imageFiles.length > 1 && onImageChange && (
        <div className="flex gap-1">
          {imageFiles.map((file, index) => (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation(); // Предотвращаем всплытие события
                onImageChange(index);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onImageChange(index);
                }
              }}
              className={`w-3 h-3 rounded-full border-2 cursor-pointer transition-all hover:scale-110 ${
                index === selectedImageIndex 
                  ? 'bg-white border-white' 
                  : 'bg-transparent border-gray-400 hover:border-gray-300'
              }`}
              title={`Вариант ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Маппинг элементов Бацзы к файлам изображений
const ELEMENT_IMAGE_MAP: Record<BaziElement, string> = {
  fire: 'огонь.png',
  wood: 'дерево-элемент.png', // Особое имя для дерева, как указал пользователь
  water: 'вода.png',
  earth: 'земля.png',
  metal: 'металл.png',
};

// Компонент для отображения иконки элемента Бацзы
export function BaziElementIcon({ 
  element, 
  className = '', 
  size = 48 
}: { 
  element: BaziElement; 
  className?: string; 
  size?: number;
}) {
  const imageFile = ELEMENT_IMAGE_MAP[element];
  
  if (!imageFile) {
    // Fallback на эмодзи, если картинка не найдена
    const emojiMap: Record<BaziElement, string> = {
      fire: '🔥',
      wood: '🌳',
      water: '💧',
      earth: '⛰️',
      metal: '⚡',
    };
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size, fontSize: `${size * 0.75}px` }}
      >
        {emojiMap[element]}
      </div>
    );
  }
  
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={`/pictures/${imageFile}`}
        alt={element}
        width={size}
        height={size}
        className="object-contain"
        style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}

// Экспортируем для обратной совместимости
export default AmuletSymbolIcon;
