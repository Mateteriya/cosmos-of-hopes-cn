'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Типы данных (те же, что и в MapCanvas)
interface Building {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  sphere: string;
  area: string;
  built: boolean;
  type: 'city' | 'house' | 'attraction' | 'reserve';
}

interface Connection {
  from: string;
  to: string;
  type: 'train' | 'bus' | 'plane' | 'rocket';
  active: boolean;
}

/**
 * Игровой вид: Мозг как ландшафт
 * 
 * Визуализация:
 * - Мозг как 3D ландшафт
 * - Извилины = рельеф местности
 * - Области = разные биомы
 * - Здания = города, дома, аттракционы, заповедники
 */
export default function BrainLandscape() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const brainRef = useRef<THREE.Mesh | null>(null);
  const buildingsRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Инициализация сцены (один раз)
  useEffect(() => {
    if (!containerRef.current) return;

    // Создаем сцену
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a); // Темный фон
    sceneRef.current = scene;

    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Создаем рендерер
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Создаем более реалистичную модель мозга (две полусферы, как настоящий мозг)
    // Левое полушарие
    const leftHemisphereGeometry = new THREE.SphereGeometry(2.5, 32, 32, 0, Math.PI * 2, 0, Math.PI);
    const rightHemisphereGeometry = new THREE.SphereGeometry(2.5, 32, 32, 0, Math.PI * 2, 0, Math.PI);
    
    // Создаем материал с неоновым свечением
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a00e0,
      emissive: 0x1a0050,
      transparent: true,
      opacity: 0.8,
      shininess: 100
    });

    // Левое полушарие
    const leftBrain = new THREE.Mesh(leftHemisphereGeometry, brainMaterial);
    leftBrain.position.set(-0.3, 0, 0);
    leftBrain.rotation.z = -0.1;
    scene.add(leftBrain);

    // Правое полушарие
    const rightBrain = new THREE.Mesh(rightHemisphereGeometry, brainMaterial);
    rightBrain.position.set(0.3, 0, 0);
    rightBrain.rotation.z = 0.1;
    scene.add(rightBrain);

    // Сохраняем ссылку на правое полушарие для анимации
    brainRef.current = rightBrain;

    // Добавляем извилины (более реалистично)
    const foldsGroup = new THREE.Group();
    for (let i = 0; i < 30; i++) {
      const foldGeometry = new THREE.TorusGeometry(0.15, 0.08, 8, 16);
      const foldMaterial = new THREE.MeshPhongMaterial({
        color: 0x6a00ff,
        emissive: 0x2a0080
      });
      const fold = new THREE.Mesh(foldGeometry, foldMaterial);
      
      // Размещаем извилины на поверхности мозга более реалистично
      const angle1 = (i / 30) * Math.PI * 2;
      const angle2 = (Math.random() - 0.5) * Math.PI * 0.8; // Ограничиваем диапазон
      const radius = 2.6;
      
      fold.position.set(
        Math.sin(angle2) * Math.cos(angle1) * radius,
        Math.cos(angle2) * radius,
        Math.sin(angle2) * Math.sin(angle1) * radius
      );
      
      // Ориентируем извилину по нормали к поверхности
      const normal = fold.position.clone().normalize();
      fold.lookAt(normal.multiplyScalar(10));
      fold.rotateX(Math.PI / 2);
      
      foldsGroup.add(fold);
    }
    scene.add(foldsGroup);

    // Группа для зданий
    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);
    buildingsRef.current = buildingsGroup;

    // Освещение
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4a00e0, 1, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 100);
    pointLight2.position.set(-5, -5, -5);
    scene.add(pointLight2);

    // Анимация
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Вращение мозга (медленное)
      if (leftBrain) leftBrain.rotation.y += 0.001;
      if (rightBrain) rightBrain.rotation.y += 0.001;

      // Пульсация (легкое масштабирование)
      const pulse = Math.sin(Date.now() / 1000) * 0.03 + 1;
      if (leftBrain) leftBrain.scale.set(pulse, pulse, pulse);
      if (rightBrain) rightBrain.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };
    animate();

    // Обработка изменения размера
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Очистка
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch (e) {
          // Игнорируем ошибки при очистке
        }
      }
      renderer.dispose();
    };
  }, []);

  // Отрисовка зданий когда они меняются
  useEffect(() => {
    if (!buildingsRef.current || !sceneRef.current) return;

    // Очищаем старые здания
    buildingsRef.current.clear();

    // Добавляем новые здания
    buildings.forEach(building => {
      if (!building.built) return;

      // Цвета по сферам
      const sphereColors = {
        mind: 0x3B82F6,
        emotions: 0xEF4444,
        body: 0x10B981,
        society: 0x8B5CF6
      };

      // Размеры по типам
      const typeSizes = {
        city: { width: 0.4, height: 0.6, depth: 0.4 },
        house: { width: 0.2, height: 0.3, depth: 0.2 },
        attraction: { width: 0.3, height: 0.5, depth: 0.3 },
        reserve: { width: 0.25, height: 0.2, depth: 0.25 }
      };

      const size = typeSizes[building.type];
      const color = sphereColors[building.sphere as keyof typeof sphereColors] || 0xffffff;

      // Создаем здание на поверхности мозга
      const buildingGeometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
      const buildingMaterial = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3
      });
      const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);

      // Размещаем на поверхности мозга (радиус ~2.6)
      const radius = 2.6;
      // Преобразуем позицию в сферические координаты
      const theta = building.position.x * Math.PI * 2; // Азимутальный угол (0-2π)
      const phi = (building.position.y + 1) * Math.PI / 2; // Полярный угол (0-π), нормализуем от -1 до 1
      
      // Определяем, на какое полушарие попадает здание
      const isLeftHemisphere = building.position.x < 0;
      const hemisphereOffset = isLeftHemisphere ? -0.3 : 0.3;
      
      buildingMesh.position.set(
        Math.sin(phi) * Math.cos(theta) * radius + hemisphereOffset,
        Math.cos(phi) * radius,
        Math.sin(phi) * Math.sin(theta) * radius
      );

      // Ориентируем по нормали к поверхности
      const normal = buildingMesh.position.clone().normalize();
      buildingMesh.lookAt(normal.multiplyScalar(10));
      buildingMesh.rotateX(-Math.PI / 2);

      buildingsRef.current!.add(buildingMesh);
    });
  }, [buildings]);

  // Функция для добавления здания (для тестирования)
  const handleAddBuilding = (sphereId: string, type: Building['type']) => {
    // Позиции по сферам (углы на поверхности мозга)
    const spherePositions = {
      mind: { x: -0.3, y: 0.2 },      // Левое полушарие, верх
      emotions: { x: 0.3, y: 0.2 },   // Правое полушарие, верх
      body: { x: -0.2, y: -0.3 },     // Левое полушарие, низ
      society: { x: 0.2, y: -0.3 }    // Правое полушарие, низ
    };

    const basePos = spherePositions[sphereId as keyof typeof spherePositions] || { x: 0, y: 0 };
    
    const newBuilding: Building = {
      id: `building-${Date.now()}`,
      name: `Тестовое ${type}`,
      position: {
        x: basePos.x + (Math.random() - 0.5) * 0.2, // Небольшое случайное смещение
        y: basePos.y + (Math.random() - 0.5) * 0.2,
        z: 0 // Z будет вычисляться при размещении на поверхности
      },
      sphere: sphereId,
      area: 'test',
      built: true,
      type
    };
    setBuildings([...buildings, newBuilding]);
  };

  return (
    <div className="w-full h-full relative">
      <div
        ref={containerRef}
        className="w-full h-full border border-gray-300 rounded-lg"
        style={{ minHeight: '600px' }}
      />
      
      {/* Кнопки для тестирования */}
      <div className="mt-4 flex gap-2 flex-wrap">
        <button
          onClick={() => handleAddBuilding('mind', 'city')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Добавить город (Разум)
        </button>
        <button
          onClick={() => handleAddBuilding('emotions', 'house')}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Добавить дом (Эмоции)
        </button>
        <button
          onClick={() => handleAddBuilding('body', 'attraction')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Добавить аттракцион (Тело)
        </button>
        <button
          onClick={() => handleAddBuilding('society', 'reserve')}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Добавить заповедник (Связи)
        </button>
      </div>

      <div className="mt-2 text-sm text-gray-400">
        🎮 Игровой вид: Мозг как ландшафт
      </div>
    </div>
  );
}
