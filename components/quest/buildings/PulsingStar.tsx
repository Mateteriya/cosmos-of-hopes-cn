'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface PulsingStarProps {
  position: [number, number, number];
  active?: boolean;
  /** Масштаб звезды (по умолчанию 1). Радиус ядра ≈ 0.14 * scale */
  scale?: number;
  /** Длительность полного цикла смены цветов в секундах (по умолчанию 10) */
  cycleDuration?: number;
}

/**
 * PulsingStar — пульсирующая звезда
 *
 * Декоративный 3D-шар: плавная смена цвета по палитре (фиолет → синий → голубой → зелёный → жёлтый → оранжевый → красный),
 * ореол «горящей» звезды (то уходит в шар, то вылезает наружу), блик от keyLight, источаемый свет.
 * Можно вставлять в сцену отдельно или внутрь зданий.
 *
 * Использование: <PulsingStar position={[x, y, z]} active={true} scale={1} />
 */
export default function PulsingStar({
  position,
  active = true,
  scale = 1,
  cycleDuration = 10,
}: PulsingStarProps) {
  const coreStarRef = useRef<THREE.Mesh>(null);
  const coreStarGlowRef = useRef<THREE.Mesh>(null);
  const coreStarLightRef = useRef<THREE.PointLight>(null);

  const coreRadius = 0.14 * scale;
  const haloBaseRadius = 0.1 * scale;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Плавная смена цвета через смешение палитры
    const starColorsHex = [0xbb00ff, 0x0088ff, 0x00ddff, 0x00ff88, 0xddff00, 0xff8800, 0xff2244];
    const t = (time / cycleDuration) % 1;
    const colorIndex = t * starColorsHex.length;
    const i0 = Math.floor(colorIndex) % starColorsHex.length;
    const i1 = (i0 + 1) % starColorsHex.length;
    const frac = colorIndex - Math.floor(colorIndex);
    const starColorLerped = new THREE.Color()
      .setHex(starColorsHex[i0])
      .lerp(new THREE.Color(starColorsHex[i1]), frac);

    const pulseScale = 1 + 0.02 * Math.sin(time * 2);
    const pulseEmit = 1 + 0.25 * Math.sin(time * 2.2);
    const haloScale = 1.4 + 0.3 * (0.5 + 0.5 * Math.sin(time * 2.5));

    if (coreStarRef.current?.material instanceof THREE.MeshStandardMaterial) {
      coreStarRef.current.scale.setScalar(pulseScale);
      coreStarRef.current.material.color.copy(starColorLerped);
      coreStarRef.current.material.emissive.copy(starColorLerped);
      coreStarRef.current.material.emissiveIntensity = active ? 1.1 * pulseEmit : 0.4;
    }
    if (coreStarGlowRef.current?.material instanceof THREE.MeshBasicMaterial) {
      coreStarGlowRef.current.scale.setScalar(haloScale);
      coreStarGlowRef.current.material.color.copy(starColorLerped);
      coreStarGlowRef.current.material.opacity = active ? 0.45 + 0.15 * Math.sin(time * 2.2) : 0.2;
    }
    if (coreStarLightRef.current) {
      coreStarLightRef.current.color.copy(starColorLerped);
      coreStarLightRef.current.intensity = active ? 1.8 * pulseEmit : 0.5;
    }
  });

  return (
    <group position={position}>
      <pointLight
        ref={coreStarLightRef}
        color={0xbb00ff}
        intensity={active ? 1.8 : 0.5}
        distance={2.5 * scale}
        decay={2}
      />
      <pointLight
        position={[0.25 * scale, 0.35 * scale, 0.25 * scale]}
        color={0xffffff}
        intensity={0.7}
        distance={1.5 * scale}
        decay={2}
      />
      <mesh ref={coreStarGlowRef} scale={1}>
        <sphereGeometry args={[haloBaseRadius, 32, 32]} />
        <meshBasicMaterial
          color={0xbb00ff}
          transparent
          opacity={active ? 0.5 : 0.2}
        />
      </mesh>
      <mesh ref={coreStarRef}>
        <sphereGeometry args={[coreRadius, 32, 32]} />
        <meshStandardMaterial
          color={0xbb00ff}
          emissive={0xbb00ff}
          emissiveIntensity={active ? 1.1 : 0.4}
          metalness={0.15}
          roughness={0.18}
        />
      </mesh>
    </group>
  );
}
