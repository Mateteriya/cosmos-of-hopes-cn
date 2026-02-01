'use client';

import React, { useState } from 'react';
import MapCanvas, { ViewMode } from './map/MapCanvas';
import BrainLandscape from './map/BrainLandscape';
import ViewModeSwitcher from './map/ViewModeSwitcher';

/**
 * Демо-компонент для визуализации карты сознания
 * 
 * Гибридный подход:
 * - Изометрическая карта (как SimCity)
 * - Нейронная сеть для связей
 * - Детализированная, но адаптивная
 * 
 * Фаза 1: 2D прототип (текущая)
 * Фаза 2: Улучшенная 2D версия
 * Фаза 3: Переход к 3D (Three.js)
 */
export default function QuestMapDemo() {
  const [viewMode, setViewMode] = useState<ViewMode>('universal');

  return (
    <div className="w-full h-full p-4 relative">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">
          🧠 Карта Сознания - Прототип
        </h1>
        <p className="text-gray-400">
          {viewMode === 'universal' 
            ? 'Универсальный вид: Изометрическая карта + Нейронная сеть'
            : 'Игровой вид: Мозг как ландшафт'
          }
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Используйте переключатель в правом верхнем углу для смены режима
        </p>
      </div>

      {/* Переключатель режимов */}
      <ViewModeSwitcher currentMode={viewMode} onModeChange={setViewMode} />

      {/* Рендерим соответствующий режим */}
      {viewMode === 'universal' ? (
        <MapCanvas viewMode={viewMode} />
      ) : (
        <BrainLandscape />
      )}

      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-2">
          📋 Статус прототипа
        </h2>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>✅ Изометрическая сетка</li>
          <li>✅ 4 сферы (Разум, Эмоции, Тело, Связи)</li>
          <li>✅ Базовые здания (изометрические формы)</li>
          <li>✅ Связи (нейронная сеть)</li>
          <li>✅ Анимация транспорта</li>
          <li>⏳ Детализация зданий (следующий шаг)</li>
          <li>⏳ Эволюция интерфейса (следующий шаг)</li>
        </ul>
      </div>
    </div>
  );
}
