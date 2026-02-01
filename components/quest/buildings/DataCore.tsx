'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PulsingStar from './PulsingStar';

interface DataCoreProps {
  position: [number, number, number];
  active?: boolean;
  level?: number;
}

/**
 * Ядро Данных
 * 
 * Форма:
 * - Здание-серверная с множеством серверов
 * - Геометрические формы (кубы, параллелепипеды)
 * - Множество "портов" и "кабелей"
 * - Компактная структура
 */
export default function DataCore({
  position,
  active = true,
  level = 1,
}: DataCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const serversRef = useRef<THREE.Group>(null);
  const indicatorsRef = useRef<THREE.Group>(null);
  const roofIndicatorRef = useRef<THREE.Mesh>(null);

  // Бело-жемчужно-серебристые тона с контрастом элементов (разница оттенков)
  const primaryColor = new THREE.Color(0xe8eaf0); // Светлый — стены, пол серверной
  const secondaryColor = new THREE.Color(0xb0b4bc); // Средний — крыша, венты (отличается от стен)
  const foundationColor = new THREE.Color(0x787c84); // Темнее — фундамент, пол под зданием
  const glowColor = new THREE.Color(0xdcdee4); // Свечение
  const doorColor = new THREE.Color(0x787c84); // Дверь чуть светлее
  const doorGlowColor = new THREE.Color(0x888c90);

  // Размеры (высота чуть меньше)
  const baseWidth = 1.2;
  const baseHeight = 1.15 * level;
  const baseDepth = 1.2;
  const foundationHeight = 0.15;
  // Координаты: фундамент снизу, здание строго на нём
  const foundationCenterY = -baseHeight / 2 + foundationHeight / 2;
  const buildingFloorY = -baseHeight / 2 + foundationHeight;
  const buildingCenterY = buildingFloorY + baseHeight / 2;
  const structureCenterY = -baseHeight / 2 + (foundationHeight + baseHeight) / 2;

  // Аура: облегает фундамент, корпус и крышу; рисуется первой (renderOrder -2), чтобы не перекрывать их
  const auraMargin = 0.02;
  const auraOverhang = 0.02;
  const auraColorGray = glowColor; // классическая «серенькая» для фундамента и крыши
  const auraColorOrange = new THREE.Color(0xff8833); // ярко-оранжевая неоновая только у корпуса

  // Анимация
  useFrame((state) => {
    if (!groupRef.current || !serversRef.current || !indicatorsRef.current) return;

    const time = state.clock.getElapsedTime();

    // Крупный индикатор на крыше: по очереди 4 цвета + пульс яркости
    if (roofIndicatorRef.current?.material && roofIndicatorRef.current.material instanceof THREE.MeshBasicMaterial) {
      const roofColors = [0x22dd44, 0x00ccff, 0x7766dd, 0xe4e0d4]; // зелёный яркий, голубой неон, фиол-сиреневый (больше синий), бело-серебристый+золото
      const cycleDuration = 1.2; // секунд на цвет
      const colorIndex = Math.floor(time / cycleDuration) % 4;
      roofIndicatorRef.current.material.color.setHex(roofColors[colorIndex]);
      const blink = 0.5 + 0.5 * Math.sin(time * 4); // пульс яркости
      roofIndicatorRef.current.material.opacity = active ? Math.max(0.6, blink) : 0.4;
    }

    // Пульсация стоек: стоят на месте (низ чуть выше пола), только растут в высоту и возвращаются
    if (serversRef.current) {
      const rackBottomY = -baseHeight / 2 + 0.008;
      const rackHalfH = (baseHeight * 0.55) / 2;
      serversRef.current.children.forEach((server, index) => {
        if (server instanceof THREE.Mesh) {
          const pulse = 0.95 + Math.sin(time * 4 + index * 0.2) * 0.05;
          server.scale.y = pulse;
          server.position.y = rackBottomY + rackHalfH * pulse;
        }
      });
    }

    // Мигание индикаторов: волна по вертикали (сверху вниз/снизу вверх), все ряды синхронно
    // Фаза зависит только от вертикальной позиции в ряду (0–4), поэтому все ряды мигают одинаково
    if (indicatorsRef.current) {
      const maxOpacity = active ? 1 : 0.5;
      indicatorsRef.current.children.forEach((indicator, index) => {
        if (indicator instanceof THREE.Mesh && indicator.material instanceof THREE.MeshBasicMaterial) {
          const verticalIndex = index % 5; // позиция в ряду (0–4)
          const blink = Math.sin(time * 3.5 + verticalIndex * 0.5) > 0 ? 1 : 0.3;
          indicator.material.opacity = blink * maxOpacity;
        }
      });
    }

    // Индикаторы статичны по Y (без движения вверх/вниз), мигание и видимость по стене — ниже

    // Показывать индикаторы только на стене, которая обращена к камере
    if (indicatorsRef.current && groupRef.current) {
      const cameraLocalZ = state.camera.position.z - position[2];
      const cameraLocalX = state.camera.position.x - position[0];
      indicatorsRef.current.children.forEach((indicator, index) => {
        if (index < 20) {
          // Фронтальная/задняя стена: 0-9 задняя (-Z), 10-19 передняя (+Z)
          const row = Math.floor(index / 10);
          indicator.visible = row === 0 ? cameraLocalZ < 0 : cameraLocalZ > 0;
        } else if (index < 30) {
          // Левая стена (20-29)
          indicator.visible = cameraLocalX < 0;
        } else {
          // Правая стена (30-39)
          indicator.visible = cameraLocalX > 0;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[position[0], baseHeight / 2, position[2]]}>
      {/* Аура: три слоя, снаружи объектов. Фундамент рисуется в прозрачном проходе после ауры (renderOrder 10 > -2), чтобы не перекрываться */}
      <mesh position={[0, foundationCenterY, 0]} renderOrder={-2}>
        <boxGeometry args={[baseWidth * 1.1 + auraOverhang * 2, foundationHeight + auraMargin, baseDepth * 1.1 + auraOverhang * 2]} />
        <meshBasicMaterial color={auraColorGray} transparent opacity={active ? 0.1 : 0.04} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, buildingCenterY, 0]} renderOrder={-2}>
        <boxGeometry args={[baseWidth + auraOverhang * 2, baseHeight + auraMargin, baseDepth + auraOverhang * 2]} />
        <meshBasicMaterial color={auraColorOrange} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, buildingFloorY + baseHeight + 0.05, 0]} renderOrder={-2}>
        <boxGeometry args={[baseWidth * 1.05 + auraOverhang * 2, 0.1 + auraMargin, baseDepth * 1.05 + auraOverhang * 2]} />
        <meshBasicMaterial color={auraColorGray} transparent opacity={active ? 0.1 : 0.04} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Основание — темнее для контраста. transparent+opacity=1 чтобы рисоваться после ауры и не перекрываться ею */}
      <mesh position={[0, foundationCenterY, 0]} renderOrder={10}>
        <boxGeometry args={[baseWidth * 1.1, foundationHeight, baseDepth * 1.1]} />
        <meshLambertMaterial
          color={foundationColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.18 : 0.09}
          transparent
          opacity={1}
          depthWrite={true}
        />
      </mesh>

      {/* Основное здание: прозрачное, depthWrite=true чтобы сетка не просвечивала; без зеркальности */}
      <mesh position={[0, buildingCenterY, 0]}>
        <boxGeometry args={[baseWidth, baseHeight, baseDepth]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.3 : 0.15}
          metalness={0}
          roughness={1}
          transparent
          opacity={0.88}
          depthWrite={true}
          envMapIntensity={0}
        />
      </mesh>

      {/* Пол под зданием — в тон фундаменту для контраста */}
      <mesh position={[0, -baseHeight / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={10}>
        <planeGeometry args={[baseWidth * 1.12, baseDepth * 1.12]} />
        <meshLambertMaterial
          color={foundationColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.08 : 0.04}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Пол серверной: рисуется поверх интерьера (renderOrder 10) */}
      <mesh position={[0, buildingCenterY - baseHeight / 2 + 0.004, 0]} renderOrder={10}>
        <boxGeometry args={[baseWidth * 0.98, 0.006, baseDepth * 0.98]} />
        <meshLambertMaterial
          color={primaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.15 : 0.08}
          transparent
          opacity={0.9}
          depthWrite={true}
        />
      </mesh>

      {/* Крыша — средний тон, контраст со стенами и фундаментом */}
      <mesh position={[0, buildingFloorY + baseHeight + 0.05, 0]} renderOrder={10}>
        <boxGeometry args={[baseWidth * 1.05, 0.1, baseDepth * 1.05]} />
        <meshLambertMaterial
          color={secondaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.45 : 0.22}
        />
      </mesh>

      {/* Вентблоки на крыше — средний тон как крыша */}
      {[0, 1].map((i) => (
        <mesh
          key={`roof-vent-${i}`}
          position={[-baseWidth * 0.25 + i * (baseWidth * 0.5), buildingFloorY + baseHeight + 0.15, 0]}
          renderOrder={10}
        >
          <boxGeometry args={[0.25, 0.1, 0.25]} />
          <meshLambertMaterial
            color={secondaryColor}
            emissive={glowColor}
            emissiveIntensity={active ? 0.35 : 0.18}
          />
        </mesh>
      ))}

      {/* Крупный индикатор на крыше между вентблоками: мигает по очереди 4 цвета */}
      <mesh
        ref={roofIndicatorRef}
        position={[0, buildingFloorY + baseHeight + 0.12, 0]}
        renderOrder={10}
      >
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshBasicMaterial color="#22dd44" transparent opacity={0.9} />
      </mesh>

      {/* Дверь — темнее для контраста */}
      <group position={[0, buildingFloorY + 0.3, baseDepth * 0.51]}>
        {/* Дверное полотно */}
        <mesh renderOrder={10}>
          <planeGeometry args={[0.3, 0.55]} />
          <meshLambertMaterial
            color={doorColor}
            emissive={doorGlowColor}
            emissiveIntensity={active ? 0.28 : 0.14}
          />
        </mesh>
        {/* Рамка двери */}
        <mesh position={[0, 0, 0.001]} renderOrder={10}>
          <planeGeometry args={[0.32, 0.57]} />
          <meshLambertMaterial
            color={doorGlowColor}
            emissive={doorGlowColor}
            emissiveIntensity={active ? 0.45 : 0.22}
          />
        </mesh>
        {/* Ручка двери */}
        <mesh position={[0.12, 0, 0.015]} renderOrder={10}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshLambertMaterial
            color={doorGlowColor}
            emissive={doorGlowColor}
            emissiveIntensity={active ? 0.8 : 0.4}
          />
        </mesh>
      </group>

      {/* Вентрешетки на 3 сторонах — рисуются поверх интерьера (renderOrder 10) */}
      {([
        { side: 'left', x: -baseWidth * 0.51, z: 0, rot: [0, Math.PI / 2, 0] as [number, number, number] },
        { side: 'right', x: baseWidth * 0.51, z: 0, rot: [0, -Math.PI / 2, 0] as [number, number, number] },
        { side: 'back', x: 0, z: -baseDepth * 0.51, rot: [0, 0, 0] as [number, number, number] },
      ]).map((wall) =>
        [0, 1, 2].map((i) => {
          const ventY = buildingFloorY + 0.2 + i * ((baseHeight - 0.4) / 2);
          return (
            <mesh
              key={`vent-${wall.side}-${i}`}
              position={[wall.x, ventY, wall.z]}
              rotation={wall.rot}
              renderOrder={10}
            >
              <boxGeometry args={[0.3, 0.2, 0.05]} />
              <meshLambertMaterial
                color={secondaryColor}
                emissive={glowColor}
                emissiveIntensity={active ? 0.35 : 0.18}
              />
            </mesh>
          );
        })
      )}

      {/* Пульсирующая звезда (переиспользуемый компонент PulsingStar) */}
      <PulsingStar
        position={[0, buildingCenterY + 0.22, 0]}
        active={active}
        scale={1}
        cycleDuration={10}
      />

      {/* Серверные стойки: низ на полу, пульсация — только рост в высоту; renderOrder чтобы видно снаружи сквозь стены */}
      <group ref={serversRef} position={[0, buildingCenterY, 0]}>
        {[0, 1].map((rack) => (
          <React.Fragment key={rack}>
            {[0, 1].map((row) => (
              <mesh
                key={`server-${rack}-${row}`}
                position={[
                  -baseWidth * 0.25 + rack * (baseWidth * 0.5),
                  -baseHeight / 2 + 0.008 + (baseHeight * 0.55) / 2,
                  -baseDepth * 0.25 + row * (baseDepth * 0.5),
                ]}
              >
                <boxGeometry args={[0.15, baseHeight * 0.55, 0.1]} />
                <meshStandardMaterial
                  color="#ff9944"
                  emissive="#ff7722"
                  emissiveIntensity={active ? 0.7 : 0.4}
                  metalness={0.3}
                  roughness={0.5}
                  envMapIntensity={0}
                />
              </mesh>
            ))}
          </React.Fragment>
        ))}
      </group>

      {/* Индикаторы: фронт/зад + боковые стены, равные отступы, верхний не выше стоек, статичны по Y, мигают */}
      <group ref={indicatorsRef} position={[0, buildingCenterY, 0]}>
        {(() => {
          const rackBottomY = -baseHeight / 2 + 0.008;
          const rackHeight = baseHeight * 0.55;
          const indMargin = 0.04;
          const indGap = (rackHeight - 2 * indMargin) / 4;
          const indYOffsets: number[] = [
            indMargin,
            indMargin + indGap,
            indMargin + 2 * indGap,
            indMargin + 3 * indGap,
            rackHeight - indMargin,
          ];
          const wallOffset = 0.02;
          const indicatorColors = ['#5b4fff', '#ffcc00', '#00ff00', '#b85c5c', '#00ffff']; // снизу вверх: фиол, желт, зелен, кирпично-розово-красный (2-й сверху), циан

          const frontBackIndicators = [
            { rack: 0, row: 0 },
            { rack: 1, row: 0 },
            { rack: 0, row: 1 },
            { rack: 1, row: 1 },
          ].map(({ rack, row }) => {
            const rackX = -baseWidth * 0.25 + rack * (baseWidth * 0.5);
            const indZ = row === 0 ? -baseDepth / 2 - wallOffset : baseDepth / 2 + wallOffset;
            return indYOffsets.map((yOff, ind) => (
              <mesh
                key={`ind-fb-${rack}-${row}-${ind}`}
                position={[rackX, rackBottomY + yOff, indZ]}
              >
                <sphereGeometry args={[0.015, 8, 8]} />
                <meshBasicMaterial
                  color={indicatorColors[ind]}
                  transparent
                  opacity={active ? 1 : 0.5}
                />
              </mesh>
            ));
          });

          // Боковые стены: левая (-X) и правая (+X), так же 2 колонки по 5 индикаторов
          const indXLeft = -baseWidth / 2 - wallOffset;
          const indXRight = baseWidth / 2 + wallOffset;
          const sideZ = [-baseDepth * 0.25, baseDepth * 0.25]; // две колонки по Z

          const leftWallIndicators = sideZ.flatMap((indZ, col) =>
            indYOffsets.map((yOff, ind) => (
              <mesh
                key={`ind-left-${col}-${ind}`}
                position={[indXLeft, rackBottomY + yOff, indZ]}
              >
                <sphereGeometry args={[0.015, 8, 8]} />
                <meshBasicMaterial
                  color={indicatorColors[ind]}
                  transparent
                  opacity={active ? 1 : 0.5}
                />
              </mesh>
            ))
          );

          const rightWallIndicators = sideZ.flatMap((indZ, col) =>
            indYOffsets.map((yOff, ind) => (
              <mesh
                key={`ind-right-${col}-${ind}`}
                position={[indXRight, rackBottomY + yOff, indZ]}
              >
                <sphereGeometry args={[0.015, 8, 8]} />
                <meshBasicMaterial
                  color={indicatorColors[ind]}
                  transparent
                  opacity={active ? 1 : 0.5}
                />
              </mesh>
            ))
          );

          return [...frontBackIndicators.flat(), ...leftWallIndicators, ...rightWallIndicators];
        })()}
      </group>


    </group>
  );
}
