'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PrototypingLabProps {
  position: [number, number, number];
  active?: boolean;
  level?: number;
}

/**
 * Лаборатория Прототипирования
 * 
 * Форма:
 * - Современное здание с геометрическими формами
 * - Множество "окон" (экранов) с голографическими дисплеями
 * - 3D-принтеры и оборудование визуально
 * - Асимметричная структура
 */
export default function PrototypingLab({
  position,
  active = true,
  level = 1,
}: PrototypingLabProps) {
  const groupRef = useRef<THREE.Group>(null);
  const screensRef = useRef<THREE.Group>(null);
  const hologramsRef = useRef<THREE.Group>(null);

  // Цвета для Сферы Разума
  const primaryColor = new THREE.Color(0x9370db); // Фиолетовый
  const secondaryColor = new THREE.Color(0xba55d3); // Средний фиолетовый
  const glowColor = new THREE.Color(0xff00ff); // Неоновый фиолетовый

  // Размеры
  const baseWidth = 2;
  const baseHeight = 1.5 * level;
  const baseDepth = 2;
  const baseYOffset = baseHeight / 2;

  // Геометрия для ауры (зазор от поверхностей — без z-fight, небольшой выступ наружу)
  const auraMargin = 0.02;
  const auraOverhang = 0.03;
  const fundH = 0.2;
  const fundY = -baseHeight / 2 + fundH / 2;
  const mainFundW = baseWidth * 1.1 + auraOverhang * 2;
  const mainFundD = baseDepth * 1.1 + auraOverhang * 2;
  const mainBodyY = -baseHeight / 2 + 0.1 + baseHeight / 2;
  const mainRoofY = -baseHeight / 2 + 0.1 + baseHeight + 0.05;
  const mainRoofH = 0.1;
  const addCx = -baseWidth * 0.75;
  const addFundW = baseWidth * 0.6 + auraOverhang * 2;
  const addBlockH = baseHeight * 0.6;
  const addBlockY = -baseHeight / 2 + 0.1 + addBlockH / 2;
  const addBlockW = baseWidth * 0.5;
  const addBlockD = baseDepth * 0.5;
  const addRoofY = -baseHeight / 2 + 0.1 + addBlockH + 0.072;
  const addRoofW = baseWidth * 0.52 + auraOverhang * 2;
  const addRoofD = baseDepth * 0.52 + auraOverhang * 2;

  // Анимация
  useFrame((state) => {
    if (!groupRef.current || !screensRef.current || !hologramsRef.current) return;

    const time = state.clock.getElapsedTime();

    // Вращение всей лаборатории
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1;
    }

    // Пульсация экранов
    if (screensRef.current) {
      screensRef.current.children.forEach((screen, index) => {
        if (screen instanceof THREE.Mesh) {
          const pulse = 0.7 + Math.sin(time * 3 + index * 0.3) * 0.3;
          if (screen.material instanceof THREE.MeshBasicMaterial) {
            screen.material.opacity = pulse * (active ? 1 : 0.5);
          }
        }
      });
    }

    // Вращение голографических проекций
    if (hologramsRef.current) {
      hologramsRef.current.rotation.y = time * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* Фундамент лаборатории - на сетке */}
      <mesh position={[0, -baseHeight / 2 + 0.2 / 2, 0]}>
        <boxGeometry args={[baseWidth * 1.1, 0.2, baseDepth * 1.1]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.2 : 0.1}
          metalness={0.8}
          roughness={0.3}
          transparent={false}
          opacity={1}
        />
      </mesh>

      {/* Основное здание (асимметричная форма) - начинается от верха фундамента */}
      <mesh position={[0, -baseHeight / 2 + 0.1 + baseHeight / 2, 0]}>
        <boxGeometry args={[baseWidth, baseHeight, baseDepth]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.4 : 0.2}
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Внутреннее здание в основном блоке (непрозрачное, голубое) — отступ от внешней стены 0.01 */}
      <mesh position={[0, -baseHeight / 2 + 0.1 + baseHeight / 2, 0]}>
        <boxGeometry args={[baseWidth - 0.02, baseHeight - 0.02, baseDepth - 0.02]} />
        <meshStandardMaterial
          color="#4a90e2"
          emissive="#4a90e2"
          emissiveIntensity={active ? 0.3 : 0.15}
          metalness={0.8}
          roughness={0.3}
          transparent={false}
          opacity={1}
        />
      </mesh>

      {/* Позиция внутреннего голубого здания основного блока: центр на 0, размер baseWidth * 0.85
          Левый край основного внутреннего здания: -baseWidth * 0.85 / 2 = -baseWidth * 0.425
          Правый край дополнительного внутреннего здания должен быть на -baseWidth * 0.425
          Центр дополнительного внутреннего здания (размер baseWidth * 0.425):
          -baseWidth * 0.425 - (baseWidth * 0.425) / 2 = -baseWidth * 0.6375
      */}
      {/* Фундамент дополнительного блока — на одном уровне с основным: центр Y = -baseHeight/2 + 0.1 (низ на сетке -baseHeight/2) */}
      <mesh position={[-baseWidth * 0.75, -baseHeight / 2 + 0.2 / 2, 0]}>
        <boxGeometry args={[baseWidth * 0.6, 0.2, baseDepth * 0.6]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.2 : 0.1}
          metalness={0.8}
          roughness={0.3}
          transparent={false}
          opacity={1}
        />
      </mesh>

      {/* Дополнительный блок: 5 стен (без правой — та входит в основное здание). cx = -baseWidth*0.75.
          Пол поднят на 0.01 выше фундамента, потолок — зазор с крышей 0.03 (без z-fighting). */}
      {(() => {
        const cx = -baseWidth * 0.75;
        const cy = -baseHeight / 2 + 0.1 + (baseHeight * 0.6) / 2;
        const cz = 0;
        const hw = baseWidth * 0.25;
        const hh = baseHeight * 0.3;
        const hd = baseDepth * 0.25;
        const t = 0.02;
        const floorOffset = 0.01; // пол выше верха фундамента, чтобы не накладываться
        const blockMat = (
          <meshStandardMaterial
            color={secondaryColor}
            emissive={glowColor}
            emissiveIntensity={active ? 0.5 : 0.25}
            metalness={0.9}
            roughness={0.2}
            transparent
            opacity={0.85}
          />
        );
        return (
          <>
            <mesh position={[cx - hw - t / 2, cy, cz]}>
              <boxGeometry args={[t, baseHeight * 0.6, baseDepth * 0.5]} />
              {blockMat}
            </mesh>
            <mesh position={[cx, cy, cz + hd + t / 2]}>
              <boxGeometry args={[baseWidth * 0.5, baseHeight * 0.6, t]} />
              {blockMat}
            </mesh>
            <mesh position={[cx, cy, cz - hd - t / 2]}>
              <boxGeometry args={[baseWidth * 0.5, baseHeight * 0.6, t]} />
              {blockMat}
            </mesh>
            <mesh position={[cx, cy + hh + t / 2, cz]}>
              <boxGeometry args={[baseWidth * 0.5, t, baseDepth * 0.5]} />
              {blockMat}
            </mesh>
            <mesh position={[cx, cy - hh - t / 2 + floorOffset, cz]}>
              <boxGeometry args={[baseWidth * 0.5, t, baseDepth * 0.5]} />
              {blockMat}
            </mesh>
          </>
        );
      })()}

      {/* Внутренняя стена дополнительного блока — временно убрана */}
      {/* <mesh position={[-baseWidth * 0.6375, -baseHeight / 2 + 0.1 + (baseHeight * 0.6) / 2, 0]}>
        <boxGeometry args={[baseWidth * 0.425, baseHeight * 0.54, baseDepth * 0.425]} />
        <meshStandardMaterial
          color="#4a90e2"
          emissive="#4a90e2"
          emissiveIntensity={active ? 0.3 : 0.15}
          metalness={0.8}
          roughness={0.3}
          transparent={false}
          opacity={1}
        />
      </mesh> */}

      {/* Окна дополнительного блока — сдвиг +0.01 по нормали от стены, чтобы не z-fighting с плоскостью стены */}
      <mesh position={[-baseWidth * 0.75, -baseHeight / 2 + 0.1 + baseHeight * 0.25, baseDepth * 0.26 + 0.01]}>
        <planeGeometry args={[0.3, 0.25]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.8 : 0.4}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh position={[-baseWidth * 0.75, -baseHeight / 2 + 0.1 + baseHeight * 0.48, baseDepth * 0.26 + 0.01]}>
        <planeGeometry args={[0.3, 0.25]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.8 : 0.4}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Окна на задней стене — rotation Y=π, чтобы смотрели наружу (-Z), а не внутрь блока */}
      <mesh
        position={[-baseWidth * 0.75, -baseHeight / 2 + 0.1 + baseHeight * 0.25, -baseDepth * 0.26 - 0.01]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[0.3, 0.25]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.8 : 0.4}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh
        position={[-baseWidth * 0.75, -baseHeight / 2 + 0.1 + baseHeight * 0.48, -baseDepth * 0.26 - 0.01]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[0.3, 0.25]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.8 : 0.4}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Окно на боковой стене (левая) — сдвиг -0.01 по X, чтобы впереди стены */}
      <mesh
        position={[-baseWidth * 0.75 - baseWidth * 0.26 - 0.01, -baseHeight / 2 + 0.1 + baseHeight * 0.4, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[0.3, 0.35]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.8 : 0.4}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Окно на правой стене (входит в основное здание) — убрано вместе со стеной */}

      {/* Крыша дополнительного блока — минимальный зазор над потолком ~0.002, без z-fighting */}
      <mesh position={[-baseWidth * 0.75, -baseHeight / 2 + 0.1 + baseHeight * 0.6 + 0.072, 0]}>
        <boxGeometry args={[baseWidth * 0.52, 0.1, baseDepth * 0.52]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.4 : 0.15}
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Вход в лабораторию */}
      <mesh
        position={[0, -baseHeight / 2 + 0.1 + 0.4, baseDepth * 0.51]}
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[0.6, 0.8]} />
        <meshStandardMaterial
          color="#9370db"
          emissive="#ba55d3"
          emissiveIntensity={active ? 0.3 : 0.1}
          metalness={0.7}
          roughness={0.3}
          transparent={false}
          opacity={1}
        />
      </mesh>
      {/* Ручка двери */}
      <mesh
        position={[0.25, -baseHeight / 2 + 0.1 + 0.35, baseDepth * 0.515]}
        rotation={[0, 0, 0]}
      >
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Крыша лаборатории */}
      <mesh position={[0, -baseHeight / 2 + 0.1 + baseHeight + 0.05, 0]}>
        <boxGeometry args={[baseWidth * 1.02, 0.1, baseDepth * 1.02]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.4 : 0.15}
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Научный орнамент на крыше - схематичная решетка/схема (поднят высоко, чтобы не утопал) */}
      <group position={[0, -baseHeight / 2 + 0.1 + baseHeight + 0.45, 0]}>
        {/* Центральная схема - схематичное представление атома/молекулы */}
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[0.3, 0.32, 32]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.32, 32]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Центральное ядро */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={1}
          />
        </mesh>
        
        {/* Орбиты электронов */}
        {[0, 1, 2].map((i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <mesh key={`electron-${i}`} position={[Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial
                color="#00ffff"
                transparent
                opacity={1}
              />
            </mesh>
          );
        })}
      </group>

      {/* Технологические линии схемы - углы крыши (на крыше) */}
      <group position={[0, -baseHeight / 2 + 0.1 + baseHeight + 0.1, 0]}>
        {[
          { pos: [-baseWidth * 0.4, 0, -baseDepth * 0.4], rot: [0, Math.PI / 4, 0] },
          { pos: [baseWidth * 0.4, 0, -baseDepth * 0.4], rot: [0, -Math.PI / 4, 0] },
          { pos: [-baseWidth * 0.4, 0, baseDepth * 0.4], rot: [0, -Math.PI / 4, 0] },
          { pos: [baseWidth * 0.4, 0, baseDepth * 0.4], rot: [0, Math.PI / 4, 0] },
        ].map((config, i) => (
          <mesh key={`line-${i}`} position={config.pos as [number, number, number]} rotation={config.rot as [number, number, number]}>
            <boxGeometry args={[0.15, 0.01, 0.01]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={active ? 0.9 : 0.5}
            />
          </mesh>
        ))}
      </group>

      {/* Светодиодики (LED точки) на крыше - по периметру (на крыше, не парят) */}
      <group position={[0, -baseHeight / 2 + 0.1 + baseHeight + 0.1, 0]}>
        {/* LED по углам крыши - яркие цвета: красный, голубой, фиолетовый, голубой */}
        {[
          { x: -baseWidth * 0.45, z: -baseDepth * 0.45, color: '#ff0040' }, // Красный
          { x: baseWidth * 0.45, z: -baseDepth * 0.45, color: '#00ffff' }, // Голубой
          { x: -baseWidth * 0.45, z: baseDepth * 0.45, color: '#ff00ff' }, // Яркий неоновый фиолетовый
          { x: baseWidth * 0.45, z: baseDepth * 0.45, color: '#00ffff' }, // Голубой
        ].map((pos, i) => (
          <mesh key={`corner-led-${i}`} position={[pos.x, 0, pos.z]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial
              color={pos.color}
              transparent
              opacity={active ? 1 : 0.6}
            />
          </mesh>
        ))}

        {/* LED по периметру крыши (каждые 45 градусов по кругу) - яркие цвета */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = baseWidth * 0.4;
          // Чередование цветов: красный, голубой, яркий фиолетовый, голубой...
          const colors = ['#ff0040', '#00ffff', '#ff00ff', '#00ffff', '#ff0040', '#00ffff', '#ff00ff', '#00ffff'];
          const color = colors[i];
          return (
            <mesh
              key={`perimeter-led-${i}`}
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
            >
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={active ? 1 : 0.5}
              />
            </mesh>
          );
        })}
      </group>

      {/* Голографические экраны на стенах */}
      <group ref={screensRef}>
        {[0, 1, 2].map((row) => (
          <React.Fragment key={row}>
            {/* Экраны на передней стене */}
            {[0, 1].map((col) => (
              <mesh
                key={`screen-front-${row}-${col}`}
                position={[
                  -baseWidth * 0.3 + col * (baseWidth * 0.6),
                  -baseHeight / 2 + 0.1 + 0.3 + row * 0.4,
                  baseDepth * 0.51,
                ]}
              >
                <planeGeometry args={[0.4, 0.3]} />
                <meshBasicMaterial
                  color={glowColor}
                  transparent
                  opacity={active ? 0.9 : 0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
            {/* Экраны на боковых стенах */}
            <mesh
              key={`screen-side-${row}`}
              position={[
                baseWidth * 0.51,
                -baseHeight / 2 + 0.1 + 0.3 + row * 0.4,
                0,
              ]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <planeGeometry args={[0.4, 0.3]} />
              <meshBasicMaterial
                color={glowColor}
                transparent
                opacity={active ? 0.9 : 0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* Голографические 3D проекции на крыше дополнительного блока */}
      {active && (
        <group ref={hologramsRef} position={[-baseWidth * 0.75, -baseHeight / 2 + 0.1 + baseHeight * 0.6 + 0.18, 0]}>
          {/* Вращающиеся торы (3D модели прототипов) */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.3, 0.05, 8, 16]} />
            <meshStandardMaterial
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={2}
              transparent
              opacity={0.9}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.25, 0.05, 8, 16]} />
            <meshStandardMaterial
              color={0xffffff}
              emissive={glowColor}
              emissiveIntensity={1.5}
              transparent
              opacity={0.7}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
      )}

      {/* Аура: фундаменты, корпуса и крыши основного здания и дополнительного блока (точные расчёты) */}
      <mesh position={[0, fundY, 0]} renderOrder={-1}>
        <boxGeometry args={[mainFundW, fundH + auraMargin, mainFundD]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, mainBodyY, 0]} renderOrder={-1}>
        <boxGeometry args={[baseWidth + auraOverhang * 2, baseHeight + auraMargin, baseDepth + auraOverhang * 2]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, mainRoofY, 0]} renderOrder={-1}>
        <boxGeometry args={[baseWidth * 1.02 + auraOverhang * 2, mainRoofH + auraMargin, baseDepth * 1.02 + auraOverhang * 2]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[addCx, fundY, 0]} renderOrder={-1}>
        <boxGeometry args={[addFundW, fundH + auraMargin, addFundW]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[addCx, addBlockY, 0]} renderOrder={-1}>
        <boxGeometry args={[addBlockW + auraOverhang * 2, addBlockH + auraMargin, addBlockD + auraOverhang * 2]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[addCx, addRoofY, 0]} renderOrder={-1}>
        <boxGeometry args={[addRoofW, mainRoofH + auraMargin, addRoofD]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}
