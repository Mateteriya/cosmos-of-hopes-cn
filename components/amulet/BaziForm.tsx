'use client';

import { useState, useEffect } from 'react';
import CitySearch from './CitySearch';
import MapPicker from './MapPicker';

interface BaziFormProps {
  onSubmit: (data: {
    dateTime: string;
    gender: 'male' | 'female';
    timezone: string;
  }) => void;
  isLoading?: boolean;
}

type LocationMode = 'city' | 'coordinates';

export default function BaziForm({ onSubmit, isLoading = false }: BaziFormProps) {
  const [dateTime, setDateTime] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [locationMode, setLocationMode] = useState<LocationMode>('city');
  
  // Для режима города
  const [selectedCity, setSelectedCity] = useState('');
  const [cityTimezone, setCityTimezone] = useState<string>('');
  
  // Для режима координат
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [coordsTimezone, setCoordsTimezone] = useState<string>('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Пытаемся определить часовой пояс пользователя
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTimezone) {
        setCityTimezone(userTimezone);
        setCoordsTimezone(userTimezone);
      }
    } catch (e) {
      // Если не удалось, оставляем по умолчанию
    }
  }, []);

  const handleCitySelect = (city: string, lat?: number, lon?: number, timezone?: string) => {
    setSelectedCity(city);
    if (timezone) {
      setCityTimezone(timezone);
    }
    if (lat !== undefined && lon !== undefined) {
      setLatitude(lat);
      setLongitude(lon);
    }
  };

  const handleMapSelect = (lat: number, lon: number, timezone?: string) => {
    setLatitude(lat);
    setLongitude(lon);
    if (timezone) {
      setCoordsTimezone(timezone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Форматируем дату для API: 'YYYY-MM-DD HH:mm'
    const formattedDateTime = dateTime.replace('T', ' ');
    
    // Определяем часовой пояс в зависимости от режима
    let finalTimezone = 'Asia/Shanghai'; // По умолчанию
    
    if (locationMode === 'city') {
      finalTimezone = cityTimezone || 'Asia/Shanghai';
    } else {
      finalTimezone = coordsTimezone || 'Asia/Shanghai';
    }
    
    // Валидация координат для режима координат
    if (locationMode === 'coordinates') {
      if (latitude === null || longitude === null) {
        alert('Пожалуйста, укажите координаты или выберите место на карте');
        return;
      }
    }
    
    onSubmit({
      dateTime: formattedDateTime,
      gender,
      timezone: finalTimezone,
    });
  };

  // Получаем максимальную дату (сегодня)
  const now = new Date();
  const maxDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Дата и время рождения */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-base font-semibold text-white">
          <span className="text-2xl">📅</span>
          <span>Дата и время рождения</span>
        </label>
        <div className="relative">
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            max={maxDateTime}
            required
            className="w-full px-5 py-4 bg-white/15 backdrop-blur-lg border-2 border-white/40 rounded-2xl text-white text-base placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/30 transition-all duration-200 shadow-lg hover:bg-white/20"
            placeholder="Выберите дату и время"
          />
          {dateTime && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-sm pointer-events-none">
              ✓
            </div>
          )}
        </div>
        <p className="text-xs text-white/50 px-1">
          Выберите точную дату и время вашего рождения
        </p>
      </div>

      {/* Пол */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-base font-semibold text-white">
          <span className="text-2xl">👤</span>
          <span>Пол</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setGender('female')}
            className={`px-5 py-4 rounded-2xl border-2 transition-all duration-200 font-semibold ${
              gender === 'female'
                ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-pink-400 text-white shadow-lg scale-105'
                : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/15 hover:border-white/40'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">👩</span>
              <span>Женский</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setGender('male')}
            className={`px-5 py-4 rounded-2xl border-2 transition-all duration-200 font-semibold ${
              gender === 'male'
                ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400 text-white shadow-lg scale-105'
                : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/15 hover:border-white/40'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">👨</span>
              <span>Мужской</span>
            </div>
          </button>
        </div>
      </div>

      {/* Место рождения */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-base font-semibold text-white">
          <span className="text-2xl">🌍</span>
          <span>Выберите из списка город ВАШЕГО РОЖДЕНИЯ</span>
        </label>

        {/* Переключатель режимов */}
        <div className="flex gap-2 p-1 bg-white/10 rounded-xl">
          <button
            type="button"
            onClick={() => setLocationMode('city')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              locationMode === 'city'
                ? 'bg-purple-500/30 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            🏙️ Поиск города
          </button>
          <button
            type="button"
            onClick={() => setLocationMode('coordinates')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              locationMode === 'coordinates'
                ? 'bg-purple-500/30 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            📍 Координаты
          </button>
        </div>

        {/* Режим поиска города */}
        {locationMode === 'city' && (
          <div className="space-y-2">
            <CitySearch
              value={selectedCity}
              onChange={handleCitySelect}
              placeholder="Введите название города (русский, английский, китайский): Черноголовка, Москва, Beijing..."
            />
            <p className="text-xs text-white/50 px-1">
              💡 Введите название города вашего рождения на любом языке (русский, английский, китайский). 
              Поддерживается поиск по городам всего мира, включая небольшие населённые пункты.
            </p>
            {cityTimezone && (
              <div className="px-4 py-2 bg-green-500/20 border border-green-400/50 rounded-lg text-green-200 text-sm">
                ✓ Определён часовой пояс: <strong>{cityTimezone}</strong>
              </div>
            )}
          </div>
        )}

        {/* Режим координат */}
        {locationMode === 'coordinates' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-2">Широта (Latitude)</label>
                <input
                  type="number"
                  value={latitude?.toFixed(6) || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setLatitude(isNaN(val) ? null : val);
                  }}
                  step="0.000001"
                  placeholder="55.7558"
                  className="w-full px-4 py-3 bg-white/15 backdrop-blur-lg border-2 border-white/40 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Долгота (Longitude)</label>
                <input
                  type="number"
                  value={longitude?.toFixed(6) || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setLongitude(isNaN(val) ? null : val);
                  }}
                  step="0.000001"
                  placeholder="37.6173"
                  className="w-full px-4 py-3 bg-white/15 backdrop-blur-lg border-2 border-white/40 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/30 transition-all"
                />
              </div>
            </div>

            <MapPicker
              onSelect={handleMapSelect}
              initialLat={latitude || 55.7558}
              initialLon={longitude || 37.6173}
            />

            <p className="text-xs text-white/50 px-1">
              💡 Используйте этот режим, если ваш город не найден в списке или уже не существует. 
              Введите координаты вручную или выберите место на карте.
            </p>

            {coordsTimezone && (
              <div className="px-4 py-2 bg-green-500/20 border border-green-400/50 rounded-lg text-green-200 text-sm">
                ✓ Определён часовой пояс: <strong>{coordsTimezone}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Кнопка отправки */}
      <button
        type="submit"
        disabled={isLoading || !dateTime || (locationMode === 'city' && !selectedCity) || (locationMode === 'coordinates' && (latitude === null || longitude === null))}
        className="w-full px-6 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Рассчитываю...</span>
          </>
        ) : (
          <>
            <span className="text-2xl">🔮</span>
            <span>Рассчитать Бацзы</span>
          </>
        )}
      </button>
    </form>
  );
}
