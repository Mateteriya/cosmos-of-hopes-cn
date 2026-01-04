'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Динамический импорт Leaflet (только на клиенте)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface MapPickerProps {
  onSelect: (lat: number, lon: number, timezone?: string) => void;
  initialLat?: number;
  initialLon?: number;
}

// Компонент для обработки кликов на карте
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  if (typeof window === 'undefined') return null;
  
  // Динамический импорт useMapEvents
  const ReactLeaflet = require('react-leaflet');
  const { useMapEvents } = ReactLeaflet;
  
  useMapEvents({
    click: (e: any) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  
  return null;
}

export default function MapPicker({ onSelect, initialLat = 55.7558, initialLon = 37.6173 }: MapPickerProps) {
  const [lat, setLat] = useState(initialLat);
  const [lon, setLon] = useState(initialLon);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timezone, setTimezone] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    // Импортируем Leaflet CSS и исправляем иконки маркеров
    if (typeof window !== 'undefined') {
      import('leaflet/dist/leaflet.css');
      const L = require('leaflet');
      
      // Исправляем проблему с иконками маркеров
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  // Определение часового пояса по координатам
  const getTimezone = async (latitude: number, longitude: number): Promise<string> => {
    // Используем приблизительное определение (быстро и бесплатно)
    return getTimezoneByCoordinates(latitude, longitude);
  };

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

  const handleMapClick = async (clickedLat: number, clickedLon: number) => {
    setLat(clickedLat);
    setLon(clickedLon);
    
    const detectedTimezone = await getTimezone(clickedLat, clickedLon);
    setTimezone(detectedTimezone);
  };

  const handleConfirm = async () => {
    if (!timezone) {
      const detectedTimezone = await getTimezone(lat, lon);
      setTimezone(detectedTimezone);
      onSelect(lat, lon, detectedTimezone);
    } else {
      onSelect(lat, lon, timezone);
    }
    setIsOpen(false);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="w-full px-5 py-3 bg-blue-500/20 border-2 border-blue-400/50 rounded-xl text-white/50"
      >
        Загрузка карты...
      </button>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-5 py-3 bg-blue-500/20 border-2 border-blue-400/50 rounded-xl text-white hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
      >
        <span className="text-xl">🗺️</span>
        <span>Выбрать на карте</span>
      </button>
    );
  }

  return (
    <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/20">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Выберите место на карте</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-white/70 hover:text-white text-xl"
        >
          ✕
        </button>
      </div>
      
      {/* Интерактивная карта через Leaflet */}
      <div className="relative w-full h-96 rounded-xl overflow-hidden border-2 border-white/20 bg-gray-800">
        <MapContainer
          center={[lat, lon]}
          zoom={10}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lon]}>
            <Popup>
              Широта: {lat.toFixed(6)}<br />
              Долгота: {lon.toFixed(6)}
            </Popup>
          </Marker>
          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-white/70 mb-1">Широта (Latitude)</label>
          <input
            type="number"
            value={lat.toFixed(6)}
            onChange={(e) => {
              const newLat = parseFloat(e.target.value) || 0;
              setLat(newLat);
              getTimezone(newLat, lon).then(tz => setTimezone(tz));
            }}
            step="0.000001"
            className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Долгота (Longitude)</label>
          <input
            type="number"
            value={lon.toFixed(6)}
            onChange={(e) => {
              const newLon = parseFloat(e.target.value) || 0;
              setLon(newLon);
              getTimezone(lat, newLon).then(tz => setTimezone(tz));
            }}
            step="0.000001"
            className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
          />
        </div>
      </div>

      {timezone && (
        <div className="px-4 py-2 bg-green-500/20 border border-green-400/50 rounded-lg text-green-200 text-sm">
          ⏰ Определён часовой пояс: <strong>{timezone}</strong>
        </div>
      )}
      
      <button
        type="button"
        onClick={handleConfirm}
        className="w-full px-5 py-3 bg-green-500/20 border-2 border-green-400/50 rounded-xl text-white hover:bg-green-500/30 transition-all"
      >
        ✓ Подтвердить выбор
      </button>
    </div>
  );
}
