'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Saturn from './Saturn';

interface ObservatoryProps {
  position: [number, number, number];
  active?: boolean;
  level?: number;
}

/**
 * Обсерватория Долгосрочного Планирования
 * 
 * Форма:
 * - Классическая обсерватория с вращающимся куполом
 * - Высокая башня
 * - Основание — широкое, стабильное
 * - Симметричная структура
 */
export default function Observatory({
  position,
  active = true,
  level = 1,
}: ObservatoryProps) {
  const groupRef = useRef<THREE.Group>(null);
  const domeRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Group>(null);
  const ledsRef = useRef<THREE.Group>(null);
  const saturnRef = useRef<THREE.Group>(null);

  // Цвета — тёплая палитра: жёлтый, оранжевый, золотистый, терракот
  const primaryColor = new THREE.Color(0xd4a017); // Золотисто-янтарный (башня)
  const secondaryColor = new THREE.Color(0xb85c22); // Терракот
  const glowColor = new THREE.Color(0xf0c040); // Золотисто-жёлтое свечение

  // Размеры (уменьшены для соответствия другим зданиям)
  const baseWidth = 1.5;
  const baseHeight = 1.8 * level;
  const baseDepth = 1.5;
  const baseYOffset = baseHeight / 2;
  const domeRadius = baseWidth * 0.7;

  const auraMargin = 0.02;
  const auraOverhang = 0.02;
  const fundH = 0.2;
  const fundY = -baseHeight / 2 + fundH / 2 - 0.21;
  const fundR = baseWidth * 0.75;
  const towerH = baseHeight * 0.7;
  const towerY = -baseHeight / 2 + 0.1 + towerH / 2 - 0.02 - 0.21;
  const towerR = baseWidth * 0.7;
  const domeBaseY = -baseHeight / 2 + 0.1 + baseHeight * 0.7 - 0.24;
  const domeAuraR = domeRadius + auraOverhang;
  const domeAuraY = domeBaseY;

  // Изогнутая дверь по цилиндру башни (дуга по стене)
  const doorArcWidth = 0.35;
  const doorHeight = 0.68;
  const doorCenterAngle = Math.PI / 4;
  const doorSegW = 12;
  const doorSegH = 12;
  const curvedDoorGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const angleMin = doorCenterAngle - doorArcWidth / (2 * towerR);
    const angleMax = doorCenterAngle + doorArcWidth / (2 * towerR);
    const yMin = -doorHeight / 2;
    const yMax = doorHeight / 2;
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    for (let j = 0; j <= doorSegH; j++) {
      const y = yMin + (j / doorSegH) * doorHeight;
      for (let i = 0; i <= doorSegW; i++) {
        const angle = angleMin + (i / doorSegW) * (angleMax - angleMin);
        const x = towerR * Math.cos(angle);
        const z = towerR * Math.sin(angle);
        positions.push(x, y, z);
        normals.push(Math.cos(angle), 0, Math.sin(angle));
        uvs.push(i / doorSegW, j / doorSegH);
      }
    }
    const indices: number[] = [];
    for (let j = 0; j < doorSegH; j++) {
      for (let i = 0; i < doorSegW; i++) {
        const a = j * (doorSegW + 1) + i;
        const b = a + 1;
        const c = a + (doorSegW + 1);
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals(); // пересчёт для плавного затенения
    return geom;
  }, [towerR, doorArcWidth, doorHeight, doorCenterAngle, doorSegW, doorSegH]);

  // Изогнутая рамка двери (чуть больше дуги)
  const frameArcWidth = 0.364;
  const frameHeight = 0.69;
  const curvedFrameGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const angleMin = doorCenterAngle - frameArcWidth / (2 * towerR);
    const angleMax = doorCenterAngle + frameArcWidth / (2 * towerR);
    const yMin = -frameHeight / 2;
    const yMax = frameHeight / 2;
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    for (let j = 0; j <= doorSegH; j++) {
      const y = yMin + (j / doorSegH) * frameHeight;
      for (let i = 0; i <= doorSegW; i++) {
        const angle = angleMin + (i / doorSegW) * (angleMax - angleMin);
        const x = (towerR + 0.001) * Math.cos(angle);
        const z = (towerR + 0.001) * Math.sin(angle);
        positions.push(x, y, z);
        normals.push(Math.cos(angle), 0, Math.sin(angle));
        uvs.push(i / doorSegW, j / doorSegH);
      }
    }
    const indices: number[] = [];
    for (let j = 0; j < doorSegH; j++) {
      for (let i = 0; i < doorSegW; i++) {
        const a = j * (doorSegW + 1) + i;
        const b = a + 1;
        const c = a + (doorSegW + 1);
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [towerR, frameArcWidth, frameHeight, doorCenterAngle, doorSegW, doorSegH]);

  // Анимация
  useFrame((state) => {
    if (!groupRef.current || !domeRef.current || !starsRef.current) return;

    const time = state.clock.getElapsedTime();

    // Медленное вращение купола
    if (domeRef.current) {
      domeRef.current.rotation.y = time * 0.15;
    }

    // Мерцание звезд в окнах
    if (starsRef.current) {
      starsRef.current.children.forEach((star, index) => {
        if (star instanceof THREE.Mesh) {
          const twinkle = 0.5 + Math.sin(time * 4 + index * 0.5) * 0.5;
          if (star.material instanceof THREE.MeshBasicMaterial) {
            star.material.opacity = twinkle * (active ? 1 : 0.5);
          }
        }
      });
    }

    // Мигание светодиодов на основании купола
    if (ledsRef.current) {
      ledsRef.current.children.forEach((led, index) => {
        if (led instanceof THREE.Mesh && led.material instanceof THREE.MeshBasicMaterial) {
          // Мерцание: три цвета - фиолетовый, голубой, цвет башни (замедлено для плавности)
          const blink = Math.sin(time * 0.3 + index * 0.1) * 0.5 + 0.5; // От 0 до 1
          const colorPhase = Math.floor(blink * 3); // 0, 1 или 2
          const colors = ['#e07c2e', '#f0c040', '#d4a017']; // Оранжевый, золотистый, янтарный (цвет башни)
          const currentColor = colors[colorPhase];
          
          // Изменяем color и opacity (фиолетовый менее яркий через прозрачность)
          led.material.color.setHex(parseInt(currentColor.replace('#', ''), 16));
          // Оранжевый (фаза 0) - менее яркий через прозрачность
          const opacity = colorPhase === 0 ? 0.3 : (active ? 1 : 0.5);
          led.material.opacity = opacity;
        }
      });
    }

    // Плавающая анимация Сатурна над куполом
    if (saturnRef.current) {
      const floatOffset = Math.sin(time * 0.5) * 0.1; // Плавное плавание вверх-вниз
      const baseY = -baseHeight / 2 + 0.1 + baseHeight * 0.7 + domeRadius + 0.5 - 0.24;
      saturnRef.current.position.y = baseY + floatOffset;
    }
  });

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* Фундамент обсерватории — на ~20% темнее базового */}
      <mesh position={[0, -baseHeight / 2 + 0.2 / 2 - 0.21, 0]}>
        <cylinderGeometry args={[fundR, fundR, 0.2, 16]} />
        <meshStandardMaterial
          color="#8b5a2b"
          emissive="#c4782a"
          emissiveIntensity={active ? 0.3 : 0.15}
          metalness={0.9}
          roughness={0.2}
          transparent={false}
          opacity={1}
        />
      </mesh>

      {/* Башня обсерватории (цилиндрическая) - начинается от верха фундамента, толщина 0.7 */}
      {/* Фундамент: высота 0.2, центр на -baseHeight/2, верх на -baseHeight/2 + 0.1 */}
      {/* Башня: высота baseHeight * 0.7, центр должен быть на -baseHeight/2 + 0.1 + (baseHeight * 0.7) / 2 */}
      {/* Но position[1] уже содержит baseHeight/2, поэтому: итоговая позиция = baseHeight/2 - baseHeight/2 + 0.1 + (baseHeight * 0.7) / 2 = 0.1 + (baseHeight * 0.7) / 2 */}
      {/* Основание башни будет на 0.1, что совпадает с верхом фундамента */}
      {/* Исправление: немного опускаем башню, чтобы убрать визуальный зазор */}
      <mesh position={[0, -baseHeight / 2 + 0.1 + (baseHeight * 0.7) / 2 - 0.02 - 0.21, 0]}>
        <cylinderGeometry args={[baseWidth * 0.7, baseWidth * 0.7, baseHeight * 0.7, 16]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.35 : 0.2}
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Внутренняя башня (непрозрачная) - создает эффект наполненности, минимальный зазор от внешней стены */}
      <mesh position={[0, -baseHeight / 2 + 0.1 + (baseHeight * 0.7) / 2 - 0.02 - 0.21, 0]}>
        <cylinderGeometry args={[baseWidth * 0.68, baseWidth * 0.68, baseHeight * 0.7 * 0.95, 16]} />
        <meshStandardMaterial
          color="#6b4423"
          emissive="#a0522d"
          emissiveIntensity={active ? 0.3 : 0.15}
          metalness={0.8}
          roughness={0.3}
          transparent={false}
          opacity={1}
        />
      </mesh>

      {/* Окна с проекциями звезд */}
      <group ref={starsRef}>
        {[0, 1, 2].map((floor) => (
          <React.Fragment key={floor}>
            {/* Окна по кругу - прилегают к цилиндрической стене плоскостью (уменьшены пропорционально, чтобы не залезали на крышу) */}
            {[0, 1, 2, 3].map((window) => {
              const angle = (window * Math.PI) / 2;
              const radius = baseWidth * 0.71; // Радиус под башню толщиной 0.7
              return (
                <mesh
                  key={`window-${floor}-${window}`}
                  position={[
                    Math.cos(angle) * radius,
                    -baseHeight / 2 + 0.1 + (baseHeight * 0.7) / 2 - 0.21 + (floor - 1) * (0.45 / 1.3),
                    Math.sin(angle) * radius,
                  ]}
                  rotation={[0, angle + Math.PI / 2, 0]}
                >
                  <planeGeometry args={[0.25 / 1.2, 0.25 / 1.2]} />
                  <meshBasicMaterial
                    color={glowColor}
                    transparent
                    opacity={active ? 0.8 : 0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              );
            })}
          </React.Fragment>
        ))}
      </group>

      {/* Дверь приделана к цилиндрической стене башни, изогнута по дуге */}
      <group position={[0, -baseHeight / 2 + 0.1 + 0.28 - 0.21, 0]}>
        {/* Изогнутая дверь по поверхности цилиндра — коричневая (низкий metalness, чтобы цвет не смывался отражениями) */}
        <mesh geometry={curvedDoorGeometry}>
          <meshStandardMaterial
            color="#3d2914"
            emissive="#4a3520"
            emissiveIntensity={active ? 0.25 : 0.08}
            metalness={0.25}
            roughness={0.65}
            transparent={false}
            opacity={1}
          />
        </mesh>
        {/* Изогнутая рамка двери (чуть выступает из стены) — коричневая обводка */}
        <mesh geometry={curvedFrameGeometry}>
          <meshStandardMaterial
            color="#5c4033"
            emissive="#6b4a35"
            emissiveIntensity={active ? 0.35 : 0.12}
            metalness={0.3}
            roughness={0.6}
            transparent={false}
            opacity={1}
          />
        </mesh>
        {/* Ручка на поверхности двери — справа по дуге, чуть вдавлена в дверь */}
        <mesh
          position={[
            (towerR + 0.002) * Math.cos(doorCenterAngle + 0.12 / towerR),
            0.1,
            (towerR + 0.002) * Math.sin(doorCenterAngle + 0.12 / towerR),
          ]}
        >
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ffb347"
            emissiveIntensity={active ? 1.5 : 0.5}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Вращающийся купол - на верху башни (полусфера с разрезом для телескопа) */}
      <group ref={domeRef} position={[0, -baseHeight / 2 + 0.1 + baseHeight * 0.7 - 0.24, 0]}>
        {/* Основная полусфера купола — оранжево-красная */}
        <mesh>
          <sphereGeometry args={[domeRadius, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#c45c2a"
            emissive="#e07c2e"
            emissiveIntensity={active ? 0.5 : 0.25}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Внутренний купол — зазор 4%, ярко сиренево-розовый; BasicMaterial = один ровный цвет без двухцветности */}
        <mesh>
          <sphereGeometry args={[domeRadius * 0.96, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial
            color="#e8c547"
            transparent={false}
            opacity={1}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Выпуклое ребро/шов вдоль разреза купола - цепочка бревнышек от основания до вершины */}
        {/* Ребро идет по одной линии разреза (например, по оси X), плотно прилегая к поверхности */}
        {/* Цепочка бревнышек идет от основания до самой вершины, без разрывов */}
        {Array.from({ length: 75 }).map((_, i) => {
          const totalSegments = 75;
          const t = i / (totalSegments - 1); // От 0 до 1
          // Начинаем выше основания, чтобы не свисало вниз
          const startOffset = domeRadius * 0.05;
          const endOffset = domeRadius; // Доходим до самой вершины
          const y = startOffset + t * (endOffset - startOffset);
          
          // Радиус в горизонтальной плоскости на этой высоте (для полусферы)
          const horizontalRadius = Math.sqrt(domeRadius * domeRadius - y * y);
          
          // Позиция на поверхности купола по оси X (ребро идет по одной линии)
          // Вычисляем точную позицию на поверхности купола
          const surfaceX = horizontalRadius;
          // Выступ уменьшается по мере приближения к вершине (t от 0 до 1, где 1 - вершина)
          const baseProtrusion = domeRadius * 0.008;
          const topProtrusion = domeRadius * 0.002; // Минимальный выступ на вершине
          const protrusion = baseProtrusion * (1 - t * 0.75) + topProtrusion * (t * 0.75); // Плавное уменьшение к вершине
          const x = surfaceX + protrusion;
          const z = 0;
          
          // Угол наклона сегмента вдоль поверхности купола
          const angle = Math.atan2(horizontalRadius, domeRadius - y);
          
          // Вычисляем длину сегмента на основе расстояния по дуге купола до следующего сегмента
          let segmentLength = domeRadius * 0.08; // Базовая длина (возвращена)
          if (i < totalSegments - 1) {
            // Вычисляем расстояние по дуге до следующего сегмента
            const nextT = (i + 1) / (totalSegments - 1);
            const nextY = startOffset + nextT * (endOffset - startOffset);
            const nextHorizontalRadius = Math.sqrt(domeRadius * domeRadius - nextY * nextY);
            // Расстояние по дуге между двумя точками на сфере
            const dy = nextY - y;
            const dx = nextHorizontalRadius - horizontalRadius;
            const arcDistance = Math.sqrt(dx * dx + dy * dy);
            // Длина сегмента должна быть немного больше расстояния, чтобы они перекрывались
            segmentLength = arcDistance * 1.1;
          } else {
            // Для последнего сегмента используем стандартную длину
            segmentLength = domeRadius * 0.08;
          }
          
          // Увеличиваем размер последнего сегмента (на вершине) в 2 раза относительно обычных
          const isLastSegment = i === totalSegments - 1;
          const segmentRadius = isLastSegment ? domeRadius * 0.27 : domeRadius * 0.2; // Последний сегмент уменьшен в 1.5 раза
          
          return (
            <mesh
              key={`dome-seam-${i}`}
              position={[x, y, z]}
              rotation={[0, 0, -angle]}
            >
              <cylinderGeometry args={[segmentRadius, segmentRadius, segmentLength, 8]} />
              <meshStandardMaterial
                color={secondaryColor}
                emissive={glowColor}
                emissiveIntensity={active ? 0.7 : 0.35}
                metalness={0.95}
                roughness={0.05}
                transparent={false}
                opacity={1}
              />
            </mesh>
          );
        })}
      </group>

      {/* Светодиоды по окружности основания купола (с внешней стороны) - с миганием */}
      <group ref={ledsRef} position={[0, -baseHeight / 2 + 0.1 + baseHeight * 0.7 - 0.21, 0]}>
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const radius = domeRadius; // На уровне основания купола
          // Чередование цветов для эффекта мерцания: яркий белый и фиолетовый
          const colors = ['#fff8e7', '#e07c2e', '#fff8e7', '#f0c040', '#fff8e7', '#e07c2e', '#fff8e7', '#f0c040', '#fff8e7', '#e07c2e', '#fff8e7', '#f0c040', '#fff8e7', '#e07c2e', '#fff8e7', '#f0c040'];
          const color = colors[i];
          return (
            <mesh
              key={`dome-led-${i}`}
              position={[
                Math.cos(angle) * radius,
                0, // На уровне основания купола
                Math.sin(angle) * radius,
              ]}
            >
              <sphereGeometry args={[domeRadius * 0.03, 8, 8]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={active ? 1 : 0.5}
              />
            </mesh>
          );
        })}
      </group>

      {/* Аура: фундамент, башня, купол — минимальный выступ, без наложения (depthWrite=false, DoubleSide) */}
      <mesh position={[0, fundY, 0]} renderOrder={-1}>
        <cylinderGeometry args={[fundR + auraOverhang, fundR + auraOverhang, fundH + auraMargin, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, towerY, 0]} renderOrder={-1}>
        <cylinderGeometry args={[towerR + auraOverhang, towerR + auraOverhang, towerH + auraMargin, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, domeAuraY, 0]} renderOrder={-1}>
        <sphereGeometry args={[domeAuraR, 32, 32, 0, Math.PI / 2, 0, Math.PI * 2]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Сатурн, парящий над вершиной купола */}
      <group ref={saturnRef} position={[0, -baseHeight / 2 + 0.1 + baseHeight * 0.7 + domeRadius + 0.5 - 0.24, 0]}>
        <Saturn
          position={[0, 0, 0]}
          scale={0.3}
          rotationSpeed={0.05}
        />
      </group>
    </group>
  );
}
