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
    mainForecast?: string;
    energy?: string;
    advice?: string;
    ritual?: string;
    recommendations?: {
      amulet?: string;
      action?: string;
      colors?: string;
    };
    warnings?: {
      months?: string;
      health?: string;
    };
  };
  onSelectElement?: (element: BaziElement) => void;
}

export default function BaziResults({ analysis, content, onSelectElement }: BaziResultsProps) {
  const elementKey = mapElementToKey(analysis.dayMaster.element);
  
  const handleSelectElement = () => {
    if (elementKey && onSelectElement) {
      onSelectElement(elementKey);
    }
  };

  return (
    <div className="space-y-6">
      {/* Столпы Бацзы */}
      <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🔮</span>
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
          <span>⭐</span>
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
            ✅ Использовать этот элемент для амулета
          </button>
        )}
      </div>

      {/* Баланс элементов */}
      <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">📊 Баланс элементов</h3>
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
              <h3 className="text-lg font-bold text-white mb-2">📜 Прогноз на 2026 год</h3>
              <p className="text-white/90">{content.mainForecast}</p>
            </div>
          )}
          
          {content.energy && (
            <div>
              <h3 className="text-lg font-bold text-white mb-2">💫 Энергия года</h3>
              <p className="text-white/90">{content.energy}</p>
            </div>
          )}
          
          {content.advice && (
            <div>
              <h3 className="text-lg font-bold text-white mb-2">💡 Совет</h3>
              <p className="text-white/90">{content.advice}</p>
            </div>
          )}
          
          {content.ritual && (
            <div>
              <h3 className="text-lg font-bold text-white mb-2">✨ Ритуал</h3>
              <p className="text-white/90">{content.ritual}</p>
            </div>
          )}
          
          {content.recommendations && (
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-2">💎 Рекомендации</h3>
              <ul className="space-y-2 text-white/90">
                {content.recommendations.amulet && (
                  <li>🔮 {content.recommendations.amulet}</li>
                )}
                {content.recommendations.action && (
                  <li>🎯 {content.recommendations.action}</li>
                )}
                {content.recommendations.colors && (
                  <li>🎨 {content.recommendations.colors}</li>
                )}
              </ul>
            </div>
          )}
          
          {content.warnings && (
            <div className="bg-red-900/30 p-4 rounded-lg border-l-4 border-red-500">
              <h3 className="text-lg font-bold text-white mb-2">⚠️ Предостережения</h3>
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
        </div>
      )}
    </div>
  );
}

