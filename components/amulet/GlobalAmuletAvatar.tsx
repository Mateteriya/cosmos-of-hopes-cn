'use client';

/**
 * Глобальный компонент для отображения отправленного амулета вверху всех страниц
 * Отображается как аватарка пользователя
 */

import { useState, useEffect } from 'react';
import { AmuletSymbolIcon, AmuletSymbolIconWithChoice } from './AmuletSymbolIcons';
import { AMULET_SYMBOLS } from '@/types/amulet';
import { LEVEL1_ADDITIONAL_SYMBOLS } from '@/lib/amulet-library';

interface GlobalAmuletAvatarProps {
  amuletData?: {
    symbol: string;
    symbolName?: string;
    symbolId?: string;
    color: string;
    wishText?: string;
  } | null;
  position?: 'center' | 'right';
}

export default function GlobalAmuletAvatar({ amuletData, position = 'center' }: GlobalAmuletAvatarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scalesImageIndex, setScalesImageIndex] = useState(0);

  // Если амулета нет, не отображаем компонент
  if (!amuletData) {
    return null;
  }

  // Находим ID символа для отображения
  const allSymbols = [
    ...AMULET_SYMBOLS,
    ...LEVEL1_ADDITIONAL_SYMBOLS.map((sym) => ({
      value: sym.id,
      label: sym.name,
    })),
  ];
  const symbol = allSymbols.find(
    (s) => s.value === amuletData.symbol || s.value === amuletData.symbolId || s.label === amuletData.symbolName
  );
  const symbolId = symbol?.value || amuletData.symbolId || amuletData.symbol || '';

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCloseExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  return (
    <>
      {/* Компактный вид - всегда вверху, по центру, но правее центра (чтобы не перекрывать заголовки) */}
      <div
        className="fixed top-4 z-40 left-1/2 -translate-x-1/2 sm:left-[calc(50%+200px)] sm:translate-x-0 md:left-[calc(50%+300px)]"
      >
        <button
          onClick={handleClick}
          className="group relative transition-all transform hover:scale-110 active:scale-95"
          title="Ваш амулет из Звёздного неба (нажмите для увеличения)"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-3 border-white/30 backdrop-blur-sm transition-all group-hover:border-white/60"
            style={{
              backgroundColor: amuletData.color,
              borderColor: `${amuletData.color}CC`,
              boxShadow: `0 0 20px ${amuletData.color}80, 0 0 40px ${amuletData.color}40`,
            }}
          >
            {symbolId === 'scales' ? (
              <AmuletSymbolIconWithChoice
                symbolId={symbolId}
                size={32}
                selectedImageIndex={scalesImageIndex}
                onImageChange={setScalesImageIndex}
                use3D={true}
              />
            ) : (
              <AmuletSymbolIcon symbolId={symbolId} size={32} use3D={true} />
            )}
          </div>
          {/* Индикатор, что это можно кликнуть */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
        </button>
      </div>

      {/* Расширенный вид - модальное окно при клике */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4"
          onClick={handleCloseExpanded}
        >
          <div
            className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-md border-4 rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закрытия */}
            <button
              onClick={handleCloseExpanded}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all transform hover:scale-110"
              title="Закрыть"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Амулет крупным планом */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div
                  className="w-48 h-48 rounded-full flex items-center justify-center shadow-2xl border-4 animate-pulse"
                  style={{
                    backgroundColor: amuletData.color,
                    borderColor: `${amuletData.color}CC`,
                    boxShadow: `0 0 60px ${amuletData.color}80, 0 0 120px ${amuletData.color}40`,
                  }}
                >
                  {symbolId === 'scales' ? (
                    <AmuletSymbolIconWithChoice
                      symbolId={symbolId}
                      size={128}
                      selectedImageIndex={scalesImageIndex}
                      onImageChange={setScalesImageIndex}
                      use3D={true}
                    />
                  ) : (
                    <AmuletSymbolIcon symbolId={symbolId} size={128} use3D={true} />
                  )}
                </div>
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: amuletData.color }}
                ></div>
              </div>

              {/* Информация об амулете */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">{amuletData.symbolName || amuletData.symbol}</h3>
                {amuletData.wishText && (
                  <div className="text-white/80 text-sm italic max-w-xs">
                    "{amuletData.wishText}"
                  </div>
                )}
                <div className="text-yellow-300/90 text-xs font-semibold mt-4 pt-4 border-t border-white/20">
                  ✨ Ваш амулет в Звёздном небе ✨
                </div>
                <p className="text-white/60 text-xs">
                  Этот амулет стал частью коллективного ритуала
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
