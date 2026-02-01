'use client';

import { useState, useEffect } from 'react';
import CitySearch from './CitySearch';
import MapPicker from './MapPicker';

interface BaziFormProps {
  onSubmit: (data: {
    dateTime: string;
    gender: 'male' | 'female';
    timezone: string;
    longitude?: number | null;
    latitude?: number | null;
    useSolarTime?: boolean;
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
  const [cityLatitude, setCityLatitude] = useState<number | null>(null);
  const [cityLongitude, setCityLongitude] = useState<number | null>(null);
  
  // Для режима координат
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [coordsTimezone, setCoordsTimezone] = useState<string>('');

  const [mounted, setMounted] = useState(false);
  const [useSolarTime, setUseSolarTime] = useState(false);

  useEffect(() => {
    setMounted(true);
    // НЕ устанавливаем timezone пользователя как дефолтный!
    // Timezone должен определяться по координатам места рождения, а не по местонахождению пользователя
  }, []);

  const handleCitySelect = (city: string, lat?: number, lon?: number, timezone?: string) => {
    setSelectedCity(city);
    if (timezone) {
      setCityTimezone(timezone);
    }
    // Сохраняем координаты города отдельно
    if (lat !== undefined && lon !== undefined) {
      setCityLatitude(lat);
      setCityLongitude(lon);
      // Также сохраняем в общие координаты для совместимости
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

  // Функция для определения timezone по координатам (если не был определен)
  const getTimezoneByCoordinates = (lat: number, lon: number): string => {
    // США - Восточный пояс (UTC-5/-4)
    if (lat >= 24 && lat <= 50 && lon >= -85 && lon <= -67) {
      // Средний Запад (Мичиган, Иллинойс, Индиана, Огайо и др.)
      if (lat >= 40 && lat <= 47 && lon >= -90 && lon <= -80) {
        return 'America/Detroit'; // Используем Detroit как основной для Eastern Time
      }
      // Новая Англия и Средняя Атлантика
      if (lat >= 40 && lat <= 45 && lon >= -75 && lon <= -67) {
        return 'America/New_York';
      }
      // Флорида, Джорджия, Южная Каролина и др.
      if (lat >= 24 && lat <= 36 && lon >= -85 && lon <= -75) {
        return 'America/New_York';
      }
      return 'America/New_York';
    }
    
    // США - Центральный пояс (UTC-6/-5)
    if (lat >= 25 && lat <= 49 && lon >= -105 && lon <= -85) {
      return 'America/Chicago';
    }
    
    // США - Горный пояс (UTC-7/-6)
    if (lat >= 31 && lat <= 49 && lon >= -115 && lon <= -102) {
      return 'America/Denver';
    }
    
    // США - Тихоокеанский пояс (UTC-8/-7)
    if (lat >= 32 && lat <= 49 && lon >= -125 && lon <= -102) {
      return 'America/Los_Angeles';
    }
    
    // Аляска (UTC-9/-8)
    if (lat >= 51 && lat <= 72 && lon >= -180 && lon <= -130) {
      return 'America/Anchorage';
    }
    
    // Гавайи (UTC-10)
    if (lat >= 18 && lat <= 23 && lon >= -161 && lon <= -154) {
      return 'Pacific/Honolulu';
    }
    
    // Россия и СНГ
    if (lat >= 50 && lat <= 60 && lon >= 20 && lon <= 40) {
      return 'Europe/Moscow';
    }
    
    // Китай
    if (lat >= 35 && lat <= 45 && lon >= 115 && lon <= 125) {
      return 'Asia/Shanghai';
    }
    
    // Другие регионы
    if (lat >= 35 && lat <= 37 && lon >= 139 && lon <= 141) {
      return 'Asia/Tokyo';
    }
    if (lat >= 37 && lat <= 38 && lon >= 126 && lon <= 127) {
      return 'Asia/Seoul';
    }
    if (lat >= 51 && lat <= 52 && lon >= -1 && lon <= 0) {
      return 'Europe/London';
    }
    
    // По умолчанию
    return 'UTC';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Форматируем дату для API: 'YYYY-MM-DD HH:mm'
    const formattedDateTime = dateTime.replace('T', ' ');
    
    // Определяем часовой пояс в зависимости от режима
    // КРИТИЧЕСКИ ВАЖНО: Используем timezone места рождения, а не пользователя!
    let finalTimezone = 'Asia/Shanghai'; // По умолчанию
    
    // Валидация координат и определение timezone
    let longitudeValue: number | null = null;
    let latitudeValue: number | null = null;
    
    if (locationMode === 'coordinates') {
      // В режиме координат проверяем введенные координаты
      if (latitude === null || longitude === null) {
        alert('Пожалуйста, укажите координаты или выберите место на карте');
        return;
      }
      longitudeValue = longitude;
      latitudeValue = latitude;
      
      // Если timezone не был определен из карты, определяем по координатам
      if (!coordsTimezone) {
        const detectedTimezone = getTimezoneByCoordinates(latitude, longitude);
        setCoordsTimezone(detectedTimezone);
        finalTimezone = detectedTimezone;
      } else {
        finalTimezone = coordsTimezone;
      }
    } else if (locationMode === 'city') {
      // В режиме города проверяем, что город выбран И координаты найдены
      if (!selectedCity) {
        alert('Пожалуйста, выберите город из списка');
        return;
      }
      if (cityLongitude === null || cityLatitude === null) {
        alert('Координаты выбранного города не найдены. Пожалуйста, укажите координаты вручную в режиме "Координаты"');
        return;
      }
      longitudeValue = cityLongitude;
      latitudeValue = cityLatitude;
      
      // Если timezone не был определен из базы городов, определяем по координатам
      if (!cityTimezone) {
        const detectedTimezone = getTimezoneByCoordinates(cityLatitude, cityLongitude);
        setCityTimezone(detectedTimezone);
        finalTimezone = detectedTimezone;
      } else {
        finalTimezone = cityTimezone;
      }
    }
    
    // Проверка перед отправкой (дополнительная защита)
    if (longitudeValue === null || latitudeValue === null || isNaN(longitudeValue) || isNaN(latitudeValue)) {
      console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Координаты не указаны перед отправкой формы!', {
        locationMode,
        longitudeValue,
        latitudeValue,
        cityLongitude,
        cityLatitude,
        longitude,
        latitude,
        selectedCity
      });
      alert('Ошибка: Координаты не указаны. Пожалуйста, выберите город или укажите координаты вручную.');
      return;
    }
    
    // Логирование для отладки
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 BaziForm - Отправка данных:', {
        dateTime: formattedDateTime,
        timezone: finalTimezone,
        longitude: longitudeValue,
        latitude: latitudeValue,
        useSolarTime,
        locationMode,
        selectedCity
      });
    }
    
    onSubmit({
      dateTime: formattedDateTime,
      gender,
      timezone: finalTimezone,
      longitude: longitudeValue,
      latitude: latitudeValue,
      useSolarTime,
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

              <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 space-y-2">
              <p className="text-xs text-white/80 px-1">
                💡 Используйте этот режим, если ваш город не найден в списке или уже не существует. 
                Введите координаты вручную или выберите место на карте.
              </p>
              <div className="pt-2 border-t border-blue-400/30">
                <p className="text-xs text-white/70 mb-2">
                  🔍 Не знаете координаты вашего города?
                </p>
                <a
                  href="https://www.latlong.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-300 hover:text-blue-200 underline inline-flex items-center gap-1 transition-colors"
                >
                  Найти координаты на latlong.net ↗
                </a>
                <p className="text-xs text-white/50 mt-1">
                  (Введите название города в поиск — координаты будут показаны автоматически)
                </p>
              </div>
            </div>

            {coordsTimezone && (
              <div className="px-4 py-2 bg-green-500/20 border border-green-400/50 rounded-lg text-green-200 text-sm">
                ✓ Определён часовой пояс: <strong>{coordsTimezone}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Настройки расчета часа */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-base font-semibold text-white">
          <span className="text-2xl">⏰</span>
          <span>Метод расчета часа</span>
        </label>
        <div className="bg-white/10 backdrop-blur-lg border-2 border-white/40 rounded-xl p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={useSolarTime}
              onChange={(e) => setUseSolarTime(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-white/40 bg-white/10 text-purple-600 focus:ring-2 focus:ring-purple-400 focus:ring-offset-0 cursor-pointer transition-all"
            />
            <div className="flex-1">
              <div className="text-white font-medium">Использовать истинное солнечное время</div>
              <div className="text-xs text-white/60 mt-1">
                Традиционный метод расчета часа с учетом долготы и уравнения времени (для некоторых школ Бацзы)
              </div>
            </div>
          </label>
          {!useSolarTime && (
            <div className="text-xs text-white/50 px-1 bg-blue-500/10 border border-blue-400/30 rounded-lg p-2">
              💡 По умолчанию используется локальное административное время (стандартная практика профессиональных калькуляторов Бацзы)
            </div>
          )}
        </div>
      </div>

      {/* Кнопка отправки */}
      <button
        type="submit"
        disabled={
          isLoading || 
          !dateTime || 
          (locationMode === 'city' && (!selectedCity || cityLongitude === null || cityLatitude === null)) || 
          (locationMode === 'coordinates' && (latitude === null || longitude === null))
        }
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
