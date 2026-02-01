'use client';

import React from 'react';
import { ViewMode } from './MapCanvas';

interface ViewModeSwitcherProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

/**
 * Переключатель режимов визуализации
 * 
 * Режимы:
 * - Универсальный вид: Изометрическая карта + нейронная сеть
 * - Игровой вид: Мозг как ландшафт
 */
export default function ViewModeSwitcher({ currentMode, onModeChange }: ViewModeSwitcherProps) {
  return (
    <div className="absolute top-4 right-4 z-10 bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 border border-gray-700">
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange('universal')}
          className={`px-4 py-2 rounded transition-all ${
            currentMode === 'universal'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title="Универсальный вид: Изометрическая карта + нейронная сеть"
        >
          <span className="flex items-center gap-2">
            📊 Универсальный
          </span>
        </button>
        
        <button
          onClick={() => onModeChange('game')}
          className={`px-4 py-2 rounded transition-all ${
            currentMode === 'game'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title="Игровой вид: Мозг как ландшафт"
        >
          <span className="flex items-center gap-2">
            🎮 Игровой
          </span>
        </button>
      </div>
    </div>
  );
}
