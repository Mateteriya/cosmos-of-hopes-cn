'use client';

/**
 * Тестовая страница для проверки всех символов амулетов
 * Показывает все доступные картинки для проверки
 */

import { AmuletSymbolIcon, AmuletSymbolIconWithChoice } from '@/components/amulet/AmuletSymbolIcons';
import { useState } from 'react';

// Список всех символов для тестирования
const ALL_SYMBOLS = [
  // Дерево
  { id: 'tree', name: 'Дерево' },
  { id: 'anchor', name: 'Якорь' },
  { id: 'roots', name: 'Корни' },
  { id: 'bridge', name: 'Мост' },
  { id: 'ship', name: 'Корабль' },
  { id: 'tree_world', name: 'Мировое древо' },
  { id: 'axe', name: 'Топор' },
  { id: 'bow_arrow', name: 'Лук и стрела' },
  { id: 'sprout', name: 'Росток' },
  { id: 'leaf', name: 'Лист' },
  { id: 'nest', name: 'Гнездо' },
  { id: 'blossom', name: 'Цветущая ветвь' },
  { id: 'rainbow', name: 'Радуга' },
  { id: 'vine', name: 'Виноградная лоза' },
  { id: 'bow_arrow', name: 'Лук и стрела' },
  { id: 'fruit', name: 'Плод' },
  
  // Огонь
  { id: 'hammer', name: 'Молот' },
  { id: 'campfire', name: 'Костёр' },
  { id: 'fortress', name: 'Крепость' },
  { id: 'sun', name: 'Солнце' },
  { id: 'torch', name: 'Факел' },
  { id: 'ring', name: 'Кольцо' },
  { id: 'volcano', name: 'Вулкан' },
  { id: 'dragon', name: 'Дракон' },
  { id: 'candle', name: 'Свеча' },
  { id: 'heart', name: 'Сердце' },
  { id: 'lotus', name: 'Цветок лотоса' },
  { id: 'phoenix', name: 'Феникс' },
  { id: 'butterfly', name: 'Бабочка' },
  { id: 'eye', name: 'Глаз' },
  { id: 'crown', name: 'Корона' },
  
  // Земля
  { id: 'mountain', name: 'Гора' },
  { id: 'tower', name: 'Башня' },
  { id: 'crystal', name: 'Кристалл' },
  { id: 'labyrinth', name: 'Лабиринт' },
  { id: 'scales', name: 'Весы' }, // ДВЕ картинки
  { id: 'gear', name: 'Шестерня' },
  { id: 'fortress', name: 'Крепость' },
  { id: 'compass', name: 'Компас' },
  { id: 'garden', name: 'Сад' },
  { id: 'crystal_lattice', name: 'Кристаллическая решетка' },
  { id: 'fruit', name: 'Плод' },
  { id: 'house', name: 'Дом' },
  
  // Металл
  { id: 'nail', name: 'Гвоздь' },
  { id: 'cube', name: 'Куб' },
  { id: 'bell', name: 'Колокол' },
  { id: 'circle', name: 'Круг' },
  { id: 'sword', name: 'Меч' },
  { id: 'anvil', name: 'Наковальня' },
  { id: 'clock', name: 'Часы' },
  { id: 'key', name: 'Ключ' },
  { id: 'lock', name: 'Замок' },
  { id: 'small_bell', name: 'Колокольчик' },
  { id: 'mirror', name: 'Зеркало' },
  { id: 'coin', name: 'Монета' },
  { id: 'dagger', name: 'Кинжал' },
  { id: 'scissors', name: 'Ножницы' },
  
  // Вода
  { id: 'helm', name: 'Штурвал' },
  { id: 'sail', name: 'Парус' },
  { id: 'turtle', name: 'Черепаха' },
  { id: 'fish', name: 'Рыба' },
  { id: 'wave', name: 'Волна' },
  { id: 'ice', name: 'Лёд' },
  { id: 'trident', name: 'Трезубец' },
  { id: 'shell', name: 'Морская Раковина' },
  { id: 'drop', name: 'Капля' },
  { id: 'swan', name: 'Лебедь' },
  { id: 'moon', name: 'Луна' },
  { id: 'pearl', name: 'Жемчужина' },
  { id: 'vase', name: 'Кувшин' },
  
  // Уровень 1
  { id: 'horse', name: 'Лошадь' },
  { id: 'fire_horse', name: 'Огненная Лошадь' },
  { id: 'horseshoe', name: 'Подкова' },
];

export default function TestAmuletsPage() {
  const [scalesImageIndex, setScalesImageIndex] = useState(0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🧪 Тестовая страница символов амулетов
        </h1>
        
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border-2 border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            Символ "Весы" - Выбор между двумя картинками
          </h2>
          <div className="flex items-center gap-6">
            <div className="bg-white/5 p-4 rounded-lg border-2 border-white/20">
              <AmuletSymbolIconWithChoice
                symbolId="scales"
                size={96}
                selectedImageIndex={scalesImageIndex}
                onImageChange={setScalesImageIndex}
              />
              <p className="text-white text-center mt-2">Вариант {scalesImageIndex + 1}</p>
            </div>
            <div className="text-white">
              <p className="mb-2">Нажмите на точки ниже для переключения между картинками:</p>
              <div className="flex gap-2">
                {[0, 1].map((index) => (
                  <button
                    key={index}
                    onClick={() => setScalesImageIndex(index)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      index === scalesImageIndex
                        ? 'bg-yellow-400 border-yellow-400'
                        : 'bg-transparent border-gray-400'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {ALL_SYMBOLS.map((symbol) => (
            <div
              key={symbol.id}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border-2 border-white/20 hover:border-yellow-400 transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white/5 p-3 rounded-lg">
                  {symbol.id === 'scales' ? (
                    <AmuletSymbolIconWithChoice
                      symbolId={symbol.id}
                      size={64}
                      selectedImageIndex={scalesImageIndex}
                    />
                  ) : (
                    <AmuletSymbolIcon symbolId={symbol.id} size={64} />
                  )}
                </div>
                <div className="text-white text-center">
                  <div className="font-semibold text-sm">{symbol.name}</div>
                  <div className="text-xs text-white/60 mt-1">ID: {symbol.id}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-green-900/30 backdrop-blur-md rounded-xl p-6 border-2 border-green-500/50">
          <h2 className="text-xl font-bold text-white mb-4">✅ Проверка:</h2>
          <ul className="text-white space-y-2">
            <li>✓ Все символы отображаются с картинками</li>
            <li>✓ "Морская Раковина" (shell) отображается с правильным названием</li>
            <li>✓ "Кристаллическая решетка" (crystal_lattice) заменяет "Ловец снов"</li>
            <li>✓ "Весы" (scales) позволяет выбирать между двумя картинками</li>
            <li>✓ Все картинки загружаются из папки /pictures/</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
