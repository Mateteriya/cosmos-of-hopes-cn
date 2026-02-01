'use client';

/**
 * Новый конструктор амулетов с поддержкой двух уровней
 * Уровень 1: Для незарегистрированных пользователей (интуитивный выбор)
 * Уровень 2: Для зарегистрированных пользователей (персональный расчёт)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { AmuletParams, BaziElement } from '@/types/amulet';
import AmuletEditorLevel1 from './AmuletEditorLevel1';
import AmuletEditorLevel2 from './AmuletEditorLevel2';
import BaziForm from './BaziForm';
import BaziResults from './BaziResults';
import MagicAmuletTransformation from './MagicAmuletTransformation';
import { mapElement } from '@/lib/amulet-library';
import { mapElementToKey } from '@/lib/bazi-utils';
import { AMULET_SYMBOLS } from '@/types/amulet';
import { LEVEL1_ADDITIONAL_SYMBOLS } from '@/lib/amulet-library';

interface AmuletConstructorNewProps {
  onSave: (params: AmuletParams) => Promise<void>;
}

export default function AmuletConstructorNew({ onSave }: AmuletConstructorNewProps) {
  const router = useRouter();
  
  // Проверка авторизации
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // DEV MODE: для разработчика (обойти проверку авторизации)
  const [devMode, setDevMode] = useState(false);
  
  // Режим работы: 'level1' | 'level2' | 'bazi_calculating'
  const [mode, setMode] = useState<'level1' | 'level2' | 'bazi_calculating'>('level1');
  
  // Состояния для калькулятора Бацзы (уровень 2)
  const [baziLoading, setBaziLoading] = useState(false);
  const [baziAnalysis, setBaziAnalysis] = useState<any>(null);
  const [baziContent, setBaziContent] = useState<any>(null);
  const [baziFormData, setBaziFormData] = useState<{ dateTime: string; gender: 'male' | 'female'; timezone: string; longitude?: number | null; latitude?: number | null; useSolarTime?: boolean } | null>(null);
  const [baziError, setBaziError] = useState<string | null>(null);
  const [selectedBaziElement, setSelectedBaziElement] = useState<BaziElement | null>(null);
  
  // Состояние магического превращения
  const [showMagicTransformation, setShowMagicTransformation] = useState(false);
  const [hasTransformed, setHasTransformed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Данные амулета для сохранения
  const [amuletData, setAmuletData] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Если пользователь зарегистрирован, предлагаем выбор режима
  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated && mode === 'level1') {
      // Можно показать промпт выбора, но по умолчанию оставляем level1
      // Пользователь может переключиться на level2 через кнопку
    }
  }, [isAuthenticated, isCheckingAuth, mode]);

  const handleUseBaziForecast = () => {
    if (isAuthenticated || devMode) {
      setMode('bazi_calculating');
      setBaziError(null);
      setBaziAnalysis(null);
      setBaziContent(null);
    }
  };

  const calculateBazi = async (data: { dateTime: string; gender: 'male' | 'female'; timezone: string; longitude?: number | null; latitude?: number | null; useSolarTime?: boolean }, style: 'poetic' | 'practical' = 'poetic') => {
    setBaziLoading(true);
    setBaziError(null);
    
    try {
      const requestBody: any = {
        dateTime: data.dateTime,
        gender: data.gender,
        timezone: data.timezone,
        year: 2026,
        yearAnimal: 'Огненная Лошадь',
        style: style
      };
      
      // Добавляем координаты для точного расчета солнечного времени
      // ВАЖНО: Форма должна гарантировать наличие координат!
      // Всегда передаем координаты, если они указаны
      if (data.longitude !== null && data.longitude !== undefined && !isNaN(Number(data.longitude))) {
        requestBody.longitude = Number(data.longitude);
      } else {
        // Это не должно происходить - форма должна валидировать координаты!
        console.error('❌ ОШИБКА: Долгота не передана из формы!', {
          longitude: data.longitude,
          latitude: data.latitude,
          locationMode: 'unknown'
        });
      }
      if (data.latitude !== null && data.latitude !== undefined && !isNaN(Number(data.latitude))) {
        requestBody.latitude = Number(data.latitude);
      }
      
      // Добавляем опцию использования истинного солнечного времени
      // ВАЖНО: Всегда передаем параметр, даже если он false (по умолчанию false)
      requestBody.useSolarTime = data.useSolarTime === true;
      
      // Логирование для отладки (после установки useSolarTime)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 calculateBazi - Отправка данных в API:', {
          dateTime: data.dateTime,
          timezone: data.timezone,
          longitude: requestBody.longitude,
          latitude: requestBody.latitude,
          useSolarTime: requestBody.useSolarTime,
          rawUseSolarTime: data.useSolarTime
        });
      }
      
      const response = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка расчёта Бацзы');
      }

      // Логирование результата для отладки
      if (result.debug) {
        console.log('🔍 calculateBazi - Результат от API (отладочная информация):', result.debug);
        console.log('🔍 ДЕТАЛЬНЫЙ АНАЛИЗ РАСЧЕТА:', {
          inputLongitude: result.debug.inputLongitude,
          usedLongitude: result.debug.usedLongitude,
          localTime: result.debug.localTime,
          gmtTime: result.debug.gmtTime,
          lmtTime: result.debug.lmtTime,
          solarTime: result.debug.solarTime,
          hourMomentUsed: result.debug.hourMomentUsed,
          longitudeCorrectionMinutes: result.debug.longitudeCorrectionMinutes,
          eotMinutes: result.debug.eotMinutes,
          totalCorrectionMinutes: result.debug.totalCorrectionMinutes,
          utcOffsetMinutes: result.debug.utcOffsetMinutes,
          timezone: result.debug.timezone,
          differenceFromLocal: result.debug.totalCorrectionMinutes,
          expectedLongitudeCorrection: result.debug.inputLongitude ? (result.debug.inputLongitude / 15) * 60 : null,
          calculationSteps: result.debug.calculationSteps
        });
      }

      setBaziAnalysis(result.analysis);
      setBaziContent(result.content);
      setBaziFormData(data);
    } catch (error) {
      console.error('Ошибка расчёта Бацзы:', error);
      setBaziError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setBaziLoading(false);
    }
  };

  const handleBaziSubmit = async (data: { dateTime: string; gender: 'male' | 'female'; timezone: string; longitude?: number | null; latitude?: number | null; useSolarTime?: boolean }) => {
    setBaziFormData(data);
    await calculateBazi(data, 'poetic');
  };

  const handleStyleChange = async (newStyle: 'poetic' | 'practical') => {
    if (baziFormData) {
      await calculateBazi(baziFormData, newStyle);
    }
  };

  const handleSolarTimeChange = async (newUseSolarTime: boolean) => {
    if (baziFormData) {
      const updatedFormData = { ...baziFormData, useSolarTime: newUseSolarTime };
      setBaziFormData(updatedFormData);
      await calculateBazi(updatedFormData, baziContent?.style || 'poetic');
    }
  };

  const handleSelectBaziElement = (element: BaziElement) => {
    setSelectedBaziElement(element);
    // Переключаемся на уровень 2 с готовыми данными
    setMode('level2');
  };

  const handleStartAmuletCreation = (creationMode: 'bazi' | 'custom', useSolarTime?: boolean) => {
    // Сохраняем выбранный метод расчета времени для активации персонального квеста
    // Это важно: персональный квест можно активировать только для одного варианта (истинное или административное время)
    if (useSolarTime !== undefined && baziFormData) {
      setBaziFormData({ ...baziFormData, useSolarTime });
    }
    
    if (creationMode === 'bazi') {
      // Использовать рекомендованные элементы и символы из Бацзы
      if (baziAnalysis) {
        const elementKey = mapElementToKey(baziAnalysis.dayMaster.element);
        if (elementKey) {
          setSelectedBaziElement(elementKey);
          setMode('level2');
        }
      }
    } else {
      // Свой выбор - показать полный редактор уровня 1
      setMode('level1');
    }
  };

  const handleLevel1Complete = async (data: {
    element: BaziElement;
    symbol: string;
    color: string;
    wishText: string;
    blessingText?: string;
  }) => {
    setAmuletData(data);
    setShowMagicTransformation(true);
  };

  const handleLevel2Complete = async (data: {
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
  }) => {
    setAmuletData(data);
    setShowMagicTransformation(true);
  };

  const [showSendToStorage, setShowSendToStorage] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleTransformationComplete = async () => {
    setShowMagicTransformation(false);
    setHasTransformed(true);
    setShowSendToStorage(true);
  };

  const handleSendToStorage = async () => {
    if (!amuletData) return;

    setIsSaving(true);
    try {
      const params: AmuletParams = {
        symbol: amuletData.symbol || amuletData.symbolName,
        color: amuletData.color,
        bazi_element: amuletData.element || mapElement(baziAnalysis?.dayMaster?.element || 'Дерево'),
        wish_text: amuletData.wishText,
        level: mode === 'level1' ? 1 : 2,
        personalized: mode === 'level2',
        ...(mode === 'level2' && {
          symbol_id: amuletData.symbolId,
          material_id: amuletData.materialId,
          task: amuletData.task,
          priority_elements: amuletData.priorityElements,
        }),
      };

      await onSave(params);
      // После успешного сохранения показываем сообщение об успехе
      setIsSaved(true);
    } catch (error) {
      console.error('Ошибка сохранения амулета:', error);
      alert('Ошибка при сохранении амулета');
    } finally {
      setIsSaving(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="text-center text-white p-8">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p>Проверка авторизации...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
          创建护身符
        </h1>
        <p className="text-white/70 text-lg">Создайте свой амулет желания</p>
      </div>

      {/* Режим разработчика */}
      <div className="bg-gradient-to-br from-yellow-900/50 via-orange-900/30 to-yellow-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🔧</span>
          <span>Режим разработчика</span>
        </h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={devMode}
              onChange={(e) => {
                setDevMode(e.target.checked);
              }}
              className="w-6 h-6 rounded border-2 border-white/30 bg-white/10 checked:bg-yellow-500 checked:border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all"
            />
            <span className="text-white font-semibold">
              🔓 Режим разработчика (обойти проверку авторизации)
            </span>
          </label>
        </div>
        {devMode && (
          <p className="text-yellow-200 text-sm mt-2">
            ✓ Режим разработчика активен. Вы можете тестировать функции для зарегистрированных пользователей.
          </p>
        )}
      </div>

      {/* Для зарегистрированных: выбор режима */}
      {(isAuthenticated || devMode) && mode === 'level1' && (
        <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-blue-900/50 backdrop-blur-md border-2 border-indigo-500/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {devMode ? '🔧 Режим разработчика активен' : '🔐 Вы зарегистрированы'}
          </h2>
          <p className="text-white/80 mb-4">
            Вы можете создать амулет двумя способами:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('level1')}
              className="p-4 bg-white/10 border-2 border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
            >
              <div className="text-2xl mb-2">🎲</div>
              <div className="font-semibold">Интуитивный выбор</div>
              <div className="text-sm text-white/70 mt-1">Быстрый и красивый ритуал</div>
            </button>
            <button
              onClick={handleUseBaziForecast}
              className="p-4 bg-white/10 border-2 border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
            >
              <div className="text-2xl mb-2">🔮</div>
              <div className="font-semibold">Персональный амулет</div>
              <div className="text-sm text-white/70 mt-1">На основе карты Бацзы</div>
            </button>
          </div>
        </div>
      )}

      {/* Уровень 1: Интуитивный выбор */}
      {mode === 'level1' && (
        <AmuletEditorLevel1 
          onComplete={handleLevel1Complete}
          onRequestPersonalized={isAuthenticated ? undefined : () => {
            // Показываем промпт регистрации или переключаем на регистрацию
            alert('Для создания персонального амулета необходимо зарегистрироваться');
          }}
          hidePreview={hasTransformed && showSendToStorage}
        />
      )}

      {/* Калькулятор Бацзы (для уровня 2) */}
      {mode === 'bazi_calculating' && (
        <div className="space-y-6">
          {!baziAnalysis ? (
            <>
              <BaziForm onSubmit={handleBaziSubmit} isLoading={baziLoading} />
              {baziError && (
                <div className="p-4 bg-red-900/50 rounded-xl border-2 border-red-500/50">
                  <p className="text-white font-semibold mb-2">❌ Ошибка</p>
                  <p className="text-white/80 text-sm">{baziError}</p>
                </div>
              )}
            </>
          ) : (
            <BaziResults 
              analysis={baziAnalysis} 
              content={baziContent}
              onSelectElement={handleSelectBaziElement}
              onStyleChange={handleStyleChange}
              onSolarTimeChange={handleSolarTimeChange}
              onStartAmuletCreation={handleStartAmuletCreation}
              gender={baziFormData?.gender}
              isLoading={baziLoading}
            />
          )}
        </div>
      )}

      {/* Уровень 2: Персональный расчёт */}
      {mode === 'level2' && baziAnalysis && baziFormData && (
        <AmuletEditorLevel2
          baziAnalysis={baziAnalysis}
          gender={baziFormData.gender}
          onComplete={handleLevel2Complete}
        />
      )}

      {/* Магическое превращение */}
      {showMagicTransformation && amuletData && (
        <MagicAmuletTransformation
          symbol={amuletData.symbol || amuletData.symbolName}
          color={amuletData.color}
          baziElement={amuletData.element || mapElement(baziAnalysis?.dayMaster?.element || 'Дерево')}
          wishText={amuletData.wishText}
          onComplete={handleTransformationComplete}
          onClose={() => setShowMagicTransformation(false)}
        />
      )}

      {/* Единая панель с амулетом и кнопкой отправки в хранилище */}
      {hasTransformed && showSendToStorage && amuletData && (
        <div className="bg-gradient-to-br from-green-900/50 via-emerald-900/30 to-teal-900/50 backdrop-blur-md border-2 border-green-500/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {isSaved ? '✅ Амулет отправлен в Хранилище!' : '✨ Амулет создан! ✨'}
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Амулет слева */}
            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              <div className="relative">
                <div
                  className="w-40 h-40 rounded-full flex items-center justify-center text-7xl shadow-2xl border-4 animate-pulse"
                  style={{
                    backgroundColor: amuletData.color,
                    borderColor: `${amuletData.color}CC`,
                    boxShadow: `0 0 40px ${amuletData.color}80, 0 0 80px ${amuletData.color}40`,
                  }}
                >
                  {(() => {
                    // Находим иконку символа
                    const allSymbols = [
                      ...AMULET_SYMBOLS,
                      ...LEVEL1_ADDITIONAL_SYMBOLS.map((sym) => ({
                        value: sym.id,
                        label: sym.name,
                        icon: sym.icon,
                      })),
                    ];
                    const symbol = allSymbols.find(
                      (s) => s.value === amuletData.symbol || s.label === amuletData.symbolName
                    );
                    return symbol?.icon || amuletData.symbol || '✨';
                  })()}
                </div>
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: amuletData.color }}
                ></div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-white font-bold text-2xl">
                  {amuletData.symbolName || amuletData.symbol}
                </div>
                {amuletData.wishText && (
                  <div className="text-white/80 text-sm max-w-xs italic">
                    "{amuletData.wishText}"
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки справа */}
            <div className="flex flex-col gap-4 flex-1 items-center sm:items-start">
              {isSaved ? (
                <>
                  <div className="text-white/90 text-sm mb-2 text-center sm:text-left max-w-xs">
                    Ваш амулет теперь в Звёздном небе и доступен всем пользователям.
                  </div>
                  <button
                    onClick={() => router.push('/')}
                    className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    🏠 Вернуться на главную
                  </button>
                </>
              ) : (
                <>
                  <div className="text-white/90 text-sm mb-2 text-center sm:text-left max-w-xs">
                    Отправьте амулет в общее хранилище (Звёздное небо), чтобы он стал частью коллективного ритуала.
                  </div>
                  <button
                    onClick={handleSendToStorage}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin inline-block mr-2">⏳</span>
                        Отправка...
                      </>
                    ) : (
                      <>
                        🌟 Отправить в Хранилище 🌟
                      </>
                    )}
                  </button>
                  {isSaving && (
                    <div className="text-white/70 text-sm">
                      Сохранение амулета...
                    </div>
                  )}
                </>
              )}
              
              {/* Кнопка "Узнать персональный амулет" для незарегистрированных */}
              {!isAuthenticated && !devMode && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      alert('Для создания персонального амулета необходимо зарегистрироваться');
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    🔮 Узнать персональный амулет
                  </button>
                  <p className="text-white/70 text-xs mt-2 text-center sm:text-left">
                    Зарегистрируйтесь, чтобы получить амулет на основе вашей карты Бацзы
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

