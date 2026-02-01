'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BuildingConfig } from '@/types/buildings';

interface МаякProps {
  position: [number, number, number];
  active?: boolean;
  level?: number;
}

/**
 * Маяк
 * 
 * Упрощенная версия Башни-маяка с только необходимыми элементами
 */
export default function Маяк({
  position,
  active = true,
  level = 1,
}: МаякProps) {
  const groupRef = useRef<THREE.Group>(null);
  const towerRef = useRef<THREE.Mesh>(null);
  const windowsRef = useRef<THREE.Group>(null);
  const doorScannerRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Mesh>(null); // Вращающийся маяк на вершине
  const innerBeaconRef = useRef<THREE.Mesh>(null); // Внутренняя крыша (вращается синхронно с внешней)
  const lightBeamRef = useRef<THREE.Group>(null); // Группа для вращающегося луча
  const particlesRef = useRef<THREE.Points>(null);
  const lightSourceRef = useRef<THREE.Mesh>(null); // Яркий источник света на вершине (мигает)
  const particlesMaterialRef = useRef<THREE.ShaderMaterial>(null); // Материал частиц для мигания
  
  // Uniforms для мигания луча - создаем один раз через useMemo, чтобы не пересоздавались при каждом рендере
  const particlesUniforms = useMemo(() => ({
    colorMultiplier: { value: 1.0 },
    blueShift: { value: 0.0 }
  }), []);

  // Цвета
  const primaryColor = new THREE.Color(0x4a90e2); // Голубой
  const secondaryColor = new THREE.Color(0x7b68ee); // Фиолетовый
  const glowColor = new THREE.Color(0x00bfff); // Яркий голубой

  // Размеры
  const baseWidth = 0.8;
  const baseHeight = 2.5 * level;
  const baseDepth = 0.8;

  // Создаем геометрию частиц для луча света (конус, уменьшенный в 2 раза)
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const particlesCount = 5000; // Еще увеличено для максимально плотного фиолетового освещения
    
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const opacities = new Float32Array(particlesCount);
    
    const beamLength = 1; // Уменьшено в 2 раза (было 2)
    const beamStartRadius = 0.001; // Очень узкое начало конуса (очень тонкое)
    const beamEndRadius = 0.25; // Широкий конец конуса (в 250 раз больше начала для выраженного конуса)
    
    // Неоновые цвета: больше глубокого фиолетового, меньше синего
    const neonColors = [
      [0.4, 0.05, 0.7],   // Глубокий фиолетовый (усилен)
      [0.5, 0.1, 0.8],    // Глубокий фиолетовый (яркий)
      [0.35, 0.08, 0.75], // Глубокий фиолетовый (средний)
      [0.45, 0.12, 0.85], // Глубокий фиолетово-индиго
      [0.3, 0.15, 0.9],   // Фиолетово-индиго (меньше синего)
      [0.4, 0.18, 0.88],  // Фиолетово-индиго (более фиолетовый)
      [0.35, 0.1, 0.8],   // Глубокий фиолетовый (темный)
      [0.5, 0.15, 0.85],  // Глубокий фиолетовый (светлый)
      [0.25, 0.2, 0.9],   // Фиолетово-индиго (переходный, меньше синего)
      [0.4, 0.2, 0.82],   // Глубокий фиолетово-индиго (более фиолетовый)
    ];
    
    // Более структурированное распределение для гладкого конуса
    const layers = 15; // Количество слоев вдоль луча
    const particlesPerLayer = Math.floor(particlesCount / layers);
    
    let particleIndex = 0;
    for (let layer = 0; layer < layers; layer++) {
      // Более равномерное распределение вдоль луча
      const t = (layer + 0.5) / layers; // Позиция вдоль луча
      const radius = beamStartRadius + (beamEndRadius - beamStartRadius) * t;
      
      // Количество частиц в слое пропорционально площади (больше в конце)
      const layerParticles = Math.floor(particlesPerLayer * (0.5 + t * 0.5));
      
      for (let p = 0; p < layerParticles && particleIndex < particlesCount; p++) {
        const i3 = particleIndex * 3;
        
        // Равномерное распределение угла
        const angle = (p / layerParticles) * Math.PI * 2;
        
        // Равномерное распределение по радиусу
        const r = (p % 6) / 6; // Более равномерное распределение
        const distanceFromCenter = Math.sqrt(r) * radius;
        
        // Небольшая случайность для естественности (минимальная)
        const randomOffset = (Math.random() - 0.5) * 0.02;
        
        // Позиция частицы в конусе (горизонтально от источника)
        positions[i3] = beamLength * t + randomOffset;
        positions[i3 + 1] = distanceFromCenter * Math.cos(angle) + randomOffset * 0.3;
        positions[i3 + 2] = distanceFromCenter * Math.sin(angle) + randomOffset * 0.3;
      
        // Обрабатываем цвета для этой частицы
        const colorIndex = Math.floor(Math.random() * neonColors.length);
        const baseColor = neonColors[colorIndex];
        const colorVariation = 0.5 + Math.random() * 0.5;
        const fadeFactor = 0.4 + t * 0.3; // От 0.4 в начале до 0.7 в конце
        const brightness = 0.15; // Уменьшена яркость для глубоких фиолетово-неоновых цветов, минимум белого
        
        colors[i3] = baseColor[0] * colorVariation * fadeFactor * brightness;
        colors[i3 + 1] = baseColor[1] * colorVariation * fadeFactor * brightness;
        colors[i3 + 2] = baseColor[2] * colorVariation * fadeFactor * brightness;
        opacities[particleIndex] = fadeFactor;
        
        particleIndex++;
      }
    }
    
    // Обрабатываем оставшиеся частицы случайным образом
    for (let i = particleIndex; i < particlesCount; i++) {
      const i3 = i * 3;
      
      const t = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const radius = beamStartRadius + (beamEndRadius - beamStartRadius) * t;
      const distanceFromCenter = Math.sqrt(Math.random()) * radius;
      
      positions[i3] = beamLength * t;
      positions[i3 + 1] = distanceFromCenter * Math.cos(angle);
      positions[i3 + 2] = distanceFromCenter * Math.sin(angle);
      
      const colorIndex = Math.floor(Math.random() * neonColors.length);
      const baseColor = neonColors[colorIndex];
      const colorVariation = 0.5 + Math.random() * 0.5;
      const fadeFactor = 0.4 + t * 0.3; // От 0.4 в начале до 0.7 в конце
      const brightness = 0.18; // Уменьшена яркость для глубоких фиолетово-неоновых цветов, минимум белого
      
      colors[i3] = baseColor[0] * colorVariation * fadeFactor * brightness;
      colors[i3 + 1] = baseColor[1] * colorVariation * fadeFactor * brightness;
      colors[i3 + 2] = baseColor[2] * colorVariation * fadeFactor * brightness;
      opacities[i] = fadeFactor;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    
    return geometry;
  }, []);

  // Анимация
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Пульсация окон на основной башне
    if (windowsRef.current) {
      windowsRef.current.children.forEach((window, index) => {
        if (window instanceof THREE.Mesh) {
          const pulse = 0.7 + Math.sin(time * 2 + index * 0.3) * 0.3;
          if (window.material instanceof THREE.MeshBasicMaterial) {
            window.material.opacity = pulse * (active ? 1 : 0.5);
          }
          if (window.material instanceof THREE.MeshStandardMaterial) {
            window.material.emissiveIntensity = pulse * (active ? 1 : 0.5);
          }
        }
      });
    }


    // Плавающая анимация
    groupRef.current.position.y = position[1] + Math.sin(time) * 0.05;

    // Вращение маяка на вершине (внешняя и внутренняя крыша синхронно)
    if (beaconRef.current) {
      beaconRef.current.rotation.y = time * 0.5;
    }
    if (innerBeaconRef.current) {
      innerBeaconRef.current.rotation.y = time * 0.5;
    }

    // Вращение луча света (группа с частицами)
    if (lightBeamRef.current) {
      lightBeamRef.current.rotation.y = time * 0.5;
    }

    // Мигание яркого источника света на вершине (меняет цвет: неоново-фиолетово-индиго / ультраярко-бело-розовый)
    if (lightSourceRef.current && lightSourceRef.current.material instanceof THREE.MeshStandardMaterial) {
      const blink = Math.sin(time * 2) > 0; // true = неоново-фиолетово-индиго, false = ультраярко-бело-розовый
      if (blink) {
        // Неоново-фиолетово-индиго
        lightSourceRef.current.material.color.setHex(0x4a1dcc);
        lightSourceRef.current.material.emissive.setHex(0x4a1dcc);
        lightSourceRef.current.material.emissiveIntensity = 0.5;
      } else {
        // Ультраярко-розово-сиреневый (больше розово-сиреневого, меньше белого) - яркость еще уменьшена
        lightSourceRef.current.material.color.setHex(0xff6bb3);
        lightSourceRef.current.material.emissive.setHex(0xff4da6);
        lightSourceRef.current.material.emissiveIntensity = 0.6; // Еще уменьшено с 1.0 до 0.6
      }
    }

    // Мигание луча света (меняет цвет: текущий глубокий фиолетово-неоновый / ярко-голубой)
    // Важно: проверяем что uniforms существуют (могут быть не инициализированы при первом рендере)
    if (particlesMaterialRef.current && particlesMaterialRef.current.uniforms) {
      const beamBlink = Math.sin(time * 2) > 0; // true = текущий цвет, false = ярко-голубой
      if (beamBlink) {
        // Текущий цвет (глубокий фиолетово-неоновый)
        if (particlesMaterialRef.current.uniforms.colorMultiplier) {
          particlesMaterialRef.current.uniforms.colorMultiplier.value = 1.0;
        }
        if (particlesMaterialRef.current.uniforms.blueShift) {
          particlesMaterialRef.current.uniforms.blueShift.value = 0.0;
        }
      } else {
        // Ярко-голубой
        if (particlesMaterialRef.current.uniforms.colorMultiplier) {
          particlesMaterialRef.current.uniforms.colorMultiplier.value = 1.0;
        }
        if (particlesMaterialRef.current.uniforms.blueShift) {
          particlesMaterialRef.current.uniforms.blueShift.value = 1.0;
        }
      }
    }

    // Мигание кнопки сканера на двери
    if (doorScannerRef.current && doorScannerRef.current.material instanceof THREE.MeshStandardMaterial) {
      const blink = Math.sin(time * 3) * 0.5 + 0.5; // От 0 до 1
      doorScannerRef.current.material.emissiveIntensity = active ? (0.5 + blink * 1.5) : 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* ОСНОВАНИЕ И ФУНДАМЕНТ */}
      {/* Аура вокруг фундамента */}
      <mesh position={[0, -baseHeight / 2 + 0.25 / 2 + 0.01, 0]} renderOrder={-1}>
        <cylinderGeometry args={[baseWidth * 1.2 * 1.05, baseWidth * 1.2 * 1.05, 0.25, 16]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={active ? 0.12 : 0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Основание башни (фундамент) - немного уменьшено по высоте и приподнято, чтобы избежать мельтешения */}
      <mesh position={[0, -baseHeight / 2 + 0.25 / 2 + 0.02, 0]}>
        <cylinderGeometry args={[baseWidth * 1.2, baseWidth * 1.2, 0.25, 16]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.3 : 0.1}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* ОСНОВНАЯ БАШНЯ */}
      {/* Аура вокруг башни - с отступом от фундамента, чтобы не накладываться */}
      <mesh position={[0, 0.27 + 0.01, 0]} renderOrder={-1}>
        <cylinderGeometry args={[baseWidth * 1.05, baseWidth * 1.05, baseHeight - 0.02, 16]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={active ? 0.12 : 0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Основная башня (цилиндрическая) - начинается от верха фундамента */}
      {/* Верх фундамента на -baseHeight / 2 + 0.27, поэтому башня начинается с этой позиции */}
      <mesh ref={towerRef} position={[0, 0.27, 0]}>
        <cylinderGeometry args={[baseWidth, baseWidth, baseHeight, 16]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#818cf8"
          emissiveIntensity={active ? 0.6 : 0.25}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Слой с нарисованными полосками на башне (снизу вверх) - начинается от верха фундамента */}
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[baseWidth + 0.001, baseWidth + 0.001, baseHeight, 32]} />
        <shaderMaterial
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            
            void main() {
              // Прозрачный фон, только полоски видны
              vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
              
              // 22 полоски по окружности (как на стене)
              float numStripes = 22.0;
              float stripeWidthRatio = 0.2; // Ширина полоски как доля от интервала между полосками (0-1)
              float stripeIndex = floor(vUv.x * numStripes);
              float stripeLocalPos = fract(vUv.x * numStripes);
              
              // Полоски идут снизу вверх - используем V координату (0 = низ, 1 = верх)
              float yPos = vUv.y; // 0 = низ, 1 = верх
              
              // Дверь находится в направлении +Z, что соответствует vUv.x близко к 0 или 1
              // Исключаем полоски в области двери (примерно vUv.x от 0.95 до 1.0 и от 0.0 до 0.05)
              bool nearDoor = (vUv.x > 0.95 || vUv.x < 0.05);
              if (nearDoor) {
                gl_FragColor = color;
                return;
              }
              
              // Длина полосок - короче, чтобы не налезать на окна
              float maxLength = 0.3; // Уменьшено с 0.5 до 0.3, чтобы не налезать на окна
              
              // Рисуем полоску только если Y в пределах длины (снизу вверх)
              // Проверяем расстояние от центра полоски
              float centerDist = abs(stripeLocalPos - 0.5);
              float halfWidth = stripeWidthRatio * 0.5;
              
              if (yPos < maxLength && centerDist < halfWidth) {
                // Иридисцентный цвет полоски (фиолетово-индиго)
                vec3 stripeColor = mix(
                  vec3(0.29, 0.11, 0.8),  // Индиго
                  vec3(0.42, 0.24, 1.0),  // Фиолетовый
                  yPos / maxLength
                );
                // Плавное затухание по краям полоски
                float edgeFade = 1.0 - (centerDist / halfWidth);
                edgeFade = smoothstep(0.0, 1.0, edgeFade);
                // Плавное затухание вверху полоски
                float topFade = smoothstep(maxLength, maxLength * 0.7, yPos);
                float stripeAlpha = 0.85 * edgeFade * topFade;
                color = vec4(stripeColor, stripeAlpha);
              }
              
              gl_FragColor = color;
            }
          `}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Внутренняя башня (непрозрачная, уменьшенная) - создает эффект наполненности */}
      {/* Почти совпадает по высоте с внешней башней, с минимальным отступом */}
      {/* Опущена на фундамент с минимальным отступом (верх фундамента на -baseHeight / 2 + 0.27) */}
      {/* Увеличена окружность, чтобы почти совпадать с внешней башней, с небольшим отступом */}
      <mesh position={[0, -baseHeight / 2 + 0.27 + (baseHeight * 0.98) / 2 + 0.01, 0]}>
        <cylinderGeometry args={[baseWidth * 0.98, baseWidth * 0.98, baseHeight * 0.98, 16]} />
        <meshStandardMaterial
          color="#C8A2C8"
          emissive="#BA8FC2"
          emissiveIntensity={active ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
          transparent={false}
          opacity={1}
        />
      </mesh>

      {/* ОКНА И ДВЕРЬ */}
      {/* Окна (светящиеся прямоугольники, пульсирующие в ритм) */}
      {/* Изогнутые, чтобы прилегать к цилиндрической башне, как дверь */}
      <group ref={windowsRef}>
        {[1, 2, 3].map((floor) => (
          <React.Fragment key={floor}>
            {/* Окно с одной стороны (справа, направление +Z) - только среднее (floor 2) на фронтальной части, где дверь */}
            {floor === 2 && (
              <mesh
                position={[
                  0,
                  0.27 - baseHeight / 2 + (floor + 1) * (baseHeight / 5),
                  0,
                ]}
                rotation={[0, 0, 0]}
              >
                <cylinderGeometry args={[baseWidth * 1.01, baseWidth * 1.01, 0.35, 16, 1, true, -Math.PI / 8, Math.PI / 4]} />
                <meshStandardMaterial
                  color={glowColor}
                  emissive={glowColor}
                  emissiveIntensity={active ? 2 : 0.5}
                  transparent
                  opacity={active ? 0.9 : 0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            {/* Правая боковая сторона (направление +X) - только верхнее окно */}
            {floor === 3 && (
              <mesh
                position={[
                  0,
                  0.27 - baseHeight / 2 + (floor + 1) * (baseHeight / 5),
                  0,
                ]}
                rotation={[0, 0, 0]}
              >
                <cylinderGeometry args={[baseWidth * 1.01, baseWidth * 1.01, 0.35, 16, 1, true, Math.PI / 2 - Math.PI / 8, Math.PI / 4]} />
                <meshStandardMaterial
                  color={glowColor}
                  emissive={glowColor}
                  emissiveIntensity={active ? 2 : 0.5}
                  transparent
                  opacity={active ? 0.9 : 0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            {/* Противоположная фронтальной стороне (направление -Z) - среднее и нижнее окна */}
            {(floor === 1 || floor === 2) && (
              <mesh
                position={[
                  0,
                  0.27 - baseHeight / 2 + (floor + 1) * (baseHeight / 5),
                  0,
                ]}
                rotation={[0, 0, 0]}
              >
                <cylinderGeometry args={[baseWidth * 1.01, baseWidth * 1.01, 0.35, 16, 1, true, Math.PI - Math.PI / 8, Math.PI / 4]} />
                <meshStandardMaterial
                  color={glowColor}
                  emissive={glowColor}
                  emissiveIntensity={active ? 2 : 0.5}
                  transparent
                  opacity={active ? 0.9 : 0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            {/* Левая боковая сторона (направление -X) - только верхнее окно */}
            {floor === 3 && (
              <mesh
                position={[
                  0,
                  0.27 - baseHeight / 2 + (floor + 1) * (baseHeight / 5),
                  0,
                ]}
                rotation={[0, 0, 0]}
              >
                <cylinderGeometry args={[baseWidth * 1.01, baseWidth * 1.01, 0.35, 16, 1, true, -Math.PI / 2 - Math.PI / 8, Math.PI / 4]} />
                <meshStandardMaterial
                  color={glowColor}
                  emissive={glowColor}
                  emissiveIntensity={active ? 2 : 0.5}
                  transparent
                  opacity={active ? 0.9 : 0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </React.Fragment>
        ))}
      </group>

      {/* Дверь (по технологии окон - светящаяся, пульсирующая) */}
      {/* Опущена на ту же высоту, что и внутренняя башня (начинается от верха фундамента) */}
      {/* Изогнутая, чтобы прилегать к цилиндрической башне */}
      {/* Сдвинута левее, чтобы не накладываться на линию-shader */}
      <mesh
        position={[0, -baseHeight / 2 + 0.27 + 0.01 + 0.4, 0]}
        rotation={[0, 0, 0]}
      >
        <cylinderGeometry args={[baseWidth * 1.01, baseWidth * 1.01, 0.8, 16, 1, true, -Math.PI / 12, Math.PI / 6]} />
        <meshStandardMaterial
          color="#6a1b9a"
          emissive="#7b2cbf"
          emissiveIntensity={active ? 1.5 : 0.4}
          transparent
          opacity={active ? 0.9 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Электронный сканер ключей на двери */}
      <group position={[0, -baseHeight / 2 + 0.27 + 0.01 + 0.4, 0]}>
        {/* Корпус сканера (изогнутый, чтобы прилегать к изогнутой двери) */}
        {/* Позиция синхронизирована с кнопкой */}
        <mesh
          position={[0, 0.15, 0]}
          rotation={[0, 0, 0]}
        >
          <cylinderGeometry args={[baseWidth * 1.015, baseWidth * 1.015, 0.08, 16, 1, true, -Math.PI / 24, Math.PI / 12]} />
          <meshStandardMaterial
            color="#9370db"
            emissive="#9370db"
            emissiveIntensity={active ? 0.3 : 0.1}
            metalness={0.9}
            roughness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Мигающая кнопка сканера (изогнутая, чтобы прилегать к двери) */}
        <mesh
          ref={doorScannerRef}
          position={[0, 0.15, 0]}
          rotation={[0, 0, 0]}
        >
          <cylinderGeometry args={[baseWidth * 1.02, baseWidth * 1.02, 0.01, 16, 1, true, -Math.PI / 48, Math.PI / 24]} />
          <meshStandardMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={active ? 1 : 0.2}
            metalness={0.8}
            roughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* БАЛКОН */}
      {/* Основание балкона (круглая платформа) - приподнято, чтобы не свисало */}
      <mesh position={[0, 0.27 + baseHeight / 2 + 0.02, 0]}>
        <cylinderGeometry args={[baseWidth * 1.15, baseWidth * 1.15, 0.1, 32]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.4 : 0.15}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Перила балкона (вертикальные столбики) - приподняты вместе с основанием */}
      <group>
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const radius = baseWidth * 1.1;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                0.27 + baseHeight / 2 + 0.15 + 0.07,
                Math.sin(angle) * radius,
              ]}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
              <meshStandardMaterial
                color={glowColor}
                emissive={glowColor}
                emissiveIntensity={active ? 0.6 : 0.3}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          );
        })}
      </group>

      {/* Поручень балкона (верхняя часть перил) - приподнят вместе с перилами */}
      <mesh position={[0, 0.27 + baseHeight / 2 + 0.3 + 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[baseWidth * 1.1, 0.02, 8, 32]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.6 : 0.3}
          metalness={0.3}
          roughness={0.7}
          transparent={false}
          opacity={1}
        />
      </mesh>

      {/* Внутренняя стена балкона - создает эффект наполненности */}
      {/* Высота стены = высота двери (0.8) * 1.5 = 1.2, но немного ниже внешней */}
      <mesh position={[0, 0.27 + baseHeight / 2 + 0.3, 0]}>
        <cylinderGeometry args={[baseWidth * 0.78, baseWidth * 0.78, 0.8 * 1.5 - 0.01, 16]} />
        <meshStandardMaterial
          color="#9b59b6"
          emissive="#8e44ad"
          emissiveIntensity={active ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
          transparent={false}
          opacity={1}
        />
      </mesh>

      {/* Аура вокруг балкона (внешней стены) */}
      <mesh position={[0, 0.27 + baseHeight / 2 + 0.3, 0]} renderOrder={-1}>
        <cylinderGeometry args={[baseWidth * 0.79 * 1.05, baseWidth * 0.79 * 1.05, 0.8 * 1.5, 16]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={active ? 0.12 : 0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Внешняя стена балкона - с минимальным отступом от внутренней */}
      {/* Высота стены = высота двери (0.8) * 1.5 = 1.2 */}
      <mesh position={[0, 0.27 + baseHeight / 2 + 0.3, 0]} renderOrder={1}>
        <cylinderGeometry args={[baseWidth * 0.79, baseWidth * 0.79, 0.8 * 1.5, 16]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.3 : 0.1}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
          depthWrite={true}
        />
      </mesh>

      {/* Прямоугольная дверь на внешней стене балкона */}
      {/* Точно такая же как на башне, только синего цвета */}
      {/* Низ обрезан на 0.18 */}
      <mesh
        position={[0, 0.27 + baseHeight / 2 + 0.3 + 0.09, 0]}
        rotation={[0, 0, 0]}
      >
        <cylinderGeometry args={[baseWidth * 0.79 + 0.01, baseWidth * 0.79 + 0.01, 0.8 / 1.05 - 0.18, 16, 1, true, -Math.PI / 12, Math.PI / 6]} />
        <meshStandardMaterial
          color="#2563eb"
          emissive="#3b82f6"
          emissiveIntensity={active ? 1.5 : 0.4}
          transparent
          opacity={active ? 0.9 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ручка двери (технологичная точка) - точно такая же как на Обсерватории */}
      {/* Дверь изогнутая, находится в направлении +Z (угол 0), ручка на поверхности двери, немного правее */}
      <mesh
        position={[
          0.08, // Сдвигаем правее
          0.27 + baseHeight / 2 + 0.3 + 0.15, // На двери, на высоте 0.15 от центра
          baseWidth * 0.79 + 0.01 + 0.02 // На поверхности двери в направлении +Z
        ]}
      >
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial
          color="#6a1b9a"
          emissive="#7b2cbf"
          emissiveIntensity={active ? 0.8 : 0.2}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Полоски на внешней стене балкона - отдельные узкие изогнутые элементы */}
      {/* renderOrder увеличен, чтобы полоски рендерились поверх стены */}
      <group renderOrder={3}>
        {Array.from({ length: 22 }).map((_, i) => {
          // Дверь находится в направлении +Z, что соответствует полоскам с индексами 0 и 1
          // Для этих двух полосок уменьшаем длину
          const maxLength = (i === 0 || i === 1) ? 0.25 / 1.5 : 0.5 / 1.5;
          const angle = (i / 22) * Math.PI * 2 - Math.PI / 22; // Сдвигаем все полоски влево (на два шага)
          
          // Определяем, является ли полоска окном или источником света
          // Зафиксированные источники света: 0, 1 (над дверью), 2 (справа), 10, 21 (слева)
          // Противоположная сторона от двери (11, 12) - окна
          // Остальные чередуются: 3-9 (начиная с окна), 13-20 (начиная с источника)
          let isWindow = false;
          if (i === 0 || i === 1 || i === 2 || i === 10 || i === 21) {
            // Зафиксированные источники света
            isWindow = false;
          } else if (i === 11 || i === 12) {
            // Противоположная сторона - окна (кроме 10, которая источник)
            isWindow = true;
          } else if (i >= 3 && i <= 9) {
            // 3-9: чередование, начиная с окна (3=окно, 4=источник, 5=окно, ...)
            isWindow = (i - 3) % 2 === 0;
          } else if (i >= 13 && i <= 20) {
            // 13-20: чередование, начиная с источника (13=источник, 14=окно, 15=источник, ...)
            isWindow = (i - 13) % 2 === 1;
          }
          
          // Ширина полоски: окна шире, источники света уже
          const stripeAngleWidth = isWindow 
            ? (Math.PI * 2) / 22 * 0.35 * 2.5 * 1.5  // Окна - расширены еще в 1.5 раза
            : (Math.PI * 2) / 22 * 0.2;  // Источники света - 20% от интервала (как было)
          
          return (
            <mesh
              key={i}
              position={[0, 0.27 + baseHeight / 2 + 0.3 + (0.8 * 1.5) / 2 - maxLength / 2, 0]}
              rotation={[0, 0, 0]}
            >
              <cylinderGeometry args={[
                baseWidth * 0.79 + 0.01,
                baseWidth * 0.79 + 0.01,
                maxLength,
                16,
                1,
                true,
                angle - stripeAngleWidth / 2,
                stripeAngleWidth
              ]} />
              <shaderMaterial
                vertexShader={`
                  varying vec2 vUv;
                  void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  }
                `}
                uniforms={{
                  windowAngle: { value: angle } // Передаем угол окна для уникальных отблесков
                }}
                fragmentShader={isWindow ? `
                  varying vec2 vUv;
                  uniform float windowAngle;
                  
                  void main() {
                    // Окно - прямоугольная область с отблесками
                    // vUv.x - по ширине полоски (0-1)
                    // vUv.y - по высоте (0 = низ, 1 = верх)
                    
                    // Уменьшаем высоту окна (используем только 80% высоты)
                    float windowHeightScale = 0.8;
                    float windowYOffset = (1.0 - windowHeightScale) / 2.0; // Центрируем
                    if (vUv.y < windowYOffset || vUv.y > 1.0 - windowYOffset) {
                      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                      return;
                    }
                    float windowYLocal = (vUv.y - windowYOffset) / windowHeightScale; // Нормализуем к 0-1
                    
                    float windowXLocal = vUv.x; // 0-1 по ширине
                    
                    // Добавляем зависимость от угла окна для уникальных отблесков
                    // Используем угол для изменения направления и частоты отблесков
                    float angleCos = cos(windowAngle);
                    float angleSin = sin(windowAngle);
                    
                    // Поворачиваем координаты отблесков в зависимости от угла окна
                    // Это создаст разные направления отблесков на разных сторонах
                    float rotatedX = windowXLocal * angleCos - windowYLocal * angleSin;
                    float rotatedY = windowXLocal * angleSin + windowYLocal * angleCos;
                    
                    // Цвет окна (темный фиолетовый)
                    vec3 windowColor = vec3(0.4, 0.2, 0.8);
                    
                    // Отблески на окне - резкие переходы с небольшой размытостью
                    // Используем повернутые координаты для уникальных отблесков на разных сторонах
                    // smoothstep с узким диапазоном дает резкий, но слегка размытый переход
                    float highlight1 = sin(rotatedX * 3.14159 * 4.0 + windowAngle * 2.0) * 0.5 + 0.5;
                    highlight1 = smoothstep(0.65, 0.75, highlight1); // Резкий переход с небольшой размытостью
                    highlight1 *= 0.25; // Уменьшено в 2 раза (было 0.5)
                    
                    float highlight2 = sin(rotatedY * 3.14159 * 2.0 + windowAngle * 1.5) * 0.5 + 0.5;
                    highlight2 = smoothstep(0.6, 0.7, highlight2); // Резкий переход с небольшой размытостью
                    highlight2 *= 0.175; // Уменьшено в 2 раза (было 0.35)
                    
                    float highlight3 = sin((rotatedX + rotatedY) * 3.14159 * 3.0 + windowAngle * 3.0) * 0.5 + 0.5;
                    highlight3 = smoothstep(0.7, 0.8, highlight3); // Резкий переход с небольшой размытостью
                    highlight3 *= 0.2; // Уменьшено в 2 раза (было 0.4)
                    
                    float blueHighlight1 = sin(rotatedX * 3.14159 * 5.0 + windowAngle * 2.5) * 0.5 + 0.5;
                    blueHighlight1 = smoothstep(0.65, 0.75, blueHighlight1); // Резкий переход с небольшой размытостью
                    blueHighlight1 *= 0.2; // Уменьшено в 2 раза (было 0.4)
                    
                    float blueHighlight2 = sin(rotatedY * 3.14159 * 3.0 + windowAngle * 1.8) * 0.5 + 0.5;
                    blueHighlight2 = smoothstep(0.63, 0.73, blueHighlight2); // Резкий переход с небольшой размытостью
                    blueHighlight2 *= 0.15; // Уменьшено в 2 раза (было 0.3)
                    
                    float totalHighlight = highlight1 + highlight2 + highlight3;
                    vec3 highlightColor = vec3(0.7, 0.5, 1.0); // Более яркий и насыщенный
                    windowColor = mix(windowColor, highlightColor, totalHighlight);
                    
                    float totalBlueHighlight = blueHighlight1 + blueHighlight2;
                    vec3 blueHighlightColor = vec3(0.4, 0.8, 1.0); // Более яркий голубой
                    windowColor = mix(windowColor, blueHighlightColor, totalBlueHighlight);
                    
                    // Четкие границы рамок - уменьшаем диапазон затухания для более резких рамок
                    float edgeFadeX = smoothstep(0.0, 0.03, min(windowXLocal, 1.0 - windowXLocal));
                    edgeFadeX = pow(edgeFadeX, 0.2); // Очень резкий переход для рамок
                    float edgeFadeY = smoothstep(0.0, 0.03, min(windowYLocal, 1.0 - windowYLocal));
                    edgeFadeY = pow(edgeFadeY, 0.2); // Очень резкий переход для рамок
                    float windowAlpha = 1.0 * edgeFadeX * edgeFadeY; // Четкие границы рамок
                    
                    gl_FragColor = vec4(windowColor, windowAlpha);
                  }
                ` : `
                  varying vec2 vUv;
                  
                  void main() {
                    // Градиент по длине полоски (vUv.y: 0 = низ цилиндра, 1 = верх цилиндра)
                    // Полоска свисает сверху вниз
                    // Вверху: темный яркий фиолетовый
                    // В середине: голубой яркий свет
                    // Внизу: сиреневый/индиго
                    float gradientPos = 1.0 - vUv.y; // Инвертируем: 0 = верх, 1 = низ
                    
                    vec3 stripeColor;
                    if (gradientPos < 0.5) {
                      // Верхняя половина: от темного фиолетового к голубому
                      float t = gradientPos * 2.0; // 0-1 для верхней половины
                      stripeColor = mix(
                        vec3(0.2, 0.05, 0.6),  // Темно-синий фиолетовый (верх) - очень темный
                        vec3(0.1, 0.4, 0.9),   // Голубой яркий свет (середина) - более насыщенный
                        t
                      );
                    } else {
                      // Нижняя половина: от голубого к сиреневому/индиго
                      float t = (gradientPos - 0.5) * 2.0; // 0-1 для нижней половины
                      stripeColor = mix(
                        vec3(0.1, 0.4, 0.9),   // Голубой яркий свет (середина) - более насыщенный
                        vec3(0.5, 0.35, 0.95),  // Сиреневый (низ) - более яркий и заметный
                        t
                      );
                    }
                    // Снижаем общую яркость
                    stripeColor *= 1.2;
                    // Делаем самые кончики неоновым розово-сиреневым (после общего умножения)
                    if (gradientPos > 0.75) {
                      float tipBrightness = (gradientPos - 0.75) / 0.25; // 0-1 для кончиков
                      vec3 neonPinkLavender = vec3(0.9, 0.15, 0.8) * 1.5; // Неоновый розово-сиреневый, яркий
                      // Заменяем цвет на кончиках на неоновый
                      stripeColor = mix(stripeColor, neonPinkLavender, tipBrightness);
                    }
                    // Плавное затухание ВНИЗУ полоски (vUv.y близко к 0 = низ)
                    float bottomFade = smoothstep(0.0, 0.3, vUv.y);
                    // Плавное затухание по краям (по ширине)
                    float edgeFade = smoothstep(0.0, 0.3, min(vUv.x, 1.0 - vUv.x));
                    float stripeAlpha = 3.0 * edgeFade * bottomFade;
                    gl_FragColor = vec4(stripeColor, stripeAlpha);
                  }
                `}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>

      {/* Вершина башни (вращающийся "маяк") */}
      {/* Позиция: выше стены балкона (стена на 0.27 + baseHeight/2 + 0.3, высота стены 1.2) */}
      {/* Верх стены: 0.27 + baseHeight/2 + 0.3 + 1.2/2 = 0.27 + baseHeight/2 + 0.9 */}
      {/* Радиус увеличен до baseWidth * 1.2, чтобы защитить все основание балкона (baseWidth * 1.15) */}
      {/* Высота увеличена до 0.6, форма более шарообразная (широкий и высокий конус) */}
      {/* Маяк: верх стены + половина высоты конуса (0.6/2 = 0.3) = 0.27 + baseHeight/2 + 1.2 */}
      {/* Аура вокруг крыши (конус) */}
      <mesh position={[0, 0.27 + baseHeight / 2 + 1.2, 0]} renderOrder={-1}>
        <coneGeometry args={[baseWidth * 1.2 * 1.05, 0.6 * 1.05, 16]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={active ? 0.12 : 0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Внешняя крыша (вращающийся "маяк") */}
      <mesh ref={beaconRef} position={[0, 0.27 + baseHeight / 2 + 1.2, 0]}>
        <coneGeometry args={[baseWidth * 1.2, 0.6, 16]} />
        <meshStandardMaterial
          color={0x4B0082}
          emissive={0x5A1A9A}
          emissiveIntensity={active ? 1 : 0.3}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Внутренняя крыша (непрозрачная, уменьшенная) - создает эффект наполненности */}
      {/* Чуть меньше внешней крыши с минимальным отступом, вращается синхронно с внешней */}
      <mesh ref={innerBeaconRef} position={[0, 0.27 + baseHeight / 2 + 1.2, 0]}>
        <coneGeometry args={[baseWidth * 1.2 * 0.98, 0.6 * 0.98, 16]} />
        <meshStandardMaterial
          color={0x87ceeb}
          emissive={0xb0e0e6}
          emissiveIntensity={active ? 1 : 0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Вращающийся луч света из частиц (горизонтальный, как у маяка) */}
      {/* Позиция: выше конуса-крыши (конус на 0.27 + baseHeight/2 + 1.2, высота конуса 0.6) */}
      {/* Верх конуса: 0.27 + baseHeight/2 + 1.2 + 0.6/2 = 0.27 + baseHeight/2 + 1.5 */}
      {/* renderOrder увеличен, чтобы луч рендерился поверх других объектов */}
      {active && (
        <group ref={lightBeamRef} position={[0, 0.27 + baseHeight / 2 + 1.5, 0]} renderOrder={10}>
          {/* Частицы луча света - конус, направленный горизонтально */}
          <points ref={particlesRef} geometry={particlesGeometry} rotation={[0, Math.PI / 2, 0]} renderOrder={10}>
            <shaderMaterial
              vertexShader={`
                attribute float opacity;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                  vColor = color;
                  vOpacity = opacity;
                  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                  gl_PointSize = 250.0 / length(mvPosition.xyz); // Размер частиц для видимости
                  gl_Position = projectionMatrix * mvPosition;
                }
              `}
              fragmentShader={`
                varying vec3 vColor;
                varying float vOpacity;
                uniform float colorMultiplier;
                uniform float blueShift;
                
                void main() {
                  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                  float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                  
                  // Мигание: текущий цвет или ярко-голубой
                  vec3 finalColor = vColor;
                  if (blueShift > 0.5) {
                    // Ярко-голубой цвет (смещаем к голубому)
                    finalColor = vec3(0.2, 0.6, 1.0) * colorMultiplier * 0.4;
                  } else {
                    // Текущий цвет (глубокий фиолетово-неоновый)
                    finalColor = vColor * colorMultiplier * 0.25;
                  }
                  
                  gl_FragColor = vec4(finalColor * alpha, alpha * vOpacity * 0.7);
                }
              `}
              uniforms={particlesUniforms}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              ref={particlesMaterialRef}
            />
          </points>
          
          {/* Яркий источник света на вершине башни (мигает: неоново-фиолетово-индиго / ультраярко-бело-розовый) */}
          <mesh ref={lightSourceRef} position={[0, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={0x4a1dcc}
              emissive={0x4a1dcc}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      )}

      {/* Точечный свет на вершине (для освещения окружения) */}
      {active && (
        <pointLight
          position={[0, 0.27 + baseHeight / 2 + 1.5, 0]}
          color={0x6a3dff}
          intensity={0.5}
          distance={5}
          decay={2}
        />
      )}
    </group>
  );
}
