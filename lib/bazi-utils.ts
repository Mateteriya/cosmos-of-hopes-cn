/**
 * Утилиты для работы с Бацзы
 */

import type { BaziElement } from '@/types/amulet';

/**
 * Преобразует русское название элемента в английский ключ
 */
export function mapElementToKey(russianElement: string): BaziElement | null {
  const map: Record<string, BaziElement> = {
    'Дерево': 'wood',
    'Огонь': 'fire',
    'Вода': 'water',
    'Земля': 'earth',
    'Металл': 'metal',
  };
  
  return map[russianElement] || null;
}

/**
 * Преобразует английский ключ элемента в русское название
 */
export function mapKeyToElement(key: BaziElement): string {
  const map: Record<BaziElement, string> = {
    'wood': 'Дерево',
    'fire': 'Огонь',
    'water': 'Вода',
    'earth': 'Земля',
    'metal': 'Металл',
  };
  
  return map[key];
}

