'use client';

/**
 * Страница Личного Пространства пользователя (первая страница)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { AmuletSymbolIcon, AmuletSymbolIconWithChoice } from '@/components/amulet/AmuletSymbolIcons';
import { AMULET_SYMBOLS } from '@/types/amulet';
import { LEVEL1_ADDITIONAL_SYMBOLS } from '@/lib/amulet-library';

export default function ProfilePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sentAmulet, setSentAmulet] = useState<any>(null);
  const [scalesImageIndex, setScalesImageIndex] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setIsAuthenticated(true);
          setUserEmail(user.email || null);
        } else {
          setIsAuthenticated(false);
        }

        // Загружаем отправленный амулет из localStorage
        const localAmulet = localStorage.getItem('lastSentAmulet');
        if (localAmulet) {
          try {
            const parsed = JSON.parse(localAmulet);
            setSentAmulet(parsed);
          } catch (e) {
            console.error('Ошибка парсинга локального амулета:', e);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-amber-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-amber-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">🔐 Требуется авторизация</h2>
          <p className="text-white/80 mb-6">
            Для доступа к личному пространству необходимо войти в систему.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-amber-700 transition-all transform hover:scale-105"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  // Находим ID символа для отображения
  const allSymbols = [
    ...AMULET_SYMBOLS,
    ...LEVEL1_ADDITIONAL_SYMBOLS.map((sym) => ({
      value: sym.id,
      label: sym.name,
    })),
  ];
  const symbol = sentAmulet ? allSymbols.find(
    (s) => s.value === sentAmulet.symbol || s.value === sentAmulet.symbolId || s.label === sentAmulet.symbolName
  ) : null;
  const symbolId = symbol?.value || sentAmulet?.symbolId || sentAmulet?.symbol || '';

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-amber-950 p-4 relative">
      {/* Кнопка "Назад" */}
      <button
        onClick={() => router.push('/')}
        className="fixed top-4 left-4 z-50 p-3 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl text-white hover:bg-white/20 transition-all transform hover:scale-105"
        title="Назад на главную"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <div className="max-w-4xl mx-auto pt-20">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
            个人空间
          </h1>
          <p className="text-white/80 text-lg">Личное Пространство</p>
          {userEmail && (
            <p className="text-white/60 text-sm mt-2">{userEmail}</p>
          )}
        </div>

        {/* Отправленный амулет в общее хранилище */}
        <div className="bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-indigo-900/50 backdrop-blur-md border-2 border-purple-500/50 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">✨ Амулет в Звёздном небе ✨</h2>
          
          {sentAmulet ? (
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div
                  className="w-48 h-48 rounded-full flex items-center justify-center shadow-2xl border-4 animate-pulse"
                  style={{
                    backgroundColor: sentAmulet.color,
                    borderColor: `${sentAmulet.color}CC`,
                    boxShadow: `0 0 60px ${sentAmulet.color}80, 0 0 120px ${sentAmulet.color}40`,
                  }}
                >
                  {symbolId === 'scales' ? (
                    <AmuletSymbolIconWithChoice
                      symbolId={symbolId}
                      size={128}
                      selectedImageIndex={scalesImageIndex}
                      onImageChange={setScalesImageIndex}
                    />
                  ) : (
                    <AmuletSymbolIcon symbolId={symbolId} size={128} />
                  )}
                </div>
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: sentAmulet.color }}
                ></div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-white font-bold text-3xl">{sentAmulet.symbolName || sentAmulet.symbol}</div>
                {sentAmulet.wishText && (
                  <div className="text-white/80 text-sm italic max-w-md">
                    "{sentAmulet.wishText}"
                  </div>
                )}
                <div className="text-yellow-300/90 text-xs font-semibold mt-4 pt-4 border-t border-white/20">
                  ⚠️ Этот амулет отправлен в общее хранилище и не может быть изменён
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌟</div>
              <p className="text-white/80 text-lg mb-4">
                Вы ещё не отправили амулет в Звёздное небо
              </p>
              <button
                onClick={() => router.push('/create')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                ✨ Создать амулет
              </button>
            </div>
          )}
        </div>

        {/* Коллекция амулетов (будущая функциональность) */}
        <div className="bg-gradient-to-br from-amber-900/50 via-yellow-900/30 to-orange-900/50 backdrop-blur-md border-2 border-amber-500/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">📚 Моя коллекция амулетов</h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-white/80 text-lg mb-4">
              Создавайте новые амулеты для своей коллекции
            </p>
            <p className="text-white/60 text-sm mb-6">
              Вы можете создать неограниченное количество амулетов для личного использования
            </p>
            <button
              onClick={() => router.push('/create')}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
            >
              ✨ Создать новый амулет
            </button>
          </div>
        </div>

        {/* Настройки профиля (будущая функциональность) */}
        <div className="mt-6 bg-gradient-to-br from-slate-900/50 via-gray-900/30 to-slate-900/50 backdrop-blur-md border-2 border-slate-500/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">⚙️ Настройки</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <div className="text-white font-semibold">Email</div>
                <div className="text-white/60 text-sm">{userEmail || 'Не указан'}</div>
              </div>
            </div>
            <div className="text-white/60 text-sm text-center pt-4 border-t border-white/20">
              Дополнительные настройки профиля будут доступны в следующих версиях
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
