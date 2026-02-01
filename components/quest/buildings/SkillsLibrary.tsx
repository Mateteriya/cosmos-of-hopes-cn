'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SkillsLibraryProps {
  position: [number, number, number];
  active?: boolean;
  level?: number;
}

/**
 * Библиотека Навыков
 * 
 * Форма:
 * - Классическое здание-библиотека с колоннами
 * - Множество "полок" с книгами (визуально)
 * - Купол на вершине
 * - Симметричная структура
 */
export default function SkillsLibrary({
  position,
  active = true,
  level = 1,
}: SkillsLibraryProps) {
  const groupRef = useRef<THREE.Group>(null);
  const booksRef = useRef<THREE.Group>(null);
  const knowledgePointRef = useRef<THREE.Mesh>(null);

  // Цвета для Сферы Разума
  const primaryColor = new THREE.Color(0x5b9bd5); // Голубой
  const secondaryColor = new THREE.Color(0x8b7ec8); // Фиолетовый
  const glowColor = new THREE.Color(0x87ceeb); // Небесно-голубой

  // Размеры
  const baseWidth = 1.5;
  const baseHeight = 1.8 * level;
  const baseDepth = 1.5;
  const baseYOffset = baseHeight / 2;
  const colTop = -baseHeight / 2 + 0.1 + baseHeight * 0.6; // верх колонн (здесь не ставить ауру — мельтешение)
  const auraGap = 0.02; // зазор ауры от плоскости верха колонн, чтобы не z-fight
  const colRadius = 0.08; // радиус колонны
  const colOffset = baseWidth * 0.51; // расстояние от центра до центра колонны
  // аура 1 этажа: обхватывает колонны (стена + выступ колонн + диаметр колонны)
  const aura1FloorSize = (colOffset + colRadius) * 2 / baseWidth; // множитель: куб ауры с учётом колонн

  // Анимация
  useFrame((state) => {
    if (!groupRef.current || !booksRef.current) return;

    const time = state.clock.getElapsedTime();

    // Мигание центральной точки знания с переливанием цветов (3D эффект)
    if (knowledgePointRef.current) {
      const blink = Math.sin(time * 4) * 0.5 + 0.5; // От 0 до 1
      const intensity = 5 + blink * 5; // От 5 до 10 (очень яркое мигание)
      
      // Переливание неоновых кислотных цветов
      const colorPhase = (time * 2) % (Math.PI * 2);
      const colors = [
        { r: 0, g: 1, b: 1 },         // Неоновый циан
        { r: 0.8, g: 0, b: 1 },       // Неоновый фиолетовый
        { r: 0.5, g: 0, b: 1 },       // Неоновый индиго
        { r: 1, g: 0, b: 0.8 },       // Неоновый розовый
        { r: 0, g: 0.8, b: 1 },       // Неоновый голубой
      ];
      const colorIndex = Math.floor((colorPhase / (Math.PI * 2)) * colors.length);
      const nextColorIndex = (colorIndex + 1) % colors.length;
      const t = ((colorPhase / (Math.PI * 2)) * colors.length) % 1;
      
      const currentColor = colors[colorIndex];
      const nextColor = colors[nextColorIndex];
      
      const r = currentColor.r + (nextColor.r - currentColor.r) * t;
      const g = currentColor.g + (nextColor.g - currentColor.g) * t;
      const b = currentColor.b + (nextColor.b - currentColor.b) * t;
      
      // Применяем цвета ко всем слоям
      knowledgePointRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity = active ? intensity * (child === knowledgePointRef.current!.children[2] ? 1 : 0.7) : intensity * 0.5;
          child.material.emissive.setRGB(r, g, b);
          child.material.color.setRGB(r, g, b);
        }
      });
      
      // Пульсация размера (уменьшена амплитуда)
      const scale = 1 + Math.sin(time * 3) * 0.1;
      knowledgePointRef.current.scale.setScalar(scale);
    }

    // Пульсация книг
    if (booksRef.current) {
      booksRef.current.children.forEach((book, index) => {
        if (book instanceof THREE.Mesh) {
          const pulse = 0.9 + Math.sin(time * 2 + index * 0.5) * 0.1;
          if (book.material instanceof THREE.MeshBasicMaterial) {
            book.material.opacity = pulse * (active ? 1 : 0.5);
          }
        }
      });
    }

    // Плавающая анимация (относительно основания на сетке)
    groupRef.current.position.y = position[1] + Math.sin(time) * 0.03;
  });

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* Основание библиотеки (фундамент) */}
      <mesh position={[0, -baseHeight / 2 + 0.2 / 2, 0]}>
        <boxGeometry args={[baseWidth * 1.1, 0.2, baseDepth * 1.1]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.2 : 0.1}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Основное здание (квадратное основание) - начинается от верха фундамента */}
      <mesh position={[0, -baseHeight / 2 + 0.1 + (baseHeight * 0.8) / 2, 0]}>
        <boxGeometry args={[baseWidth, baseHeight * 0.8, baseDepth]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.3 : 0.15}
          metalness={0.7}
          roughness={0.4}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Внутренняя библиотека: 1 этаж */}
      <mesh position={[0, -baseHeight / 2 + 0.1 + (baseHeight * 0.6) / 2, 0]}>
        <boxGeometry args={[baseWidth * 0.95, baseHeight * 0.6, baseDepth * 0.95]} />
        <meshStandardMaterial
          color="#ff69b4"
          emissive="#ff1493"
          emissiveIntensity={active ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
          transparent={false}
          opacity={1}
        />
      </mesh>
      {/* Внутренняя стена второго этажа: отступ от внешней и от внутреннего края декоративной стены (0.95) */}
      <mesh position={[0, -baseHeight / 2 + 0.1 + baseHeight * 0.6 + (baseHeight * 0.2) / 2 - 0.001, 0]}>
        <boxGeometry args={[baseWidth * 0.93, baseHeight * 0.2, baseDepth * 0.93]} />
        <meshStandardMaterial
          color="#ff69b4"
          emissive="#ff1493"
          emissiveIntensity={active ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
          transparent={false}
          opacity={1}
        />
      </mesh>

      {/* Колонны по углам - снаружи библиотеки */}
      {[
        [-baseWidth * 0.51, -baseHeight / 2 + 0.1, -baseDepth * 0.51],
        [baseWidth * 0.51, -baseHeight / 2 + 0.1, -baseDepth * 0.51],
        [-baseWidth * 0.51, -baseHeight / 2 + 0.1, baseDepth * 0.51],
        [baseWidth * 0.51, -baseHeight / 2 + 0.1, baseDepth * 0.51],
      ].map((colPos, i) => (
        <mesh key={i} position={[colPos[0], colPos[1] + (baseHeight * 0.6) / 2, colPos[2]]}>
          <cylinderGeometry args={[0.08, 0.08, baseHeight * 0.6, 8]} />
          <meshStandardMaterial
            color={secondaryColor}
            emissive={glowColor}
            emissiveIntensity={active ? 0.4 : 0.2}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Декоративная стена на вершинах колонн (полый квадрат) */}
      <group position={[0, -baseHeight / 2 + 0.1 + baseHeight * 0.6, 0]}>
        {/* Внешний квадрат */}
        <mesh>
          <boxGeometry args={[baseWidth * 1.05, 0.12, baseDepth * 1.05]} />
          <meshStandardMaterial
            color={secondaryColor}
            emissive={glowColor}
            emissiveIntensity={active ? 0.4 : 0.2}
            metalness={0.9}
            roughness={0.2}
            transparent
            opacity={0.95}
          />
        </mesh>
        {/* Полость (вырезанный квадрат) - увеличена для минимального отступа */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[baseWidth * 0.95, 0.15, baseDepth * 0.95]} />
          <meshStandardMaterial
            color={secondaryColor}
            emissive={glowColor}
            emissiveIntensity={active ? 0.4 : 0.2}
            metalness={0.9}
            roughness={0.2}
            transparent
            opacity={0.95}
          />
        </mesh>
      </group>

      {/* Вход в библиотеку - сбоку */}
      <mesh
        position={[baseWidth * 0.51, -baseHeight / 2 + 0.2 + 0.4, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[0.6, 0.8]} />
        <meshStandardMaterial
          color="#8b7ec8"
          emissive="#9b8fd8"
          emissiveIntensity={active ? 0.3 : 0.1}
          metalness={0.7}
          roughness={0.3}
          transparent={false}
          opacity={1}
        />
      </mesh>
      {/* Ручка двери */}
      <mesh
        position={[baseWidth * 0.515, -baseHeight / 2 + 0.2 + 0.35, 0.25]}
        rotation={[0, Math.PI / 2, 0]}
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

      {/* Окна над дверью (сбоку) */}
      {[0, 1, 2, 3].map((book) => (
        <mesh
          key={`side-right-${book}`}
          position={[
            baseWidth * 0.51,
            -baseHeight / 2 + 0.2 + 0.4 + 0.8,
            -baseWidth * 0.3 + book * (baseWidth * 0.6 / 3),
          ]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <boxGeometry args={[0.15, 0.25, 0.02]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={active ? 2 : 0.8}
            transparent
            opacity={active ? 0.9 : 0.4}
          />
        </mesh>
      ))}

      {/* Окна на противоположной стороне (один ряд) */}
      {[0, 1, 2, 3].map((book) => (
        <mesh
          key={`side-left-${book}`}
          position={[
            -baseWidth * 0.51,
            -baseHeight / 2 + 0.2 + 0.4 + 0.8,
            -baseWidth * 0.3 + book * (baseWidth * 0.6 / 3),
          ]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <boxGeometry args={[0.15, 0.25, 0.02]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={active ? 2 : 0.8}
            transparent
            opacity={active ? 0.9 : 0.4}
          />
        </mesh>
      ))}

      {/* Орнамент - трехслойная изогнутая линия */}
      <mesh
        position={[-baseWidth * 0.51, -baseHeight / 2 + 0.2 + 0.4 + 0.8 - 0.43, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[baseWidth * 1.0, 0.4]} />
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
            uniform float intensity;
            
            void main() {
              // Более волнистая изогнутая линия (в 3 раза больше волн)
              float wave = sin(vUv.x * 3.14159 * 18.0) * 0.2; // В 3 раза больше волн
              
              float lineThickness = 0.06;
              float aa = 0.015;
              
              float line1Y = 0.42 + wave;
              float dist1 = abs(vUv.y - line1Y);
              float line1 = 1.0 - smoothstep(lineThickness - aa, lineThickness + aa, dist1);
              
              float line2Y = 0.5 + wave;
              float dist2 = abs(vUv.y - line2Y);
              float line2 = 1.0 - smoothstep(lineThickness - aa, lineThickness + aa, dist2);
              
              float line3Y = 0.58 + wave;
              float dist3 = abs(vUv.y - line3Y);
              float line3 = 1.0 - smoothstep(lineThickness - aa, lineThickness + aa, dist3);
              
              vec3 colorGreen = vec3(0.4, 0.6, 0.45);
              vec3 colorSilver = vec3(0.85, 0.7, 0.35);
              vec3 colorBlue = vec3(0.4, 0.6, 0.8);
              
              float maxLine = max(max(line1, line2), line3);
              vec3 finalColor = vec3(0.0);
              float pattern = maxLine;
              if (line1 > 0.01 && line1 >= line2 && line1 >= line3) {
                finalColor = colorGreen;
              } else if (line2 > 0.01 && line2 >= line3) {
                finalColor = colorSilver;
                pattern = line2 * 1.5;
              } else if (line3 > 0.01) {
                finalColor = colorBlue;
              }
              
              gl_FragColor = vec4(finalColor * pattern * intensity, pattern * 0.85);
            }
          `}
          uniforms={{
            intensity: { value: active ? 0.8 : 0.4 }
          }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Орнамент на передней боковой стене второго этажа */}
      <mesh
        position={[0, -baseHeight / 2 + 0.2 + baseHeight * 0.68, baseDepth * 0.51]}
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[baseWidth * 1.0, 0.25]} />
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
            uniform float intensity;
            
            void main() {
              float wave = sin(vUv.x * 3.14159 * 18.0) * 0.2;
              
              float lineThickness = 0.06;
              float aa = 0.015;
              
              float line1Y = 0.42 + wave;
              float dist1 = abs(vUv.y - line1Y);
              float line1 = 1.0 - smoothstep(lineThickness - aa, lineThickness + aa, dist1);
              
              float line2Y = 0.5 + wave;
              float dist2 = abs(vUv.y - line2Y);
              float line2 = 1.0 - smoothstep(lineThickness - aa, lineThickness + aa, dist2);
              
              float line3Y = 0.58 + wave;
              float dist3 = abs(vUv.y - line3Y);
              float line3 = 1.0 - smoothstep(lineThickness - aa, lineThickness + aa, dist3);
              
              vec3 colorGreen = vec3(0.4, 0.6, 0.45);
              vec3 colorSilver = vec3(0.8, 0.6, 0.95);
              vec3 colorBlue = vec3(0.4, 0.6, 0.8);
              
              float maxLine = max(max(line1, line2), line3);
              vec3 finalColor = vec3(0.0);
              float pattern = maxLine;
              if (line1 > 0.01 && line1 >= line2 && line1 >= line3) {
                finalColor = colorGreen;
              } else if (line2 > 0.01 && line2 >= line3) {
                finalColor = colorSilver;
                pattern = line2 * 1.5;
              } else if (line3 > 0.01) {
                finalColor = colorBlue;
              }
              
              gl_FragColor = vec4(finalColor * pattern * intensity, pattern * 0.85);
            }
          `}
          uniforms={{
            intensity: { value: active ? 0.8 : 0.4 }
          }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Орнамент на задней боковой стене второго этажа */}
      <mesh
        position={[0, -baseHeight / 2 + 0.2 + baseHeight * 0.68, -baseDepth * 0.51]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[baseWidth * 1.0, 0.25]} />
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
            uniform float intensity;
            
            void main() {
              float wave = sin(vUv.x * 3.14159 * 18.0) * 0.2;
              
              float lineThickness = 0.06;
              float aa = 0.015;
              
              float line1Y = 0.42 + wave;
              float dist1 = abs(vUv.y - line1Y);
              float line1 = 1.0 - smoothstep(lineThickness - aa, lineThickness + aa, dist1);
              
              float line2Y = 0.5 + wave;
              float dist2 = abs(vUv.y - line2Y);
              float line2 = 1.0 - smoothstep(lineThickness - aa, lineThickness + aa, dist2);
              
              float line3Y = 0.58 + wave;
              float dist3 = abs(vUv.y - line3Y);
              float line3 = 1.0 - smoothstep(lineThickness - aa, lineThickness + aa, dist3);
              
              vec3 colorGreen = vec3(0.4, 0.6, 0.45);
              vec3 colorSilver = vec3(0.8, 0.6, 0.95);
              vec3 colorBlue = vec3(0.4, 0.6, 0.8);
              
              float maxLine = max(max(line1, line2), line3);
              vec3 finalColor = vec3(0.0);
              float pattern = maxLine;
              if (line1 > 0.01 && line1 >= line2 && line1 >= line3) {
                finalColor = colorGreen;
              } else if (line2 > 0.01 && line2 >= line3) {
                finalColor = colorSilver;
                pattern = line2 * 1.5;
              } else if (line3 > 0.01) {
                finalColor = colorBlue;
              }
              
              gl_FragColor = vec4(finalColor * pattern * intensity, pattern * 0.85);
            }
          `}
          uniforms={{
            intensity: { value: active ? 0.8 : 0.4 }
          }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Второй ряд окон на противоположной стороне */}
      {[0, 1, 2, 3].map((book) => (
        <mesh
          key={`side-left-bottom-${book}`}
          position={[
            -baseWidth * 0.51,
            -baseHeight / 2 + 0.2 + 0.4 + 0.8 - 0.7,
            -baseWidth * 0.3 + book * (baseWidth * 0.6 / 3),
          ]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <boxGeometry args={[0.15, 0.25, 0.02]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={active ? 2 : 0.8}
            transparent
            opacity={active ? 0.9 : 0.4}
          />
        </mesh>
      ))}

      {/* Книги (светящиеся прямоугольники на стенах) - размеры уменьшены, позиции скорректированы */}
      <group ref={booksRef}>
        {[0, 1, 2].map((shelf) => (
          <React.Fragment key={shelf}>
            {/* Книги на передней стене */}
            {[0, 1, 2, 3].map((book) => {
              // Корректируем позицию по Y: верхний ряд (shelf=2) опускаем, нижний (shelf=0) поднимаем
              let yOffset = 0;
              if (shelf === 2) {
                yOffset = -0.10; // Верхний ряд - опускаем на 0.10 (было -0.02, добавили еще -0.08)
              } else if (shelf === 0) {
                yOffset = 0.10; // Нижний ряд - поднимаем на 0.10 (было +0.02, добавили еще +0.08)
              }
              return (
                <mesh
                  key={`front-${shelf}-${book}`}
                  position={[
                    -baseWidth * 0.3 + book * (baseWidth * 0.6 / 3),
                    -baseHeight / 2 + 0.2 + 0.1 + shelf * (baseHeight * 0.8 / 4) + yOffset,
                    baseDepth * 0.51,
                  ]}
                >
                  <boxGeometry args={[0.13, 0.23, 0.02]} />
                  <meshStandardMaterial
                    color={glowColor}
                    emissive={glowColor}
                    emissiveIntensity={active ? 2 : 0.8}
                    transparent
                    opacity={active ? 0.9 : 0.4}
                  />
                </mesh>
              );
            })}
            {/* Книги на задней стене */}
            {[0, 1, 2, 3].map((book) => {
              // Корректируем позицию по Y: верхний ряд (shelf=2) опускаем, нижний (shelf=0) поднимаем
              let yOffset = 0;
              if (shelf === 2) {
                yOffset = -0.10; // Верхний ряд - опускаем на 0.10 (было -0.02, добавили еще -0.08)
              } else if (shelf === 0) {
                yOffset = 0.10; // Нижний ряд - поднимаем на 0.10 (было +0.02, добавили еще +0.08)
              }
              return (
                <mesh
                  key={`back-${shelf}-${book}`}
                  position={[
                    -baseWidth * 0.3 + book * (baseWidth * 0.6 / 3),
                    -baseHeight / 2 + 0.2 + 0.1 + shelf * (baseHeight * 0.8 / 4) + yOffset,
                    -baseDepth * 0.51,
                  ]}
                >
                  <boxGeometry args={[0.13, 0.23, 0.02]} />
                  <meshStandardMaterial
                    color={glowColor}
                    emissive={glowColor}
                    emissiveIntensity={active ? 2.5 : 1}
                    transparent
                    opacity={active ? 0.95 : 0.5}
                  />
                </mesh>
              );
            })}
          </React.Fragment>
        ))}
      </group>

      {/* Плоская крыша */}
      <mesh position={[0, -baseHeight / 2 + 0.1 + baseHeight * 0.8 + 0.05, 0]}>
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

      {/* Символ библиотеки на крыше: поднят, чтобы книга лежала поверх крыши (не утопала) */}
      <group position={[0, -baseHeight / 2 + 0.1 + baseHeight * 0.8 + 0.21, 0]}>
        {/* Основание-книга (более крупная и видимая) */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 8]}>
          <boxGeometry args={[0.35, 0.04, 0.25]} />
          <meshStandardMaterial
            color="#8b7ec8"
            emissive={glowColor}
            emissiveIntensity={active ? 0.8 : 0.4}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 8]}>
          <boxGeometry args={[0.35, 0.04, 0.25]} />
          <meshStandardMaterial
            color="#8b7ec8"
            emissive={glowColor}
            emissiveIntensity={active ? 0.8 : 0.4}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        
        {/* Центральный символ знания (над книгой, мигает и переливается цветами) - 3D эффект */}
        <group ref={knowledgePointRef} position={[0, 0.12, 0]}>
          {/* Внешний слой свечения (больший, более прозрачный) */}
          <mesh>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={active ? 3 : 1.5}
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={0.4}
            />
          </mesh>
          
          {/* Средний слой (средний размер) */}
          <mesh>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={active ? 4 : 2}
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={0.6}
            />
          </mesh>
          
          {/* Внутренний ядро (яркое, плотное) */}
          <mesh>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={active ? 5 : 2}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
        
        {/* Парящие символы знания (тетраэдры, расположенные по кругу) */}
        {[0, 1, 2].map((symbol) => {
          const angle = (symbol / 3) * Math.PI * 2;
          const radius = 0.15;
          return (
            <mesh
              key={symbol}
              position={[
                Math.cos(angle) * radius,
                0.18,
                Math.sin(angle) * radius,
              ]}
            >
              <tetrahedronGeometry args={[0.025, 0]} />
              <meshStandardMaterial
                color={glowColor}
                emissive={glowColor}
                emissiveIntensity={active ? 1.5 : 0.8}
                metalness={0.8}
                roughness={0.2}
                wireframe
              />
            </mesh>
          );
        })}
      </group>


      {/* Аура: позиции с зазором от colTop (верх колонн), чтобы не было мельтешения */}
      {/* 0. Аура фундамента: +0.0205 высоты снизу (оптимал) */}
      <mesh position={[0, -baseHeight / 2 + 0.05975, 0]} renderOrder={-1}>
        <boxGeometry args={[baseWidth * 1.12, 0.1005, baseDepth * 1.12]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* 1. Первый этаж: куб ауры с учётом колонн (обхватывает колонны по диаметру) */}
      <mesh position={[0, -baseHeight / 2 + 0.1 + (baseHeight * 0.6 - auraGap) / 2, 0]} renderOrder={-1}>
        <boxGeometry args={[baseWidth * aura1FloorSize, baseHeight * 0.6 - auraGap, baseDepth * aura1FloorSize]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* 2. Второй этаж: низ ауры = colTop + auraGap; ближе к стене (1.02 вместо 1.08) */}
      <mesh position={[0, colTop + auraGap + (baseHeight * 0.2) / 2, 0]} renderOrder={-1}>
        <boxGeometry args={[baseWidth * 1.02, baseHeight * 0.2, baseDepth * 1.02]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* 3. Крыша: небольшой выступ (1.04), чтобы ауру было видно поверх крыши */}
      <mesh position={[0, -baseHeight / 2 + 0.1 + baseHeight * 0.8 + 0.05, 0]} renderOrder={-1}>
        <boxGeometry args={[baseWidth * 1.04, 0.12, baseDepth * 1.04]} />
        <meshBasicMaterial color={glowColor} transparent opacity={active ? 0.12 : 0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}
