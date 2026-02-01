'use client';

/**
 * Конструктор амулетов (китайская версия)
 * Упрощённая версия для создания амулетов с китайскими символами
 */

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { AmuletParams, AmuletSymbol, BaziElement } from '@/types/amulet';
import { ELEMENT_COLORS, AMULET_SYMBOLS, BAZI_ELEMENTS } from '@/types/amulet';
import { AmuletSymbolIcon, AmuletSymbolIconWithChoice } from './AmuletSymbolIcons';
import MagicAmuletTransformation from './MagicAmuletTransformation';
import BaziForm from './BaziForm';
import BaziResults from './BaziResults';

interface AmuletConstructorProps {
  onSave: (params: AmuletParams) => Promise<void>;
}

export default function AmuletConstructor({ onSave }: AmuletConstructorProps) {
  // Проверка авторизации пользователя
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [useBaziForecast, setUseBaziForecast] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  // DEV MODE: для разработчика (пока что для теста)
  const [devMode, setDevMode] = useState(false);
  
  // Состояния для калькулятора Бацзы
  const [baziLoading, setBaziLoading] = useState(false);
  const [baziAnalysis, setBaziAnalysis] = useState<any>(null);
  const [baziContent, setBaziContent] = useState<any>(null);
  const [baziFormData, setBaziFormData] = useState<{ dateTime: string; gender: 'male' | 'female'; timezone: string } | null>(null);
  const [baziError, setBaziError] = useState<string | null>(null);

  // Отладка: логируем изменения состояний
  useEffect(() => {
    console.log('Состояния калькулятора:', { 
      useBaziForecast, 
      isAuthenticated, 
      devMode, 
      showAuthPrompt,
      hasAnalysis: !!baziAnalysis 
    });
  }, [useBaziForecast, isAuthenticated, devMode, showAuthPrompt, baziAnalysis]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.log('Supabase credentials not found, setting isAuthenticated to false');
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user } } = await supabase.auth.getUser();
        const authenticated = !!user;
        console.log('Auth check result:', authenticated);
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleBaziForecastClick = () => {
    console.log('handleBaziForecastClick called', { isAuthenticated, devMode });
    if (isAuthenticated || devMode) {
      setUseBaziForecast(true);
      setShowAuthPrompt(false);
      setBaziError(null);
      setBaziAnalysis(null);
      setBaziContent(null);
      console.log('Калькулятор открыт');
    } else {
      setShowAuthPrompt(true);
      setUseBaziForecast(false);
      console.log('Показан промпт авторизации');
    }
  };

  const calculateBazi = async (data: { dateTime: string; gender: 'male' | 'female'; timezone: string }, style: 'poetic' | 'practical' = 'poetic') => {
    setBaziLoading(true);
    setBaziError(null);
    
    try {
      const response = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateTime: data.dateTime,
          gender: data.gender,
          timezone: data.timezone,
          year: 2026,
          yearAnimal: 'Огненная Лошадь',
          style: style
        })
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка расчёта Бацзы');
      }

      setBaziAnalysis(result.analysis);
      setBaziContent(result.content);
    } catch (error) {
      console.error('Ошибка расчёта Бацзы:', error);
      setBaziError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setBaziLoading(false);
    }
  };

  const handleBaziSubmit = async (data: { dateTime: string; gender: 'male' | 'female'; timezone: string }) => {
    // Сохраняем данные формы для возможного пересчёта
    setBaziFormData(data);
    await calculateBazi(data, 'poetic');
  };

  const handleStyleChange = async (newStyle: 'poetic' | 'practical') => {
    if (baziFormData) {
      await calculateBazi(baziFormData, newStyle);
    }
  };

  const handleSelectBaziElement = (element: BaziElement) => {
    setBaziElement(element);
    // Автоматически выбираем первый цвет из палитры элемента
    const colors = ELEMENT_COLORS[element];
    if (colors && colors.length > 0) {
      setColor(colors[0].value);
    }
  };

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
  
  // Для выбора между двумя картинками весов
  const [scalesImageIndex, setScalesImageIndex] = useState(0);
  
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

      {/* ТЕСТ 1: Блок для незарегистрированных (показывает отказ) */}
      <div className="bg-gradient-to-br from-gray-800/50 via-gray-700/30 to-gray-800/50 backdrop-blur-md border-2 border-gray-500/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🧪 ТЕСТ 1</span>
          <span>Блок для незарегистрированных (показывает отказ)</span>
        </h2>
        <button
          onClick={() => {
            if (!isAuthenticated && !devMode) {
              setShowAuthPrompt(true);
              setUseBaziForecast(false);
            }
          }}
          disabled={isCheckingAuth || isAuthenticated || devMode}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔮 Использовать прогноз Бацзы (八字)
        </button>
        {showAuthPrompt && !isAuthenticated && !devMode && !useBaziForecast && (
          <div className="mt-4 p-4 bg-red-900/50 rounded-xl border-2 border-red-500/50">
            <p className="text-white font-semibold mb-2">⚠️ Требуется регистрация</p>
            <p className="text-white/80 text-sm mb-3">
              Для использования калькулятора Бацзы необходимо войти в аккаунт или зарегистрироваться.
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                Войти в аккаунт
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                Зарегистрироваться
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ТЕСТ 2: Блок для разработчика (работает с калькулятором) */}
      <div className="bg-gradient-to-br from-yellow-900/50 via-orange-900/30 to-yellow-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🔧 ТЕСТ 2 (DEV)</span>
          <span>Блок для разработчика (работает с калькулятором)</span>
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={devMode}
              onChange={(e) => {
                setDevMode(e.target.checked);
                if (e.target.checked) {
                  setShowAuthPrompt(false);
                }
              }}
              className="w-6 h-6 rounded border-2 border-white/30 bg-white/10 checked:bg-yellow-500 checked:border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all"
            />
            <span className="text-white font-semibold">
              🔓 Режим разработчика (обойти проверку авторизации)
            </span>
          </label>
        </div>
        <button
          onClick={handleBaziForecastClick}
          disabled={!devMode && !isAuthenticated}
          className="w-full px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔮 Использовать прогноз Бацзы (八字)
        </button>
        {useBaziForecast && (isAuthenticated || devMode) && (
          <div className="mt-4 space-y-4">
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
                isLoading={baziLoading}
              />
            )}
          </div>
        )}
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
                <div className="flex items-center justify-center mb-2" style={{ height: '64px' }}>
                  {sym.value === 'scales' ? (
                    <AmuletSymbolIconWithChoice
                      symbolId={sym.value}
                      size={64}
                      selectedImageIndex={scalesImageIndex}
                      onImageChange={setScalesImageIndex}
                    />
                  ) : (
                    <AmuletSymbolIcon symbolId={sym.value} size={64} />
                  )}
                </div>
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
                className="w-40 h-40 rounded-full flex items-center justify-center shadow-2xl border-4 animate-pulse"
                style={{ 
                  backgroundColor: color,
                  borderColor: `${color}CC`,
                  boxShadow: `0 0 40px ${color}80, 0 0 80px ${color}40`,
                }}
              >
                {symbol === 'scales' ? (
                  <AmuletSymbolIconWithChoice
                    symbolId={symbol}
                    size={96}
                    selectedImageIndex={scalesImageIndex}
                    onImageChange={setScalesImageIndex}
                  />
                ) : (
                  <AmuletSymbolIcon symbolId={symbol || ''} size={96} />
                )}
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

