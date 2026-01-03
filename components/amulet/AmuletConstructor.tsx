'use client';

/**
 * Конструктор амулетов (китайская версия)
 * Упрощённая версия для создания амулетов с китайскими символами
 */

import { useState } from 'react';
import type { AmuletParams, AmuletSymbol, BaziElement } from '@/types/amulet';
import { ELEMENT_COLORS, AMULET_SYMBOLS, BAZI_ELEMENTS } from '@/types/amulet';
import MagicAmuletTransformation from './MagicAmuletTransformation';

interface AmuletConstructorProps {
  onSave: (params: AmuletParams) => Promise<void>;
}

export default function AmuletConstructor({ onSave }: AmuletConstructorProps) {
  // Шаг 1: Элемент Бацзы (пока упрощённо - выбор вручную)
  const [baziElement, setBaziElement] = useState<BaziElement | null>(null);
  
  // Шаг 2: Символ амулета
  const [symbol, setSymbol] = useState<AmuletSymbol | null>(null);
  
  // Шаг 3: Цвет (из палитры элемента)
  const [color, setColor] = useState<string>('#DC2626');
  
  // Шаг 4: Желание
  const [wishText, setWishText] = useState('');
  
  // Состояние загрузки
  const [isSaving, setIsSaving] = useState(false);
  
  // Состояние магического превращения
  const [showMagicTransformation, setShowMagicTransformation] = useState(false);
  const [hasTransformed, setHasTransformed] = useState(false);

  // Получаем цвета для выбранного элемента
  const availableColors = baziElement ? ELEMENT_COLORS[baziElement] : [];

  const handleMagicTransformation = () => {
    if (!baziElement || !symbol || !wishText.trim()) {
      alert('Пожалуйста, заполните все поля перед магическим превращением');
      return;
    }
    setShowMagicTransformation(true);
  };

  const handleTransformationComplete = async () => {
    setShowMagicTransformation(false);
    setHasTransformed(true);
    
    // После завершения превращения - сохраняем
    if (!baziElement || !symbol || !wishText.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        symbol,
        color,
        bazi_element: baziElement,
        wish_text: wishText,
      });
    } catch (error) {
      console.error('Ошибка сохранения амулета:', error);
      alert('Ошибка при сохранении амулета');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
          创建护身符
        </h1>
        <p className="text-white/70 text-lg">Создайте свой амулет желания</p>
      </div>

      {/* Шаг 1: Выбор элемента Бацзы */}
      <div className="bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>1️⃣</span>
          <span>Выберите элемент удачи</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {BAZI_ELEMENTS.map((element) => (
            <button
              key={element.value}
              onClick={() => setBaziElement(element.value)}
              className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                baziElement === element.value
                  ? 'border-yellow-400 bg-yellow-500/20 shadow-lg'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-4xl mb-2">{element.icon}</div>
              <div className="text-white font-semibold text-sm">{element.label}</div>
              <div className="text-white/60 text-xs mt-1">{element.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Шаг 2: Выбор символа амулета (показываем только после выбора элемента) */}
      {baziElement && (
        <div className="bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>2️⃣</span>
            <span>Выберите символ амулета</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AMULET_SYMBOLS.map((sym) => (
              <button
                key={sym.value}
                onClick={() => setSymbol(sym.value)}
                className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  symbol === sym.value
                    ? 'border-yellow-400 bg-yellow-500/20 shadow-lg'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-5xl mb-2">{sym.icon}</div>
                <div className="text-white font-semibold">{sym.label}</div>
                <div className="text-white/60 text-xs mt-1">{sym.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Шаг 3: Выбор цвета (показываем только после выбора символа) */}
      {symbol && baziElement && (
        <div className="bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>3️⃣</span>
            <span>Выберите цвет (из палитры {BAZI_ELEMENTS.find(e => e.value === baziElement)?.label})</span>
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {availableColors.map((col) => (
              <button
                key={col.value}
                onClick={() => setColor(col.value)}
                className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  color === col.value
                    ? 'border-yellow-400 shadow-lg ring-2 ring-yellow-400/50'
                    : 'border-white/20'
                }`}
                style={{ backgroundColor: col.value }}
                title={col.label}
              >
                <div className="w-full h-12 rounded-lg bg-white/20"></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Шаг 4: Ввод желания (показываем только после выбора цвета) */}
      {color && symbol && (
        <div className="bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>4️⃣</span>
            <span>Ваше желание на 2026 год</span>
          </h2>
          <textarea
            value={wishText}
            onChange={(e) => setWishText(e.target.value)}
            placeholder="Опишите ваше желание на 2026 год..."
            className="w-full min-h-[120px] p-4 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 resize-none"
            maxLength={200}
          />
          <div className="text-right text-white/60 text-sm mt-2">
            {wishText.length}/200
          </div>
        </div>
      )}

      {/* Предпросмотр амулета */}
      {symbol && color && baziElement && (
        <div className="bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">✨ Предпросмотр амулета ✨</h2>
          <div className="flex flex-col items-center gap-6">
            {/* Амулет с эффектом свечения */}
            <div className="relative">
              <div
                className="w-40 h-40 rounded-full flex items-center justify-center text-7xl shadow-2xl border-4 animate-pulse"
                style={{ 
                  backgroundColor: color,
                  borderColor: `${color}CC`,
                  boxShadow: `0 0 40px ${color}80, 0 0 80px ${color}40`,
                }}
              >
                {AMULET_SYMBOLS.find(s => s.value === symbol)?.icon}
              </div>
              {/* Дополнительное свечение */}
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ backgroundColor: color }}
              ></div>
            </div>
            
            {/* Информация об амулете */}
            <div className="text-center space-y-2">
              <div className="text-white font-bold text-2xl">
                {AMULET_SYMBOLS.find(s => s.value === symbol)?.label}
              </div>
              <div className="flex items-center justify-center gap-2 text-white/80">
                <span className="text-2xl">{BAZI_ELEMENTS.find(e => e.value === baziElement)?.icon}</span>
                <span className="text-lg">Элемент: {BAZI_ELEMENTS.find(e => e.value === baziElement)?.label}</span>
              </div>
              {wishText && (
                <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20">
                  <div className="text-white/90 text-sm italic">
                    "{wishText}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Кнопка магического превращения */}
      {symbol && color && baziElement && wishText.trim() && !hasTransformed && (
        <div className="flex justify-center">
          <button
            onClick={handleMagicTransformation}
            disabled={isSaving}
            className="px-8 py-4 bg-gradient-to-r from-yellow-500 via-red-500 to-orange-500 text-white font-bold text-xl rounded-xl shadow-2xl hover:from-yellow-600 hover:via-red-600 hover:to-orange-600 transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
          >
            🪄 魔力转换 - Магическое Превращение 🪄
          </button>
        </div>
      )}

      {/* Кнопка сохранения (после превращения) */}
      {hasTransformed && (
        <div className="flex justify-center">
          <div className="text-center space-y-4">
            <div className="text-white text-2xl font-bold animate-pulse">
              ✨ Амулет создан! ✨
            </div>
            {isSaving && (
              <div className="text-white/70">
                Сохранение...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Магическое превращение */}
      {showMagicTransformation && baziElement && symbol && (
        <MagicAmuletTransformation
          symbol={symbol}
          color={color}
          baziElement={baziElement}
          wishText={wishText}
          onComplete={handleTransformationComplete}
          onClose={() => setShowMagicTransformation(false)}
        />
      )}
    </div>
  );
}

