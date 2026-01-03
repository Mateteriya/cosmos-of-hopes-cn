'use client';

/**
 * Таймер до Китайского Нового года 2026
 * 29 января 2026, 00:00 (UTC+8, Пекин)
 */

import { useState, useEffect } from 'react';

export default function ChineseNewYearTimer() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Целевая дата: 29 января 2026, 00:00 UTC+8 (Пекин)
  const targetDate = new Date('2026-01-29T00:00:00+08:00');
  const targetTimestamp = targetDate.getTime();

  // Синхронизация времени с сервером
  useEffect(() => {
    const syncWithInternet = async () => {
      try {
        setIsSyncing(true);
        const localTimeBefore = Date.now();
        
        const response = await fetch('/api/time');
        const localTimeAfter = Date.now();
        const localTimeAvg = (localTimeBefore + localTimeAfter) / 2;
        
        if (response.ok) {
          const data = await response.json();
          const internetTime = new Date(data.timestamp).getTime();
          const offset = internetTime - localTimeAvg;
          setServerTimeOffset(offset);
        }
      } catch (error) {
        console.error('Ошибка синхронизации времени:', error);
        setServerTimeOffset(0);
      } finally {
        setIsSyncing(false);
      }
    };

    syncWithInternet();
    const syncInterval = setInterval(syncWithInternet, 5 * 60 * 1000); // Каждые 5 минут
    return () => clearInterval(syncInterval);
  }, []);

  // Обновление таймера
  useEffect(() => {
    const updateTimer = () => {
      const systemTime = Date.now();
      const correctedTime = systemTime + serverTimeOffset;
      const diff = targetTimestamp - correctedTime;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [serverTimeOffset, targetTimestamp]);

  if (!timeLeft) {
    return (
      <div className="text-white/70 text-sm">
        加载中...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 sm:gap-4">
        {timeLeft.days > 0 && (
          <>
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300 tabular-nums">
                {timeLeft.days.toString().padStart(2, '0')}
              </div>
              <div className="text-xs sm:text-sm text-white/60">天</div>
            </div>
            <div className="text-xl sm:text-2xl text-yellow-400">:</div>
          </>
        )}
        <div className="flex flex-col items-center">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300 tabular-nums">
            {timeLeft.hours.toString().padStart(2, '0')}
          </div>
          <div className="text-xs sm:text-sm text-white/60">时</div>
        </div>
        <div className="text-xl sm:text-2xl text-yellow-400">:</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300 tabular-nums">
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <div className="text-xs sm:text-sm text-white/60">分</div>
        </div>
        <div className="text-xl sm:text-2xl text-yellow-400">:</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300 tabular-nums">
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs sm:text-sm text-white/60">秒</div>
        </div>
      </div>
      {isSyncing && (
        <div className="text-white/50 text-xs">
          同步时间...
        </div>
      )}
    </div>
  );
}

