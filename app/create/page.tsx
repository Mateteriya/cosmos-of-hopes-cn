'use client';

/**
 * Страница создания амулета (китайская версия)
 */

import { useRouter } from 'next/navigation';
import AmuletConstructorNew from '@/components/amulet/AmuletConstructorNew';

export default function CreateAmuletPage() {
  const router = useRouter();

  const handleSave = async (params: any) => {
    try {
      // TODO: Реализовать сохранение амулета в базу данных через API
      console.log('Сохранение амулета в общее хранилище...', params);
      
      // Временно сохраняем в localStorage для отображения
      // Это будет работать до реализации полноценной БД
      const symbolId = params.symbol_id || params.symbol || '';
      const symbolName = params.symbol_name || params.symbol || symbolId;
      
      const amuletForStorage = {
        symbol: symbolId,
        symbolName: symbolName,
        symbolId: symbolId,
        color: params.color || '#DC2626',
        wishText: params.wish_text || '',
      };
      
      localStorage.setItem('lastSentAmulet', JSON.stringify(amuletForStorage));
      
      // Отправляем кастомное событие для обновления компонентов в той же вкладке
      window.dispatchEvent(new CustomEvent('amuletUpdated'));
      
      // Также отправляем storage event для синхронизации между вкладками
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'lastSentAmulet',
        newValue: JSON.stringify(amuletForStorage),
      }));
      
      // После реализации БД здесь будет вызов API:
      // const response = await fetch('/api/amulet/save', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(params),
      // });
      
    } catch (error) {
      console.error('Ошибка сохранения амулета:', error);
      throw error;
    }
  };

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

      {/* Кнопка профиля (если зарегистрирован) - не добавляем здесь, так как GlobalAmuletProvider не показывается на /create */}

      <div className="max-w-4xl mx-auto pt-4">
        <AmuletConstructorNew onSave={handleSave} />
      </div>
    </div>
  );
}

