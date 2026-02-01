'use client';

import { useState } from 'react';
import { mapElementToKey } from '@/lib/bazi-utils';
import type { BaziElement } from '@/types/amulet';
import { getElementExplanation } from '@/lib/element-explanations';

interface BaziResultsProps {
  analysis: {
    pillars: string[];
    pillarsWithHiddenStems?: Array<{
      pillar: string;
      stemGlyph: string;
      branchGlyph: string;
      hiddenStems: Array<{ stem: string; element: string; weight: number }>;
    }>;
    dayMaster: {
      element: string;
      strengthText: string;
      glyph: string;
      strength?: number;
    };
    elementBalance: Record<string, number>;
    balanceAnalysis?: {
      dominant: string[];
      weak: string[];
      balanced: string[];
      interpretation: string;
    };
    usefulElements?: string[];
    usefulStems?: string[];
    harmfulElements?: string[];
    harmfulStems?: string[];
    interactions?: Array<{
      type: string;
      name: string;
      pillars: string[];
      description: string;
      impact?: string;
    }>;
    specialCombinations?: any[];
    isPureMonth?: boolean;
    pureMonthInfo?: {
      stem: string;
      branch: string;
      meaning: string;
    };
    castlePillars?: Array<{
      branch: string;
      element: string;
      count: number;
      pillars: string[];
      meaning: string;
      fullPillar?: string;
    }>;
    sandwichBranches?: Array<{
      branch: string;
      element: string;
      meaning: string;
    }>;
    noblePeople?: Array<{
      branch: string;
      element: string;
      pillar: string | null;
      present: boolean;
      meaning: string;
    }>;
    temperatureBalance?: {
      balance: string;
      season: string;
      seasonTemperature: string;
      description: string;
      interpretation: string;
    };
    timeInfo?: {
      inputDateTime?: string;
      localTime?: string;
      solarTime?: string;
      hourMomentUsed?: string;
      useSolarTime?: boolean;
      timeMethod?: string;
      timezone?: string;
      longitude?: number;
      isDST?: boolean;
      dstNote?: string;
    };
    specialStructure?: {
      type: string;
      typeRu: string;
      usefulElements: string[];
      details?: any;
    } | null;
  };
  content?: {
    style?: string;
    mainForecast?: string;
    energy?: string;
    advice?: string;
    ritual?: string;
    transformation?: string;
    recommendations?: {
      amulet?: string;
      action?: string;
      colors?: string;
    };
    warnings?: {
      months?: string;
      health?: string;
    };
    amuletCreation?: {
      title?: string;
      element?: string;
      symbol?: string;
      colors?: string;
      materials?: string;
      favorableElements?: string;
      favorableColors?: string;
    };
    balanceNote?: string;
    yearContext?: string;
    specialNote?: string;
    health?: string;
  };
  onSelectElement?: (element: BaziElement) => void;
  onStyleChange?: (style: 'poetic' | 'practical') => void;
  onSolarTimeChange?: (useSolarTime: boolean) => void;
  onStartAmuletCreation?: (mode: 'bazi' | 'custom', useSolarTime?: boolean) => void;
  gender?: 'male' | 'female';
  isLoading?: boolean;
}

// Компонент аккордеона
function AccordionSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  isNested = false
}: { 
  title: string; 
  icon: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  isNested?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isNested) {
    // Вложенный аккордеон (подпанель) - более компактный стиль
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/10 transition-all cursor-pointer group"
        >
          <h4 className="text-base font-semibold text-white flex items-center gap-2">
            <span>{icon}</span>
            <span>{title}</span>
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs">
              {isOpen ? 'Свернуть' : 'Развернуть'}
            </span>
            <span 
              className="text-white/70 text-lg transition-transform duration-300 ease-in-out" 
              style={{ 
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                display: 'inline-block'
              }}
            >
              ▼
            </span>
          </div>
        </button>
        <div 
          className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{
            maxHeight: isOpen ? '10000px' : '0px',
            opacity: isOpen ? 1 : 0,
            paddingTop: isOpen ? '0.5rem' : '0',
            paddingBottom: isOpen ? '1rem' : '0',
          }}
        >
          <div className="px-4">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Основной аккордеон
  return (
    <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
      >
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
          <span className="text-xs text-white/60 font-normal ml-2 group-hover:text-white/80">
            (нажмите, чтобы {isOpen ? 'свернуть' : 'развернуть'})
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">
            {isOpen ? 'Свернуть' : 'Развернуть'}
          </span>
          <span 
            className="text-white text-2xl transition-transform duration-300 ease-in-out" 
            style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'inline-block'
            }}
          >
            ▼
          </span>
        </div>
      </button>
      <div 
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: isOpen ? '10000px' : '0px',
          opacity: isOpen ? 1 : 0,
          paddingTop: isOpen ? '0.5rem' : '0',
          paddingBottom: isOpen ? '1.5rem' : '0',
        }}
      >
        <div className="px-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BaziResults({ 
  analysis, 
  content, 
  onSelectElement, 
  onStyleChange,
  onSolarTimeChange,
  onStartAmuletCreation,
  gender,
  isLoading = false 
}: BaziResultsProps) {
  const elementKey = mapElementToKey(analysis.dayMaster.element);
  const currentStyle = content?.style || 'poetic';
  const currentUseSolarTime = analysis.timeInfo?.useSolarTime || false;
  
  // Получаем объяснение элемента
  const elementExplanation = getElementExplanation(
    analysis.dayMaster.element,
    analysis.dayMaster.strengthText,
    gender
  );
  
  const handleSelectElement = () => {
    if (elementKey && onSelectElement) {
      onSelectElement(elementKey);
    }
  };

  const handleStyleChange = (newStyle: 'poetic' | 'practical') => {
    if (onStyleChange && newStyle !== currentStyle) {
      onStyleChange(newStyle);
    }
  };

  const handleSolarTimeChange = (newUseSolarTime: boolean) => {
    if (onSolarTimeChange && newUseSolarTime !== currentUseSolarTime) {
      onSolarTimeChange(newUseSolarTime);
    }
  };

  const handleStartAmuletCreation = (mode: 'bazi' | 'custom') => {
    if (onStartAmuletCreation) {
      onStartAmuletCreation(mode, currentUseSolarTime);
    }
  };

  return (
    <div className="space-y-4">
      {/* Переключатель метода расчета времени */}
      {onSolarTimeChange && (
        <div className="bg-gradient-to-br from-amber-900/50 via-yellow-900/30 to-orange-900/50 backdrop-blur-md border-2 border-amber-500/50 rounded-xl p-4">
          <label className="flex items-center gap-2 text-base font-semibold text-white mb-3">
            <span className="text-2xl">⏰</span>
            <span>Метод расчета времени</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSolarTimeChange(false)}
              disabled={isLoading}
              className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-semibold ${
                !currentUseSolarTime
                  ? 'bg-gradient-to-r from-blue-500/40 to-indigo-500/40 border-blue-400 text-white shadow-lg scale-105'
                  : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/15 hover:border-white/40'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-lg">🕐</span>
                <span className="text-sm">Административное</span>
                <span className="text-xs opacity-70">Стандартный метод</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleSolarTimeChange(true)}
              disabled={isLoading}
              className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-semibold ${
                currentUseSolarTime
                  ? 'bg-gradient-to-r from-orange-500/40 to-red-500/40 border-orange-400 text-white shadow-lg scale-105'
                  : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/15 hover:border-white/40'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-lg">☀️</span>
                <span className="text-sm">Солнечное</span>
                <span className="text-xs opacity-70">Традиционный метод</span>
              </div>
            </button>
          </div>
          {isLoading && (
            <p className="text-xs text-white/60 mt-2 text-center">Переключение метода расчета...</p>
          )}
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
            <p className="text-xs text-white/70">
              💡 Вы можете переключаться между методами расчета времени и сравнивать результаты. 
              При активации персонального квеста будет использован выбранный метод.
            </p>
          </div>
        </div>
      )}

      {/* Переключатель стилей */}
      {onStyleChange && (
        <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-pink-900/50 backdrop-blur-md border-2 border-indigo-500/50 rounded-xl p-4">
          <label className="flex items-center gap-2 text-base font-semibold text-white mb-3">
            <span className="text-2xl">◈</span>
            <span>Стиль прогноза</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleStyleChange('poetic')}
              disabled={isLoading}
              className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-semibold ${
                currentStyle === 'poetic'
                  ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40 border-purple-400 text-white shadow-lg scale-105'
                  : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/15 hover:border-white/40'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-lg">〜</span>
                <span className="text-sm">Поэтический</span>
                <span className="text-xs opacity-70">Метафорический</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleStyleChange('practical')}
              disabled={isLoading}
              className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-semibold ${
                currentStyle === 'practical'
                  ? 'bg-gradient-to-r from-blue-500/40 to-teal-500/40 border-blue-400 text-white shadow-lg scale-105'
                  : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/15 hover:border-white/40'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-lg">▤</span>
                <span className="text-sm">Практический</span>
                <span className="text-xs opacity-70">Разговорный</span>
              </div>
            </button>
          </div>
          {isLoading && (
            <p className="text-xs text-white/60 mt-2 text-center">Переключение стиля...</p>
          )}
        </div>
      )}

      {/* Информация о времени расчета */}
      {analysis.timeInfo && (
        <AccordionSection title="Информация о времени расчета" icon="⏰" defaultOpen={false}>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
              <div className="font-semibold text-blue-200 mb-2">📅 Введенные данные:</div>
              <div className="text-white/80">
                Дата и время: <strong className="text-white">{analysis.timeInfo.inputDateTime || 'Не указано'}</strong>
              </div>
              <div className="text-white/80 mt-1">
                Часовой пояс: <strong className="text-white">{analysis.timeInfo.timezone || 'Не указано'}</strong>
              </div>
              {analysis.timeInfo.longitude !== undefined && analysis.timeInfo.longitude !== null && (
                <div className="text-white/80 mt-1">
                  Долгота: <strong className="text-white">{analysis.timeInfo.longitude}°</strong>
                </div>
              )}
              {analysis.timeInfo.isDST !== undefined && (
                <div className={`mt-2 p-2 rounded ${analysis.timeInfo.isDST ? 'bg-yellow-500/20 border border-yellow-400/30' : 'bg-gray-500/20 border border-gray-400/30'}`}>
                  <div className="text-xs font-medium text-white/90">
                    {analysis.timeInfo.isDST ? '🌞 Летнее время (DST)' : '❄️ Зимнее время'}
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    {analysis.timeInfo.dstNote || (analysis.timeInfo.isDST ? 'Летнее время действовало в эту дату' : 'Летнее время не действовало')}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3">
              <div className="font-semibold text-purple-200 mb-2">🕐 Метод расчета:</div>
              <div className="text-white/80">
                <strong className="text-white">{analysis.timeInfo.timeMethod || (analysis.timeInfo.useSolarTime ? 'Истинное солнечное время' : 'Локальное административное время')}</strong>
              </div>
            </div>
            
            <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-3">
              <div className="font-semibold text-green-200 mb-2">🕑 Конвертированное время:</div>
              <div className="space-y-1">
                <div className="text-white/80">
                  Локальное административное время: <strong className="text-white">{analysis.timeInfo.localTime || 'Не указано'}</strong>
                </div>
                {analysis.timeInfo.useSolarTime && (
                  <div className="text-white/80">
                    Истинное солнечное время: <strong className="text-white">{analysis.timeInfo.solarTime || 'Не указано'}</strong>
                  </div>
                )}
                <div className="text-white/80">
                  Время, использованное для расчета часа: <strong className="text-yellow-300">{analysis.timeInfo.hourMomentUsed || 'Не указано'}</strong>
                </div>
              </div>
            </div>
          </div>
        </AccordionSection>
      )}

      {/* Столпы Бацзы */}
      <AccordionSection title="Ваши натальные столпы" icon="◉" defaultOpen={true}>
        <div className="flex gap-4 justify-center flex-wrap">
          {analysis.pillars && analysis.pillars.length > 0 ? analysis.pillars.map((pillar, i) => {
            if (!pillar || pillar.trim().length === 0) return null;
            
            const pillarNames = ['Год', 'Месяц', 'День', 'Час'];
            const stemGlyph = pillar.charAt(0); // Первый иероглиф - небесный ствол
            const branchGlyph = pillar.charAt(1); // Второй иероглиф - земная ветвь
            
            // Получаем скрытые стволы, если доступны
            const pillarData = analysis.pillarsWithHiddenStems?.[i];
            const hiddenStems = pillarData?.hiddenStems || [];
            
            // Пояснения иероглифов
            const stemNames: Record<string, string> = {
              '甲': '甲 (Цзя) - Дерево Ян', '乙': '乙 (И) - Дерево Инь',
              '丙': '丙 (Бин) - Огонь Ян', '丁': '丁 (Дин) - Огонь Инь',
              '戊': '戊 (У) - Земля Ян', '己': '己 (Цзи) - Земля Инь',
              '庚': '庚 (Гэн) - Металл Ян', '辛': '辛 (Синь) - Металл Инь',
              '壬': '壬 (Жэнь) - Вода Ян', '癸': '癸 (Гуй) - Вода Инь'
            };
            
            const branchNames: Record<string, string> = {
              '子': '子 (Цзы) - Крыса, Вода', '丑': '丑 (Чоу) - Бык, Земля',
              '寅': '寅 (Инь) - Тигр, Дерево', '卯': '卯 (Мао) - Кролик, Дерево',
              '辰': '辰 (Чэнь) - Дракон, Земля', '巳': '巳 (Сы) - Змея, Огонь',
              '午': '午 (У) - Лошадь, Огонь', '未': '未 (Вэй) - Коза, Земля',
              '申': '申 (Шэнь) - Обезьяна, Металл', '酉': '酉 (Ю) - Петух, Металл',
              '戌': '戌 (Сюй) - Собака, Земля', '亥': '亥 (Хай) - Свинья, Вода'
            };
            
            return (
              <div key={i} className="text-center bg-white/5 p-4 rounded-lg border border-white/10 min-w-[140px]">
                <div className="text-4xl font-bold text-yellow-300 mb-2">{pillar}</div>
                <div className="text-sm font-semibold text-white mb-3">
                  {pillarNames[i]}
                </div>
                <div className="text-xs text-white/80 space-y-1">
                  <div className="border-b border-white/10 pb-1">
                    <div className="text-yellow-200 font-semibold">{stemGlyph}</div>
                    <div>{stemNames[stemGlyph] || 'Небесный ствол'}</div>
                  </div>
                  <div className="pt-1">
                    <div className="text-yellow-200 font-semibold">{branchGlyph}</div>
                    <div>{branchNames[branchGlyph] || 'Земная ветвь'}</div>
                    {hiddenStems.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="text-purple-300 text-xs font-semibold mb-1">Скрытые стволы (藏干):</div>
                        {hiddenStems.map((h, idx) => (
                          <div key={idx} className="text-xs text-white/70">
                            {h.stem} ({h.element}) {h.weight < 1 ? `×${h.weight.toFixed(1)}` : ''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-white/70">Столпы не рассчитаны</div>
          )}
        </div>
      </AccordionSection>

      {/* Элемент личности */}
      <AccordionSection title="Элемент личности" icon="◆" defaultOpen={true}>
        <div className="mb-4">
          <p className="text-2xl font-bold text-white mb-2">
            {analysis.dayMaster.glyph} {analysis.dayMaster.element}
          </p>
          <p className="text-white/80 mb-4">
            Сила: <span className="font-semibold">{analysis.dayMaster.strengthText}</span>
          </p>
          
          {/* Объяснение что такое элемент личности */}
          {elementExplanation && (
            <div className="bg-white/10 p-4 rounded-lg border border-white/20 mb-4">
              <h4 className="text-white font-semibold mb-3">💡 Что это значит?</h4>
              <div className="space-y-3 text-white/90 text-sm leading-relaxed">
                <div>
                  <strong className="text-white">СУТЬ:</strong> {elementExplanation.essence}
                </div>
                <div>
                  <strong className="text-white">СОСТОЯНИЕ:</strong> {elementExplanation.state}
                </div>
                <div>
                  <strong className="text-white">ЗАДАЧА:</strong> {elementExplanation.task}
                </div>
                <div>
                  <strong className="text-white">ПРАКТИКА:</strong> {elementExplanation.practice}
                </div>
                {gender && elementExplanation[`${gender}Nuance` as keyof typeof elementExplanation] && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <strong className="text-white">ВАШ НЮАНС:</strong>{' '}
                    {elementExplanation[`${gender}Nuance` as keyof typeof elementExplanation] as string}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Базовое объяснение, если нет детального */}
          {!elementExplanation && (
            <div className="bg-white/10 p-4 rounded-lg border border-white/20 mb-4">
              <h4 className="text-white font-semibold mb-2">💡 Что это значит?</h4>
              <p className="text-white/90 text-sm leading-relaxed">
                <strong>Элемент личности</strong> — это ваш основной элемент в системе У-Син, определяемый по дню вашего рождения. 
                Он отражает вашу внутреннюю природу, характер и энергетику. 
                {analysis.dayMaster.strengthText.includes('слабый') && (
                  <> <strong>Слабый элемент</strong> означает, что вам нужна поддержка через другие элементы для гармонии и баланса.</>
                )}
                {analysis.dayMaster.strengthText.includes('средн') && (
                  <> <strong>Сбалансированный элемент</strong> означает гармоничное состояние, когда ваша энергия находится в равновесии.</>
                )}
                {analysis.dayMaster.strengthText.includes('сильный') && (
                  <> <strong>Сильный элемент</strong> означает избыток энергии, который нужно направлять и балансировать.</>
                )}
              </p>
            </div>
          )}
        </div>
        {elementKey && onSelectElement && (
          <button
            onClick={handleSelectElement}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            ▲ Использовать этот элемент для амулета
          </button>
        )}
      </AccordionSection>

      {/* Баланс элементов */}
      <AccordionSection title="Баланс элементов" icon="⚖" defaultOpen={true}>
        {analysis.balanceAnalysis?.interpretation && (
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-4 mb-4">
            <div className="text-blue-200 font-semibold mb-2">📊 Качественный анализ:</div>
            <div className="text-white/90 text-sm">{analysis.balanceAnalysis.interpretation}</div>
            {analysis.balanceAnalysis.weak && analysis.balanceAnalysis.weak.length > 0 && (
              <div className="text-white/80 text-xs mt-2">
                Мало: {analysis.balanceAnalysis.weak.join(', ')}
              </div>
            )}
          </div>
        )}
        <div className="space-y-3">
          {Object.entries(analysis.elementBalance).map(([element, value]) => (
            <div key={element} className="flex items-center gap-3">
              <span className="w-24 text-white font-medium">{element}:</span>
              <div className="flex-1 bg-white/20 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all"
                  style={{ width: `${Math.min((value / 10) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm text-white/70 w-16 text-right">{value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* Взаимодействия столпов */}
      {analysis.interactions && analysis.interactions.length > 0 && (
        <AccordionSection title="Взаимодействия столпов" icon="⚡" defaultOpen={true}>
          <div className="space-y-3">
            {analysis.interactions.map((interaction, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  interaction.impact === 'positive'
                    ? 'bg-green-500/20 border-green-400/50'
                    : interaction.impact === 'negative'
                    ? 'bg-red-500/20 border-red-400/50'
                    : 'bg-yellow-500/20 border-yellow-400/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold">{interaction.type}</span>
                  <span className="text-white font-semibold">{interaction.name}</span>
                  <span className="text-xs text-white/70">
                    ({interaction.pillars.join(' - ')})
                  </span>
                </div>
                <div className="text-white/90 text-sm">{interaction.description}</div>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Специальные комбинации */}
      {(analysis.isPureMonth || 
        (analysis.castlePillars && analysis.castlePillars.length > 0) ||
        (analysis.sandwichBranches && analysis.sandwichBranches.length > 0) ||
        (analysis.noblePeople && analysis.noblePeople.length > 0)) && (
        <AccordionSection title="Специальные структуры" icon="🔮" defaultOpen={true}>
          <div className="space-y-4">
            {/* Чистая Ци месяца */}
            {analysis.isPureMonth && analysis.pureMonthInfo && (
              <div className="bg-purple-500/20 border border-purple-400/50 rounded-lg p-4">
                <div className="text-purple-200 font-semibold mb-2">✨ {analysis.pureMonthInfo.stem}{analysis.pureMonthInfo.branch}</div>
                <div className="text-white/90 text-sm">{analysis.pureMonthInfo.meaning}</div>
              </div>
            )}

            {/* Замковые столпы */}
            {analysis.castlePillars && analysis.castlePillars.length > 0 && (
              <div className="space-y-2">
                <div className="text-white font-semibold mb-2">🏛 Замковые столпы (主柱):</div>
                {analysis.castlePillars.map((castle, idx) => (
                  <div key={idx} className="bg-orange-500/20 border border-orange-400/50 rounded-lg p-3">
                    <div className="text-orange-200 font-semibold mb-1">
                      {castle.fullPillar ? castle.fullPillar : castle.branch} ({castle.count}×) - {castle.element}
                    </div>
                    <div className="text-white/90 text-sm">{castle.meaning}</div>
                    <div className="text-white/70 text-xs mt-1">
                      В столпах: {castle.pillars.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Пропущенные ветви (сэндвич) */}
            {analysis.sandwichBranches && analysis.sandwichBranches.length > 0 && (
              <div className="space-y-2">
                <div className="text-white font-semibold mb-2">🥪 Пропущенные ветви (сэндвич):</div>
                {analysis.sandwichBranches.map((sandwich, idx) => (
                  <div key={idx} className="bg-indigo-500/20 border border-indigo-400/50 rounded-lg p-3">
                    <div className="text-indigo-200 font-semibold mb-1">{sandwich.branch} - {sandwich.element}</div>
                    <div className="text-white/90 text-sm">{sandwich.meaning}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Благородные люди */}
            {analysis.noblePeople && analysis.noblePeople.length > 0 && (
              <div className="space-y-2">
                <div className="text-white font-semibold mb-2">👑 Благородные люди (贵人):</div>
                {analysis.noblePeople.map((noble, idx) => (
                  <div 
                    key={idx} 
                    className={`rounded-lg p-3 ${
                      noble.present 
                        ? 'bg-yellow-500/20 border border-yellow-400/50' 
                        : 'bg-gray-500/20 border border-gray-400/50'
                    }`}
                  >
                    <div className={`font-semibold mb-1 ${
                      noble.present ? 'text-yellow-200' : 'text-gray-300'
                    }`}>
                      {noble.branch} - {noble.element} {noble.present ? `в ${noble.pillar}` : '(отсутствует в карте)'}
                    </div>
                    <div className="text-white/90 text-sm">{noble.meaning}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Температурный баланс */}
            {analysis.temperatureBalance && (
              <div className="bg-teal-500/20 border border-teal-400/50 rounded-lg p-4">
                <div className="text-teal-200 font-semibold mb-2">🌡 Температурный баланс:</div>
                <div className="text-white/90 text-sm mb-2">
                  <strong>{analysis.temperatureBalance.balance}</strong>
                </div>
                <div className="text-white/80 text-xs">
                  {analysis.temperatureBalance.interpretation}
                </div>
              </div>
            )}
          </div>
        </AccordionSection>
      )}

      {/* Специальная структура карты */}
      {analysis.specialStructure && (
        <AccordionSection title="Специальная структура карты" icon="⭐" defaultOpen={true}>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 border-2 border-purple-400/50 rounded-lg p-4">
              <div className="text-purple-200 font-bold text-lg mb-3">
                ⭐ {analysis.specialStructure.typeRu}
              </div>
              {analysis.specialStructure.details && (
                <div className="text-white/80 text-sm space-y-2 mb-3">
                  {analysis.specialStructure.details.mergerPair && (
                    <div className="bg-white/5 rounded p-2">
                      <span className="text-purple-200 font-semibold">Слияние Небесных Стволов:</span> {analysis.specialStructure.details.mergerPair.stem1} + {analysis.specialStructure.details.mergerPair.stem2}
                    </div>
                  )}
                  {analysis.specialStructure.details.transformationElement && (
                    <div className="bg-white/5 rounded p-2">
                      <span className="text-purple-200 font-semibold">Элемент трансформации:</span> <span className="font-semibold text-yellow-300">{analysis.specialStructure.details.transformationElement}</span>
                    </div>
                  )}
                  {analysis.specialStructure.details.generatingElement && (
                    <div className="bg-white/5 rounded p-2">
                      <span className="text-purple-200 font-semibold">Поддерживающий элемент:</span> <span className="text-yellow-300">{analysis.specialStructure.details.generatingElement}</span>
                    </div>
                  )}
                  {analysis.specialStructure.details.dominantElement && (
                    <div className="bg-white/5 rounded p-2">
                      <span className="text-purple-200 font-semibold">Доминирующий элемент:</span> <span className="font-semibold text-yellow-300">{analysis.specialStructure.details.dominantElement}</span>
                    </div>
                  )}
                  {analysis.specialStructure.details.clashingBranch && (
                    <div className="bg-white/5 rounded p-2 text-yellow-200">
                      <span className="text-purple-200 font-semibold">Редкая структура:</span> {analysis.specialStructure.details.repeatedCount}x {analysis.specialStructure.details.repeatedBranch} сталкивается с {analysis.specialStructure.details.clashingBranch}
                    </div>
                  )}
                </div>
              )}
              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3 mt-3">
                <div className="text-yellow-200 font-semibold mb-2">✨ Полезные элементы для этой структуры:</div>
                <div className="flex flex-wrap gap-2">
                  {analysis.specialStructure.usefulElements?.map((element, idx) => (
                    <span key={idx} className="px-3 py-1 bg-yellow-500/20 border border-yellow-400/40 rounded-full text-white font-semibold">
                      {element}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AccordionSection>
      )}

      {/* Полезные и вредные элементы */}
      {analysis.usefulStems && analysis.usefulStems.length > 0 && (
        <AccordionSection title="Полезные и вредные элементы" icon="🎯" defaultOpen={true}>
          <div className="space-y-4">
            {analysis.specialStructure && (
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3 mb-4">
                <div className="text-blue-200 font-semibold text-sm mb-1">ℹ️ Примечание:</div>
                <div className="text-white/80 text-sm">
                  Для специальной структуры "{analysis.specialStructure.typeRu}" полезные элементы определяются особым образом и могут отличаться от стандартного анализа силы.
                </div>
              </div>
            )}
            <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-4">
              <div className="text-green-200 font-semibold mb-2">✅ Полезные элементы (用神):</div>
              <div className="text-white/90 mb-2">
                Элементы: <span className="font-semibold">{analysis.usefulElements?.join(', ') || ''}</span>
              </div>
              <div className="text-white/90">
                Небесные стволы: <span className="font-semibold text-lg">{analysis.usefulStems.join(', ')}</span>
              </div>
              <div className="text-white/70 text-xs mt-2">
                {analysis.dayMaster?.strength !== undefined && (
                  analysis.dayMaster.strength <= 2 
                    ? 'Для слабой личности нужны поддержка и помощь'
                    : analysis.dayMaster.strength >= 4
                    ? 'Для сильной личности нужны ослабление и истощение'
                    : 'Для сбалансированной личности нужна поддержка и небольшое ослабление'
                )}
              </div>
            </div>
            
            {analysis.harmfulStems && analysis.harmfulStems.length > 0 && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4">
                <div className="text-red-200 font-semibold mb-2">❌ Вредные элементы (忌神):</div>
                <div className="text-white/90 mb-2">
                  Элементы: <span className="font-semibold">{analysis.harmfulElements?.join(', ') || ''}</span>
                </div>
                <div className="text-white/90">
                  Небесные стволы: <span className="font-semibold text-lg">{analysis.harmfulStems.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
        </AccordionSection>
      )}

      {/* Прогноз и рекомендации */}
      {content && (
        <AccordionSection title="Прогноз и рекомендации" icon="📋" defaultOpen={true}>
          <div className="space-y-3">
            {content.mainForecast && (
              <AccordionSection title="Прогноз на 2026 год" icon="📋" defaultOpen={false} isNested={true}>
                <div className="flex items-center justify-between mb-2">
                  {content.style && (
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      content.style === 'poetic' 
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50' 
                        : 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                    }`}>
                      {content.style === 'poetic' ? '〜 Поэтический' : '▣ Практический'}
                    </span>
                  )}
                </div>
                <p className="text-white/90">{content.mainForecast}</p>
              </AccordionSection>
            )}
            
            {content.energy && (
              <AccordionSection title="Энергия года" icon="⚡" defaultOpen={false} isNested={true}>
                <p className="text-white/90">{content.energy}</p>
              </AccordionSection>
            )}
            
            {content.advice && (
              <AccordionSection title="Совет" icon="▢" defaultOpen={false} isNested={true}>
                <p className="text-white/90">{content.advice}</p>
              </AccordionSection>
            )}
            
            {content.ritual && (
              <AccordionSection title="Ритуал" icon="◊" defaultOpen={false} isNested={true}>
                <p className="text-white/90">{content.ritual}</p>
              </AccordionSection>
            )}
            
            {content.transformation && (
              <AccordionSection title="Возможность и превращение" icon="▶" defaultOpen={false} isNested={true}>
                <p className="text-white/90">{content.transformation}</p>
              </AccordionSection>
            )}
            
            {content.recommendations && (
              <AccordionSection title="Рекомендации" icon="■" defaultOpen={false} isNested={true}>
                <ul className="space-y-2 text-white/90">
                  {content.recommendations.amulet && (
                    <li>◯ {content.recommendations.amulet}</li>
                  )}
                  {content.recommendations.action && (
                    <li>► {content.recommendations.action}</li>
                  )}
                  {content.recommendations.colors && (
                    <li>◐ {content.recommendations.colors}</li>
                  )}
                </ul>
              </AccordionSection>
            )}
            
            {content.warnings && (
              <AccordionSection title="Предостережения" icon="⚠" defaultOpen={false} isNested={true}>
                <ul className="space-y-2 text-white/90">
                  {content.warnings.months && (
                    <li><strong>Месяцы:</strong> {content.warnings.months}</li>
                  )}
                  {content.warnings.health && (
                    <li><strong>Здоровье:</strong> {content.warnings.health}</li>
                  )}
                </ul>
              </AccordionSection>
            )}
            
            {content.balanceNote && (
              <AccordionSection title="Баланс элементов" icon="⚖" defaultOpen={false} isNested={true}>
                <p className="text-white/90 whitespace-pre-line">{content.balanceNote}</p>
              </AccordionSection>
            )}
            
            {content.specialNote && (
              <AccordionSection title="Особое примечание" icon="◆" defaultOpen={false} isNested={true}>
                <p className="text-white/90">{content.specialNote}</p>
              </AccordionSection>
            )}
            
            {content.yearContext && (
              <AccordionSection title="Контекст года (2026 - Огненная Лошадь)" icon="◄" defaultOpen={false} isNested={true}>
                <p className="text-white/90">{content.yearContext}</p>
              </AccordionSection>
            )}
            
            {content.health && (
              <AccordionSection title="Здоровье" icon="●" defaultOpen={false} isNested={true}>
                <p className="text-white/90">{content.health}</p>
              </AccordionSection>
            )}
            
            {content.amuletCreation && (
              <AccordionSection title={content.amuletCreation.title || 'Советы для создания амулета по выводам Бацзы'} icon="◯" defaultOpen={false} isNested={true}>
                <ul className="space-y-2 text-white/90">
                  {content.amuletCreation.element && (
                    <li><strong>Элемент:</strong> {content.amuletCreation.element.replace('Элемент: ', '')}</li>
                  )}
                  {content.amuletCreation.symbol && (
                    <li><strong>Символ:</strong> {content.amuletCreation.symbol.replace('Символ: ', '')}</li>
                  )}
                  {content.amuletCreation.colors && (
                    <li><strong>Цвета:</strong> {content.amuletCreation.colors.replace('Цвета: ', '')}</li>
                  )}
                  {content.amuletCreation.materials && (
                    <li><strong>Материалы:</strong> {content.amuletCreation.materials.replace('Материалы: ', '')}</li>
                  )}
                  {content.amuletCreation.favorableElements && (
                    <li><strong>Благоприятные элементы:</strong> {content.amuletCreation.favorableElements.replace('Благоприятные элементы: ', '')}</li>
                  )}
                  {content.amuletCreation.favorableColors && (
                    <li><strong>Благоприятные цвета:</strong> {content.amuletCreation.favorableColors.replace('Благоприятные цвета: ', '')}</li>
                  )}
                </ul>
              </AccordionSection>
            )}
          </div>
        </AccordionSection>
      )}

      {/* Кнопка приступить к созданию амулета */}
      {onStartAmuletCreation && (
        <div className="bg-gradient-to-br from-yellow-900/50 via-orange-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            ✨ Приступить к созданию Амулета ✨
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => handleStartAmuletCreation('bazi')}
              className="p-6 bg-gradient-to-br from-indigo-600/80 to-purple-600/80 border-2 border-indigo-400 rounded-xl text-white hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl"
            >
              <div className="text-4xl mb-3">🔮</div>
              <div className="font-bold text-xl mb-2">На основе Бацзы</div>
              <div className="text-sm text-white/90">
                Использовать рекомендованные элементы и символы из вашего прогноза
              </div>
            </button>
            <button
              onClick={() => handleStartAmuletCreation('custom')}
              className="p-6 bg-gradient-to-br from-blue-600/80 to-cyan-600/80 border-2 border-blue-400 rounded-xl text-white hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-xl"
            >
              <div className="text-4xl mb-3">🎲</div>
              <div className="font-bold text-xl mb-2">Свой</div>
              <div className="text-sm text-white/90">
                Выбрать любые элементы и символы без учёта рекомендаций Бацзы
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
