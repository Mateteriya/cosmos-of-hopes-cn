'use client';

/**
 * Главная страница приложения "Путь Огненной Лошади" (火马之路)
 */

import { useRouter } from 'next/navigation';
import DecorativeParticles from '@/components/DecorativeParticles';
import ChineseNewYearTimer from '@/components/ChineseNewYearTimer';

export default function Home() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-amber-950 flex items-center justify-center p-3 sm:p-4 relative">
      {/* Декоративные элементы - огненные частицы (только на клиенте) */}
      <DecorativeParticles />

      <div className="max-w-4xl w-full relative z-10">
        {/* Заголовок */}
        <div className="text-center mb-8 sm:mb-12 pt-16 sm:pt-8">
          {/* Китайское название */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-red-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent leading-tight">
            火马之路
          </h1>
          {/* Подзаголовок на русском */}
          <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-6 font-light">
            Путь Огненной Лошади
          </p>
          {/* Описание */}
          <p className="text-base sm:text-lg md:text-xl text-white/80 mb-2 px-4 max-w-2xl mx-auto leading-relaxed">
            15-дневное путешествие к Китайскому Новому году 2026
          </p>
          <p className="text-sm sm:text-base text-white/60 px-4 max-w-xl mx-auto">
            Создайте амулет желания, объединитесь в комнатах, запустите фонарики в небо
          </p>
        </div>

        {/* Основные действия */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Создать амулет */}
          <button
            onClick={() => router.push('/create')}
            className="group relative text-white font-bold px-6 py-12 rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
            }}
          >
            <div className="mb-4 flex justify-center">
              <span className="text-5xl">🐴</span>
            </div>
            <div className="text-2xl mb-2">创建护身符</div>
            <div className="text-sm opacity-90">Создать амулет</div>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-2xl transition-all" />
          </button>

          {/* Комнаты */}
          <button
            onClick={() => router.push('/rooms')}
            className="group relative text-white font-bold px-6 py-12 rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
            }}
          >
            <div className="mb-4 flex justify-center">
              <span className="text-5xl">🏮</span>
            </div>
            <div className="text-2xl mb-2">房间</div>
            <div className="text-sm opacity-90">Комнаты</div>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-2xl transition-all" />
          </button>

          {/* Храм/Дворец (вместо ёлки) */}
          <button
            onClick={() => router.push('/temple')}
            className="group relative text-white font-bold px-6 py-12 rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #a16207 100%)',
            }}
          >
            <div className="mb-4 flex justify-center">
              <span className="text-5xl">🐉</span>
            </div>
            <div className="text-2xl mb-2">宫殿</div>
            <div className="text-sm opacity-90">Храм/Дворец</div>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-2xl transition-all" />
          </button>
        </div>

        {/* Информационный блок */}
        <div className="bg-gradient-to-br from-red-900/50 via-amber-900/30 to-red-900/50 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent">
            🎊 新年快乐! 🎊
          </h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">🔥</span>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Бацзы-гороскоп</h3>
                <p className="text-sm text-white/80">
                  Создайте персональный амулет на основе вашего гороскопа Бацзы и элемента удачи на 2026 год
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">🏮</span>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Храм с фонарями</h3>
                <p className="text-sm text-white/80">
                  Все амулеты размещаются вокруг Храма/Дворца. 12 февраля все фонарики взлетят в небо
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">🎭</span>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Комнаты по стихиям</h3>
                <p className="text-sm text-white/80">
                  Объединяйтесь с единомышленниками в тематических комнатах (Огонь, Дерево, Вода, Земля, Металл)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">🐴</span>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Путь Лошади</h3>
                <p className="text-sm text-white/80">
                  Поддерживайте символ года — Огненную Лошадь. Чем больше активности, тем ярче празднование
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Таймер до Нового года */}
        <div className="bg-gradient-to-br from-amber-900/40 via-red-900/40 to-amber-900/40 backdrop-blur-md border-2 border-red-400/50 rounded-2xl p-6 text-center mb-6">
          <div className="text-3xl mb-3">⏰</div>
          <h3 className="text-xl font-bold text-white mb-4">До Китайского Нового года</h3>
          <div className="mb-4">
            <ChineseNewYearTimer />
          </div>
          <p className="text-sm text-white/70 mb-1">
            29 января 2026, 00:00 (UTC+8, Пекин)
          </p>
          <p className="text-xs text-white/60">
            Фестиваль фонарей: 12 февраля 2026
          </p>
        </div>

        {/* Статус разработки */}
        <div className="bg-slate-800/50 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 text-center">
          <p className="text-white/70 text-sm mb-1">
            🚧 Приложение в разработке
          </p>
          <p className="text-white/50 text-xs">
            Запуск: 29 января 2026
          </p>
        </div>
      </div>
    </div>
  );
}
