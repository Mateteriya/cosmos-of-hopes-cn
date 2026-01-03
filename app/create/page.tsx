'use client';

/**
 * Страница создания амулета (китайская версия)
 */

import { useRouter } from 'next/navigation';
import AmuletConstructor from '@/components/amulet/AmuletConstructor';

export default function CreateAmuletPage() {
  const router = useRouter();

  const handleSave = async () => {
    // TODO: Реализовать сохранение амулета
    console.log('Сохранение амулета...');
    // После сохранения - перенаправление на главную
    router.push('/');
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

      <div className="max-w-4xl mx-auto pt-4">
        <AmuletConstructor onSave={handleSave} />
      </div>
    </div>
  );
}

