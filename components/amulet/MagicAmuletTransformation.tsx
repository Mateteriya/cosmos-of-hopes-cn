'use client';

/**
 * Компонент магического превращения 2D амулета в 3D
 * 魔力转换 (Мо Ли Чжуань Хуань) - Магическое Превращение
 */

import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { AmuletSymbol, BaziElement } from '@/types/amulet';
import { AMULET_SYMBOLS } from '@/types/amulet';

interface MagicAmuletTransformationProps {
  symbol: AmuletSymbol;
  color: string;
  baziElement: BaziElement;
  wishText: string;
  onComplete: () => void;
  onClose: () => void;
}

// 3D амулет (геометрическая форма в зависимости от символа)
function Amulet3D({
  symbol,
  color,
  baziElement,
  isAnimating,
}: {
  symbol: AmuletSymbol;
  color: string;
  baziElement: BaziElement;
  isAnimating: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const glowRefs = useRef<THREE.Mesh[]>([]);
  const [scale, setScale] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);

  // Анимация появления
  useEffect(() => {
    if (isAnimating) {
      setScale(0);
      setGlowIntensity(0);
      
      const duration = 2500;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        setScale(easeOutCubic);
        setGlowIntensity(Math.sin(progress * Math.PI) * 3);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setScale(1);
          setGlowIntensity(2);
        }
      };
      
      animate();
    }
  }, [isAnimating]);

  // Для ВСЕХ символов - ГАРАНТИРУЕМ что они ВСЕГДА плоские монеты (лежат плоско)
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.PI / 2; // МОНЕТА ЛЕЖИТ ПЛОСКО - ВСЕГДА!
      meshRef.current.rotation.y = 0;
      meshRef.current.rotation.z = 0;
    }
  }, [symbol]);

  // Выбор геометрии - ВСЕГДА МОНЕТА (плоский цилиндр) для всех символов
  const geometry = useMemo(() => {
    // ВСЕ символы превращаются в форму монеты (плоский цилиндр)
    return new THREE.CylinderGeometry(1, 1, 0.1, 64);
  }, [symbol]);

  // Текстура для монеты с символом и элементом (для ВСЕХ символов)
  const coinTexture = useMemo(() => {
    // ВСЕ символы превращаются в монеты с соответствующим символом
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Фон - радиальный градиент цвета элемента (с ярким контрастом для рельефа)
    const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // ОЧЕНЬ яркий центр (для максимальной яркости)
    const lightR = Math.min(255, r + 150);
    const lightG = Math.min(255, g + 150);
    const lightB = Math.min(255, b + 150);
    
    // Средний тон (яркий)
    const midR = Math.min(255, r + 90);
    const midG = Math.min(255, g + 90);
    const midB = Math.min(255, b + 90);
    
    // Темные края (для контраста, но не слишком темные)
    const darkR = Math.max(0, r - 30);
    const darkG = Math.max(0, g - 30);
    const darkB = Math.max(0, b - 30);
    
    gradient.addColorStop(0, `rgb(${lightR}, ${lightG}, ${lightB})`); // ОЧЕНЬ яркий центр
    gradient.addColorStop(0.15, `rgb(${midR}, ${midG}, ${midB})`); // Яркий средний тон
    gradient.addColorStop(0.4, color); // Базовый цвет
    gradient.addColorStop(1, `rgb(${darkR}, ${darkG}, ${darkB})`); // Темные края
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Рельефная внешняя рамка (толстая, контрастная)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 8;
    
    ctx.strokeStyle = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
    ctx.lineWidth = 55; // Толще для рельефности
    ctx.beginPath();
    ctx.arc(512, 512, 450, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
    
    // Внутренняя рамка (рельефная, контрастная)
    ctx.strokeStyle = `rgb(${Math.max(0, r - 15)}, ${Math.max(0, g - 15)}, ${Math.max(0, b - 15)})`;
    ctx.lineWidth = 38;
    ctx.beginPath();
    ctx.arc(512, 512, 400, 0, Math.PI * 2);
    ctx.stroke();
    
    // Дополнительный рельеф - яркая выпуклость по краю (светлая линия для объема, БЕЗ прозрачности)
    ctx.strokeStyle = `rgb(${Math.min(255, r + 150)}, ${Math.min(255, g + 150)}, ${Math.min(255, b + 150)})`;
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.arc(512, 512, 435, 0, Math.PI * 2);
    ctx.stroke();
    
    // Еще одна светлая линия ближе к центру (для дополнительного рельефа, БЕЗ прозрачности)
    ctx.strokeStyle = `rgb(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)})`;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(512, 512, 415, 0, Math.PI * 2);
    ctx.stroke();
    
    // СИМВОЛ АМУЛЕТА - МАКСИМАЛЬНО ЯРКИЙ И КОНТРАСТНЫЙ (зависит от выбранного символа)
    const symbolIcon = symbol === 'horse' ? '🐴' : symbol === 'dragon' ? '🐉' : symbol === 'coin' ? '🪙' : '🦅';
    
    ctx.save();
    
    // Перемещаем начало координат в центр и поворачиваем canvas на -90° (чтобы символ был правильно ориентирован на плоской монете)
    ctx.translate(512, 512);
    ctx.rotate(-Math.PI / 2); // Поворот на -90° чтобы символ был правильно ориентирован
    ctx.translate(-512, -512);
    
    // Темная тень для контраста (полностью черная)
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.font = 'bold 500px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbolIcon, 517, 517); // Тень вниз-вправо
    ctx.fillText(symbolIcon, 507, 507); // Тень вверх-влево
    
    // Золотая/желтая обводка (для максимального контраста)
    ctx.strokeStyle = '#FFD700'; // Золотой
    ctx.lineWidth = 26;
    ctx.font = 'bold 480px Arial';
    ctx.strokeText(symbolIcon, 512, 512);
    
    // Основной символ - МАКСИМАЛЬНО яркий цвет элемента (прямой цвет, БЕЗ screen mode)
    ctx.fillStyle = `rgb(${Math.min(255, r + 220)}, ${Math.min(255, g + 220)}, ${Math.min(255, b + 220)})`;
    ctx.font = 'bold 480px Arial';
    ctx.fillText(symbolIcon, 512, 512);
    
    ctx.restore();
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.flipY = false;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 16;
    
    return tex;
  }, [symbol, color]);

  // Материал с эффектами элемента (особенно для монеты - золотой блеск)
  const material = useMemo(() => {
    // Для ВСЕХ символов - материал с МАКСИМАЛЬНО ЯРКОЙ текстурой и отблесками (все превращаются в монеты)
    const mat = new THREE.MeshStandardMaterial({
      map: coinTexture || undefined,
      color: coinTexture ? '#ffffff' : color, // Если есть текстура - белый для видимости, иначе цвет элемента
      metalness: 0.4, // Небольшой металлический эффект для легкого блеска (не темный)
      roughness: 0.25, // Низкая шероховатость для отблесков при вращении
      // УБРАНО: emissive и emissiveIntensity - убираем подсветку, чтобы амулет не был бледным
    });
    mat.transparent = false;
    mat.opacity = 1.0; // Полностью непрозрачный
    return mat;
  }, [color, baziElement, symbol, coinTexture]);

  // Анимация - ВСЕГДА плоская монета для всех символов, вращается по Z
  useFrame((state) => {
    if (meshRef.current) {
      const finalScale = scale > 0 ? scale : 0;
      meshRef.current.scale.setScalar(finalScale);
      
      // ВСЕ символы - ВСЕГДА монета (лежит плоско)
      meshRef.current.rotation.x = Math.PI / 2; // МОНЕТА ЛЕЖИТ ПЛОСКО - ВСЕГДА!
      meshRef.current.rotation.y = 0;
      
      if (isAnimating && scale > 0) {
        const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.1 + 1;
        meshRef.current.scale.setScalar(finalScale * pulse);
        meshRef.current.rotation.z += 0.03; // Вращение монеты
      } else if (scale > 0) {
        meshRef.current.scale.setScalar(finalScale);
        meshRef.current.rotation.z += 0.02; // Вращение монеты
      }
    }

    // УБРАНО: Анимация свечения - убираем подсветку во время анимации, чтобы амулет не был бледным
    // if (glowRefs.current.length > 0 && glowIntensity > 0) {
    //   const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
    //   glowRefs.current.forEach((glow, index) => {
    //     if (glow) {
    //       const scaleMultiplier = 1.2 + index * 0.15;
    //       glow.scale.setScalar(scale * scaleMultiplier * pulse);
    //       const glowMat = glow.material as THREE.MeshBasicMaterial;
    //       if (glowMat) {
    //         glowMat.opacity = glowIntensity * 0.3 * pulse;
    //       }
    //     }
    //   });
    // }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Основной амулет - В ЦЕНТРЕ, ВИДИМЫЙ, НЕ ПРОЗРАЧНЫЙ */}
      {/* Для монеты - поворачиваем на 90° по X, чтобы она лежала плоско (как монета на столе) */}
      <mesh 
        ref={meshRef} 
        geometry={geometry} 
        material={material} 
        position={[0, 0, 0]}
      />
      
      {/* Волшебные звездочки вокруг амулета */}
      <MagicStars color={color} intensity={scale} />
    </group>
  );
}

// Частицы огня
function FireParticles({ color, intensity }: { color: string; intensity: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 50;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 0.5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.02 * intensity;
        if (positions[i * 3 + 1] > 2) {
          positions[i * 3 + 1] = -2;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.1 * intensity}
        transparent
        opacity={0.8 * intensity}
        sizeAttenuation
      />
    </points>
  );
}

// Волшебные звездочки вокруг амулета
function MagicStars({ color, intensity }: { color: string; intensity: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 30; // Количество звездочек
  
  // Создаем текстуру звездочки
  const starTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const centerX = 32;
    const centerY = 32;
    const outerRadius = 24;
    const innerRadius = 10;

    // Рисуем 5-конечную звезду
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Градиент для звездочки
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, color + '80');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Яркое ядро
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [color]);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Размещаем звездочки на круге вокруг амулета (монета лежит плоско, так что по кругу в плоскости XY)
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.5 + Math.random() * 0.3; // Расстояние от центра (немного варьируется)
      const height = (Math.random() - 0.5) * 0.4; // Немного выше/ниже плоскости монеты
      
      pos[i * 3] = Math.cos(angle) * radius; // X
      pos[i * 3 + 1] = height; // Y (немного выше/ниже плоскости)
      pos[i * 3 + 2] = Math.sin(angle) * radius; // Z
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current && intensity > 0) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      // Вращаем звездочки вокруг центра
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time * 0.3; // Медленное вращение
        const radius = 1.5 + Math.sin(time * 0.5 + i) * 0.2; // Радиус немного пульсирует
        const height = (Math.sin(time * 1.5 + i * 0.5) - 0.5) * 0.4; // Плавающее движение вверх-вниз
        
        positions[i * 3] = Math.cos(angle) * radius; // X
        positions[i * 3 + 1] = height; // Y
        positions[i * 3 + 2] = Math.sin(angle) * radius; // Z
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (intensity <= 0) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={starTexture || undefined}
        color={color}
        size={0.22}
        transparent
        opacity={0.9 * intensity}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Частицы для других элементов
function ElementParticles({ 
  element, 
  color, 
  intensity 
}: { 
  element: BaziElement; 
  color: string; 
  intensity: number;
}) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 30;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.3 + Math.random() * 0.4;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.005;
      particlesRef.current.rotation.x += 0.003;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.08 * intensity}
        transparent
        opacity={0.6 * intensity}
        sizeAttenuation
      />
    </points>
  );
}

// Частицы желания (летят к амулету)
function WishParticles({
  text,
  isAnimating,
  targetPosition,
}: {
  text: string;
  isAnimating: boolean;
  targetPosition: [number, number, number];
}) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = text.length * 3;
  
  const [positions, setPositions] = useState<Float32Array>(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  });

  useFrame(() => {
    if (particlesRef.current && isAnimating) {
      const pos = positions;
      for (let i = 0; i < particleCount; i++) {
        const dx = targetPosition[0] - pos[i * 3];
        const dy = targetPosition[1] - pos[i * 3 + 1];
        const dz = targetPosition[2] - pos[i * 3 + 2];
        
        pos[i * 3] += dx * 0.05;
        pos[i * 3 + 1] += dy * 0.05;
        pos[i * 3 + 2] += dz * 0.05;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      setPositions(new Float32Array(pos));
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#FFD700"
        size={0.15}
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

export default function MagicAmuletTransformation({
  symbol,
  color,
  baziElement,
  wishText,
  onComplete,
  onClose,
}: MagicAmuletTransformationProps) {
  const [stage, setStage] = useState<'initial' | 'wish-absorbing' | 'complete'>('initial');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStage('wish-absorbing');
      setIsAnimating(true);
    }, 500);

    const timer2 = setTimeout(() => {
      setStage('complete');
    }, 3000);

    const timer3 = setTimeout(() => {
      onComplete();
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const symbolInfo = AMULET_SYMBOLS.find(s => s.value === symbol);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="absolute inset-0">
        <Canvas>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.5} />
            {/* Основной свет сверху для отблеска монеты */}
            <directionalLight position={[0, 10, 0]} intensity={2.0} castShadow />
            <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
            <directionalLight position={[-5, 3, -5]} intensity={0.8} />
            {/* Дополнительное освещение для блеска */}
            <pointLight position={[0, 5, 0]} intensity={1.5} color={color} />
            <pointLight position={[0, -5, 0]} intensity={0.8} color={color} />
            {/* Яркий spot light для отблеска на монете */}
            <spotLight position={[0, 10, 5]} angle={0.3} penumbra={0.2} intensity={3.0} color="#FFFFFF" />
            <spotLight position={[8, 8, 8]} angle={0.4} penumbra={0.3} intensity={2.0} />
            
            <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
            
            {(isAnimating || stage !== 'initial') && (
              <>
                <Amulet3D
                  symbol={symbol}
                  color={color}
                  baziElement={baziElement}
                  isAnimating={stage === 'complete' || isAnimating}
                />
                
                {/* Частицы желаний (не показываем, так как все - монеты) */}
              </>
            )}
            
            <OrbitControls enableZoom={false} enablePan={false} />
          </Suspense>
        </Canvas>
      </div>

      {/* Текстовые подсказки */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        {stage === 'initial' && (
          <div className="text-white text-3xl font-bold animate-pulse">
            魔力激活中... (Магия активируется...)
          </div>
        )}
        {stage === 'wish-absorbing' && (
          <div className="text-white text-2xl font-bold">
            {symbolInfo?.icon} {symbolInfo?.label} 吸收愿望...
          </div>
        )}
        {stage === 'complete' && (
          <div className="text-yellow-400 text-4xl font-bold animate-pulse">
            ✨ 完成! ✨
          </div>
        )}
      </div>

      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-3 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
      >
        ✕
      </button>
    </div>
  );
}

