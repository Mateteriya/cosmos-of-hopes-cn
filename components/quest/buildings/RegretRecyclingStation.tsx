'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RegretRecyclingStationProps {
  position: [number, number, number];
  active?: boolean;
  level?: number;
}

/**
 * Станция Переработки Сожалений (Сфера Эмоций — Резильентность)
 *
 * Низкий объём в голубых и бледно-зелёных тонах: «приёмник» сожалений,
 * центральный процессор-сфера с пульсацией, мягкая аура обновления.
 */
export default function RegretRecyclingStation({
  position,
  active = true,
  level = 1,
}: RegretRecyclingStationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const primaryColor = new THREE.Color(0x87ceeb);
  const secondaryColor = new THREE.Color(0x98fb98);
  const glowColor = new THREE.Color(0xe0ffff);

  const baseWidth = 1.5;
  const baseHeight = 1.2 * level;
  const baseDepth = 1.5;
  const foundationHeight = 0.1;
  const foundationCenterY = -baseHeight / 2 + foundationHeight / 2;
  const buildingCenterY =
    -baseHeight / 2 + foundationHeight + (baseHeight - foundationHeight) / 2;
  const roofCenterY =
    -baseHeight / 2 + foundationHeight + (baseHeight - foundationHeight) + 0.06;

  const auraMargin = 0.02;
  const auraOverhang = 0.02;

  useFrame((state) => {
    if (!coreRef.current) return;
    const time = state.clock.getElapsedTime();
    const pulse = 1 + 0.08 * Math.sin(time * 2.5);
    coreRef.current.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* Аура: фундамент, корпус, крыша */}
      <mesh position={[0, foundationCenterY, 0]} renderOrder={-2}>
        <boxGeometry
          args={[
            baseWidth * 1.08 + auraOverhang * 2,
            foundationHeight + auraMargin,
            baseDepth * 1.08 + auraOverhang * 2,
          ]}
        />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={active ? 0.1 : 0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, buildingCenterY, 0]} renderOrder={-2}>
        <boxGeometry
          args={[
            baseWidth + auraOverhang * 2,
            baseHeight - foundationHeight + auraMargin,
            baseDepth + auraOverhang * 2,
          ]}
        />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={active ? 0.12 : 0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, roofCenterY, 0]} renderOrder={-2}>
        <boxGeometry
          args={[
            baseWidth * 1.04 + auraOverhang * 2,
            0.12 + auraMargin,
            baseDepth * 1.04 + auraOverhang * 2,
          ]}
        />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={active ? 0.1 : 0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Фундамент */}
      <mesh position={[0, foundationCenterY, 0]} renderOrder={10}>
        <boxGeometry args={[baseWidth * 1.08, foundationHeight, baseDepth * 1.08]} />
        <meshLambertMaterial
          color={secondaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.15 : 0.08}
          transparent
          opacity={1}
          depthWrite={true}
        />
      </mesh>

      {/* Основной объём */}
      <mesh position={[0, buildingCenterY, 0]}>
        <boxGeometry args={[baseWidth, baseHeight - foundationHeight, baseDepth]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.3 : 0.15}
          metalness={0.15}
          roughness={0.75}
          envMapIntensity={0}
        />
      </mesh>

      {/* Крыша */}
      <mesh position={[0, roofCenterY, 0]} renderOrder={10}>
        <boxGeometry args={[baseWidth * 1.04, 0.12, baseDepth * 1.04]} />
        <meshLambertMaterial
          color={secondaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.35 : 0.18}
        />
      </mesh>

      {/* Центральный «процессор» переработки — пульсирующая сфера */}
      <mesh ref={coreRef} position={[0, roofCenterY + 0.14, 0]}>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.7 : 0.35}
          metalness={0.1}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}
