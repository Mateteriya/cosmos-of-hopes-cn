'use client';

import { useState, useEffect, useRef } from 'react';

interface CityOption {
  display_name: string;
  lat: string;
  lon: string;
  timezone?: string;
}

interface CitySearchProps {
  value: string;
  onChange: (city: string, lat?: number, lon?: number, timezone?: string) => void;
  placeholder?: string;
}

// Кэш популярных городов для быстрого поиска
// Главная целевая группа - жители Китая, поэтому приоритет китайским городам
const POPULAR_CITIES: Record<string, CityOption> = {
  // Китайские города (приоритет)
  '北京': { display_name: '北京, 中国', lat: '39.9042', lon: '116.4074', timezone: 'Asia/Shanghai' },
  'beijing': { display_name: 'Beijing, China', lat: '39.9042', lon: '116.4074', timezone: 'Asia/Shanghai' },
  'пекин': { display_name: 'Пекин, Китай', lat: '39.9042', lon: '116.4074', timezone: 'Asia/Shanghai' },
  '上海': { display_name: '上海, 中国', lat: '31.2304', lon: '121.4737', timezone: 'Asia/Shanghai' },
  'shanghai': { display_name: 'Shanghai, China', lat: '31.2304', lon: '121.4737', timezone: 'Asia/Shanghai' },
  'шанхай': { display_name: 'Шанхай, Китай', lat: '31.2304', lon: '121.4737', timezone: 'Asia/Shanghai' },
  '广州': { display_name: '广州, 中国', lat: '23.1291', lon: '113.2644', timezone: 'Asia/Shanghai' },
  'guangzhou': { display_name: 'Guangzhou, China', lat: '23.1291', lon: '113.2644', timezone: 'Asia/Shanghai' },
  '深圳': { display_name: '深圳, 中国', lat: '22.5431', lon: '114.0579', timezone: 'Asia/Shanghai' },
  'shenzhen': { display_name: 'Shenzhen, China', lat: '22.5431', lon: '114.0579', timezone: 'Asia/Shanghai' },
  '成都': { display_name: '成都, 中国', lat: '30.6624', lon: '104.0633', timezone: 'Asia/Shanghai' },
  'chengdu': { display_name: 'Chengdu, China', lat: '30.6624', lon: '104.0633', timezone: 'Asia/Shanghai' },
  '杭州': { display_name: '杭州, 中国', lat: '30.2741', lon: '120.1551', timezone: 'Asia/Shanghai' },
  'hangzhou': { display_name: 'Hangzhou, China', lat: '30.2741', lon: '120.1551', timezone: 'Asia/Shanghai' },
  '西安': { display_name: '西安, 中国', lat: '34.3416', lon: '108.9398', timezone: 'Asia/Shanghai' },
  'xian': { display_name: 'Xian, China', lat: '34.3416', lon: '108.9398', timezone: 'Asia/Shanghai' },
  '南京': { display_name: '南京, 中国', lat: '32.0603', lon: '118.7969', timezone: 'Asia/Shanghai' },
  'nanjing': { display_name: 'Nanjing, China', lat: '32.0603', lon: '118.7969', timezone: 'Asia/Shanghai' },
  '武汉': { display_name: '武汉, 中国', lat: '30.5928', lon: '114.3055', timezone: 'Asia/Shanghai' },
  'wuhan': { display_name: 'Wuhan, China', lat: '30.5928', lon: '114.3055', timezone: 'Asia/Shanghai' },
  '重庆': { display_name: '重庆, 中国', lat: '29.5630', lon: '106.5516', timezone: 'Asia/Shanghai' },
  'chongqing': { display_name: 'Chongqing, China', lat: '29.5630', lon: '106.5516', timezone: 'Asia/Shanghai' },
  '天津': { display_name: '天津, 中国', lat: '39.3434', lon: '117.3616', timezone: 'Asia/Shanghai' },
  'tianjin': { display_name: 'Tianjin, China', lat: '39.3434', lon: '117.3616', timezone: 'Asia/Shanghai' },
  '苏州': { display_name: '苏州, 中国', lat: '31.2989', lon: '120.5853', timezone: 'Asia/Shanghai' },
  'suzhou': { display_name: 'Suzhou, China', lat: '31.2989', lon: '120.5853', timezone: 'Asia/Shanghai' },
  '香港': { display_name: '香港, 中国', lat: '22.3193', lon: '114.1694', timezone: 'Asia/Hong_Kong' },
  'hong kong': { display_name: 'Hong Kong, China', lat: '22.3193', lon: '114.1694', timezone: 'Asia/Hong_Kong' },
  '台北': { display_name: '台北, 台湾', lat: '25.0330', lon: '121.5654', timezone: 'Asia/Taipei' },
  'taipei': { display_name: 'Taipei, Taiwan', lat: '25.0330', lon: '121.5654', timezone: 'Asia/Taipei' },
  
  // Российские города (для удобства)
  'москва': { display_name: 'Москва, Россия', lat: '55.7558', lon: '37.6173', timezone: 'Europe/Moscow' },
  'moscow': { display_name: 'Moscow, Russia', lat: '55.7558', lon: '37.6173', timezone: 'Europe/Moscow' },
  'санкт-петербург': { display_name: 'Санкт-Петербург, Россия', lat: '59.9343', lon: '30.3351', timezone: 'Europe/Moscow' },
  'черноголовка': { display_name: 'Черноголовка, Московская область, Россия', lat: '55.9139', lon: '38.3803', timezone: 'Europe/Moscow' },
  'череповец': { display_name: 'Череповец, Вологодская область, Россия', lat: '59.2000', lon: '37.9000', timezone: 'Europe/Moscow' },
  'чебоксары': { display_name: 'Чебоксары, Чувашская Республика, Россия', lat: '56.1322', lon: '47.2519', timezone: 'Europe/Moscow' }
};

export default function CitySearch({ value, onChange, placeholder = "Введите название города..." }: CitySearchProps) {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [results, setResults] = useState<CityOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Закрытие результатов при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Приблизительное определение часового пояса по координатам
  const getTimezoneByCoordinates = (lat: number, lon: number): string => {
    // Россия и СНГ
    if (lat >= 50 && lat <= 60 && lon >= 20 && lon <= 40) {
      return 'Europe/Moscow';
    }
    if (lat >= 55.5 && lat <= 56.5 && lon >= 37.5 && lon <= 38.5) {
      return 'Europe/Moscow'; // Черноголовка и Московская область
    }
    if (lat >= 59 && lat <= 60 && lon >= 29 && lon <= 31) {
      return 'Europe/Moscow'; // Санкт-Петербург
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
    if (lat >= 40 && lat <= 41 && lon >= -74 && lon <= -73) {
      return 'America/New_York';
    }
    if (lat >= 51 && lat <= 52 && lon >= -1 && lon <= 0) {
      return 'Europe/London';
    }
    
    return 'UTC';
  };

  // Поиск городов через Nominatim API (OpenStreetMap) - бесплатно, работает везде
  const searchCities = async (query: string) => {
    if (!query || query.length < 1) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    // Сначала проверяем кэш популярных городов
    const queryLower = query.trim().toLowerCase();
    const cachedCity = POPULAR_CITIES[queryLower];
    
    if (cachedCity) {
      setResults([cachedCity]);
      setShowResults(true);
      setIsSearching(false);
      return;
    }
    
    // Проверяем частичные совпадения в кэше
    const cachedMatches = Object.entries(POPULAR_CITIES)
      .filter(([key]) => key.startsWith(queryLower) && queryLower.length >= 3)
      .map(([, value]) => value);
    
    if (cachedMatches.length > 0) {
      setResults(cachedMatches);
      setShowResults(true);
      setIsSearching(false);
    }
    
    try {
      const normalizedQuery = query.trim().replace(/\s+/g, ' ');
      
      // Используем только Nominatim API (OpenStreetMap) - бесплатно, работает везде
      // Улучшенная версия с приоритетом для Китая (главная целевая группа)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(normalizedQuery)}&` +
        `format=json&` +
        `limit=50&` + // Увеличиваем лимит для лучших результатов
        `accept-language=zh,ru,en&` + // Приоритет китайскому языку
        `addressdetails=1&` +
        `extratags=1&` +
        `featuretype=city,town,village,municipality&` + // Добавляем municipality
        `countrycodes=cn,ru,us,gb,jp,kr,tw,hk&` + // Приоритет Китаю и регионам
        `dedupe=1&` +
        `namedetails=1&` + // Получаем больше информации о названиях
        `polygon_geojson=0`, // Не нужны полигоны, ускоряет ответ
        {
          headers: {
            'User-Agent': 'CosmosOfHopes/1.0 (https://cosmosofhopes.com)',
            'Accept-Language': 'zh,ru,en'
          }
        }
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      
      const queryLower = normalizedQuery.toLowerCase();
      
      // Улучшенная фильтрация и сортировка с приоритетом для Китая
      const filteredData = data
        .map((item: any) => {
          const name = item.display_name.toLowerCase();
          const cityName = name.split(',')[0].trim();
          const words = cityName.split(/\s+/);
          const firstWord = words[0];
          
          // Проверяем совпадение
          let relevance = 0;
          let isChina = false;
          
          // Проверяем, является ли это китайским городом (приоритет)
          if (item.address?.country_code === 'cn' || 
              item.address?.country === 'China' || 
              item.address?.country === '中国' ||
              name.includes('中国') || 
              name.includes('china')) {
            isChina = true;
            relevance += 20; // Бонус за китайский город
          }
          
          // Точное совпадение первого слова
          if (firstWord === queryLower) {
            relevance += 100;
          }
          // Первое слово начинается с запроса
          else if (firstWord.startsWith(queryLower)) {
            // Для полных запросов (>= 4 символов) даём больше релевантности
            if (queryLower.length >= 4) {
              relevance += 60;
            } else if (queryLower.length >= 3) {
              relevance += 40;
            } else {
              relevance += 20;
            }
          }
          // Запрос содержится в первом слове (для частичных совпадений)
          else if (firstWord.includes(queryLower) && queryLower.length >= 3) {
            relevance += 10;
          }
          // Запрос содержится в названии города
          else if (cityName.includes(queryLower)) {
            relevance += 5;
          }
          
          // Бонус за точное совпадение названия города
          if (cityName === queryLower) {
            relevance += 50;
          }
          
          return { ...item, relevance, isChina };
        })
        .filter((item: any) => item.relevance > 0) // Убираем нерелевантные
        .sort((a: any, b: any) => {
          // Сначала по релевантности
          if (b.relevance !== a.relevance) {
            return b.relevance - a.relevance;
          }
          // Затем приоритет китайским городам
          if (b.isChina && !a.isChina) return 1;
          if (a.isChina && !b.isChina) return -1;
          // Затем по длине названия (короче = лучше)
          return a.display_name.length - b.display_name.length;
        })
        .slice(0, 20); // Увеличиваем до 20 результатов
      
      const resultsWithTimezone = filteredData.map((item: any) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const timezone = getTimezoneByCoordinates(lat, lon);
        
        return {
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
          timezone: timezone
        };
      });

      const allResults = [...cachedMatches, ...resultsWithTimezone];
      const uniqueResults = allResults.filter((item, index, self) =>
        index === self.findIndex((t) => t.lat === item.lat && t.lon === item.lon)
      );
      
      setResults(uniqueResults.slice(0, 15));
      setShowResults(true);
    } catch (error) {
      console.error('City search error:', error);
      setResults(cachedMatches.length > 0 ? cachedMatches : []);
      setShowResults(cachedMatches.length > 0);
    } finally {
      setIsSearching(false);
    }
  };

  // Обработка ввода с задержкой (debounce)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let query = e.target.value.trim().replace(/\s+/g, ' ');
    setSearchQuery(query);
    setSelectedIndex(-1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query || query.length < 1) {
      setResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchCities(query);
    }, 150);
  };

  // Выбор города из результатов
  const handleSelectCity = (city: CityOption) => {
    setSearchQuery(city.display_name);
    setShowResults(false);
    onChange(
      city.display_name,
      parseFloat(city.lat),
      parseFloat(city.lon),
      city.timezone
    );
  };

  // Обработка клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectCity(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          placeholder={placeholder}
          className="w-full px-5 py-4 bg-white/15 backdrop-blur-lg border-2 border-white/40 rounded-2xl text-white text-base placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/30 transition-all duration-200 shadow-lg hover:bg-white/20 pr-12"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="animate-spin text-white/60">⏳</div>
          </div>
        )}
        {!isSearching && searchQuery && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-sm">
            ✓
          </div>
        )}
      </div>

      {/* Результаты поиска */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-lg border-2 border-white/20 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
          {results.map((city, index) => (
            <button
              key={`${city.lat}-${city.lon}`}
              type="button"
              onClick={() => handleSelectCity(city)}
              className={`w-full px-5 py-4 text-left transition-all ${
                index === selectedIndex
                  ? 'bg-purple-500/30 text-white'
                  : 'bg-transparent text-white/90 hover:bg-white/10'
              } ${index === 0 ? 'rounded-t-2xl' : ''} ${index === results.length - 1 ? 'rounded-b-2xl' : ''}`}
            >
              <div className="font-semibold text-base">{city.display_name.split(',')[0]}</div>
              <div className="text-sm text-white/60 mt-1">{city.display_name}</div>
              {city.timezone && (
                <div className="text-xs text-purple-300 mt-1">⏰ {city.timezone}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && searchQuery.length >= 2 && !isSearching && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-lg border-2 border-white/20 rounded-2xl shadow-2xl p-4 text-white/60 text-center">
          Город не найден. Попробуйте ввести координаты вручную или выбрать на карте.
        </div>
      )}
    </div>
  );
}
