'use client';

import { mapElementToKey } from '@/lib/bazi-utils';
import type { BaziElement } from '@/types/amulet';

interface BaziResultsProps {
  analysis: {
    pillars: string[];
    dayMaster: {
      element: string;
      strengthText: string;
      glyph: string;
    };
    elementBalance: Record<string, number>;
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
  isLoading?: boolean;
}

export default function BaziResults({ analysis, content, onSelectElement, onStyleChange, isLoading = false }: BaziResultsProps) {
  const elementKey = mapElementToKey(analysis.dayMaster.element);
  const currentStyle = content?.style || 'poetic';
  
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

  return (
    <div className="space-y-6">
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
      {/* Столпы Бацзы */}
      <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>◉</span>
          <span>Ваши натальные столпы</span>
        </h3>
        <div className="flex gap-4 justify-center flex-wrap">
          {analysis.pillars.map((pillar, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-yellow-300 mb-2">{pillar}</div>
              <div className="text-sm text-white/70">
                {['Год', 'Месяц', 'День', 'Час'][i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Элемент личности */}
      <div className="bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-red-900/50 backdrop-blur-md border-2 border-purple-500/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>◆</span>
          <span>Элемент личности</span>
        </h3>
        <div className="mb-4">
          <p className="text-2xl font-bold text-white mb-2">
            {analysis.dayMaster.glyph} {analysis.dayMaster.element}
          </p>
          <p className="text-white/80">
            Сила: <span className="font-semibold">{analysis.dayMaster.strengthText}</span>
          </p>
        </div>
        {elementKey && onSelectElement && (
          <button
            onClick={handleSelectElement}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            ▲ Использовать этот элемент для амулета
          </button>
        )}
      </div>

      {/* Баланс элементов */}
      <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">⚖ Баланс элементов</h3>
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
      </div>

      {/* Прогноз и рекомендации */}
      {content && (
        <div className="bg-gradient-to-br from-amber-900/50 via-yellow-900/30 to-orange-900/50 backdrop-blur-md border-2 border-amber-500/50 rounded-xl p-6 space-y-4">
          {content.mainForecast && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">📋 Прогноз на 2026 год</h3>
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
            </div>
          )}
          
          {content.energy && (
            <div>
              <h3 className="text-lg font-bold text-white mb-2">⚡ Энергия года</h3>
              <p className="text-white/90">{content.energy}</p>
            </div>
          )}
          
          {content.advice && (
            <div>
              <h3 className="text-lg font-bold text-white mb-2">▢ Совет</h3>
              <p className="text-white/90">{content.advice}</p>
            </div>
          )}
          
          {content.ritual && (
            <div>
              <h3 className="text-lg font-bold text-white mb-2">◊ Ритуал</h3>
              <p className="text-white/90">{content.ritual}</p>
            </div>
          )}
          
          {content.transformation && (
            <div className="bg-gradient-to-br from-green-900/50 via-emerald-900/30 to-teal-900/50 p-4 rounded-lg border-2 border-green-500/50">
              <h3 className="text-lg font-bold text-white mb-2">▶ Возможность и превращение</h3>
              <p className="text-white/90">{content.transformation}</p>
            </div>
          )}
          
          {content.recommendations && (
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-2">■ Рекомендации</h3>
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
            </div>
          )}
          
          {content.warnings && (
            <div className="bg-red-900/30 p-4 rounded-lg border-l-4 border-red-500">
              <h3 className="text-lg font-bold text-white mb-2">⚠ Предостережения</h3>
              <ul className="space-y-2 text-white/90">
                {content.warnings.months && (
                  <li><strong>Месяцы:</strong> {content.warnings.months}</li>
                )}
                {content.warnings.health && (
                  <li><strong>Здоровье:</strong> {content.warnings.health}</li>
                )}
              </ul>
            </div>
          )}
          
          {/* Новые поля из расширенной библиотеки */}
          {content.balanceNote && (
            <div className="bg-gradient-to-br from-amber-900/50 via-yellow-900/30 to-orange-900/50 p-4 rounded-lg border-2 border-amber-500/50">
              <h3 className="text-lg font-bold text-white mb-2">⚖ Баланс элементов</h3>
              <p className="text-white/90 whitespace-pre-line">{content.balanceNote}</p>
            </div>
          )}
          
          {content.specialNote && (
            <div className="bg-gradient-to-br from-blue-900/50 via-cyan-900/30 to-teal-900/50 p-4 rounded-lg border-2 border-blue-500/50">
              <h3 className="text-lg font-bold text-white mb-2">◆ Особое примечание</h3>
              <p className="text-white/90">{content.specialNote}</p>
            </div>
          )}
          
          {content.yearContext && (
            <div className="bg-gradient-to-br from-red-900/50 via-pink-900/30 to-rose-900/50 p-4 rounded-lg border-2 border-red-500/50">
              <h3 className="text-lg font-bold text-white mb-2">◄ Контекст года (2026 - Огненная Лошадь)</h3>
              <p className="text-white/90">{content.yearContext}</p>
            </div>
          )}
          
          {content.health && (
            <div className="bg-gradient-to-br from-green-900/50 via-emerald-900/30 to-teal-900/50 p-4 rounded-lg border-2 border-green-500/50">
              <h3 className="text-lg font-bold text-white mb-2">● Здоровье</h3>
              <p className="text-white/90">{content.health}</p>
            </div>
          )}
          
          {/* Рекомендации по созданию амулета - перемещены в конец */}
          {content.amuletCreation && (
            <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-blue-900/50 p-4 rounded-lg border-2 border-indigo-500/50">
              <h3 className="text-lg font-bold text-white mb-3">◯ {content.amuletCreation.title || 'Советы для создания амулета по выводам Бацзы'}</h3>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

