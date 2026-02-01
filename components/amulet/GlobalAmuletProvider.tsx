'use client';

/**
 * Провайдер для получения и отображения глобального амулета пользователя
 */

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import GlobalAmuletAvatar from './GlobalAmuletAvatar';

interface AmuletData {
  symbol: string;
  symbolName?: string;
  symbolId?: string;
  color: string;
  wishText?: string;
}

export default function GlobalAmuletProvider() {
  const pathname = usePathname();
  const [amuletData, setAmuletData] = useState<AmuletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Не показываем амулет на странице создания (там он отображается крупным планом)
  const isCreatePage = pathname === '/create';

  useEffect(() => {
    const fetchUserAmulet = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          setIsLoading(false);
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Проверяем локальное хранилище для незарегистрированных пользователей
          const localAmulet = localStorage.getItem('lastSentAmulet');
          if (localAmulet) {
            try {
              const parsed = JSON.parse(localAmulet);
              setAmuletData(parsed);
            } catch (e) {
              console.error('Ошибка парсинга локального амулета:', e);
            }
          }
          setIsLoading(false);
          return;
        }

        // Для зарегистрированных пользователей - получаем из API
        // Пока используем локальное хранилище, потом заменим на API
        const localAmulet = localStorage.getItem('lastSentAmulet');
        if (localAmulet) {
          try {
            const parsed = JSON.parse(localAmulet);
            setAmuletData(parsed);
          } catch (e) {
            console.error('Ошибка парсинга локального амулета:', e);
          }
        }

        // TODO: После создания таблицы в БД, раскомментировать:
        // const response = await fetch('/api/amulet/latest');
        // const data = await response.json();
        // if (data.amulet) {
        //   setAmuletData(data.amulet);
        // }

        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки амулета:', error);
        setIsLoading(false);
      }
    };

    fetchUserAmulet();

    // Подписываемся на изменения в localStorage (для синхронизации между вкладками)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastSentAmulet') {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setAmuletData(parsed);
          } catch (error) {
            console.error('Ошибка парсинга амулета из storage:', error);
          }
        } else {
          setAmuletData(null);
        }
      }
    };

    // Кастомное событие для обновления в той же вкладке (storage event не срабатывает в той же вкладке)
    const handleCustomAmuletUpdate = () => {
      const localAmulet = localStorage.getItem('lastSentAmulet');
      if (localAmulet) {
        try {
          const parsed = JSON.parse(localAmulet);
          setAmuletData(parsed);
        } catch (error) {
          console.error('Ошибка парсинга амулета:', error);
        }
      } else {
        setAmuletData(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('amuletUpdated', handleCustomAmuletUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('amuletUpdated', handleCustomAmuletUpdate);
    };
  }, []);

  if (isLoading) {
    return null;
  }

  // Не показываем глобальный амулет на странице создания (там он показывается крупным планом)
  if (isCreatePage) {
    return null;
  }

  return <GlobalAmuletAvatar amuletData={amuletData} />;
}
