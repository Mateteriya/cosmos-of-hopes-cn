'use client';

import React, { useRef, useEffect, useState } from 'react';

// Тип режима визуализации
export type ViewMode = 'universal' | 'game';

// Типы данных
interface Sphere {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  areas: Area[];
}

interface Area {
  id: string;
  name: string;
  position: { x: number; y: number };
  status: 'gray' | 'green' | 'yellow' | 'red';
  buildings: Building[];
}

interface Building {
  id: string;
  name: string;
  position: { x: number; y: number };
  sphere: string;
  area: string;
  built: boolean;
}

interface Connection {
  from: string;
  to: string;
  type: 'train' | 'bus' | 'plane' | 'rocket';
  active: boolean;
}

// Изометрическая проекция - константы
const ISO_ANGLE = Math.PI / 6; // 30 градусов
const TILE_WIDTH = 80;
const TILE_HEIGHT = 40;

// Функция изометрической проекции (объявлена как function для правильного hoisting)
function toIso(x: number, y: number) {
  return {
    x: (x - y) * TILE_WIDTH / 2,
    y: (x + y) * TILE_HEIGHT / 2
  };
}

interface MapCanvasProps {
  viewMode?: ViewMode;
}

export default function MapCanvas({ viewMode = 'universal' }: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  // Определяем 4 сферы
  const spheres: Sphere[] = [
    {
      id: 'mind',
      name: 'Разум',
      color: '#3B82F6',
      position: { x: 2, y: 2 },
      areas: [
        { id: 'focus', name: 'Фокус', position: { x: 1, y: 1 }, status: 'gray', buildings: [] },
        { id: 'creativity', name: 'Креативность', position: { x: 3, y: 1 }, status: 'gray', buildings: [] }
      ]
    },
    {
      id: 'emotions',
      name: 'Эмоции',
      color: '#EF4444',
      position: { x: 2, y: 6 },
      areas: [
        { id: 'awareness', name: 'Осознанность', position: { x: 1, y: 5 }, status: 'gray', buildings: [] },
        { id: 'regulation', name: 'Саморегуляция', position: { x: 3, y: 5 }, status: 'gray', buildings: [] }
      ]
    },
    {
      id: 'body',
      name: 'Тело',
      color: '#10B981',
      position: { x: 6, y: 2 },
      areas: [
        { id: 'energy', name: 'Энергия', position: { x: 5, y: 1 }, status: 'gray', buildings: [] },
        { id: 'movement', name: 'Движение', position: { x: 7, y: 1 }, status: 'gray', buildings: [] }
      ]
    },
    {
      id: 'society',
      name: 'Связи',
      color: '#8B5CF6',
      position: { x: 6, y: 6 },
      areas: [
        { id: 'communication', name: 'Коммуникация', position: { x: 5, y: 5 }, status: 'gray', buildings: [] },
        { id: 'relationships', name: 'Отношения', position: { x: 7, y: 5 }, status: 'gray', buildings: [] }
      ]
    }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Устанавливаем размер canvas
    canvas.width = 1200;
    canvas.height = 800;

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем изометрическую сетку
    drawIsometricGrid(ctx, canvas.width, canvas.height);

    // Рисуем сферы
    spheres.forEach(sphere => {
      drawSphere(ctx, sphere);
    });

    // Рисуем здания
    buildings.forEach(building => {
      drawBuilding(ctx, building);
    });

    // Рисуем связи (нейронная сеть)
    connections.forEach(connection => {
      drawConnection(ctx, connection, buildings);
    });

  }, [buildings, connections]);

  // Рисуем изометрическую сетку
  function drawIsometricGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;

    // Вертикальные линии
    for (let x = 0; x < width; x += TILE_WIDTH) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Горизонтальные линии (изометрические)
    for (let y = 0; y < height; y += TILE_HEIGHT) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  // Рисуем сферу
  function drawSphere(ctx: CanvasRenderingContext2D, sphere: Sphere) {
    const iso = toIso(sphere.position.x, sphere.position.y);
    const centerX = canvasRef.current!.width / 2 + iso.x;
    const centerY = canvasRef.current!.height / 2 + iso.y;

    // Рисуем область сферы (изометрический ромб)
    ctx.fillStyle = sphere.color + '20'; // Прозрачность
    ctx.strokeStyle = sphere.color;
    ctx.lineWidth = 2;

    const size = 120;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size);
    ctx.lineTo(centerX + size, centerY);
    ctx.lineTo(centerX, centerY + size);
    ctx.lineTo(centerX - size, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Название сферы
    ctx.fillStyle = sphere.color;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(sphere.name, centerX, centerY - size - 10);
  }

  // Рисуем здание
  function drawBuilding(ctx: CanvasRenderingContext2D, building: Building) {
    const sphere = spheres.find(s => s.id === building.sphere);
    if (!sphere) return;

    const iso = toIso(building.position.x, building.position.y);
    const centerX = canvasRef.current!.width / 2 + iso.x;
    const centerY = canvasRef.current!.height / 2 + iso.y;

    if (!building.built) {
      // Потенциальное место для здания (пунктирный контур)
      ctx.strokeStyle = '#6B7280';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 20, centerY - 20, 40, 40);
      ctx.setLineDash([]);
      return;
    }

    // Изометрическое здание
    const size = 30;
    const height = 20;

    // Основание
    ctx.fillStyle = sphere.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    // Изометрический параллелепипед
    ctx.beginPath();
    // Верхняя грань
    ctx.moveTo(centerX, centerY - height);
    ctx.lineTo(centerX + size, centerY - height + size / 2);
    ctx.lineTo(centerX, centerY - height + size);
    ctx.lineTo(centerX - size, centerY - height + size / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Боковые грани
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - height);
    ctx.lineTo(centerX + size, centerY - height + size / 2);
    ctx.lineTo(centerX + size, centerY + size / 2);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Свечение для активных зданий
    ctx.shadowBlur = 10;
    ctx.shadowColor = sphere.color;
    ctx.fillRect(centerX - 5, centerY - height - 5, 10, 10);
    ctx.shadowBlur = 0;
  }

  // Рисуем связь (нейронная сеть)
  function drawConnection(ctx: CanvasRenderingContext2D, connection: Connection, buildings: Building[]) {
    const fromBuilding = buildings.find(b => b.id === connection.from);
    const toBuilding = buildings.find(b => b.id === connection.to);

    if (!fromBuilding || !toBuilding) return;

    const fromIso = toIso(fromBuilding.position.x, fromBuilding.position.y);
    const toIsoResult = toIso(toBuilding.position.x, toBuilding.position.y);

    const fromX = canvasRef.current!.width / 2 + fromIso.x;
    const fromY = canvasRef.current!.height / 2 + fromIso.y;
    const toX = canvasRef.current!.width / 2 + toIsoResult.x;
    const toY = canvasRef.current!.height / 2 + toIsoResult.y;

    if (!connection.active) {
      // Пунктирная линия (потенциальный маршрут)
      ctx.strokeStyle = '#6B7280';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // Светящаяся линия (активная связь)
      const colors = {
        train: '#3B82F6',
        bus: '#10B981',
        plane: '#EF4444',
        rocket: '#8B5CF6'
      };

      ctx.strokeStyle = colors[connection.type];
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = colors[connection.type];

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Транспорт (простая точка, движущаяся по линии)
      const progress = (Date.now() / 2000) % 1; // Анимация
      const x = fromX + (toX - fromX) * progress;
      const y = fromY + (toY - fromY) * progress;

      ctx.fillStyle = colors[connection.type];
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Функция для добавления здания (для тестирования)
  const handleAddBuilding = (sphereId: string, areaId: string) => {
    const newBuilding: Building = {
      id: `building-${Date.now()}`,
      name: 'Тестовое здание',
      position: { x: Math.random() * 8, y: Math.random() * 8 },
      sphere: sphereId,
      area: areaId,
      built: true
    };
    setBuildings([...buildings, newBuilding]);
  };

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg bg-gray-900"
        style={{ width: '100%', height: '600px' }}
      />
      
      {/* Кнопки для тестирования */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => handleAddBuilding('mind', 'focus')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Добавить здание (Разум)
        </button>
        <button
          onClick={() => handleAddBuilding('body', 'energy')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Добавить здание (Тело)
        </button>
        <button
          onClick={() => {
            if (buildings.length < 2) {
              alert('Нужно минимум 2 здания для создания связи');
              return;
            }

            // Находим пару зданий, между которыми еще нет связи
            let foundPair = false;
            for (let i = 0; i < buildings.length && !foundPair; i++) {
              for (let j = i + 1; j < buildings.length && !foundPair; j++) {
                const building1 = buildings[i];
                const building2 = buildings[j];
                
                // Проверяем, нет ли уже связи между этими зданиями
                const existingConnection = connections.find(
                  conn => 
                    (conn.from === building1.id && conn.to === building2.id) ||
                    (conn.from === building2.id && conn.to === building1.id)
                );

                if (!existingConnection) {
                  // Определяем тип транспорта в зависимости от сфер
                  let transportType: 'train' | 'bus' | 'plane' | 'rocket' = 'bus';
                  if (building1.sphere === building2.sphere) {
                    transportType = 'train'; // Внутри одной сферы - поезд
                  } else {
                    // Между разными сферами - автобус или самолет
                    const sphereDistance = Math.abs(
                      ['mind', 'emotions', 'body', 'society'].indexOf(building1.sphere) -
                      ['mind', 'emotions', 'body', 'society'].indexOf(building2.sphere)
                    );
                    if (sphereDistance === 1) {
                      transportType = 'bus'; // Соседние сферы - автобус
                    } else {
                      transportType = 'plane'; // Дальние сферы - самолет
                    }
                  }

                  setConnections([...connections, {
                    from: building1.id,
                    to: building2.id,
                    type: transportType,
                    active: true
                  }]);
                  foundPair = true;
                }
              }
            }

            if (!foundPair) {
              alert('Все возможные связи уже созданы!');
            }
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Добавить связь
        </button>
      </div>
    </div>
  );
}
