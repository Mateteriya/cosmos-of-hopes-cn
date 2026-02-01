'use client';

/**
 * Редактор амулетов - Уровень 2 (для зарегистрированных пользователей)
 * Персональный расчёт на основе карты Бацзы
 */

import { useState, useEffect, useRef } from 'react';
import { generatePersonalizedAmulet, generateFinalAmuletDescription, type BaziAnalysisData } from '@/lib/amulet-generator';
import type { BaziElement } from '@/types/amulet';
import { AmuletSymbolIcon, AmuletSymbolIconWithChoice } from './AmuletSymbolIcons';
import { getAllSymbolsForLevel2, SYMBOL_LIBRARY, COLOR_ENERGY_GROUPS } from '@/lib/amulet-library';
import { getColorLabel } from '@/lib/amulet-generator';
import { AMULET_ELEMENTS, getDefaultElement, type AmuletElement } from '@/lib/amulet-elements';
import { AMULET_PATTERNS, getDefaultPattern, type AmuletPattern } from '@/lib/amulet-patterns';
import ElementPreview from './ElementPreview';
import PatternPreview from './PatternPreview';
import AmuletPreviewWithOrnament from './AmuletPreviewWithOrnament';

interface AmuletEditorLevel2Props {
  baziAnalysis?: {
    dayMaster: {
      element: string;
      strength: number;
      strengthText: string;
    };
    usefulElements: string[];
    imbalance?: {
      excess?: string[];
      deficient?: string[];
    };
  };
  gender: 'male' | 'female';
  onComplete: (data: {
    symbolId: string;
    symbolName: string;
    materialId: string;
    materialName: string;
    color: string;
    colorName: string;
    wishText: string;
    blessingText?: string;
    task: string;
    priorityElements: BaziElement[];
    finalDescription: string;
    elementId?: string; // ID выбранного узора
    patternId?: string; // ID выбранного орнамента (непрерывной линии)
    scalesImageIndex?: number; // Индекс выбранной картинки для символа "весы"
  }) => void;
}

export default function AmuletEditorLevel2({ baziAnalysis, gender, onComplete }: AmuletEditorLevel2Props) {
  const [generationResult, setGenerationResult] = useState<ReturnType<typeof generatePersonalizedAmulet> | null>(null);
  const [selectedSymbolId, setSelectedSymbolId] = useState<string | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [wishText, setWishText] = useState('');
  const [blessingText, setBlessingText] = useState('');
  const [showFinal, setShowFinal] = useState(false);
  const [finalDescription, setFinalDescription] = useState<string>('');
  const [scalesImageIndex, setScalesImageIndex] = useState(0); // Для выбора между двумя картинками весов
  const [allAvailableSymbols, setAllAvailableSymbols] = useState<any[]>([]);
  const [allAvailableMaterials, setAllAvailableMaterials] = useState<any[]>([]);
  const [allAvailableColors, setAllAvailableColors] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<AmuletElement>(getDefaultElement()); // Выбранный узор
  const [selectedPattern, setSelectedPattern] = useState<AmuletPattern>(getDefaultPattern()); // Выбранный орнамент (непрерывная линия)
  const [showWishMessage, setShowWishMessage] = useState(false); // Для показа сообщения о необходимости ввода желания
  const wishPanelRef = useRef<HTMLDivElement>(null); // Ref для панели ввода желания

  // Генерируем персональный амулет при монтировании (если есть Бацзы) или показываем все символы
  useEffect(() => {
    if (baziAnalysis) {
      // Режим с Бацзы - генерируем персональные рекомендации
    try {
      const result = generatePersonalizedAmulet(
        {
          dayMaster: baziAnalysis.dayMaster,
          usefulElements: baziAnalysis.usefulElements,
          imbalance: baziAnalysis.imbalance,
        },
        gender
      );
      setGenerationResult(result);
      // Автоматически выбираем первые варианты
      if (result.recommendedSymbols.length > 0) {
        setSelectedSymbolId(result.recommendedSymbols[0].id);
      }
      if (result.recommendedMaterials.length > 0) {
        setSelectedMaterialId(result.recommendedMaterials[0].id);
      }
      if (result.recommendedColors.length > 0) {
        setSelectedColor(result.recommendedColors[0].value);
      }
    } catch (error) {
      console.error('Ошибка генерации амулета:', error);
      }
    } else {
      // Режим без Бацзы - показываем ВСЕ символы
      const allSymbols = getAllSymbolsForLevel2(gender);
      setAllAvailableSymbols(allSymbols);
      
      // Собираем все материалы из библиотеки
      const allMaterials = new Map();
      SYMBOL_LIBRARY.forEach(sc => {
        sc.materials.forEach(mat => {
          if (!allMaterials.has(mat.id)) {
            allMaterials.set(mat.id, mat);
          }
        });
      });
      setAllAvailableMaterials(Array.from(allMaterials.values()));
      
      // Собираем все цвета из библиотеки
      const allColors = new Set<string>();
      SYMBOL_LIBRARY.forEach(sc => {
        sc.colors.forEach(color => allColors.add(color));
      });
      // Добавляем цвета из COLOR_ENERGY_GROUPS
      Object.values(COLOR_ENERGY_GROUPS).forEach(group => {
        group.colors.forEach(col => allColors.add(col.value));
      });
      setAllAvailableColors(Array.from(allColors).map(color => ({
        value: color,
        label: getColorLabel(color)
      })));
      
      // Автоматически выбираем первые варианты
      if (allSymbols.length > 0) {
        setSelectedSymbolId(allSymbols[0].id);
      }
      if (allMaterials.size > 0) {
        setSelectedMaterialId(Array.from(allMaterials.values())[0].id);
      }
      if (allColors.size > 0) {
        setSelectedColor(Array.from(allColors)[0]);
      }
    }
  }, [baziAnalysis, gender]);

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
    if (!selectedSymbolId || !selectedMaterialId || !selectedColor || !wishText.trim()) {
      return;
    }

    let symbol, material, colorObj, task, priorityElements;
    
    if (generationResult) {
      // Режим с Бацзы
      symbol = generationResult.recommendedSymbols.find((s) => s.id === selectedSymbolId);
      material = generationResult.recommendedMaterials.find((m) => m.id === selectedMaterialId);
      colorObj = generationResult.recommendedColors.find((c) => c.value === selectedColor);
      task = generationResult.task;
      priorityElements = generationResult.priorityElements;
    } else {
      // Режим без Бацзы - используем все доступные символы
      symbol = allAvailableSymbols.find((s) => s.id === selectedSymbolId);
      material = allAvailableMaterials.find((m) => m.id === selectedMaterialId);
      colorObj = allAvailableColors.find((c) => c.value === selectedColor);
      task = 'Создание амулета для 2026 года (Год Огненной Лошади)';
      priorityElements = ['fire'] as BaziElement[]; // По умолчанию Огонь (год)
    }

    if (!symbol || !material || !colorObj) return;

    const desc = generateFinalAmuletDescription(
      symbol.name,
      material.name,
      colorObj.label,
      priorityElements || ['fire'],
      task || 'Создание амулета'
    );

    setFinalDescription(desc);
    setShowFinal(true);

    onComplete({
      symbolId: selectedSymbolId,
      symbolName: symbol.name,
      materialId: selectedMaterialId,
      materialName: material.name,
      color: selectedColor,
      colorName: colorObj.label,
      wishText: wishText.trim(),
      blessingText: blessingText.trim() || undefined,
      task: task || 'Создание амулета',
      priorityElements: priorityElements || ['fire'],
      finalDescription: desc,
      elementId: selectedElement.id !== 'none' ? selectedElement.id : undefined,
      patternId: selectedPattern.id !== 'none' ? selectedPattern.id : undefined,
      scalesImageIndex: scalesImageIndex,
    });
  };

  // Показываем загрузку только если есть Бацзы и результат еще не готов
  if (baziAnalysis && !generationResult) {
    return (
      <div className="text-center text-white p-8">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p>Генерация персонального амулета...</p>
      </div>
    );
  }

  if (showFinal) {
    const symbol = generationResult 
      ? generationResult.recommendedSymbols.find((s) => s.id === selectedSymbolId)
      : allAvailableSymbols.find((s) => s.id === selectedSymbolId);
    const material = generationResult
      ? generationResult.recommendedMaterials.find((m) => m.id === selectedMaterialId)
      : allAvailableMaterials.find((m) => m.id === selectedMaterialId);

    return (
      <div className="space-y-6">
        {/* Финальный результат */}
        <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-blue-900/50 backdrop-blur-md border-2 border-indigo-500/50 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            ✨ Ваш персональный амулет-навигатор ✨
          </h2>

          {/* Превью амулета */}
          <div className="flex flex-col items-center gap-6 mb-6">
            <div className="relative">
              <div
                className="w-48 h-48 rounded-full flex items-center justify-center shadow-2xl border-4 animate-pulse text-white"
                style={{
                  backgroundColor: selectedColor || '#64748B',
                  borderColor: `${selectedColor || '#64748B'}CC`,
                  boxShadow: `0 0 40px ${selectedColor || '#64748B'}80, 0 0 80px ${selectedColor || '#64748B'}40`,
                }}
              >
                {symbol?.id === 'scales' ? (
                  <AmuletSymbolIconWithChoice
                    symbolId={symbol.id}
                    size={96}
                    selectedImageIndex={scalesImageIndex}
                  />
                ) : (
                  <AmuletSymbolIcon 
                    symbolId={symbol?.id || ''} 
                    size={96}
                  />
                )}
              </div>
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ backgroundColor: selectedColor || '#64748B' }}
              ></div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-white font-bold text-3xl">{symbol?.name}</div>
              <div className="text-white/80 text-lg">{material?.name}</div>
            </div>
          </div>

          {/* Объяснение */}
            <div className="bg-white/10 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-bold text-white mb-4">📖 Объяснение</h3>
              {generationResult && (
              <div className="text-white/90 whitespace-pre-line mb-4">{generationResult.explanation}</div>
              )}
              {finalDescription && (
                <div className="text-white/90 whitespace-pre-line mt-4">{finalDescription}</div>
              )}
            </div>

          {/* Желание и пожелание */}
          {wishText && (
            <div className="bg-white/10 p-4 rounded-xl mb-4">
              <h4 className="text-white font-semibold mb-2">💫 Ваше желание:</h4>
              <p className="text-white/90 italic">"{wishText}"</p>
            </div>
          )}
          {blessingText && (
            <div className="bg-white/10 p-4 rounded-xl mb-4">
              <h4 className="text-white font-semibold mb-2">🌟 Ваше пожелание:</h4>
              <p className="text-white/90 italic">"{blessingText}"</p>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
              💾 Сохранить дизайн
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105">
              📄 Получить схему для ювелира (PDF)
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105">
              🛒 Заказать изготовление
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Определяем, какие символы, материалы и цвета показывать
  const availableSymbols = generationResult ? generationResult.recommendedSymbols : allAvailableSymbols;
  const availableMaterials = generationResult ? generationResult.recommendedMaterials : allAvailableMaterials;
  const availableColors = generationResult ? generationResult.recommendedColors : allAvailableColors;

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
      {/* Мобильная версия: предпросмотр sticky сверху */}
      <div className="w-full md:hidden sticky top-0 z-20 mb-2 pb-2 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent">
        <div className="bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-red-900/50 backdrop-blur-md border-2 border-purple-500/50 rounded-xl p-3 max-w-xs mx-auto">
          <h2 className="text-sm font-bold text-white mb-2 text-center">👁️ Предпросмотр</h2>
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <AmuletPreviewWithOrnament
                symbolId={selectedSymbolId || ''}
                color={selectedColor || '#DC2626'}
                elementId={selectedElement.id !== 'none' ? selectedElement.id : undefined}
                patternId={selectedPattern.id !== 'none' ? selectedPattern.id : undefined}
                size={100}
                scalesImageIndex={scalesImageIndex}
                onScalesImageChange={setScalesImageIndex}
              />
            </div>
            {selectedSymbolId && selectedMaterialId && selectedColor ? (
              <div className="text-center text-white">
                <div className="font-bold text-sm">
                  {availableSymbols.find((s) => s.id === selectedSymbolId)?.name || 
                   (generationResult?.recommendedSymbols.find((s) => s.id === selectedSymbolId)?.name)}
                </div>
                <div className="text-white/80 text-xs">
                  {availableMaterials.find((m) => m.id === selectedMaterialId)?.name ||
                   (generationResult?.recommendedMaterials.find((m) => m.id === selectedMaterialId)?.name)}
                </div>
              </div>
            ) : (
              <div className="text-center text-white/60 text-xs">
                Выберите символ, материал и цвет
              </div>
            )}
            {/* Кнопка завершения */}
            {selectedSymbolId && selectedMaterialId && selectedColor && (
              <button
                onClick={!wishText.trim() ? handleWishRequired : (!selectedSymbolId || !selectedMaterialId || !selectedColor) ? undefined : handleFinish}
                className={`w-full px-4 py-2 text-xs bg-gradient-to-r from-yellow-500 via-red-500 to-orange-500 text-white font-bold rounded-lg shadow-2xl transition-all transform ${
                  !selectedSymbolId || !selectedMaterialId || !selectedColor || !wishText.trim()
                    ? 'opacity-50 cursor-pointer' 
                    : 'hover:from-yellow-600 hover:via-red-600 hover:to-orange-600 hover:scale-105'
                }`}
              >
                ✨ Завершить ✨
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Десктопная версия: левая часть - закрепленный предпросмотр */}
      <div className="hidden md:block sticky top-4 self-start flex-shrink-0 w-80">
        <div className="bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-red-900/50 backdrop-blur-md border-2 border-purple-500/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 text-center">👁️ Предпросмотр</h2>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <AmuletPreviewWithOrnament
                symbolId={selectedSymbolId || ''}
                color={selectedColor || '#DC2626'}
                elementId={selectedElement.id !== 'none' ? selectedElement.id : undefined}
                patternId={selectedPattern.id !== 'none' ? selectedPattern.id : undefined}
                size={200}
                scalesImageIndex={scalesImageIndex}
                onScalesImageChange={setScalesImageIndex}
              />
            </div>
            {selectedSymbolId && selectedMaterialId && selectedColor ? (
              <div className="text-center text-white">
                <div className="font-bold text-xl">
                  {availableSymbols.find((s) => s.id === selectedSymbolId)?.name || 
                   (generationResult?.recommendedSymbols.find((s) => s.id === selectedSymbolId)?.name)}
                </div>
                <div className="text-white/80">
                  {availableMaterials.find((m) => m.id === selectedMaterialId)?.name ||
                   (generationResult?.recommendedMaterials.find((m) => m.id === selectedMaterialId)?.name)}
                </div>
              </div>
            ) : (
              <div className="text-center text-white/60 text-sm">
                Выберите символ, материал и цвет для предпросмотра
              </div>
            )}
            {/* Кнопка завершения */}
            {selectedSymbolId && selectedMaterialId && selectedColor && (
              <button
                onClick={!wishText.trim() ? handleWishRequired : (!selectedSymbolId || !selectedMaterialId || !selectedColor) ? undefined : handleFinish}
                className={`w-full px-8 py-4 bg-gradient-to-r from-yellow-500 via-red-500 to-orange-500 text-white font-bold text-xl rounded-xl shadow-2xl transition-all transform mt-4 ${
                  !selectedSymbolId || !selectedMaterialId || !selectedColor || !wishText.trim()
                    ? 'opacity-50 cursor-pointer' 
                    : 'hover:from-yellow-600 hover:via-red-600 hover:to-orange-600 hover:scale-110'
                }`}
              >
                ✨ Завершить создание амулета ✨
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Правая часть - все блоки создания */}
      <div className="flex-1 space-y-2 md:space-y-6 w-full mt-0 md:mt-0">
        {/* Блок 1: Объяснение (только если есть Бацзы) */}
      {generationResult && (
      <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-blue-900/50 backdrop-blur-md border-2 border-indigo-500/50 rounded-xl md:rounded-2xl p-3 md:p-6">
        <h2 className="text-sm md:text-xl font-bold text-white mb-2 md:mb-4">📖 Объяснение</h2>
        <div className="text-white/90 whitespace-pre-line text-xs md:text-base">{generationResult.explanation}</div>
      </div>
      )}

      {/* Блок 2: Конструктор */}
      <div className="bg-gradient-to-br from-amber-900/50 via-yellow-900/30 to-orange-900/50 backdrop-blur-md border-2 border-amber-500/50 rounded-xl md:rounded-2xl p-3 md:p-6">
        <h2 className="text-sm md:text-xl font-bold text-white mb-3 md:mb-6">
          {generationResult ? '🎨 Конструктор' : '🎨 Конструктор'}
        </h2>

        {/* Выбор символа */}
        <div className="mb-3 md:mb-6">
          <h3 className="text-xs md:text-lg font-semibold text-white mb-2 md:mb-4">
            {generationResult ? 'Форма:' : `Форма (${availableSymbols.length}):`}
          </h3>
          {/* Современный скроллируемый контейнер */}
          <div className="relative">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 max-h-64 md:max-h-96 overflow-y-auto overflow-x-hidden pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/50 scroll-smooth"
                 style={{
                   scrollbarWidth: 'thin',
                   scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
                 }}>
              {availableSymbols.map((sym) => (
              <button
                key={sym.id}
                onClick={() => setSelectedSymbolId(sym.id)}
                  className={`p-2 md:p-4 rounded-lg md:rounded-xl border-2 transition-all transform hover:scale-105 flex-shrink-0 ${
                  selectedSymbolId === sym.id
                      ? 'border-yellow-400 bg-yellow-500/20 shadow-lg ring-2 ring-yellow-400/50'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                  <div className="flex items-center justify-center mb-1 md:mb-2 text-white" style={{ height: '32px' }}>
                    {sym.id === 'scales' ? (
                      <AmuletSymbolIconWithChoice
                        symbolId={sym.id}
                        size={32}
                        selectedImageIndex={scalesImageIndex}
                        onImageChange={setScalesImageIndex}
                      />
                    ) : (
                      <AmuletSymbolIcon symbolId={sym.id} size={32} />
                    )}
                  </div>
                  <div className="text-white font-semibold text-xs md:text-sm text-center">{sym.name}</div>
                  <div className="hidden md:block text-white/60 text-xs mt-1 text-center line-clamp-2">{sym.description}</div>
              </button>
            ))}
            </div>
            {/* Индикатор прокрутки (если есть много символов) */}
            {availableSymbols.length > 12 && (
              <div className="absolute bottom-0 left-0 right-0 h-6 md:h-8 bg-gradient-to-t from-amber-900/50 to-transparent pointer-events-none flex items-center justify-center">
                <span className="text-white/60 text-xs hidden md:block">↓ Прокрутите для просмотра всех символов</span>
                <span className="text-white/60 text-xs md:hidden">↓</span>
              </div>
            )}
          </div>
        </div>

        {/* Выбор материала/цвета */}
        <div className="mb-3 md:mb-6">
          <h3 className="text-xs md:text-lg font-semibold text-white mb-2 md:mb-4">Основа:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            {/* Материалы */}
            <div>
              <h4 className="text-white/80 text-xs md:text-sm mb-1 md:mb-2">Материал:</h4>
              <div className="space-y-1 md:space-y-2 max-h-32 md:max-h-48 overflow-y-auto">
                {availableMaterials.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => setSelectedMaterialId(mat.id)}
                    className={`w-full p-2 md:p-3 rounded-lg border-2 transition-all text-left ${
                      selectedMaterialId === mat.id
                        ? 'border-yellow-400 bg-yellow-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-white font-medium text-xs md:text-sm">{mat.name}</div>
                    <div className="hidden md:block text-white/60 text-xs">{mat.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Цвета */}
            <div>
              <h4 className="text-white/80 text-xs md:text-sm mb-1 md:mb-2">Цвет:</h4>
              <div className="grid grid-cols-4 md:grid-cols-3 gap-2 md:gap-3 max-h-32 md:max-h-48 overflow-y-auto">
                {availableColors.map((col) => {
                  // Проверяем, является ли цвет белым или очень светлым
                  const isLightColor = col.value === '#FFFFFF' || col.value === '#F1F5F9' || col.value === '#F8F8FF' || 
                    (col.value.startsWith('#') && parseInt(col.value.slice(1, 3), 16) > 240 && 
                     parseInt(col.value.slice(3, 5), 16) > 240 && 
                     parseInt(col.value.slice(5, 7), 16) > 240);
                  
                  return (
                  <button
                    key={col.value}
                    onClick={() => setSelectedColor(col.value)}
                    className={`p-1.5 md:p-3 rounded-lg md:rounded-xl border-2 transition-all transform hover:scale-105 ${
                      selectedColor === col.value
                        ? 'border-yellow-400 shadow-lg ring-2 ring-yellow-400/50'
                          : isLightColor ? 'border-gray-400' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: col.value }}
                    title={col.label}
                  >
                      <div className={`w-full h-6 md:h-8 rounded ${isLightColor ? 'bg-gray-300/30' : 'bg-white/20'}`}></div>
                      <div className={`text-xs mt-0.5 md:mt-1 text-center font-semibold hidden md:block ${
                        isLightColor ? 'text-gray-800' : 'text-white'
                      }`}>
                        {col.label}
                      </div>
                  </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>


      {/* Блок 3: Выбор узора - показываем после выбора цвета */}
      {selectedColor && (
        <div className="bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-indigo-900/50 backdrop-blur-md border-2 border-purple-500/50 rounded-xl md:rounded-2xl p-3 md:p-6 mb-3 md:mb-6">
          <h2 className="text-sm md:text-2xl font-bold text-white mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
            <span className="text-xl md:text-4xl">🎨</span>
            <span className="text-xs md:text-base">Узор</span>
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
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
                <div className="flex items-center justify-center mb-1 md:mb-2" style={{ height: '32px' }}>
                  <ElementPreview element={element} size={32} />
                </div>
                <div className="text-white font-semibold text-xs md:text-sm text-center">{element.name}</div>
                <div className="hidden md:block text-white/60 text-xs mt-1 text-center line-clamp-2">{element.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}


      {/* Блок 3.5: Выбор орнамента (непрерывной линии) - показываем после выбора узора */}
      {selectedColor && (
        <div className="bg-gradient-to-br from-blue-900/50 via-cyan-900/30 to-teal-900/50 backdrop-blur-md border-2 border-blue-500/50 rounded-xl md:rounded-2xl p-3 md:p-6 mb-3 md:mb-6">
          <h2 className="text-sm md:text-2xl font-bold text-white mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
            <span className="text-xl md:text-4xl">🎨</span>
            <span className="text-xs md:text-base">Орнамент</span>
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
            {AMULET_PATTERNS.map((pattern) => (
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
        </div>
      )}


      {/* Блок 4: Желание и пожелание */}
      <div ref={wishPanelRef} className={`bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-6 relative ${
        !wishText.trim() 
          ? 'border-2 border-yellow-400 ring-1 ring-yellow-400/30 shadow-[0_0_8px_rgba(250,204,21,0.25)]' 
          : 'border-2 border-yellow-500/50'
      }`}>
        <h2 className="text-sm md:text-2xl font-bold text-white mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
          <span className="text-xl md:text-4xl">💫</span>
          <span className="text-xs md:text-base">Желание 2026</span>
          <span className="text-red-400 text-lg md:text-2xl" title="Обязательное поле">*</span>
        </h2>
        {!wishText.trim() && (
          <div className="mb-2 md:mb-3 text-center">
            <p className="text-yellow-300 text-xs md:text-sm font-semibold">
              ⚠️ Без желания амулет нельзя преобразовать в 3D или отправить в хранилище
            </p>
          </div>
        )}
        {showWishMessage && (
          <div className="mb-2 md:mb-3 text-center animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-yellow-400 text-xs md:text-sm font-bold bg-yellow-400/20 px-3 py-2 rounded-lg border border-yellow-400/50">
              ⚠️ Необходимо добавить Желание
            </p>
          </div>
        )}
        <textarea
          value={wishText}
          onChange={(e) => setWishText(e.target.value)}
          placeholder="Опишите ваше желание..."
          className={`w-full min-h-[80px] md:min-h-[120px] p-2 md:p-4 rounded-lg md:rounded-xl bg-white/10 text-white placeholder-white/50 focus:outline-none resize-none text-sm md:text-base ${
            !wishText.trim()
              ? 'border-2 border-yellow-400 ring-2 ring-yellow-400/50'
              : 'border-2 border-white/20 focus:border-yellow-400'
          }`}
          maxLength={200}
        />
        <div className="text-right text-white/60 text-xs md:text-sm mt-1 md:mt-2">{wishText.length}/200</div>

        <div className="mt-3 md:mt-6">
          <h3 className="text-sm md:text-lg font-bold text-white mb-1 md:mb-2">🌟 Пожелание (опц.)</h3>
          <textarea
            value={blessingText}
            onChange={(e) => setBlessingText(e.target.value)}
            placeholder="Пожелание для кого-то..."
            className="w-full min-h-[60px] md:min-h-[100px] p-2 md:p-4 rounded-lg md:rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 resize-none text-sm md:text-base"
            maxLength={200}
          />
          <div className="text-right text-white/60 text-xs md:text-sm mt-1 md:mt-2">{blessingText.length}/200</div>
        </div>
      </div>
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
  );
}

