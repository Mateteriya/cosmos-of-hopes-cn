'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BuildingConfig } from '@/types/buildings';

interface BuildingBaseProps {
  config: BuildingConfig;
  position: [number, number, number];
  active?: boolean;
  level?: number;
}

/**
 * Базовый компонент для всех зданий
 * Предоставляет общую функциональность: пульсация, свечение, анимация
 */
export default function BuildingBase({
  config,
  position,
  active = true,
  level = 1,
}: BuildingBaseProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Парсим цвета
  const primaryColor = new THREE.Color(config.color.primary);
  const secondaryColor = new THREE.Color(config.color.secondary);
  const glowColor = new THREE.Color(config.color.glow);

  // Анимация пульсации
  useFrame((state) => {
    if (!meshRef.current || !glowRef.current || !groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Пульсация
    if (config.animation.pulse) {
      const pulse = 1 + Math.sin(time * 2) * 0.1;
      meshRef.current.scale.setScalar(pulse);
      glowRef.current.scale.setScalar(pulse * 1.2);
    }

    // Плавающая анимация
    if (config.animation.float) {
      groupRef.current.position.y = position[1] + Math.sin(time) * 0.1;
    }

    // Вращение
    if (config.animation.rotate) {
      groupRef.current.rotation.y = time * 0.5;
    }

    // Интенсивность свечения зависит от активности
    const glowIntensity = active ? 0.8 + Math.sin(time * 3) * 0.2 : 0.3;
    if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
      glowRef.current.material.opacity = glowIntensity;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Основное здание */}
      <mesh ref={meshRef}>
        <boxGeometry args={[config.size.width, config.size.height, config.size.depth]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Свечение вокруг здания */}
      <mesh ref={glowRef}>
        <boxGeometry args={[config.size.width * 1.1, config.size.height * 1.1, config.size.depth * 1.1]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={active ? 0.3 : 0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
