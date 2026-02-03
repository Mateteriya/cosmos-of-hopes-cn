'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Building, BuildingType } from '@/types/buildings';
import BuildingFactory from './BuildingFactory';
import { buildingConfigs } from '@/lib/buildingConfigs';
import PurplePlanet from './PurplePlanet';

type Vec3 = [number, number, number];

/** Сцена с целью орбиты, заданной снаружи */
function SceneContent({
  buildings,
  orbitTarget,
}: {
  buildings: Building[];
  orbitTarget: Vec3;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
      <OrbitControls
        target={orbitTarget}
        enableDamping
        dampingFactor={0.05}
        minDistance={0.05}
        maxDistance={80}
        enablePan
        enableZoom
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <Grid args={[20, 20]} cellColor="#6f6f6f" sectionColor="#9d4b4b" />
      {buildings.map((building) => (
        <BuildingFactory key={building.id} building={building} />
      ))}
      <PurplePlanet position={[8, 6, 8]} scale={1.2} rotationSpeed={0.08} />
    </>
  );
}

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

  /** Цель орбиты: при выборе здания — его центр, иначе центр сетки */
  const [orbitTarget, setOrbitTarget] = useState<Vec3>([0, 0, 0]);

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
    <div className="w-full h-screen flex">
      {/* Панель управления — слева, компактные кнопки */}
      <div className="w-52 shrink-0 flex flex-col gap-2 p-3 bg-gray-900/95 text-white border-r border-gray-700 overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-300 mb-1">Добавить здание</h2>
        <div className="flex flex-col gap-1.5">
          <button onClick={() => addBuilding('маяк')} className="px-2 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded truncate" title="Маяк (Башня Фокуса)">Маяк</button>
          <button onClick={() => addBuilding('skills_library')} className="px-2 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 rounded truncate" title="Библиотека Навыков">Библиотека</button>
          <button onClick={() => addBuilding('prototyping_lab')} className="px-2 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded truncate" title="Лаборатория Прототипирования">Лаб. прототипов</button>
          <button onClick={() => addBuilding('observatory')} className="px-2 py-1.5 text-xs bg-teal-600 hover:bg-teal-500 rounded truncate" title="Обсерватория">Обсерватория</button>
          <button onClick={() => addBuilding('data_core')} className="px-2 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 rounded truncate" title="Ядро Данных">Ядро данных</button>
          <button onClick={() => addBuilding('calm_power_station')} className="px-2 py-1.5 text-xs bg-pink-600 hover:bg-pink-500 rounded truncate" title="Остров спокойствия">Остров спокойствия</button>
          <button onClick={() => addBuilding('regret_recycling_station')} className="px-2 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 rounded truncate" title="Станция Переработки Сожалений">Переработка сожалений</button>
        </div>
        <h2 className="text-sm font-semibold text-gray-300 mt-3 mb-1">Цель камеры</h2>
        <button onClick={() => setOrbitTarget([0, 0, 0])} className="px-2 py-1.5 text-xs bg-gray-600 hover:bg-gray-500 rounded truncate text-left" title="Орбита вокруг центра сетки">Центр сетки</button>
        <div className="flex flex-col gap-1 mt-1">
          {buildings.map((b) => (
            <button
              key={b.id}
              onClick={() => setOrbitTarget([b.position.x, b.position.y, b.position.z])}
              className="px-2 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded truncate text-left"
              title={`Орбита вокруг: ${b.name}`}
            >
              {b.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-auto pt-2">Зданий: {buildings.length}</p>
      </div>

      {/* 3D Canvas — на весь остаток экрана */}
      <div className="flex-1 min-w-0">
        <Canvas>
          <SceneContent buildings={buildings} orbitTarget={orbitTarget} />
        </Canvas>
      </div>
    </div>
  );
}
