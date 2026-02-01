'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Building, BuildingType } from '@/types/buildings';
import BuildingFactory from './BuildingFactory';
import { buildingConfigs } from '@/lib/buildingConfigs';
import PurplePlanet from './PurplePlanet';

/**
 * Демо-компонент для тестирования 3D-моделей зданий
 */
export default function BuildingsDemo() {
  // По умолчанию на сетке — новый Маяк (Башня Фокуса)
  const initialBuildingConfig = buildingConfigs.маяк;
  const initialBuildingHeight = initialBuildingConfig.size.height;
  
  const [buildings, setBuildings] = useState<Building[]>([
    {
      id: '1',
      name: initialBuildingConfig.name,
      type: 'маяк',
      sphere: initialBuildingConfig.sphere,
      area: initialBuildingConfig.area,
      position: { 
        x: 0, 
        y: initialBuildingHeight / 2,
        z: 0 
      },
      built: true,
      active: true,
      level: 1,
      connections: [],
    },
  ]);

  const addBuilding = (type: BuildingType) => {
    const config = buildingConfigs[type];
    // Высота здания для правильного позиционирования на сетке
    const buildingHeight = config.size.height;
    
    // Минимальное расстояние между зданиями (учитываем размеры зданий)
    // Берем максимальный размер (ширина или глубина) из конфига + запас
    const newBuildingSize = Math.max(config.size.width, config.size.depth);
    
    // Максимальное количество попыток найти свободное место
    let attempts = 0;
    const maxAttempts = 100; // Увеличил количество попыток
    let newPosition = { x: 0, y: buildingHeight / 2, z: 0 };
    let foundValidPosition = false;
    
    while (attempts < maxAttempts && !foundValidPosition) {
      // Генерируем случайную позицию в более широкой области
      newPosition = {
        x: (Math.random() - 0.5) * 20, // Увеличил область поиска
        y: buildingHeight / 2, // Смещение вверх на половину высоты, чтобы основание было на y=0
        z: (Math.random() - 0.5) * 20,
      };
      
      // Проверяем расстояние до всех существующих зданий
      const tooClose = buildings.some((existingBuilding) => {
        const existingConfig = buildingConfigs[existingBuilding.type];
        const existingSize = Math.max(existingConfig.size.width, existingConfig.size.depth);
        
        // Минимальное расстояние = размер нового здания + размер существующего + запас
        const minDistance = newBuildingSize / 2 + existingSize / 2 + 1.5; // Запас 1.5 единицы
        
        const dx = newPosition.x - existingBuilding.position.x;
        const dz = newPosition.z - existingBuilding.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        return distance < minDistance;
      });
      
      if (!tooClose) {
        foundValidPosition = true;
      }
      
      attempts++;
    }
    
    // Если не нашли валидную позицию за maxAttempts попыток, размещаем далеко
    if (!foundValidPosition) {
      newPosition = {
        x: buildings.length * 6, // Размещаем последовательно далеко
        y: buildingHeight / 2,
        z: buildings.length * 6,
      };
    }
    
    const newBuilding: Building = {
      id: Date.now().toString(),
      name: config.name,
      type,
      sphere: config.sphere,
      area: config.area,
      position: newPosition,
      built: true,
      active: true,
      level: 1,
      connections: [],
    };
    setBuildings([...buildings, newBuilding]);
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Панель управления */}
      <div className="p-4 bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-4">3D Модели Зданий - Демо</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => addBuilding('маяк')}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Маяк (Башня Фокуса)
          </button>
          <button
            onClick={() => addBuilding('skills_library')}
            className="px-4 py-2 bg-purple-500 rounded hover:bg-purple-600"
          >
            Библиотека Навыков
          </button>
          <button
            onClick={() => addBuilding('prototyping_lab')}
            className="px-4 py-2 bg-indigo-500 rounded hover:bg-indigo-600"
          >
            Лаборатория Прототипирования
          </button>
          <button
            onClick={() => addBuilding('observatory')}
            className="px-4 py-2 bg-teal-500 rounded hover:bg-teal-600"
          >
            Обсерватория
          </button>
          <button
            onClick={() => addBuilding('data_core')}
            className="px-4 py-2 bg-cyan-500 rounded hover:bg-cyan-600"
          >
            Ядро Данных
          </button>
          <button
            onClick={() => addBuilding('calm_power_station')}
            className="px-4 py-2 bg-pink-500 rounded hover:bg-pink-600"
          >
            Электростанция Спокойствия
          </button>
          <button
            onClick={() => addBuilding('regret_recycling_station')}
            className="px-4 py-2 bg-sky-500 rounded hover:bg-sky-600"
          >
            Станция Переработки Сожалений
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Всего зданий: {buildings.length}
        </p>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas>
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
          <OrbitControls enableDamping dampingFactor={0.05} />

          {/* Освещение */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          {/* Сетка для ориентации */}
          <Grid args={[20, 20]} cellColor="#6f6f6f" sectionColor="#9d4b4b" />

          {/* Здания */}
          {buildings.map((building) => (
            <BuildingFactory key={building.id} building={building} />
          ))}

          {/* Фиолетовый Сатурн (PurplePlanet) — над сеткой, выше самого высокого здания (макс. высота ~2.5) */}
          <PurplePlanet
            position={[8, 6, 8]}
            scale={1.2}
            rotationSpeed={0.08}
          />
        </Canvas>
      </div>
    </div>
  );
}
