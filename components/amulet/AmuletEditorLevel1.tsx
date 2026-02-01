'use client';

/**
 * Редактор амулетов - Уровень 1 (для незарегистрированных пользователей)
 * Интуитивный выбор с поэтическими прогнозами
 */

import { useState, useMemo, useRef } from 'react';
import { BAZI_ELEMENTS, AMULET_SYMBOLS, type BaziElement } from '@/types/amulet';
import { POETIC_FORECASTS, LEVEL1_ADDITIONAL_SYMBOLS, COLOR_ENERGY_GROUPS, getAllSymbolsForLevel2 } from '@/lib/amulet-library';
import { AmuletSymbolIcon, AmuletSymbolIconWithChoice, BaziElementIcon } from './AmuletSymbolIcons';
import { AMULET_ELEMENTS, PREMIUM_ELEMENTS, getDefaultElement, type AmuletElement } from '@/lib/amulet-elements';
import { AMULET_PATTERNS, getDefaultPattern, type AmuletPattern } from '@/lib/amulet-patterns';
import ElementPreview from './ElementPreview';
import PatternPreview from './PatternPreview';
import AmuletPreviewWithOrnament from './AmuletPreviewWithOrnament';

interface AmuletEditorLevel1Props {
  onComplete: (data: {
    element: BaziElement;
    symbol: string;
    color: string;
    wishText: string;
    blessingText?: string;
    elementId?: string; // ID выбранного узора
    patternId?: string; // ID выбранного орнамента (непрерывной линии)
    scalesImageIndex?: number; // Индекс выбранной картинки для символа "весы"
  }) => void;
  onRequestPersonalized?: () => void; // Для призыва к регистрации
  hidePreview?: boolean; // Скрыть предпросмотр (после превращения)
  isAuthenticated?: boolean; // Для зарегистрированных пользователей - показывать все символы
  gender?: 'male' | 'female'; // Гендер для фильтрации символов (если зарегистрирован)
}

export default function AmuletEditorLevel1({ onComplete, onRequestPersonalized, hidePreview = false, isAuthenticated = false, gender = 'male' }: AmuletEditorLevel1Props) {
  const [selectedBaziElement, setSelectedBaziElement] = useState<BaziElement | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [wishText, setWishText] = useState('');
  const [blessingText, setBlessingText] = useState('');
  const [scalesImageIndex, setScalesImageIndex] = useState(0); // Для выбора между двумя картинками весов
  const [selectedElement, setSelectedElement] = useState<AmuletElement>(getDefaultElement()); // Выбранный узор
  const [selectedPattern, setSelectedPattern] = useState<AmuletPattern>(getDefaultPattern()); // Выбранный орнамент (непрерывная линия)
  const [expandedColor, setExpandedColor] = useState<string | null>(null); // Для расширения кнопки с названием цвета на мобильных
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null); // Для расширения кнопки с описанием
  const [showWishMessage, setShowWishMessage] = useState(false); // Для показа сообщения о необходимости ввода желания
  const wishPanelRef = useRef<HTMLDivElement>(null); // Ref для панели ввода желания

  // Получаем все символы (для зарегистрированных - все из библиотеки, для незарегистрированных - базовый набор)
  const allSymbols = useMemo(() => {
    if (isAuthenticated) {
      // Для зарегистрированных - все символы из библиотеки
      const librarySymbols = getAllSymbolsForLevel2(gender);
      const seen = new Set<string>();
      const result: Array<{ value: string; label: string; icon: string; description: string }> = [];
      
      // Собираем уникальные символы
      librarySymbols.forEach(sym => {
        if (!seen.has(sym.id)) {
          seen.add(sym.id);
          result.push({
            value: sym.id,
            label: sym.name,
            icon: sym.icon,
            description: sym.description,
          });
        }
      });
      
      return result;
    } else {
      // Для незарегистрированных - базовый набор без дубликатов
      const seen = new Set<string>();
      const result: Array<{ value: string; label: string; icon: string; description: string }> = [];
      
      // Добавляем базовые символы
      AMULET_SYMBOLS.forEach(sym => {
        if (!seen.has(sym.value)) {
          seen.add(sym.value);
          result.push(sym);
        }
      });
      
      // Добавляем дополнительные, исключая дубликаты
      LEVEL1_ADDITIONAL_SYMBOLS.forEach(sym => {
        if (!seen.has(sym.id)) {
          seen.add(sym.id);
          result.push({
            value: sym.id,
            label: sym.name,
            icon: sym.icon,
            description: sym.description,
          });
        }
      });
      
      return result;
    }
  }, [isAuthenticated, gender]);

  // Получаем поэтический прогноз
  const poeticForecast = selectedBaziElement ? POETIC_FORECASTS[selectedBaziElement] : null;

  const handleWishRequired = () => {
    if (!wishText.trim()) {
      setShowWishMessage(true);
      // Прокрутка к панели ввода желания
      if (window.innerWidth >= 768) {
        // На десктопе используем более точную прокрутку
        const element = wishPanelRef.current;
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - 150; // Отступ 150px сверху
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      } else {
        // На мобильных используем стандартную прокрутку
        wishPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Скрыть сообщение через 3 секунды
      setTimeout(() => setShowWishMessage(false), 3000);
    }
  };

  const handleFinish = () => {
    if (selectedBaziElement && selectedSymbol && selectedColor && wishText.trim()) {
      onComplete({
        element: selectedBaziElement,
        symbol: selectedSymbol,
        color: selectedColor,
        wishText: wishText.trim(),
        blessingText: blessingText.trim() || undefined,
        elementId: selectedElement.id !== 'none' ? selectedElement.id : undefined,
        patternId: selectedPattern.id !== 'none' ? selectedPattern.id : undefined,
        scalesImageIndex: scalesImageIndex,
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Панель ввода желания - на самом верху */}
      <div ref={wishPanelRef} className={`w-full bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 relative ${
        !wishText.trim() 
          ? 'border-2 border-yellow-400 ring-1 ring-yellow-400/30 shadow-[0_0_8px_rgba(250,204,21,0.25)]' 
          : 'border-2 border-yellow-500/50'
      }`}>
        <h2 className="text-sm md:text-xl font-bold text-white mb-2 md:mb-3 text-center flex items-center justify-center gap-2">
          <span>Желание 2026</span>
          <span className="text-red-400 text-lg md:text-2xl" title="Обязательное поле">*</span>
        </h2>
        {!wishText.trim() && (
          <div className="mb-2 text-center">
            <p className="text-yellow-300 text-xs md:text-sm font-semibold">
              ⚠️ Без желания амулет нельзя преобразовать в 3D или отправить в хранилище
            </p>
          </div>
        )}
        {showWishMessage && (
          <div className="mb-2 text-center animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-yellow-400 text-xs md:text-sm font-bold bg-yellow-400/20 px-3 py-2 rounded-lg border border-yellow-400/50">
              ⚠️ Необходимо добавить Желание
            </p>
          </div>
        )}
        <textarea
          value={wishText}
          onChange={(e) => setWishText(e.target.value)}
          placeholder="Опишите ваше желание..."
          className={`w-full min-h-[60px] md:min-h-[80px] p-2 md:p-3 rounded-lg md:rounded-xl bg-white/10 text-white placeholder-white/50 focus:outline-none resize-none text-sm md:text-base ${
            !wishText.trim()
              ? 'border-2 border-yellow-400 ring-2 ring-yellow-400/50'
              : 'border-2 border-white/20 focus:border-yellow-400'
          }`}
          maxLength={200}
        />
        <div className="text-right text-white/60 text-xs md:text-sm mt-1">{wishText.length}/200</div>

        <div className="mt-2 md:mt-3">
          <h3 className="text-xs md:text-base font-bold text-white mb-1 md:mb-2">Пожелание (опц.)</h3>
          <textarea
            value={blessingText}
            onChange={(e) => setBlessingText(e.target.value)}
            placeholder="Пожелание для кого-то..."
            className="w-full min-h-[50px] md:min-h-[70px] p-2 md:p-3 rounded-lg md:rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 resize-none text-sm md:text-base"
            maxLength={200}
          />
          <div className="text-right text-white/60 text-xs md:text-sm mt-1">{blessingText.length}/200</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
        {/* Мобильная версия: предпросмотр sticky сверху */}
      {!hidePreview && (
        <div className="w-full md:hidden sticky top-0 z-20 mb-2 pb-2 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent">
          <div className="bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-xl p-3 max-w-xs mx-auto">
            <h2 className="text-sm font-bold text-white mb-2 text-center">✨ Предпросмотр ✨</h2>
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <AmuletPreviewWithOrnament
                  symbolId={selectedSymbol || ''}
                  color={selectedColor || '#DC2626'}
                  elementId={selectedElement.id !== 'none' ? selectedElement.id : undefined}
                  patternId={selectedPattern.id !== 'none' ? selectedPattern.id : undefined}
                  size={100}
                  scalesImageIndex={scalesImageIndex}
                  onScalesImageChange={setScalesImageIndex}
                />
                {selectedColor && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none"
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                )}
              </div>
              {selectedSymbol && selectedBaziElement ? (
                <>
                  <div className="text-center space-y-1">
                    <div className="text-white font-bold text-sm">
                      {allSymbols.find((s) => s.value === selectedSymbol)?.label}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-white/80">
                      <BaziElementIcon element={selectedBaziElement} size={20} />
                      <span className="text-xs">
                        {BAZI_ELEMENTS.find((e) => e.value === selectedBaziElement)?.label}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-white/60 text-xs">
                    Выберите элемент, символ и цвет
                  </div>
                </div>
              )}
              {/* Кнопка завершения */}
              {selectedBaziElement && selectedSymbol && selectedColor && (
                <button
                  onClick={!wishText.trim() ? handleWishRequired : handleFinish}
                  className={`w-full px-4 py-2 text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg transition-all transform shadow-lg ${
                    !wishText.trim() 
                      ? 'opacity-50 cursor-pointer' 
                      : 'hover:from-yellow-600 hover:to-orange-600 hover:scale-105'
                  }`}
                >
                  ✨ Завершить ✨
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Десктопная версия: левая часть - закрепленный предпросмотр */}
      {!hidePreview && (
        <div className="hidden md:block sticky top-4 self-start flex-shrink-0 w-80">
          <div className="bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 text-center">✨ Предпросмотр амулета ✨</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <AmuletPreviewWithOrnament
                  symbolId={selectedSymbol || ''}
                  color={selectedColor || '#DC2626'}
                  elementId={selectedElement.id !== 'none' ? selectedElement.id : undefined}
                  patternId={selectedPattern.id !== 'none' ? selectedPattern.id : undefined}
                  size={200}
                  scalesImageIndex={scalesImageIndex}
                  onScalesImageChange={setScalesImageIndex}
                />
                {selectedColor && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none"
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                )}
              </div>
              {selectedSymbol && selectedBaziElement ? (
                <>
                  <div className="text-center space-y-2">
                    <div className="text-white font-bold text-2xl">
                      {allSymbols.find((s) => s.value === selectedSymbol)?.label}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white/80">
                      <BaziElementIcon element={selectedBaziElement} size={32} />
                      <span className="text-lg">
                        Элемент: {BAZI_ELEMENTS.find((e) => e.value === selectedBaziElement)?.label}
                      </span>
                    </div>
                  </div>
                  {/* Описание амулета */}
                  {selectedColor && (
                    <div className="mt-2 p-3 bg-white/10 rounded-xl border border-white/20 max-w-xs">
                      <p className="text-white/90 text-sm text-center italic">
                        Ваш амулет — <strong>{allSymbols.find((s) => s.value === selectedSymbol)?.label}</strong> в{' '}
                        <strong style={{ color: selectedColor }}>
                          {COLOR_ENERGY_GROUPS.warm.colors.find((c) => c.value === selectedColor)?.label ||
                            COLOR_ENERGY_GROUPS.cold.colors.find((c) => c.value === selectedColor)?.label ||
                            COLOR_ENERGY_GROUPS.neutral.colors.find((c) => c.value === selectedColor)?.label ||
                            COLOR_ENERGY_GROUPS.neon?.colors.find((c) => c.value === selectedColor)?.label ||
                            COLOR_ENERGY_GROUPS.gradients?.colors.find((c) => c.value === selectedColor)?.label ||
                            'выбранных'}
                        </strong>{' '}
                        тонах. Это символ вашего пути в 2026 году.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center space-y-2">
                  <div className="text-white/60 text-sm">
                    Выберите элемент, символ и цвет для предпросмотра
                  </div>
                </div>
              )}
              {/* Кнопка завершения */}
              {selectedBaziElement && selectedSymbol && selectedColor && (
                <button
                  onClick={!wishText.trim() ? handleWishRequired : handleFinish}
                  className={`w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl transition-all transform shadow-lg mt-4 ${
                    !wishText.trim() 
                      ? 'opacity-50 cursor-pointer' 
                      : 'hover:from-yellow-600 hover:to-orange-600 hover:scale-105'
                  }`}
                >
                  ✨ Завершить создание ✨
                </button>
              )}
              {/* Кнопка призыва к регистрации */}
              {onRequestPersonalized && (
                <div className="text-center w-full mt-2">
                  <button
                    onClick={onRequestPersonalized}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                  >
                    🔮 Узнать персональный амулет
                  </button>
                  <p className="text-white/70 text-xs mt-2">
                    Зарегистрируйтесь, чтобы получить амулет на основе вашей карты Бацзы
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Все шаги создания */}
      <div className="flex-1 space-y-2 md:space-y-6 relative w-full mt-0 md:mt-0">
        {/* Шаг 1: Элемент удачи - всегда видим */}
      <div className="bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-xl md:rounded-2xl p-3 md:p-6">
        <h2 className="text-sm md:text-2xl font-bold text-white mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
          <span className="text-xl md:text-4xl">1️⃣</span>
          <span className="text-xs md:text-base">Элемент удачи</span>
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-1 gap-2 md:gap-2">
          {BAZI_ELEMENTS.map((element) => (
            <button
              key={element.value}
              onClick={() => setSelectedBaziElement(element.value)}
              className={`p-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border-2 transition-all transform hover:scale-105 flex flex-col md:flex-row items-center md:items-center justify-start md:justify-start gap-2 md:gap-4 ${
                selectedBaziElement === element.value
                  ? 'border-yellow-400 bg-yellow-500/20 shadow-lg'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center flex-shrink-0" style={{ height: '32px', width: '32px' }}>
                <BaziElementIcon element={element.value} size={32} />
              </div>
              <div className="flex flex-col md:flex-row items-center md:items-center gap-1 md:gap-3 flex-1">
                <div className="text-white font-semibold text-xs md:text-sm text-center md:text-left">{element.label}</div>
                <div className="hidden md:block text-white/60 text-xs text-left leading-relaxed">
                  {element.description}
                </div>
              </div>
            </button>
          ))}
        </div>
        {selectedBaziElement && poeticForecast && (
          <div className="mt-2 md:mt-3 p-2 md:p-3 bg-white/10 rounded-lg md:rounded-xl border border-white/20">
            <p className="text-white/90 italic text-center text-xs md:text-sm leading-relaxed">{poeticForecast}</p>
          </div>
        )}
      </div>

      {/* Шаг 2: Символ амулета - показываем после выбора элемента */}
      {selectedBaziElement && (
        <div className="bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-xl md:rounded-2xl p-3 md:p-6">
          <h2 className="text-sm md:text-2xl font-bold text-white mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
            <span className="text-xl md:text-4xl">2️⃣</span>
            <span className="text-xs md:text-base">Символ амулета {isAuthenticated && <span className="text-xs text-yellow-300">({allSymbols.length})</span>}</span>
          </h2>
          {/* Современный скроллируемый контейнер */}
          <div className="relative">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 max-h-64 md:max-h-96 overflow-y-auto overflow-x-hidden p-1 md:p-4 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/50 scroll-smooth"
                 style={{
                   scrollbarWidth: 'thin',
                   scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
                 }}>
              {allSymbols.map((sym) => (
                <button
                  key={sym.value}
                  onClick={() => {
                    if (expandedSymbol === sym.value) {
                      setExpandedSymbol(null);
                    } else {
                      setExpandedSymbol(sym.value);
                    }
                    setSelectedSymbol(sym.value);
                  }}
                  title={sym.description}
                  className={`p-2 md:p-4 rounded-lg md:rounded-xl border-2 transition-all transform hover:scale-105 flex-shrink-0 flex flex-col items-center justify-start ${
                    selectedSymbol === sym.value
                      ? 'border-yellow-400 bg-yellow-500/20 shadow-lg ring-2 ring-yellow-400/50'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  } ${expandedSymbol === sym.value ? 'md:col-span-2 lg:col-span-2' : ''}`}
                >
                  <div className="flex items-center justify-center mb-1 md:mb-2 flex-shrink-0" style={{ height: '48px' }}>
                    {sym.value === 'scales' ? (
                      <AmuletSymbolIconWithChoice
                        symbolId={sym.value}
                        size={48}
                        selectedImageIndex={scalesImageIndex}
                        onImageChange={setScalesImageIndex}
                      />
                    ) : (
                      <AmuletSymbolIcon symbolId={sym.value} size={48} />
                    )}
                  </div>
                  <div className="text-white font-semibold text-center text-xs md:text-sm mb-1">{sym.label}</div>
                  {/* Расширяемое описание */}
                  {expandedSymbol === sym.value && (
                    <div className="hidden md:block text-white/60 text-xs text-center leading-relaxed mt-1 px-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {sym.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
            {/* Индикатор прокрутки (если есть много символов) */}
            {allSymbols.length > 8 && (
              <div className="absolute bottom-0 left-0 right-0 h-6 md:h-8 bg-gradient-to-t from-red-900/50 to-transparent pointer-events-none flex items-center justify-center">
                <span className="text-white/60 text-xs hidden md:block">↓ Прокрутите для просмотра всех символов</span>
                <span className="text-white/60 text-xs md:hidden">↓</span>
              </div>
            )}
          </div>
          {!isAuthenticated && (
            <p className="text-yellow-300/80 text-xs mt-2 md:mt-4 text-center">
              Больше вариантов символов доступно{' '}
              {onRequestPersonalized ? (
                <button
                  onClick={onRequestPersonalized}
                  className="underline hover:text-yellow-200 transition-colors"
                >
                  зарегистрированным
                </button>
              ) : (
                <span>зарегистрированным</span>
              )}{' '}
              пользователям
            </p>
          )}
        </div>
      )}

      {/* Шаг 3: Цвет (группировка по энергетике) - показываем после выбора символа */}
      {selectedSymbol && (
        <div className="bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-xl md:rounded-2xl p-3 md:p-6">
          <h2 className="text-sm md:text-2xl font-bold text-white mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
            <span className="text-xl md:text-4xl">3️⃣</span>
            <span className="text-xs md:text-base">Цвет</span>
          </h2>
          <div className="space-y-3 md:space-y-6">
            {Object.entries(COLOR_ENERGY_GROUPS)
              .filter(([key]) => key !== 'gradients' || isAuthenticated) // Градиенты только для зарегистрированных
              .map(([key, group]) => (
              <div key={key}>
                <h3 className="text-white font-semibold mb-2 md:mb-3 text-xs md:text-base">{group.name}</h3>
                <div className="grid grid-cols-6 md:grid-cols-8 gap-1.5 md:gap-2">
                  {group.colors.map((col) => {
                    const isWhite = col.value === '#FFFFFF';
                    const isNeonCyan = col.value === '#00FFFF';
                    const isGradient = col.value.startsWith('linear-gradient');
                    const isExpanded = expandedColor === col.value;
                    const needsDarkBorder = isWhite || isNeonCyan;
                    
                    return (
                      <button
                        key={col.value}
                        onClick={() => {
                          if (expandedColor === col.value) {
                            setExpandedColor(null);
                          } else {
                            setExpandedColor(col.value);
                          }
                          setSelectedColor(col.value);
                        }}
                        className={`p-1 md:p-2 rounded-md md:rounded-lg border-2 transition-all transform hover:scale-105 flex flex-col items-center justify-center ${
                          selectedColor === col.value
                            ? 'border-yellow-400 shadow-lg ring-2 ring-yellow-400/50'
                            : needsDarkBorder
                            ? 'border-gray-600/60'
                            : 'border-white/20'
                        } ${isExpanded ? 'md:col-span-2' : ''}`}
                        style={isGradient ? { background: col.value } : { backgroundColor: col.value }}
                        title={col.label}
                      >
                        {!isGradient && (
                          <div className={`w-full h-4 md:h-6 rounded ${
                            isWhite || isNeonCyan
                              ? 'border-2 border-silver-400/90 bg-transparent'
                              : 'bg-white/20'
                          }`} style={isWhite || isNeonCyan ? { borderColor: 'rgba(192, 192, 192, 0.9)' } : {}}></div>
                        )}
                        {/* Название цвета только на мобильных при расширении */}
                        {isExpanded && (
                          <div className="md:hidden text-white text-xs mt-1 text-center font-semibold px-1">
                            {col.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Шаг 4: Выбор узора - показываем после выбора цвета */}
      {selectedColor && (
        <div className="bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-indigo-900/50 backdrop-blur-md border-2 border-purple-500/50 rounded-xl md:rounded-2xl p-3 md:p-6">
          <h2 className="text-sm md:text-2xl font-bold text-white mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
            <span className="text-xl md:text-4xl">4️⃣</span>
            <span className="text-xs md:text-base">Узор</span>
          </h2>
          {/* Обычные узоры */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 mb-4">
            {AMULET_ELEMENTS.map((element) => (
              <button
                key={element.id}
                onClick={() => setSelectedElement(element)}
                className={`p-2 md:p-4 rounded-lg md:rounded-xl border-2 transition-all transform hover:scale-105 ${
                  selectedElement.id === element.id
                    ? 'border-yellow-400 bg-yellow-500/20 shadow-lg ring-2 ring-yellow-400/50'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center" style={{ height: '48px' }}>
                  <ElementPreview element={element} size={48} />
                </div>
              </button>
            ))}
          </div>

          {/* Премиум узоры (только для зарегистрированных) */}
          {isAuthenticated && PREMIUM_ELEMENTS.length > 0 && (
            <>
              <h3 className="text-white font-semibold mb-2 md:mb-3 text-xs md:text-base mt-4">Премиум узоры</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                {PREMIUM_ELEMENTS.map((element) => (
                  <button
                    key={element.id}
                    onClick={() => setSelectedElement(element)}
                    className={`p-2 md:p-4 rounded-lg md:rounded-xl border-2 transition-all transform hover:scale-105 ${
                      selectedElement.id === element.id
                        ? 'border-yellow-400 bg-yellow-500/20 shadow-lg ring-2 ring-yellow-400/50'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-center" style={{ height: '48px' }}>
                      <ElementPreview element={element} size={48} />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
          {!isAuthenticated && (
            <p className="text-yellow-300/80 text-xs mt-2 md:mt-4 text-center">
              Больше узоров доступно{' '}
              {onRequestPersonalized ? (
                <button
                  onClick={onRequestPersonalized}
                  className="underline hover:text-yellow-200 transition-colors"
                >
                  зарегистрированным
                </button>
              ) : (
                <span>зарегистрированным</span>
              )}{' '}
              пользователям
            </p>
          )}
        </div>
      )}


      {/* Шаг 5: Выбор орнамента (непрерывной линии) - показываем после выбора узора */}
      {selectedColor && (
        <div className="bg-gradient-to-br from-blue-900/50 via-cyan-900/30 to-teal-900/50 backdrop-blur-md border-2 border-blue-500/50 rounded-xl md:rounded-2xl p-3 md:p-6">
          <h2 className="text-sm md:text-2xl font-bold text-white mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
            <span className="text-xl md:text-4xl">5️⃣</span>
            <span className="text-xs md:text-base">Орнамент</span>
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
            {(isAuthenticated ? AMULET_PATTERNS : AMULET_PATTERNS.filter(p => p.id === 'none' || p.id === 'wave' || p.id === 'dashed')).map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className={`p-2 md:p-4 rounded-lg md:rounded-xl border-2 transition-all transform hover:scale-105 ${
                  selectedPattern.id === pattern.id
                    ? 'border-yellow-400 bg-yellow-500/20 shadow-lg ring-2 ring-yellow-400/50'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center" style={{ height: '48px' }}>
                  <PatternPreview pattern={pattern} size={48} />
                </div>
              </button>
            ))}
          </div>
          {!isAuthenticated && (
            <p className="text-yellow-300/80 text-xs mt-2 md:mt-4 text-center">
              Больше орнаментов доступно{' '}
              {onRequestPersonalized ? (
                <button
                  onClick={onRequestPersonalized}
                  className="underline hover:text-yellow-200 transition-colors"
                >
                  зарегистрированным
                </button>
              ) : (
                <span>зарегистрированным</span>
              )}{' '}
              пользователям
            </p>
          )}
        </div>
      )}
      </div>

      {/* Интерактивная вертикальная подсказка справа от всех панелек (только на десктопе) */}
      <div 
        className="hidden md:flex sticky top-4 self-start w-12 flex-col items-center justify-center z-10 h-full min-h-[600px] cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          const middle = rect.height / 2;
          
          // Клик в верхнюю половину - скролл вверх
          if (clickY < middle) {
            window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
          } 
          // Клик в нижнюю половину - скролл вниз
          else {
            window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
          }
        }}
      >
        {/* Вертикальная панелька с эффектом перфорации (3 линии точек) и сверканием */}
        <div className="flex flex-col items-center gap-4 h-full py-4 relative">
          {/* Эффект сверкания */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-pulse pointer-events-none"></div>
          
          {/* Три вертикальные линии точек */}
          <div className="flex-1 flex items-center gap-2 relative z-10">
            {/* Левая линия */}
            <div className="flex flex-col items-center gap-2">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={`left-${i}`}
                  className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"
                  style={{ 
                    marginTop: i === 0 ? 0 : '10px',
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '2s'
                  }}
                ></div>
              ))}
            </div>
            {/* Центральная линия */}
            <div className="flex flex-col items-center gap-2">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={`center-${i}`}
                  className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse"
                  style={{ 
                    marginTop: i === 0 ? 0 : '10px',
                    animationDelay: `${i * 0.1 + 0.05}s`,
                    animationDuration: '2s'
                  }}
                ></div>
              ))}
            </div>
            {/* Правая линия */}
            <div className="flex flex-col items-center gap-2">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={`right-${i}`}
                  className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"
                  style={{ 
                    marginTop: i === 0 ? 0 : '10px',
                    animationDelay: `${i * 0.1 + 0.1}s`,
                    animationDuration: '2s'
                  }}
                ></div>
              ))}
            </div>
          </div>
          {/* Стрелочки вверх и вниз */}
          <div className="flex flex-col items-center gap-1 opacity-80 relative z-10">
            {/* Стрелки вверх (верхняя половина) */}
            <div className="flex flex-col items-center gap-1 mb-8">
              <div className="text-white/60 text-xl leading-none" style={{ transform: 'translateY(4px)' }}>↑</div>
              <div className="text-white/50 text-lg leading-none">↑</div>
            </div>
            {/* Стрелки вниз (нижняя половина) */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-white/80 text-2xl leading-none font-light animate-bounce" style={{ animationDuration: '1.5s' }}>↓</div>
              <div className="text-white/60 text-xl leading-none" style={{ transform: 'translateY(-4px)' }}>↓</div>
              <div className="text-white/40 text-lg leading-none" style={{ transform: 'translateY(-8px)' }}>↓</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

