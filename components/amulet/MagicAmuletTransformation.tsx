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
import { AmuletSymbolIcon, SYMBOL_IMAGE_MAP_3D } from './AmuletSymbolIcons';
import { getElementById } from '@/lib/amulet-elements';
import { getPatternById } from '@/lib/amulet-patterns';

interface MagicAmuletTransformationProps {
  symbol: AmuletSymbol;
  color: string;
  baziElement: BaziElement;
  wishText: string;
  elementId?: string; // ID выбранного узора
  patternId?: string; // ID выбранного орнамента (непрерывной линии)
  scalesImageIndex?: number; // Индекс выбранной картинки для символа "весы"
  onComplete: () => void;
  onClose: () => void;
}

// Функция для извлечения цвета из градиента или обычного hex
function extractColorFromGradient(color: string): { r: number; g: number; b: number; actualColor: string } {
  let r = 128, g = 128, b = 160;
  let actualColor = color;
  
  if (color.startsWith('linear-gradient')) {
    const hexMatch = color.match(/#([0-9A-Fa-f]{6})/);
    if (hexMatch) {
      const hex = hexMatch[1];
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      actualColor = `#${hex}`;
    } else {
      r = 102; g = 126; b = 234;
      actualColor = '#667eea';
    }
  } else if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    actualColor = color;
  }
  
  return { r, g, b, actualColor };
}

// 3D амулет (геометрическая форма в зависимости от символа)
function Amulet3D({
  symbol,
  color,
  baziElement,
  isAnimating,
  elementId,
  patternId,
  scalesImageIndex = 0,
}: {
  symbol: AmuletSymbol;
  color: string;
  baziElement: BaziElement;
  isAnimating: boolean;
  elementId?: string;
  patternId?: string;
  scalesImageIndex?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const glowRefs = useRef<THREE.Mesh[]>([]);
  const [scale, setScale] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [coinTexture, setCoinTexture] = useState<THREE.Texture | null>(null);

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

  // Создаем и загружаем текстуру с символом асинхронно
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCoinTexture(null);
      return;
    }

    // Фон - радиальный градиент цвета элемента (с ярким контрастом для рельефа)
    const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
    
    // Обрабатываем градиенты и обычные цвета
    const { r, g, b, actualColor } = extractColorFromGradient(color);
    const isGradient = color.startsWith('linear-gradient');
    
    // ОЧЕНЬ яркий центр (для максимальной яркости фронтальной части)
    const lightR = Math.min(255, r + 180);
    const lightG = Math.min(255, g + 180);
    const lightB = Math.min(255, b + 180);
    
    // Средний тон (очень яркий для фронтальной видимости)
    const midR = Math.min(255, r + 120);
    const midG = Math.min(255, g + 120);
    const midB = Math.min(255, b + 120);
    
    // Средне-темные области (не слишком темные)
    const midDarkR = Math.max(0, r - 20);
    const midDarkG = Math.max(0, g - 20);
    const midDarkB = Math.max(0, b - 20);
    
    // Темные края (для объема, но не слишком темные)
    const darkR = Math.max(0, r - 40);
    const darkG = Math.max(0, g - 40);
    const darkB = Math.max(0, b - 40);
    
    // Если это градиент, создаем реальный градиент на canvas
    if (isGradient) {
      // Извлекаем оба цвета из градиента
      const hexMatches = color.match(/#([0-9A-Fa-f]{6})/g);
      if (hexMatches && hexMatches.length >= 2) {
        const hex1 = hexMatches[0].replace('#', '');
        const hex2 = hexMatches[1].replace('#', '');
        const r1 = parseInt(hex1.substring(0, 2), 16);
        const g1 = parseInt(hex1.substring(2, 4), 16);
        const b1 = parseInt(hex1.substring(4, 6), 16);
        const r2 = parseInt(hex2.substring(0, 2), 16);
        const g2 = parseInt(hex2.substring(2, 4), 16);
        const b2 = parseInt(hex2.substring(4, 6), 16);
        
        // Создаем градиент от центра к краю с двумя цветами
        gradient.addColorStop(0, `rgb(${Math.min(255, r1 + 150)}, ${Math.min(255, g1 + 150)}, ${Math.min(255, b1 + 150)})`);
        gradient.addColorStop(0.3, `rgb(${r1}, ${g1}, ${b1})`);
        gradient.addColorStop(0.5, `rgb(${Math.floor((r1 + r2) / 2)}, ${Math.floor((g1 + g2) / 2)}, ${Math.floor((b1 + b2) / 2)})`);
        gradient.addColorStop(0.7, `rgb(${r2}, ${g2}, ${b2})`);
        gradient.addColorStop(1, `rgb(${Math.max(0, r2 - 40)}, ${Math.max(0, g2 - 40)}, ${Math.max(0, b2 - 40)})`);
      } else {
        // Fallback на один цвет
        gradient.addColorStop(0, `rgb(${lightR}, ${lightG}, ${lightB})`);
        gradient.addColorStop(0.15, `rgb(${midR}, ${midG}, ${midB})`);
        gradient.addColorStop(0.4, actualColor);
        gradient.addColorStop(0.75, `rgb(${midDarkR}, ${midDarkG}, ${midDarkB})`);
        gradient.addColorStop(1, `rgb(${darkR}, ${darkG}, ${darkB})`);
      }
    } else {
      gradient.addColorStop(0, `rgb(${lightR}, ${lightG}, ${lightB})`); // ОЧЕНЬ яркий центр (блик)
      gradient.addColorStop(0.15, `rgb(${midR}, ${midG}, ${midB})`); // Очень яркий средний тон
      gradient.addColorStop(0.4, actualColor); // Базовый цвет
      gradient.addColorStop(0.75, `rgb(${midDarkR}, ${midDarkG}, ${midDarkB})`); // Средне-темные области
      gradient.addColorStop(1, `rgb(${darkR}, ${darkG}, ${darkB})`); // Темные края (но не слишком темные)
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Рельефная внешняя рамка (толстая, контрастная) - с глубокими тенями для металлического эффекта
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 1.0)';
    ctx.shadowBlur = 50; // Усиленная тень для глубины
    ctx.shadowOffsetX = 12; // Больше смещение для объема
    ctx.shadowOffsetY = 12;
    
    // Темная рамка с металлическим оттенком
    ctx.strokeStyle = `rgb(${Math.max(0, r - 60)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 60)})`;
    ctx.lineWidth = 35;
    ctx.beginPath();
    ctx.arc(512, 512, 450, 0, Math.PI * 2);
    ctx.stroke();
    
    // Внутренний блик на внешней рамке (металлический эффект)
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = -6;
    ctx.shadowOffsetY = -6;
    ctx.strokeStyle = `rgb(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)})`;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(512, 512, 450, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
    
    // Дополнительный рельеф - яркая выпуклость по краю (металлический блик)
    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = -5;
    ctx.shadowOffsetY = -5;
    ctx.strokeStyle = `rgb(${Math.min(255, r + 180)}, ${Math.min(255, g + 180)}, ${Math.min(255, b + 180)})`;
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.arc(512, 512, 435, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    
    // Получаем путь к картинке символа
    const symbolImageFiles = SYMBOL_IMAGE_MAP_3D[symbol] || [];
    // Для символа "весы" используем выбранный индекс, для остальных - первую картинку
    const imageIndex = symbol === 'scales' ? scalesImageIndex : 0;
    const symbolImageFile = symbolImageFiles[imageIndex] || symbolImageFiles[0] || 'круг.png'; // Fallback
    
    // Параметры для узоров (элементов) и орнаментов (непрерывных линий)
    const elementRadius = 380; // Радиус расположения узоров (элементов)
    const elementSize = 60; // Размер каждого элемента узора
    const elementCount = 12; // Количество элементов по окружности
    const patternRadius = 400 * 1.2; // Радиус для орнамента (непрерывной линии) - увеличен в 1.2 раза, у самой границы амулета
    const patternLineWidth = 8; // Толщина линии орнамента
    
    // Создаем текстуру с улучшенными настройками для металлического эффекта
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.flipY = false;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 16;
    // Улучшаем качество текстуры для более четкого металлического вида
    tex.format = THREE.RGBAFormat;
    
    // Создаем нормальную карту для фактурных кругов (выпуклых/вдавленных)
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = 1024;
    normalCanvas.height = 1024;
    const normalCtx = normalCanvas.getContext('2d');
    if (normalCtx) {
      // Базовый цвет для плоской поверхности (нормаль направлена вверх)
      // В нормальных картах: R=128, G=128, B=255 для плоской поверхности (Z=1, X=0, Y=0)
      normalCtx.fillStyle = 'rgb(128, 128, 255)';
      normalCtx.fillRect(0, 0, 1024, 1024);
      
      // Создаем нормальную карту пиксель за пикселем для точного контроля
      const imageData = normalCtx.createImageData(1024, 1024);
      const data = imageData.data;
      
      for (let y = 0; y < 1024; y++) {
        for (let x = 0; x < 1024; x++) {
          const dx = x - 512;
          const dy = y - 512;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const index = (y * 1024 + x) * 4;
          
          // Внешняя рамка (440-450) - ВЫПУКЛАЯ (усиленная)
          if (dist >= 440 && dist <= 450) {
            // Нормаль наклонена наружу от центра (выпуклая) - УСИЛЕННАЯ
            const angle = Math.atan2(dy, dx);
            const normalX = Math.cos(angle) * 0.6; // X компонент нормали (наклон наружу) - УВЕЛИЧЕН
            const normalY = Math.sin(angle) * 0.6; // Y компонент нормали (наклон наружу) - УВЕЛИЧЕН
            const normalZ = 0.8; // Z компонент нормали (меньше для большего наклона)
            
            // Конвертируем нормаль в RGB (128 = 0, 255 = 1)
            data[index] = Math.round(128 + normalX * 127);     // R
            data[index + 1] = Math.round(128 + normalY * 127);   // G
            data[index + 2] = Math.round(128 + normalZ * 127);   // B
            data[index + 3] = 255; // Alpha
          }
          // Контрастный круг (420-435) - ВДАВЛЕННЫЙ
          else if (dist >= 420 && dist <= 435) {
            // Нормаль наклонена внутрь к центру (вдавленная)
            const angle = Math.atan2(dy, dx);
            const normalX = -Math.cos(angle) * 0.4; // X компонент нормали (наклон внутрь)
            const normalY = -Math.sin(angle) * 0.4; // Y компонент нормали (наклон внутрь)
            const normalZ = 0.85; // Z компонент нормали (меньше для вдавленности)
            
            // Конвертируем нормаль в RGB
            data[index] = Math.round(128 + normalX * 127);     // R
            data[index + 1] = Math.round(128 + normalY * 127);   // G
            data[index + 2] = Math.round(128 + normalZ * 127);   // B
            data[index + 3] = 255; // Alpha
          }
          // Остальная область - плоская
          else {
            data[index] = 128;     // R
            data[index + 1] = 128;   // G
            data[index + 2] = 255;   // B (нормаль вверх)
            data[index + 3] = 255;   // Alpha
          }
        }
      }
      
      normalCtx.putImageData(imageData, 0, 0);
    }
    
    const normalTex = new THREE.CanvasTexture(normalCanvas);
    normalTex.wrapS = THREE.ClampToEdgeWrapping;
    normalTex.wrapT = THREE.ClampToEdgeWrapping;
    normalTex.flipY = false;
    normalTex.generateMipmaps = true;
    normalTex.minFilter = THREE.LinearMipmapLinearFilter;
    normalTex.magFilter = THREE.LinearFilter;
    
    // Сохраняем нормальную карту для использования в материале
    (tex as any).normalMap = normalTex;
    
    // Устанавливаем временную текстуру без символа
    setCoinTexture(tex);
    
      // Функция для рисования всего (орнамента, узоров и символа)
      const drawEverything = (symbolImg: HTMLImageElement) => {
        ctx.save();
        
        // Рисуем орнамент (непрерывную линию) по внутренней границе (если выбран)
        if (patternId && patternId !== 'none') {
          const pattern = getPatternById(patternId);
          if (pattern && pattern.draw) {
            pattern.draw(ctx, 512, 512, patternRadius, patternLineWidth);
          }
        }
        
        // Рисуем узоры (элементы) по окружности (если выбран) - БЕЗ поворота canvas
        if (elementId && elementId !== 'none') {
          const element = getElementById(elementId);
          if (element && element.draw) {
            ctx.save();
            ctx.translate(512, 512);
            
            // Увеличиваем размер звездочек (в 1.54 раза от обычного, т.е. в 2/1.3 раза)
            // Увеличиваем размер капли в 1.7 раза
            let currentElementSize = elementSize;
            if (element.id === 'star-neon' || element.id === 'star-red' || element.id === 'star-gold') {
              currentElementSize = elementSize * (2 / 1.3);
            } else if (element.id === 'drop') {
              currentElementSize = elementSize * 1.7;
            }
            
            const angleStep = (Math.PI * 2) / elementCount;
            
            for (let i = 0; i < elementCount; i++) {
              ctx.save();
              ctx.rotate(i * angleStep);
              ctx.translate(0, -elementRadius); // Перемещаем к радиусу узора
              
              // Рисуем элемент узора через функцию
              element.draw(ctx, 0, 0, currentElementSize);
              
              ctx.restore();
            }
            
            ctx.restore();
          }
        }
        
        // Размер изображения символа (занимает большую часть центра)
      const symbolSize = 600;
      
      // Золотая обводка (рисуем круг вокруг символа) - БЕЗ поворота и отражения
      // С металлическим отливом через градиент и тени
      ctx.save();
      
      // Внешняя тень для глубины
      ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      // Градиент для металлического отлива
      const gradient = ctx.createRadialGradient(512, 512, 319, 512, 512, 339);
      gradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)'); // Яркий центр
      gradient.addColorStop(0.5, 'rgba(255, 215, 0, 1.0)'); // Золотой
      gradient.addColorStop(1, 'rgba(184, 134, 11, 1.0)'); // Темное золото
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 24; // Немного толще для лучшей видимости
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.arc(512, 512, 329, 0, Math.PI * 2);
      ctx.stroke();
      
      // Внутренний блик для металлического эффекта
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = -2;
      ctx.shadowOffsetY = -2;
      ctx.strokeStyle = 'rgba(255, 255, 220, 0.9)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(512, 512, 329, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
      
      // Перемещаем начало координат в центр и поворачиваем canvas на -90° для правильной ориентации символа
      ctx.save();
      ctx.translate(512, 512);
      ctx.rotate(-Math.PI / 2); // Поворот на -90° против часовой стрелки (нужен для правильной ориентации)
      ctx.scale(-1, 1); // Горизонтальное отражение (зеркальное отражение по вертикальной оси)
      
      // Темная тень для контраста (полностью черная, сдвинута)
      ctx.globalAlpha = 0.5;
      ctx.drawImage(symbolImg, -symbolSize / 2 + 5, -symbolSize / 2 + 5, symbolSize, symbolSize);
      ctx.globalAlpha = 1.0;
      
      // Основной символ - яркий и контрастный (с горизонтальным отражением)
      ctx.filter = 'brightness(1.3) contrast(1.2)';
      ctx.drawImage(symbolImg, -symbolSize / 2, -symbolSize / 2, symbolSize, symbolSize);
      ctx.filter = 'none';
      
      ctx.restore();
      
      ctx.restore();
      
      // Обновляем текстуру
      tex.needsUpdate = true;
      setCoinTexture(tex);
    };
    
    // Загружаем изображение символа асинхронно
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      drawEverything(img);
    };
    img.onerror = () => {
      console.warn(`Не удалось загрузить изображение для символа ${symbol}`);
    };
    img.src = `/pictures/${symbolImageFile}`;
    
    // Cleanup функция
    return () => {
      if (tex) {
        tex.dispose();
      }
    };
  }, [symbol, color, elementId, patternId, scalesImageIndex]);

  // Материал с эффектами элемента (особенно для монеты - золотой блеск)
  const material = useMemo(() => {
    // Для ВСЕХ символов - материал с МАКСИМАЛЬНО ЯРКОЙ текстурой и отблесками (все превращаются в монеты)
    const { actualColor: extractedColor } = extractColorFromGradient(color);
    const materialConfig: any = {
      color: coinTexture ? '#ffffff' : extractedColor, // Если есть текстура - белый для видимости, иначе цвет элемента
      metalness: 0.6, // Умеренный металлический эффект (меньше зеркальности на ребре)
      roughness: 0.3, // Средняя шероховатость (меньше отражений на ребре, больше видимости фронтально)
      envMapIntensity: 0.8, // Умеренное отражение окружения
    };
    
    // Добавляем текстуру только если она загружена
    if (coinTexture) {
      materialConfig.map = coinTexture;
      // Добавляем нормальную карту для фактурных кругов (выпуклых/вдавленных)
      if ((coinTexture as any).normalMap) {
        materialConfig.normalMap = (coinTexture as any).normalMap;
        materialConfig.normalScale = new THREE.Vector2(2.5, 2.5); // Усиленная интенсивность для видимого эффекта
      }
    }
    
    const mat = new THREE.MeshStandardMaterial(materialConfig);
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
        color={extractColorFromGradient(color).actualColor}
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
    const { actualColor: extractedColor } = extractColorFromGradient(color);
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.5, extractedColor);
    gradient.addColorStop(1, extractedColor + '80');
    
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
        color={extractColorFromGradient(color).actualColor}
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
        color={extractColorFromGradient(color).actualColor}
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
  elementId,
  patternId,
  scalesImageIndex = 0,
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
    }, 8000); // Увеличено до 8 секунд (было 5.5) - анимация завершается через 3 сек, добавляем 5 секунд для просмотра результата

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
            <ambientLight intensity={0.7} />
            {/* Основной свет спереди (по оси Z) для яркости фронтальной части */}
            <directionalLight position={[0, 0, 10]} intensity={2.0} />
            {/* Свет сверху для отблеска монеты */}
            <directionalLight position={[0, 10, 0]} intensity={1.2} />
            <directionalLight position={[5, 8, 5]} intensity={0.8} />
            {/* Дополнительное освещение для блеска фронтальной части */}
            <pointLight position={[0, 0, 8]} intensity={1.5} color={extractColorFromGradient(color).actualColor} />
            {/* Яркий spot light спереди для фронтальной части */}
            <spotLight position={[0, 0, 10]} angle={0.5} penumbra={0.3} intensity={2.375} color="#FFFFFF" />
            
            <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
            
            {(isAnimating || stage !== 'initial') && (
              <>
                <Amulet3D
                  symbol={symbol}
                  color={color}
                  baziElement={baziElement}
                  isAnimating={stage === 'complete' || isAnimating}
                  elementId={elementId}
                  patternId={patternId}
                  scalesImageIndex={scalesImageIndex}
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
          <div className="text-white text-2xl font-bold flex items-center gap-2">
            <AmuletSymbolIcon symbolId={symbol || ''} size={32} />
            <span>{symbolInfo?.label} 吸收愿望...</span>
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

