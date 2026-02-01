'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SaturnProps {
  position: [number, number, number];
  scale?: number;
  rotationSpeed?: number;
}

/**
 * Сатурн с кольцами
 * 
 * Декоративный элемент - планета Сатурн с кольцами
 */
export default function Saturn({
  position,
  scale = 1,
  rotationSpeed = 0.1,
}: SaturnProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  // Цвета Сатурна
  const planetColor = new THREE.Color(0xfad5a5); // Золотисто-бежевый
  const ringColor = new THREE.Color(0xd4a574); // Коричнево-золотистый для колец
  const glowColor = new THREE.Color(0xffd700); // Золотистое свечение

  // Размеры
  const planetRadius = 0.5 * scale;
  const ringInnerRadius = planetRadius * 1.35;
  const ringOuterRadius = planetRadius * 2.2;
  const ringThickness = 0.02 * scale;

  // Анимация вращения
  useFrame((state) => {
    if (!groupRef.current || !ringsRef.current) return;

    const time = state.clock.getElapsedTime();

    // Вращение планеты
    if (groupRef.current) {
      groupRef.current.rotation.y = time * rotationSpeed;
    }

    // Кольца не вращаются отдельно - вращаются вместе с планетой
  });

  return (
    <group 
      ref={groupRef} 
      position={[position[0], position[1], position[2]]}
      rotation={[0, 0, Math.PI / 10]} // Наклон оси планеты (18 градусов по оси Z)
    >
      {/* Основная планета (сфера) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[planetRadius, 32, 32]} />
        <meshStandardMaterial
          color={planetColor}
          emissive={glowColor}
          emissiveIntensity={0.2}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Полосы на планете - неоновые цвета прямо на поверхности планеты */}
      {Array.from({ length: 9 }).map((_, i) => {
        const y = (i - 4) * (planetRadius * 0.2);
        // Вычисляем радиус сферы на этой высоте Y (планета сужается к полюсам)
        const horizontalRadius = Math.sqrt(planetRadius * planetRadius - y * y);
        // Неоновые цвета для полос Сатурна - яркие, светящиеся
        const colors = [
          0xffd700, // Неоновый золотой
          0xffa500, // Неоновый оранжевый
          0xffeb3b, // Неоновый желтый
          0xffd700, // Неоновый золотой
          0xffa500, // Неоновый оранжевый (центральный)
          0xffeb3b, // Неоновый желтый
          0xffd700, // Неоновый золотой
          0xffa500, // Неоновый оранжевый
          0xffeb3b, // Неоновый желтый
        ];
        // Толщина полос - некоторые толще для неоднородности
        const thicknesses = [
          0.005, // Тонкая
          0.012, // Толстая
          0.005, // Тонкая
          0.010, // Средняя
          0.015, // Толстая (центральная)
          0.005, // Тонкая
          0.010, // Средняя
          0.005, // Тонкая
          0.012, // Толстая
        ];
        // Ширина полосы
        const bandWidth = planetRadius * thicknesses[i] * 2;
        // Создаем очень тонкий сферический слой с неоновым цветом - полоса прямо на поверхности планеты
        // Используем sphereGeometry с ограниченным углом theta для создания полосы на определенной высоте
        const thetaStart = Math.acos((y - bandWidth * 0.5) / planetRadius);
        const thetaEnd = Math.acos((y + bandWidth * 0.5) / planetRadius);
        const thetaLength = thetaStart - thetaEnd;
        return (
          <mesh key={`band-${i}`} position={[0, 0, 0]}>
            <sphereGeometry args={[planetRadius * 1.001, 32, 16, 0, Math.PI * 2, thetaStart, thetaLength]} />
            <meshStandardMaterial
              color={colors[i]}
              emissive={colors[i]}
              emissiveIntensity={0.8}
              metalness={0.1}
              roughness={0.3}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Легкое свечение вокруг планеты - рендерится ДО колец */}
      <mesh position={[0, 0, 0]} renderOrder={-1}>
        <sphereGeometry args={[planetRadius * 1.05, 16, 16]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Кольца Сатурна */}
      <group ref={ringsRef} renderOrder={1}>
        {/* Основное кольцо - состоит из множества вложенных колец с разными оттенками */}
        {Array.from({ length: 8 }).map((_, ringIndex) => {
          // Разбиваем кольцо на несколько вложенных колец
          const totalRings = 8;
          const ringWidth = (ringOuterRadius - ringInnerRadius) / totalRings;
          const innerR = ringInnerRadius + ringIndex * ringWidth;
          const outerR = ringInnerRadius + (ringIndex + 1) * ringWidth;
          
          // Разные оттенки коричнево-золотистого цвета
          const colorVariations = [
            0xd4a574, // Базовый коричнево-золотистый
            0xc9a882, // Чуть светлее
            0xdeb887, // Еще светлее
            0xe6c89a, // Светло-бежевый
            0xd4a574, // Базовый
            0xc9a882, // Чуть светлее
            0xdeb887, // Еще светлее
            0xe6c89a, // Светло-бежевый
          ];
          const currentColor = colorVariations[ringIndex % colorVariations.length];
          
          return (
            <mesh key={`main-ring-${ringIndex}`} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[innerR, outerR, 64]} />
              <meshStandardMaterial
                color={currentColor}
                emissive={glowColor}
                emissiveIntensity={0.1}
                metalness={0.5}
                roughness={0.6}
                transparent
                opacity={0.9}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}

        {/* Внутреннее кольцо (более темное) - отодвинуто дальше от планеты */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ringInnerRadius * 0.85, ringInnerRadius, 64]} />
          <meshStandardMaterial
            color={0xb8956a}
            emissive={glowColor}
            emissiveIntensity={0.05}
            metalness={0.6}
            roughness={0.7}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Внешнее тонкое кольцо */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ringOuterRadius, ringOuterRadius * 1.1, 64]} />
          <meshStandardMaterial
            color={ringColor}
            emissive={glowColor}
            emissiveIntensity={0.15}
            metalness={0.4}
            roughness={0.7}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>

      </group>
    </group>
  );
}
