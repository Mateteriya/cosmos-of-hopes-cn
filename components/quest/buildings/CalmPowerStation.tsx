'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ——— Ручей ———
const STREAM_WIDTH = 0.95;
const STREAM_BAND_INNER_MARGIN = 0.05;
const STREAM_BAND_OUTER_MARGIN = 0.22;
const STREAM_CYCLE_DURATION = 12;
const STREAM_COLORS = [
  0x6b9ed4, 0x7eb0e0, 0x8ec4e8, 0x8b7ec8, 0x88a8d0, 0x6b9ed4,
];

// ——— Волны от углов ———
const RIPPLE_TIER_COUNT = 4; // Уменьшено для производительности (было 6)
const RIPPLE_RING_COUNT = 4 * RIPPLE_TIER_COUNT; // 16 (было 24)
const RIPPLE_COLOR_START = 0x2d4a70;
const RIPPLE_COLOR_END = 0x8ec8f0;
const RIPPLE_COLOR_END_TIER1 = 0x6aa0d8;
const RIPPLE_COLOR_END_BY_TIER: number[] = [
  RIPPLE_COLOR_END,           // 0 — большой
  RIPPLE_COLOR_END_TIER1,     // 1 — средний
  RIPPLE_COLOR_END,           // 2 — малый
  0x2d5a8a,                   // 3 — темно-голубой
  0x4a7ec8,                   // 4 — голубой
  0x4a5a9e,                   // 5 — индиго (объединён 5,6,7)
];
const RIPPLE_MIN_SCALE = 0.5;
const RIPPLE_MAX_SCALE = 1.35;
const RIPPLE_MAX_SCALE_FAR = 2.0;
const RIPPLE_GROW_DURATION_MIN = 1.5;
const RIPPLE_GROW_DURATION_MAX = 2.2;
const RIPPLE_OPACITY = 0.22;
const RIPPLE_OUTER = 0.28;
const RIPPLE_WAVE_AMP = 0.006;
const RIPPLE_INNER_BY_TIER = [0.277, 0.275, 0.273, 0.271, 0.269, 0.267];
const RIPPLE_BASE_MAX_BY_TIER = [2.0, 1.73, 1.458, 1.35, 1.255, 1.18];
const RIPPLE_AMP_MULT_BY_TIER = [2.5, 2.2, 1.9, 2.3, 2.0, 1.7];
const RIPPLE_THICKNESS_GROW = 1.0;

function createIrregularRing(
  innerR: number,
  outerR: number,
  phases: [number, number, number],
  ampMultiplier = 1
): THREE.BufferGeometry {
  const segments = 64;
  const amp = RIPPLE_WAVE_AMP * ampMultiplier;
  const [p1, p2, p3] = phases;
  const wave = (a: number) =>
    Math.sin(a * 12 + p1) * 0.6 + Math.sin(a * 14 + p2) * 0.3 + Math.sin(a * 16 + p3) * 0.2;
  const positions: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const w = wave(angle);
    const rIn = innerR + amp * w;
    const rOut = outerR + amp * w;
    positions.push(rIn * Math.cos(angle), rIn * Math.sin(angle), 0);
    positions.push(rOut * Math.cos(angle), rOut * Math.sin(angle), 0);
  }
  const indices: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, b, c, b, d, c);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// ——— Полоски-блики ———
const GLINT_COUNT = 12;
const GLINT_RIPPLE_COUNT = 36;
const GLINT_RIPPLE2_COUNT = 48;
const GLINT_STRIPE_LENGTH = 0.2;
const GLINT_STRIPE_WIDTH = 0.018;
const GLINT_STRIPE_WAVES = 2.0;
const GLINT_STRIPE_WAVE_AMPLITUDE = 0.011;
const GLINT_STRIPE_SEGMENTS = 24;
const GLINT_MAIN_OPACITY_MIN = 0.09;
const GLINT_MAIN_OPACITY_MAX = 0.36;
const GLINT_RIPPLE_OPACITY_MIN = 0.04;
const GLINT_RIPPLE_OPACITY_MAX = 0.18;
const GLINT_RIPPLE2_OPACITY_MIN = 0.012;
const GLINT_RIPPLE2_OPACITY_MAX = 0.065;
const GLINT_RIPPLE_COLOR = 0x7eb0e0;
const GLINT_PULSE_SPEED = 1.1;
const GLINT_DRIFT_AMOUNT = 0.028;
const GLINT_DRIFT_SPEED = 0.58;
const GLINT_EXCLUDE_CORNER_RADIUS = 0.58;
const GLINT_ANGLE_RIGHT_LEFT = Math.PI / 2;
const GLINT_ANGLE_FRONT_BACK = 0;
// ——— Мостик и арочная дверь ———
const BRIDGE_FRONT_Z = 1; // фронтальная сторона: +Z
const BRIDGE_WIDTH = 0.5;
const BRIDGE_ARCH_HEIGHT = 0.12;
const RAILING_RADIUS = 0.022;
// Поручни на уровне половины высоты проёма (для рук персонажей)
const RAILING_TUBULAR_SEGMENTS = 24;
const RAILING_RADIAL_SEGMENTS = 8;
const DOOR_WIDTH = 0.4;
const DOOR_HEIGHT = 0.45;
const DOOR_ARCH_RADIUS = 0.2;
const DOOR_Y_OFFSET_FRAC = 0.25; // дверь: 1/4 высоты стены от низа
const DOOR_FRAME_THICKNESS = 0.04; // толщина рамки
const DOOR_FRAME_DEPTH = 0.025; // глубина выступа рамки

// Реакция на касание: большой отступ от стены, плавное движение (без резкости)
const GLINT_IMPACT_REACT_AMPLITUDE = 0.058; // больше смещение — полоски дальше отходят от стены
const GLINT_IMPACT_REACT_DECAY = 1.5;
const GLINT_IMPACT_REACT_DURATION = 3.5;
const GLINT_IMPACT_WAVE_SPEED = 0.36; // медленнее волна — плавнее движение
const GLINT_IMPACT_WAVELENGTH = 0.45;
const GLINT_IMPACT_RAMP = 0.55; // более плавное начало реакции

interface CalmPowerStationProps {
  position: [number, number, number];
  active?: boolean;
  level?: number;
}

export default function CalmPowerStation({
  position,
  active = true,
  level = 1,
}: CalmPowerStationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const floatRef = useRef<THREE.Group>(null);
  const bridgeFloatingRef = useRef<THREE.Mesh>(null);
  const bridgeRailingFloatingLeftRef = useRef<THREE.Mesh>(null);
  const bridgeRailingFloatingRightRef = useRef<THREE.Mesh>(null);
  const streamMeshRef = useRef<THREE.Mesh>(null);
  const streamUnderFoundationRef = useRef<THREE.Mesh>(null);
  const rippleMeshRef = useRef<(THREE.Mesh | null)[]>([]);
  const prevFloatYRef = useRef(0.02);
  const lastImpactTimeRef = useRef(-10);

  const baseWidth = 1.8;
  const baseHeight = 1.5 * level;
  const baseDepth = 1.8;
  const foundationHeight = 0.1;
  const floatAmplitude = 0.04;
  // Расчёт уровней (сетка y=0, группа на position[1]=baseHeight/2):
  // Ручей вокруг здания и вода под фундаментом — строго НА сетке (минимальный offset 0.002 выше для видимости).
  // Ножки здания при нижней точке парения касаются воды под фундаментом.
  const GRID_OFFSET = 0.015;
  const streamY = -baseHeight / 2 + GRID_OFFSET;
  const streamUnderY = -baseHeight / 2 + 0.014;
  const streamUnderThickness = 0.006;
  const floatMinGap = 0.002;
  const foundationCenterY = -baseHeight / 2 + foundationHeight / 2;
  const footBottomLocal = foundationCenterY - foundationHeight / 2 - 0.09 / 12 - 0.09 / 12;
  const groupY = position[1];
  const floatBaseY = streamUnderY - footBottomLocal + floatAmplitude - 0.01;

  const buildingCenterY =
    -baseHeight / 2 + foundationHeight + (baseHeight - foundationHeight) / 2;
  const roofY =
    -baseHeight / 2 +
    foundationHeight +
    (baseHeight - foundationHeight) +
    0.06;

  const wallHeight = baseHeight - foundationHeight;
  const wallBottomY = -baseHeight / 2 + foundationHeight;
  const doorCenterY = wallBottomY + wallHeight * DOOR_Y_OFFSET_FRAC + DOOR_HEIGHT / 2;
  const doorLocalY = doorCenterY - buildingCenterY; // позиция двери относительно группы здания
  const doorThresholdY = doorCenterY - DOOR_HEIGHT / 2; // порог проёма (низ двери)
  const doorRectHeight = DOOR_HEIGHT - DOOR_ARCH_RADIUS; // высота прямоугольной части двери
  const hd = baseDepth / 2;
  const gap = 0.06;
  const streamWidth = STREAM_WIDTH;
  const landZ = hd + gap + streamWidth + 0.15;

  // Цвета экстерьера: спокойный голубой, ярко-синяя крыша
  const exteriorPearl = new THREE.Color(0x9ac0db); // мягкий спокойный голубой
  const exteriorGolden = new THREE.Color(0x1e90ff); // ярко-синий (dodger blue) — крыша, фундамент
  const exteriorBlue = new THREE.Color(0x87cefa); // light sky blue
  const exteriorGlow = new THREE.Color(0x7eb3d4); // приглушённое голубое свечение

  // Мост и перила: сиренево-фиолетовые, без зелени/серости, с лёгким неоном
  const bridgeColor = new THREE.Color(0xb8a0d8); // сиреневый — настил моста
  const bridgeGlow = new THREE.Color(0x9370db); // фиолетовое свечение моста
  const railingColor = new THREE.Color(0xd8c8f0); // светло-сиреневый — перила (отличается от моста)
  const railingGlow = new THREE.Color(0xda70d6); // орхидея — неоновое свечение перил

  // Цвета интерьера: светлые, мягкие
  const interiorWallColor = new THREE.Color(0xf0e6f6); // светло-сиреневый — задняя стена
  const interiorSideColor = new THREE.Color(0x87ceeb); // светло-голубой sky blue — боковые стены
  const interiorSideGlow = new THREE.Color(0x6eb5e0); // голубое свечение для боковых стен
  const interiorFloorColor = new THREE.Color(0x8b7ec8); // фиолетовый как газ — пол
  const interiorCeilingColor = new THREE.Color(0xf5f0ff); // светлый лавандовый — потолок
  const interiorGlow = new THREE.Color(0xc9a0dc); // мягкий сиреневый для свечения

  // Общая плавная волнистая граница ручья — полярные координаты с волной, как у берега (без углов)
  const streamOuterSmoothBoundary = useMemo(() => {
    const gap = 0.06;
    const streamWidth = STREAM_WIDTH;
    const baseHalfW = baseWidth / 2 + gap + streamWidth;
    const baseHalfD = baseDepth / 2 + gap + streamWidth;
    const waveAmp1 = 0.10;
    const waveAmp2 = 0.06;
    const steps = 96;
    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 2;
      const wave = waveAmp1 * Math.sin(angle * 4) + waveAmp2 * Math.cos(angle * 6);
      const x = Math.cos(angle) * (baseHalfW + wave);
      const z = Math.sin(angle) * (baseHalfD + wave);
      points.push([x, z]);
    }
    const n = points.length;
    const normals: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const prev = points[(i - 1 + n) % n];
      const next = points[(i + 1) % n];
      const tx = next[0] - prev[0];
      const tz = next[1] - prev[1];
      const d = Math.hypot(tx, tz);
      const outX = d > 1e-6 ? -tz / d : 1;
      const outZ = d > 1e-6 ? tx / d : 0;
      normals.push([outX, outZ]);
    }
    return { points, normals };
  }, [baseWidth, baseDepth]);

  // Геометрия ручья: заполнение по плавной внешней границе (минус прямоугольник здания)
  const streamGeometry = useMemo(() => {
    const gap = 0.06;
    const hw = baseWidth / 2 + gap;
    const hd = baseDepth / 2 + gap;
    const outer = streamOuterSmoothBoundary.points;
    const shape = new THREE.Shape();
    shape.moveTo(outer[0][0], outer[0][1]);
    for (let i = 1; i < outer.length; i++) shape.lineTo(outer[i][0], outer[i][1]);
    shape.lineTo(outer[0][0], outer[0][1]);
    const hole = new THREE.Path();
    hole.moveTo(hw, hd);
    hole.lineTo(-hw, hd);
    hole.lineTo(-hw, -hd);
    hole.lineTo(hw, -hd);
    hole.lineTo(hw, hd);
    shape.holes.push(hole);
    const geom = new THREE.ShapeGeometry(shape);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [streamOuterSmoothBoundary, baseWidth, baseDepth]);

  // Дно ручья — та же форма, создаёт эффект глубины
  const streamBottomGeometry = useMemo(() => {
    const gap = 0.06;
    const hw = baseWidth / 2 + gap;
    const hd = baseDepth / 2 + gap;
    const outer = streamOuterSmoothBoundary.points;
    const shape = new THREE.Shape();
    shape.moveTo(outer[0][0], outer[0][1]);
    for (let i = 1; i < outer.length; i++) shape.lineTo(outer[i][0], outer[i][1]);
    shape.lineTo(outer[0][0], outer[0][1]);
    const hole = new THREE.Path();
    hole.moveTo(hw, hd);
    hole.lineTo(-hw, hd);
    hole.lineTo(-hw, -hd);
    hole.lineTo(hw, -hd);
    hole.lineTo(hw, hd);
    shape.holes.push(hole);
    const geom = new THREE.ShapeGeometry(shape);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [streamOuterSmoothBoundary, baseWidth, baseDepth]);

  // Фронтальная стена (+Z) с арочным проёмом — прямоугольник с дыркой
  const frontWallWithDoorGeometry = useMemo(() => {
    const hw = baseWidth / 2;
    const wallTop = wallBottomY + wallHeight;
    const relBottom = wallBottomY - buildingCenterY;
    const relTop = wallTop - buildingCenterY;
    const shape = new THREE.Shape();
    shape.moveTo(-hw, relBottom);
    shape.lineTo(-hw, relTop);
    shape.lineTo(hw, relTop);
    shape.lineTo(hw, relBottom);
    shape.lineTo(-hw, relBottom);
    const doorW = DOOR_WIDTH / 2;
    const doorBottom = doorCenterY - buildingCenterY - DOOR_HEIGHT / 2;
    const hRect = DOOR_HEIGHT - DOOR_ARCH_RADIUS;
    const hole = new THREE.Path();
    hole.moveTo(-doorW, doorBottom);
    hole.lineTo(doorW, doorBottom);
    hole.lineTo(doorW, doorBottom + hRect);
    hole.absarc(0, doorBottom + hRect + DOOR_ARCH_RADIUS, DOOR_ARCH_RADIUS, 0, Math.PI, false);
    hole.lineTo(-doorW, doorBottom + hRect);
    hole.lineTo(-doorW, doorBottom);
    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape);
  }, [wallBottomY, wallHeight, doorCenterY, buildingCenterY]);

  // Мост: статичная часть (от суши до середины) и парящая (от середины до порога проёма)
  const BRIDGE_SPLIT = 0.5; // t: 0..0.5 статика, 0.5..1 парящая
  const bridgeStaticGeometry = useMemo(() => {
    const segments = 12;
    const hb = BRIDGE_WIDTH / 2;
    const wallZ = hd - 0.015;
    const positions: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * BRIDGE_SPLIT;
      const rise = 1 - (1 - t) * (1 - t);
      const y = streamY + (doorThresholdY - streamY) * rise;
      const z = landZ + (wallZ - landZ) * t;
      positions.push(-hb, y, z, hb, y, z);
    }
    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, d, a, d, c);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [streamY, doorThresholdY, hd, landZ]);

  const bridgeFloatingGeometry = useMemo(() => {
    const segments = 12;
    const hb = BRIDGE_WIDTH / 2;
    const wallZ = hd - 0.015;
    const midT = BRIDGE_SPLIT;
    const midRise = 1 - (1 - midT) * (1 - midT);
    const midY = streamY + (doorThresholdY - streamY) * midRise;
    const midZ = landZ + (wallZ - landZ) * midT;
    const startYLocal = midY - buildingCenterY;
    const endYLocal = doorLocalY - DOOR_HEIGHT / 2;
    const positions: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = BRIDGE_SPLIT + (i / segments) * (1 - BRIDGE_SPLIT);
      const rise = 1 - (1 - t) * (1 - t);
      const tLocal = (t - BRIDGE_SPLIT) / (1 - BRIDGE_SPLIT);
      const y = startYLocal + (endYLocal - startYLocal) * tLocal;
      const z = midZ + (wallZ - midZ) * (i / segments);
      positions.push(-hb, y, z, hb, y, z);
    }
    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, d, a, d, c);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [streamY, doorThresholdY, buildingCenterY, doorLocalY, hd, landZ]);

  // Перила: статичная часть (трубка по кривой), парящая — BufferGeometry с обновляемой первой точкой
  const bridgeRailingStaticLeft = useMemo(() => {
    const hb = BRIDGE_WIDTH / 2;
    const wallZ = hd - 0.015;
    const midZ = landZ + (wallZ - landZ) * BRIDGE_SPLIT;
    const yAtLand = streamY + 0.06;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const z = landZ + (midZ - landZ) * t;
      const y = yAtLand + (doorCenterY - yAtLand) * t;
      points.push(new THREE.Vector3(-hb, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, RAILING_TUBULAR_SEGMENTS, RAILING_RADIUS, RAILING_RADIAL_SEGMENTS);
  }, [streamY, doorCenterY, hd, landZ]);

  const bridgeRailingStaticRight = useMemo(() => {
    const hb = BRIDGE_WIDTH / 2;
    const wallZ = hd - 0.015;
    const midZ = landZ + (wallZ - landZ) * BRIDGE_SPLIT;
    const yAtLand = streamY + 0.06;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const z = landZ + (midZ - landZ) * t;
      const y = yAtLand + (doorCenterY - yAtLand) * t;
      points.push(new THREE.Vector3(hb, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, RAILING_TUBULAR_SEGMENTS, RAILING_RADIUS, RAILING_RADIAL_SEGMENTS);
  }, [streamY, doorCenterY, hd, landZ]);

  const bridgeRailingFloatingLeft = useMemo(() => {
    const hb = -BRIDGE_WIDTH / 2;
    const wallZ = hd - 0.015;
    const midZ = landZ + (wallZ - landZ) * BRIDGE_SPLIT;
    const yLocal = doorLocalY;
    const segments = RAILING_TUBULAR_SEGMENTS;
    const radial = RAILING_RADIAL_SEGMENTS;
    const positions: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const z = midZ + ((wallZ - midZ) * i) / segments;
      for (let j = 0; j <= radial; j++) {
        const angle = (j / radial) * Math.PI * 2;
        positions.push(hb + RAILING_RADIUS * Math.cos(angle), yLocal + RAILING_RADIUS * Math.sin(angle), z);
      }
    }
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radial; j++) {
        const a = i * (radial + 1) + j;
        const b = a + 1;
        const c = a + (radial + 1);
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [doorLocalY, hd, landZ]);

  const bridgeRailingFloatingRight = useMemo(() => {
    const hb = BRIDGE_WIDTH / 2;
    const wallZ = hd - 0.015;
    const midZ = landZ + (wallZ - landZ) * BRIDGE_SPLIT;
    const yLocal = doorLocalY;
    const segments = RAILING_TUBULAR_SEGMENTS;
    const radial = RAILING_RADIAL_SEGMENTS;
    const positions: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const z = midZ + ((wallZ - midZ) * i) / segments;
      for (let j = 0; j <= radial; j++) {
        const angle = (j / radial) * Math.PI * 2;
        positions.push(hb + RAILING_RADIUS * Math.cos(angle), yLocal + RAILING_RADIUS * Math.sin(angle), z);
      }
    }
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radial; j++) {
        const a = i * (radial + 1) + j;
        const b = a + 1;
        const c = a + (radial + 1);
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [doorLocalY, hd, landZ]);

  // Центры волн — чётко под углами здания
  const cornerPositions = useMemo<[number, number, number][]>(() => {
    const y = streamY + 0.002;
    const hw = baseWidth / 2;
    const hd = baseDepth / 2;
    return [
      [hw, y, hd],
      [-hw, y, hd],
      [-hw, y, -hd],
      [hw, y, -hd],
    ];
  }, [streamY, baseWidth, baseDepth]);

  // Волны — только ref, без React state (state не успевает за useFrame)
  const RIPPLE_THICK_STEPS = 2; // Уменьшено для производительности
  type RippleSlot = {
    scale: number;
    opacity: number;
    t: number;
    lastThickStep: number;
    cornerIndex: number;
    maxScale: number;
    spawnTime: number;
    layerY: number;
    tier: number;
    duration: number;
    shapePhases: [number, number, number];
  };
  const nextSlotIndexRef = useRef(0);
  const rippleSlotsRef = useRef<RippleSlot[]>(
    Array.from({ length: RIPPLE_RING_COUNT }, () => ({
      scale: RIPPLE_MAX_SCALE_FAR + 1,
      opacity: 0,
      t: 1,
      lastThickStep: -1,
      cornerIndex: 0,
      maxScale: RIPPLE_MAX_SCALE,
      spawnTime: -999,
      layerY: 0,
      tier: 0,
      duration: RIPPLE_GROW_DURATION_MIN,
      shapePhases: [0, 0, 0],
    }))
  );

  const rippleGeometries = useMemo(() => {
    const outer = RIPPLE_OUTER;
    return RIPPLE_INNER_BY_TIER.map(
      (inner) => new THREE.RingGeometry(inner, outer, 32) as THREE.BufferGeometry
    );
  }, []);

  // Кэш геометрий для ripple колец (ограничен по размеру для предотвращения утечки памяти)
  const RIPPLE_CACHE_MAX_SIZE = 100;
  const rippleGeometryCache = useRef<Map<string, THREE.BufferGeometry>>(new Map());
  const cleanupRippleCache = () => {
    const cache = rippleGeometryCache.current;
    if (cache.size > RIPPLE_CACHE_MAX_SIZE) {
      const keysToDelete = Array.from(cache.keys()).slice(0, cache.size - RIPPLE_CACHE_MAX_SIZE / 2);
      for (const key of keysToDelete) {
        const geom = cache.get(key);
        if (geom) geom.dispose();
        cache.delete(key);
      }
    }
  };

  // Пул позиций полосок по всей поверхности ручья (исключая зоны углов)
  type GlintItem = {
    x: number;
    z: number;
    phase: number;
    scaleLength: number;
    scaleWidth: number;
    angleIndex: 0 | 1;
    variant: 0 | 1 | 2;
  };
  const seed = (i: number) => ((i * 0.382 + 0.618) % 1);

  // Углы здания — зона волн-кругов, исключаем полоски оттуда
  const corners: [number, number][] = [
    [baseWidth / 2, baseDepth / 2],
    [-baseWidth / 2, baseDepth / 2],
    [-baseWidth / 2, -baseDepth / 2],
    [baseWidth / 2, -baseDepth / 2],
  ];
  const distToCorner = (x: number, z: number) =>
    Math.min(...corners.map(([cx, cz]) => Math.hypot(x - cx, z - cz)));

  // Размещаем полоски ТОЛЬКО на воде ручья (не под зданием, не в зоне волн-кругов)
  const glintPool = useMemo(() => {
    const gap = 0.06;
    const innerHalfW = baseWidth / 2 + gap;
    const innerHalfD = baseDepth / 2 + gap;
    const streamW = STREAM_WIDTH;
    const waveAmp1 = 0.10;
    const waveAmp2 = 0.06;
    // Глубина в ручье: строго между внутренним и внешним краем воды
    const depthMin = 0.12; // отступ от внутреннего края (здания)
    const depthMax = streamW - 0.15; // отступ от внешнего края (берега)
    
    const total = GLINT_COUNT + GLINT_RIPPLE_COUNT + GLINT_RIPPLE2_COUNT;
    const nAngle = 64; // количество позиций по окружности
    const nDepth = 5;  // количество слоёв по глубине
    
    // Проверка: точка внутри ручья (не под зданием, не за берегом)
    const isInStream = (x: number, z: number): boolean => {
      // Расстояние от центра в нормализованных координатах
      const normX = Math.abs(x) / innerHalfW;
      const normZ = Math.abs(z) / innerHalfD;
      const normDist = Math.max(normX, normZ);
      // Должно быть: дальше внутреннего края, но ближе внешнего
      const minNorm = 1.0 + depthMin / Math.max(innerHalfW, innerHalfD);
      const maxNorm = 1.0 + depthMax / Math.max(innerHalfW, innerHalfD);
      return normDist >= minNorm && normDist <= maxNorm;
    };
    
    const candidates: { x: number; z: number; angle: number }[] = [];
    for (let ai = 0; ai < nAngle; ai++) {
      const angle = (ai / nAngle) * Math.PI * 2;
      const wave = waveAmp1 * Math.sin(angle * 4) + waveAmp2 * Math.cos(angle * 6);
      for (let di = 0; di < nDepth; di++) {
        const depthFrac = (di + 0.5) / nDepth;
        const depth = depthMin + (depthMax - depthMin) * depthFrac;
        // Радиус от центра до точки в ручье
        const rW = innerHalfW + depth + wave * 0.5;
        const rD = innerHalfD + depth + wave * 0.5;
        const x = Math.cos(angle) * rW;
        const z = Math.sin(angle) * rD;
        // Исключаем зону волн-кругов из углов здания
        if (distToCorner(x, z) < GLINT_EXCLUDE_CORNER_RADIUS) continue;
        // Исключаем область под зданием
        if (Math.abs(x) < innerHalfW - 0.1 && Math.abs(z) < innerHalfD - 0.1) continue;
        candidates.push({ x, z, angle });
      }
    }
    
    // Выбираем равномерно из кандидатов
    const step = Math.max(1, candidates.length / total);
    const selected: { x: number; z: number; angle: number }[] = [];
    for (let i = 0; i < total && i < candidates.length; i++) {
      const idx = Math.floor(i * step + seed(i) * step * 0.3) % candidates.length;
      selected.push(candidates[idx]);
    }
    
    const types: (0 | 1 | 2)[] = [];
    for (let i = 0; i < GLINT_COUNT; i++) types.push(0);
    for (let i = 0; i < GLINT_RIPPLE_COUNT; i++) types.push(1);
    for (let i = 0; i < GLINT_RIPPLE2_COUNT; i++) types.push(2);
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(seed(i + 99) * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    
    const out: GlintItem[] = [];
    for (let k = 0; k < selected.length; k++) {
      const c = selected[k];
      // Ориентация полоски: перпендикулярно радиусу (по касательной к эллипсу)
      const angleIndex: 0 | 1 = (Math.abs(Math.cos(c.angle)) > Math.abs(Math.sin(c.angle))) ? 0 : 1;
      out.push({
        x: c.x,
        z: c.z,
        phase: seed(k + 1) * Math.PI * 2,
        scaleLength: 0.65 + seed(k + 31) * 0.7,
        scaleWidth: 0.5 + seed(k + 37) * 1.0,
        angleIndex,
        variant: types[k] ?? 0,
      });
    }
    return out;
  }, [baseWidth, baseDepth]);

  const glintMainData = useMemo(
    () => glintPool.filter((g) => g.variant === 0),
    [glintPool]
  );
  const glintRippleData = useMemo(
    () => glintPool.filter((g) => g.variant === 1),
    [glintPool]
  );
  const glintRipple2Data = useMemo(
    () => glintPool.filter((g) => g.variant === 2),
    [glintPool]
  );

  // Геометрия полоски — волнистая в XZ
  const glintGeometryBase = useMemo(() => {
    const L = GLINT_STRIPE_LENGTH / 2;
    const halfW = GLINT_STRIPE_WIDTH / 2;
    const segments = GLINT_STRIPE_SEGMENTS;
    const numWaves = GLINT_STRIPE_WAVES;
    const amp = GLINT_STRIPE_WAVE_AMPLITUDE;
    const vertexCount = (segments + 1) * 2;
    const pos = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = -L + 2 * L * t;
      const tangentX = 2 * L;
      const tangentZ =
        amp * Math.PI * 2 * numWaves * Math.cos(t * Math.PI * 2 * numWaves);
      const perpLen = Math.hypot(tangentZ, tangentX) || 1;
      const nx = -tangentZ / perpLen;
      const nz = tangentX / perpLen;
      const zCenter = amp * Math.sin(t * Math.PI * 2 * numWaves);
      const i0 = i * 2;
      pos[i0 * 3 + 0] = x + nx * halfW;
      pos[i0 * 3 + 1] = 0;
      pos[i0 * 3 + 2] = zCenter + nz * halfW;
      uvs[i0 * 2] = t;
      uvs[i0 * 2 + 1] = 1;
      pos[(i0 + 1) * 3 + 0] = x - nx * halfW;
      pos[(i0 + 1) * 3 + 1] = 0;
      pos[(i0 + 1) * 3 + 2] = zCenter - nz * halfW;
      uvs[(i0 + 1) * 2] = t;
      uvs[(i0 + 1) * 2 + 1] = 0;
    }
    const indices: number[] = [];
    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, c, a, c, d);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, []);

  const glintMainMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x5ce1ff,
        transparent: true,
        opacity: GLINT_MAIN_OPACITY_MIN,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );
  const glintRippleMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: GLINT_RIPPLE_COLOR,
        transparent: true,
        opacity: GLINT_RIPPLE_OPACITY_MIN,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );
  const glintRipple2Mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: GLINT_RIPPLE_COLOR,
        transparent: true,
        opacity: GLINT_RIPPLE2_OPACITY_MIN,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  const glintMainInstRef = useRef<THREE.InstancedMesh>(null);
  const glintRippleInstRef = useRef<THREE.InstancedMesh>(null);
  const glintRipple2InstRef = useRef<THREE.InstancedMesh>(null);
  const glintDummy = useRef({
    pos: new THREE.Vector3(),
    quat: new THREE.Quaternion(),
    quatRightLeft: new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, GLINT_ANGLE_RIGHT_LEFT, 0)
    ),
    quatFrontBack: new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, GLINT_ANGLE_FRONT_BACK, 0)
    ),
    scale: new THREE.Vector3(),
    matrix: new THREE.Matrix4(),
  });

  // Функция обновления instancedMesh (вынесена из useFrame для производительности)
  const updateGlintInstances = useRef((
    inst: THREE.InstancedMesh | null,
    list: GlintItem[],
    glintY: number,
    time: number,
    inReaction: boolean,
    envelope: number,
    ramp: number,
    decay: number,
    timeSinceImpact: number
  ) => {
    if (!inst) return;
    const dummy = glintDummy.current;
    if (!dummy?.quat) return;
    for (let i = 0; i < list.length; i++) {
      const g = list[i];
      let driftX = GLINT_DRIFT_AMOUNT * Math.sin(time * GLINT_DRIFT_SPEED + g.phase);
      let driftZ = GLINT_DRIFT_AMOUNT * Math.cos(time * GLINT_DRIFT_SPEED * 1.1 + g.phase * 0.7);
      if (inReaction) {
        const r = Math.hypot(g.x, g.z) || 0.001;
        const wavePhase = r / GLINT_IMPACT_WAVELENGTH - timeSinceImpact * GLINT_IMPACT_WAVE_SPEED;
        const wave = Math.sin(wavePhase * Math.PI * 2) * decay;
        const mag = GLINT_IMPACT_REACT_AMPLITUDE * wave * envelope * ramp * (g.x / r);
        const magZ = GLINT_IMPACT_REACT_AMPLITUDE * wave * envelope * ramp * (g.z / r);
        driftX += mag;
        driftZ += magZ;
      }
      dummy.pos.set(g.x + driftX, glintY, g.z + driftZ);
      const sourceQuat = g.angleIndex === 0 ? dummy.quatRightLeft : dummy.quatFrontBack;
      if (dummy?.quat && sourceQuat) {
        dummy.quat.copy(sourceQuat);
        dummy.scale.set(g.scaleLength, 1, g.scaleWidth);
        dummy.matrix.compose(dummy.pos, dummy.quat, dummy.scale);
        inst.setMatrixAt(i, dummy.matrix);
      }
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  // Кэшированные Color объекты для useFrame (избегаем создания новых объектов каждый кадр)
  const cachedColors = useRef({
    rippleStart: new THREE.Color(RIPPLE_COLOR_START),
    rippleEnd: new THREE.Color(RIPPLE_COLOR_END),
    rippleEndByTier: RIPPLE_COLOR_END_BY_TIER.map(c => new THREE.Color(c)),
    streamColors: STREAM_COLORS.map(c => new THREE.Color(c)),
    tempColor1: new THREE.Color(),
    tempColor2: new THREE.Color(),
  });

  // Вода под фундаментом
  const streamInnerW = baseWidth / 2 + 0.06;
  const streamInnerD = baseDepth / 2 + 0.06;
  const streamUnderFoundationGeometry = useMemo(
    () =>
      new THREE.PlaneGeometry(streamInnerW * 2, streamInnerD * 2).rotateX(
        -Math.PI / 2
      ),
    []
  );

  // Берег резервуара — широкий, круглый, неровный
  const SHORE_WIDTH = 0.45;
  const streamWaveAmp = 0.12;
  const reservoirOuterHalfW = baseWidth / 2 + gap + streamWidth + streamWaveAmp;
  const reservoirOuterHalfD = baseDepth / 2 + gap + streamWidth + streamWaveAmp;
  const shoreGeometry = useMemo(() => {
    const innerPoints = streamOuterSmoothBoundary.points;
    const outerSteps = 96;
    const outerAmp1 = 0.15;
    const outerAmp2 = 0.10;
    const outerAmp3 = 0.06;
    const outerPoints: [number, number][] = [];
    for (let i = 0; i <= outerSteps; i++) {
      const t = i / outerSteps;
      const angle = t * Math.PI * 2;
      // Неровная волнистая граница, но без углов — круглая форма
      const wave = outerAmp1 * Math.sin(angle * 5) + outerAmp2 * Math.cos(angle * 7) + outerAmp3 * Math.sin(angle * 11);
      const x = Math.cos(angle) * (reservoirOuterHalfW + SHORE_WIDTH + wave);
      const z = Math.sin(angle) * (reservoirOuterHalfD + SHORE_WIDTH + wave);
      outerPoints.push([x, z]);
    }
    const shape = new THREE.Shape();
    shape.moveTo(outerPoints[0][0], outerPoints[0][1]);
    for (let i = 1; i < outerPoints.length; i++) {
      shape.lineTo(outerPoints[i][0], outerPoints[i][1]);
    }
    const hole = new THREE.Path();
    hole.moveTo(innerPoints[0][0], innerPoints[0][1]);
    for (let i = 1; i < innerPoints.length; i++) {
      hole.lineTo(innerPoints[i][0], innerPoints[i][1]);
    }
    shape.holes.push(hole);
    const geom = new THREE.ShapeGeometry(shape);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [streamOuterSmoothBoundary]);

  // Полоса «песок/берег» — соединительная линия: половина в воде, половина на берегу
  const EDGE_FILL_OFFSET = 0.18;
  const shoreEdgeFillGeometry = useMemo(() => {
    const { points: centerPoints, normals } = streamOuterSmoothBoundary;
    const halfOffset = EDGE_FILL_OFFSET / 2;
    // Внутренний край (в воде) — смещение внутрь
    const innerPoints: [number, number][] = centerPoints.map(([cx, cz], i) => [
      cx + halfOffset * normals[i][0],
      cz + halfOffset * normals[i][1],
    ]);
    // Внешний край (на берегу) — смещение наружу
    const outerPoints: [number, number][] = centerPoints.map(([cx, cz], i) => [
      cx - halfOffset * normals[i][0],
      cz - halfOffset * normals[i][1],
    ]);
    const shape = new THREE.Shape();
    shape.moveTo(outerPoints[0][0], outerPoints[0][1]);
    for (let i = 1; i < outerPoints.length; i++) shape.lineTo(outerPoints[i][0], outerPoints[i][1]);
    const hole = new THREE.Path();
    hole.moveTo(innerPoints[0][0], innerPoints[0][1]);
    for (let i = 1; i < innerPoints.length; i++) hole.lineTo(innerPoints[i][0], innerPoints[i][1]);
    shape.holes.push(hole);
    const geom = new THREE.ShapeGeometry(shape);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [streamOuterSmoothBoundary]);

  const shoreColor = new THREE.Color(0x90c078);
  const shoreEdgeFillColor = new THREE.Color(0xc4a35a); // песок/жёлто-бежевый
  const palmTrunkColor = new THREE.Color(0x8b7355);
  const palmLeafColor = new THREE.Color(0x2d5a27);

  // Очистка кэша геометрий при размонтировании
  React.useEffect(() => {
    return () => {
      rippleGeometryCache.current.forEach(geom => geom.dispose());
      rippleGeometryCache.current.clear();
    };
  }, []);

  // Счётчик кадров для throttling тяжёлых операций
  const frameCountRef = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    frameCountRef.current++;

    if (floatRef.current) {
      const newY = floatBaseY + Math.sin(time * 0.8) * floatAmplitude;
      const prevY = prevFloatYRef.current;
      prevFloatYRef.current = newY;
      floatRef.current.position.y = newY;

      const midRise = 1 - (1 - BRIDGE_SPLIT) * (1 - BRIDGE_SPLIT);
      const midY = streamY + (doorThresholdY - streamY) * midRise;
      const connY = midY - newY;
      if (bridgeFloatingRef.current?.geometry) {
        const pos = bridgeFloatingRef.current.geometry.attributes.position;
        if (pos) {
          pos.array[1] = connY;
          pos.array[4] = connY;
          pos.needsUpdate = true;
        }
      }
      const connYRailing = doorCenterY - newY;
      for (const meshRef of [bridgeRailingFloatingLeftRef, bridgeRailingFloatingRightRef]) {
        const mesh = meshRef.current;
        if (mesh?.geometry?.attributes?.position) {
          const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
          const radial = RAILING_RADIAL_SEGMENTS;
          for (let k = 0; k <= radial; k++) {
            pos.array[1 + k * 3] = connYRailing + RAILING_RADIUS * Math.sin((k / radial) * Math.PI * 2);
          }
          pos.needsUpdate = true;
        }
      }

      const touchThreshold = streamUnderY - footBottomLocal;
      const margin = 0.008;
      const crossedDown =
        prevY >= touchThreshold - margin && newY <= touchThreshold + margin && newY < prevY;

      if (crossedDown) lastImpactTimeRef.current = time;

      const slots = rippleSlotsRef.current;
      if (crossedDown) {
        const start = nextSlotIndexRef.current;
        for (let k = 0; k < RIPPLE_RING_COUNT; k++) {
          const i = (start + k) % RIPPLE_RING_COUNT;
          const tier = Math.floor(k / 4) % RIPPLE_TIER_COUNT;
          const baseMax = RIPPLE_BASE_MAX_BY_TIER[tier];
          const maxScale = baseMax * (0.92 + Math.random() * 0.14);
          const duration =
            RIPPLE_GROW_DURATION_MIN +
            Math.random() * (RIPPLE_GROW_DURATION_MAX - RIPPLE_GROW_DURATION_MIN);
          // Используем фиксированные фазы на основе индекса для стабильного кэширования
          const phaseBase = (i * 0.618 + k * 0.382) % 1;
          const shapePhases: [number, number, number] = [
            phaseBase * Math.PI * 2,
            (phaseBase * 1.5) % 1 * Math.PI * 2,
            (phaseBase * 2.3) % 1 * Math.PI * 2,
          ];
          slots[i] = {
            scale: RIPPLE_MIN_SCALE,
            opacity: RIPPLE_OPACITY,
            t: 0,
            lastThickStep: -1,
            cornerIndex: k % 4,
            maxScale,
            spawnTime: time,
            layerY: tier * 0.001,
            tier,
            duration,
            shapePhases,
          };
          const mesh = rippleMeshRef.current[i];
          if (mesh) {
            const inner = RIPPLE_INNER_BY_TIER[tier];
            const ampMult = RIPPLE_AMP_MULT_BY_TIER[tier];
            const cacheKey = `${inner}_${RIPPLE_OUTER}_${shapePhases.join('_')}_${ampMult}`;
            let geom = rippleGeometryCache.current.get(cacheKey);
            if (!geom) {
              geom = createIrregularRing(inner, RIPPLE_OUTER, shapePhases, ampMult);
              rippleGeometryCache.current.set(cacheKey, geom);
            }
            const prev = mesh.geometry;
            if (prev !== geom && prev && !rippleGeometries.includes(prev)) {
              prev.dispose();
            }
            mesh.geometry = geom;
          }
        }
        nextSlotIndexRef.current = (start + RIPPLE_RING_COUNT) % RIPPLE_RING_COUNT;
      }

      for (let i = 0; i < RIPPLE_RING_COUNT; i++) {
        const d = slots[i];
        const elapsed = time - d.spawnTime;
        if (elapsed < 0) continue;
        const dur = d.duration ?? RIPPLE_GROW_DURATION_MIN;
        const t = Math.min(1, elapsed / dur);
        d.t = t;
        d.scale = RIPPLE_MIN_SCALE + (d.maxScale - RIPPLE_MIN_SCALE) * t;
        const fadeIn = t < 0.02 ? t / 0.02 : 1;
        const fadeOut = t > 0.88 ? (1 - t) / 0.12 : 1;
        d.opacity = RIPPLE_OPACITY * fadeIn * fadeOut;
        if (t >= 1) {
          d.scale = RIPPLE_MAX_SCALE_FAR + 1;
          d.opacity = 0;
        }
      }
    } else {
      const slots = rippleSlotsRef.current;
      for (let i = 0; i < RIPPLE_RING_COUNT; i++) {
        const d = slots[i];
        const elapsed = time - d.spawnTime;
        if (elapsed < 0) continue;
        const dur = d.duration ?? RIPPLE_GROW_DURATION_MIN;
        const t = Math.min(1, elapsed / dur);
        d.t = t;
        d.scale = RIPPLE_MIN_SCALE + (d.maxScale - RIPPLE_MIN_SCALE) * t;
        const fadeIn = t < 0.02 ? t / 0.02 : 1;
        const fadeOut = t > 0.88 ? (1 - t) / 0.12 : 1;
        d.opacity = RIPPLE_OPACITY * fadeIn * fadeOut;
        if (t >= 1) {
          d.scale = RIPPLE_MAX_SCALE_FAR + 1;
          d.opacity = 0;
        }
      }
    }

    const slots = rippleSlotsRef.current;
    for (let i = 0; i < RIPPLE_RING_COUNT; i++) {
      const mesh = rippleMeshRef.current[i];
      const d = slots[i];
      if (!mesh || !d) continue;
      mesh.scale.set(d.scale, d.scale, 1);
      const baseY = cornerPositions[d.cornerIndex][1];
      mesh.position.set(
        cornerPositions[d.cornerIndex][0],
        baseY + (d.layerY ?? 0),
        cornerPositions[d.cornerIndex][2]
      );
      const t = d.t ?? 0;
      const thickStep =
        t > 0 && t <= 1 ? Math.min(RIPPLE_THICK_STEPS, Math.floor(t * (RIPPLE_THICK_STEPS + 0.999))) : -1;
      if (thickStep >= 0 && thickStep !== d.lastThickStep) {
        d.lastThickStep = thickStep;
        const baseInner = RIPPLE_INNER_BY_TIER[d.tier];
        const baseThick = RIPPLE_OUTER - baseInner;
        const tFrac = thickStep / RIPPLE_THICK_STEPS;
        const thickNow = baseThick * (1 + RIPPLE_THICKNESS_GROW * tFrac);
        const innerNow = RIPPLE_OUTER - thickNow;
        const ampMult = RIPPLE_AMP_MULT_BY_TIER[d.tier];
        const cacheKey = `${innerNow.toFixed(3)}_${RIPPLE_OUTER}_${d.shapePhases.join('_')}_${ampMult}`;
        let geom = rippleGeometryCache.current.get(cacheKey);
        if (!geom) {
          geom = createIrregularRing(innerNow, RIPPLE_OUTER, d.shapePhases, ampMult);
          rippleGeometryCache.current.set(cacheKey, geom);
        }
        const prev = mesh.geometry;
        if (prev !== geom && prev && !rippleGeometries.includes(prev)) {
          prev.dispose();
        }
        mesh.geometry = geom;
      }
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = d.opacity;
        // Обновляем цвет только каждые 3 кадра для производительности
        if (frameCountRef.current % 3 === 0) {
          const cc = cachedColors.current;
          const endColorObj = cc.rippleEndByTier[d.tier] ?? cc.rippleEnd;
          mat.color.lerpColors(cc.rippleStart, endColorObj, t);
        }
      }
    }

    // Обновляем цвет ручья каждые 2 кадра для производительности
    if (streamMeshRef.current && frameCountRef.current % 2 === 0) {
      const mat = streamMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(
        0.94,
        Math.min(0.99, 0.965 + 0.025 * Math.sin(time * 1.5))
      );
      const cc = cachedColors.current;
      const N = cc.streamColors.length;
      const position = (time / STREAM_CYCLE_DURATION) * N;
      const idx = Math.floor(position % N);
      const nextIdx = (idx + 1) % N;
      const frac = position - Math.floor(position);
      mat.color.lerpColors(cc.streamColors[idx], cc.streamColors[nextIdx], frac);
      mat.emissive?.copy(mat.color).multiplyScalar(0.35);
    }

    if (streamUnderFoundationRef.current) {
      const under = streamUnderFoundationRef.current.material as THREE.MeshStandardMaterial;
      if (under.emissive) {
        under.emissiveIntensity = 1.0 + 0.25 * Math.sin(time * 0.6);
      }
    }
    const pulse = 0.5 + 0.5 * Math.sin(time * GLINT_PULSE_SPEED);
    glintMainMat.opacity =
      GLINT_MAIN_OPACITY_MIN +
      (GLINT_MAIN_OPACITY_MAX - GLINT_MAIN_OPACITY_MIN) * pulse;
    glintRippleMat.opacity =
      GLINT_RIPPLE_OPACITY_MIN +
      (GLINT_RIPPLE_OPACITY_MAX - GLINT_RIPPLE_OPACITY_MIN) * pulse;
    glintRipple2Mat.opacity =
      GLINT_RIPPLE2_OPACITY_MIN +
      (GLINT_RIPPLE2_OPACITY_MAX - GLINT_RIPPLE2_OPACITY_MIN) * pulse;

    const glintY = streamY + 0.005;
    const timeSinceImpact = time - lastImpactTimeRef.current;
    const inReaction =
      timeSinceImpact >= 0 &&
      timeSinceImpact < GLINT_IMPACT_REACT_DURATION;
    const envelope = Math.max(
      0,
      1 - timeSinceImpact / GLINT_IMPACT_REACT_DURATION
    );
    const ramp =
      timeSinceImpact < GLINT_IMPACT_RAMP
        ? 0.5 -
          0.5 * Math.cos((Math.PI * timeSinceImpact) / GLINT_IMPACT_RAMP)
        : 1;
    const decay = Math.exp(-timeSinceImpact / GLINT_IMPACT_REACT_DECAY);

    const update = updateGlintInstances.current;
    update(glintMainInstRef.current, glintMainData, glintY, time, inReaction, envelope, ramp, decay, timeSinceImpact);
    update(glintRippleInstRef.current, glintRippleData, glintY, time, inReaction, envelope, ramp, decay, timeSinceImpact);
    update(glintRipple2InstRef.current, glintRipple2Data, glintY, time, inReaction, envelope, ramp, decay, timeSinceImpact);
  });

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* Многослойное дно ручья — на сетке, с минимальными отступами друг от друга */}
      
      {/* Слой 1 (самый нижний) — земля/грунт, НЕПРОЗРАЧНЫЙ */}
      <mesh position={[0, streamY - 0.004, 0]} geometry={streamBottomGeometry} renderOrder={-4}>
        <meshBasicMaterial
          color={0x5a4d42}
          side={THREE.DoubleSide}
          depthWrite={true}
        />
      </mesh>

      {/* Слой 2 — глубокая синяя вода */}
      <mesh position={[0, streamY - 0.003, 0]} geometry={streamBottomGeometry} renderOrder={-3}>
        <meshBasicMaterial
          color={0x3a6a9a}
          side={THREE.DoubleSide}
          depthWrite={true}
        />
      </mesh>

      {/* Слой 3 — средняя глубина */}
      <mesh position={[0, streamY - 0.002, 0]} geometry={streamBottomGeometry} renderOrder={-2}>
        <meshBasicMaterial
          color={0x5a8ac0}
          side={THREE.DoubleSide}
          depthWrite={true}
        />
      </mesh>

      {/* Слой 4 — мелкая вода */}
      <mesh position={[0, streamY - 0.001, 0]} geometry={streamBottomGeometry} renderOrder={-1}>
        <meshBasicMaterial
          color={0x7aa8d8}
          side={THREE.DoubleSide}
          depthWrite={true}
        />
      </mesh>

      {/* Ручей — верхний слой воды, полупрозрачный */}
      <mesh ref={streamMeshRef} position={[0, streamY, 0]} geometry={streamGeometry} renderOrder={0}>
        <meshStandardMaterial
          color={STREAM_COLORS[0]}
          emissive={new THREE.Color(STREAM_COLORS[0]).multiplyScalar(0.25)}
          transparent
          opacity={0.92}
          depthWrite={true}
          roughness={0.18}
          metalness={0.72}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Газовое испарение под фундаментом — тонкий слой */}
      <mesh
        ref={streamUnderFoundationRef}
        position={[0, streamUnderY, 0]}
        geometry={streamUnderFoundationGeometry}
        renderOrder={1}
      >
        <meshStandardMaterial
          color={0x8b7ec8}
          emissive={0x6a4a9e}
          emissiveIntensity={0.9}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* Полоса песок/берег между границей ручья и внутренней границей берега — убирает чёрный зазор */}
      <mesh position={[0, streamY - 0.002, 0]} geometry={shoreEdgeFillGeometry} renderOrder={0}>
        <meshLambertMaterial color={shoreEdgeFillColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Берег резервуара — рамка вокруг воды/газа («сад»), чуть ниже ручья чтобы не мельтешить */}
      <mesh position={[0, streamY - 0.003, 0]} geometry={shoreGeometry} renderOrder={0}>
        <meshLambertMaterial color={shoreColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Пальмы на берегу (2 шт., низкополигональные) — за пределами ручья */}
      {/* Большие пальмы на берегу — выше здания */}
      {(() => {
        // Пальма 1: угол 45° (правый передний угол берега)
        const angle1 = Math.PI / 4;
        const palmR1 = Math.max(reservoirOuterHalfW, reservoirOuterHalfD) + SHORE_WIDTH * 0.5;
        const palm1X = Math.cos(angle1) * palmR1;
        const palm1Z = Math.sin(angle1) * palmR1;
        // Пальма 2: угол 135° (левый передний угол берега)
        const angle2 = Math.PI * 3 / 4;
        const palmR2 = Math.max(reservoirOuterHalfW, reservoirOuterHalfD) + SHORE_WIDTH * 0.5;
        const palm2X = Math.cos(angle2) * palmR2;
        const palm2Z = Math.sin(angle2) * palmR2;
        
        const trunkHeight = 1.9; // Высота ствола — чуть выше здания
        const trunkRadiusBottom = 0.08;
        const trunkRadiusTop = 0.05;
        const leafColor = 0x228b22; // Насыщенный зелёный (ForestGreen)
        const leafColorLight = 0x32cd32; // Светло-зелёный (LimeGreen) для бликов
        
        // Компонент изогнутого листа пальмы — цельная геометрия
        const PalmLeaf = ({ 
          angle, 
          tilt, 
          length, 
          color 
        }: { 
          angle: number; 
          tilt: number; 
          length: number; 
          color: number;
        }) => {
          // Создаём цельный лист с изгибом и толщиной через BufferGeometry
          const leafGeo = useMemo(() => {
            const segments = 8; // Количество сегментов вдоль листа
            const widthSegs = 4; // Больше сегментов для выпуклости
            const baseWidth = 0.18; // Шире листья
            const thickness = 0.015; // Толщина листа (выпуклость)
            
            const vertices: number[] = [];
            const indices: number[] = [];
            
            // Генерируем вершины изогнутого листа с выпуклым профилем
            for (let i = 0; i <= segments; i++) {
              const t = i / segments;
              // Позиция вдоль листа с изгибом
              const x = t * length;
              const yBase = -t * t * tilt * length * 0.4; // Параболический изгиб вниз
              const width = baseWidth * (1 - t * 0.7); // Сужение к концу
              const thicknessFade = 1 - t * 0.8; // Толщина уменьшается к концу
              
              for (let j = 0; j <= widthSegs; j++) {
                const wFrac = j / widthSegs - 0.5; // -0.5 до 0.5
                const w = wFrac * width;
                // Выпуклый профиль — центр выше краёв (парабола по ширине)
                const bulge = (1 - 4 * wFrac * wFrac) * thickness * thicknessFade;
                vertices.push(x, yBase + bulge, w);
              }
            }
            
            // Генерируем индексы треугольников
            for (let i = 0; i < segments; i++) {
              for (let j = 0; j < widthSegs; j++) {
                const a = i * (widthSegs + 1) + j;
                const b = a + 1;
                const c = a + (widthSegs + 1);
                const d = c + 1;
                indices.push(a, c, b);
                indices.push(b, c, d);
              }
            }
            
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geo.setIndex(indices);
            geo.computeVertexNormals();
            return geo;
          }, [length, tilt]);
          
          return (
            <group rotation={[0, angle, 0]}>
              <mesh geometry={leafGeo}>
                <meshLambertMaterial color={color} side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        };

        const PalmTree = ({ x, z }: { x: number; z: number }) => (
          <group position={[x, streamY + trunkHeight / 2, z]}>
            {/* Ствол пальмы */}
            <mesh>
              <cylinderGeometry args={[trunkRadiusTop, trunkRadiusBottom, trunkHeight, 8]} />
              <meshLambertMaterial color={palmTrunkColor} />
            </mesh>
            {/* Крона — листья свешиваются в разные стороны от верхушки */}
            <group position={[0, trunkHeight / 2 - 0.01, 0]}>
              {/* Шапка из коротких листьев — прикрывает верхушку ствола */}
              <mesh position={[0, -0.02, 0]}>
                <sphereGeometry args={[0.1, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshLambertMaterial color={leafColor} />
              </mesh>
              {/* Основные листья — 8 штук в разные стороны */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const leafAngle = (i / 8) * Math.PI * 2 + (i % 2) * 0.15;
                const tilt = 1.1 + (i % 3) * 0.15; // Разный наклон
                const length = 0.55 + (i % 2) * 0.1; // Укороченные листья
                return (
                  <PalmLeaf
                    key={i}
                    angle={leafAngle}
                    tilt={tilt}
                    length={length}
                    color={i % 2 === 0 ? leafColor : leafColorLight}
                  />
                );
              })}
              {/* Средний ярус — покороче, между основными */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const leafAngle = (i / 6) * Math.PI * 2 + Math.PI / 8;
                return (
                  <PalmLeaf
                    key={`mid-${i}`}
                    angle={leafAngle}
                    tilt={0.9}
                    length={0.4}
                    color={leafColor}
                  />
                );
              })}
              {/* Молодые листья в центре — короткие, торчат вверх */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const leafAngle = (i / 6) * Math.PI * 2 + Math.PI / 12;
                return (
                  <PalmLeaf
                    key={`young-${i}`}
                    angle={leafAngle}
                    tilt={0.3}
                    length={0.25}
                    color={leafColorLight}
                  />
                );
              })}
            </group>
          </group>
        );
        
        return (
          <>
            <PalmTree x={palm1X} z={palm1Z} />
            <PalmTree x={palm2X} z={palm2Z} />
          </>
        );
      })()}

      {/* Мостик статичная часть — от суши до середины */}
      <mesh geometry={bridgeStaticGeometry} renderOrder={5}>
        <meshStandardMaterial
          color={bridgeColor}
          emissive={bridgeGlow}
          emissiveIntensity={active ? 0.25 : 0.12}
          roughness={0.6}
          metalness={0.15}
        />
      </mesh>
      {/* Перила статичная часть — слева и справа */}
      <mesh geometry={bridgeRailingStaticLeft} renderOrder={6}>
        <meshStandardMaterial
          color={railingColor}
          emissive={railingGlow}
          emissiveIntensity={active ? 0.35 : 0.18}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
      <mesh geometry={bridgeRailingStaticRight} renderOrder={6}>
        <meshStandardMaterial
          color={railingColor}
          emissive={railingGlow}
          emissiveIntensity={active ? 0.35 : 0.18}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Волны от углов — фиксированные геометрии, только scale/position/opacity */}
      {rippleSlotsRef.current.map((r, i) => (
        <mesh
          key={i}
          ref={(el) => {
            rippleMeshRef.current[i] = el;
          }}
          position={[
            cornerPositions[r.cornerIndex][0],
            cornerPositions[r.cornerIndex][1] + (r.layerY ?? 0),
            cornerPositions[r.cornerIndex][2],
          ]}
          scale={[r.scale, r.scale, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={rippleGeometries[r.tier ?? 0]}
          renderOrder={2}
        >
          <meshBasicMaterial
            color={RIPPLE_COLOR_START}
            transparent
            opacity={r.opacity}
            depthWrite={false}
            depthTest={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Полоски — InstancedMesh x3 */}
      <instancedMesh
        ref={glintMainInstRef}
        args={[glintGeometryBase, glintMainMat, glintMainData.length]}
        renderOrder={3}
      />
      <instancedMesh
        ref={glintRippleInstRef}
        args={[glintGeometryBase, glintRippleMat, glintRippleData.length]}
        renderOrder={3}
      />
      <instancedMesh
        ref={glintRipple2InstRef}
        args={[glintGeometryBase, glintRipple2Mat, glintRipple2Data.length]}
        renderOrder={3}
      />

      {/* Здание (парение) — парящая часть мостика синхронно с зданием */}
      <group ref={floatRef}>
        {/* Мостик парящая часть — от середины к порогу проёма */}
        <mesh ref={bridgeFloatingRef} geometry={bridgeFloatingGeometry} renderOrder={5}>
          <meshStandardMaterial
            color={bridgeColor}
            emissive={bridgeGlow}
            emissiveIntensity={active ? 0.25 : 0.12}
            roughness={0.6}
            metalness={0.15}
          />
        </mesh>
        {/* Перила парящая часть — слева и справа */}
        <mesh ref={bridgeRailingFloatingLeftRef} geometry={bridgeRailingFloatingLeft} renderOrder={6}>
          <meshStandardMaterial
            color={railingColor}
            emissive={railingGlow}
            emissiveIntensity={active ? 0.35 : 0.18}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
        <mesh ref={bridgeRailingFloatingRightRef} geometry={bridgeRailingFloatingRight} renderOrder={6}>
          <meshStandardMaterial
            color={railingColor}
            emissive={railingGlow}
            emissiveIntensity={active ? 0.35 : 0.18}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[0, foundationCenterY, 0]} renderOrder={10}>
          <boxGeometry args={[baseWidth * 1.06, foundationHeight, baseDepth * 1.06]} />
          <meshLambertMaterial
            color={exteriorGolden}
            emissive={exteriorGlow}
            emissiveIntensity={active ? 0.22 : 0.11}
          />
        </mesh>

        {[
          [baseWidth / 2, baseDepth / 2],
          [-baseWidth / 2, baseDepth / 2],
          [-baseWidth / 2, -baseDepth / 2],
          [baseWidth / 2, -baseDepth / 2],
        ].map(([x, z], i) => (
          <mesh
            key={i}
            position={[
              x,
              foundationCenterY - foundationHeight / 2 - 0.09 / 12,
              z,
            ]}
            renderOrder={10}
          >
            <boxGeometry args={[0.1, 0.09 / 6, 0.1]} />
            <meshLambertMaterial
              color={exteriorGolden}
              emissive={exteriorGlow}
              emissiveIntensity={active ? 0.22 : 0.11}
            />
          </mesh>
        ))}

        {/* Корпус здания — 6 стен: внешние 5 + фронт с проёмом; интерьер — смещённые плоскости */}
        <group position={[0, buildingCenterY, 0]}>
          {/* Внешние стены (задняя, боковые, пол, потолок) — DoubleSide чтобы видны снаружи */}
          <mesh position={[0, 0, -baseDepth / 2]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[baseWidth, baseHeight - foundationHeight]} />
            <meshStandardMaterial color={exteriorPearl} emissive={exteriorGlow} emissiveIntensity={active ? 0.35 : 0.2} metalness={0.15} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-baseWidth / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[baseDepth, baseHeight - foundationHeight]} />
            <meshStandardMaterial color={exteriorPearl} emissive={exteriorGlow} emissiveIntensity={active ? 0.35 : 0.2} metalness={0.15} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[baseWidth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[baseDepth, baseHeight - foundationHeight]} />
            <meshStandardMaterial color={exteriorPearl} emissive={exteriorGlow} emissiveIntensity={active ? 0.35 : 0.2} metalness={0.15} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          {/* Внешний пол — приподнят над верхом фундамента, чтобы не мельтешить */}
          <mesh position={[0, -(baseHeight - foundationHeight) / 2 + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[baseWidth, baseDepth]} />
            <meshStandardMaterial color={exteriorPearl} emissive={exteriorGlow} emissiveIntensity={active ? 0.35 : 0.2} metalness={0.15} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, (baseHeight - foundationHeight) / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[baseWidth, baseDepth]} />
            <meshStandardMaterial color={exteriorPearl} emissive={exteriorGlow} emissiveIntensity={active ? 0.35 : 0.2} metalness={0.15} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          {/* Фронт с проёмом */}
          <mesh position={[0, 0, baseDepth / 2]} geometry={frontWallWithDoorGeometry} renderOrder={8}>
            <meshStandardMaterial
              color={exteriorPearl}
              emissive={exteriorGlow}
              emissiveIntensity={active ? 0.35 : 0.2}
              metalness={0.15}
              roughness={0.8}
              side={THREE.DoubleSide}
              polygonOffset
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
            />
          </mesh>
          {/* Рамка проёма — левый косяк */}
          <mesh position={[
            -DOOR_WIDTH / 2 - DOOR_FRAME_THICKNESS / 2,
            doorLocalY,
            baseDepth / 2 + DOOR_FRAME_DEPTH / 2
          ]}>
            <boxGeometry args={[DOOR_FRAME_THICKNESS, DOOR_HEIGHT, DOOR_FRAME_DEPTH]} />
            <meshStandardMaterial
              color={exteriorGolden}
              emissive={exteriorGlow}
              emissiveIntensity={active ? 0.4 : 0.25}
              metalness={0.3}
              roughness={0.6}
            />
          </mesh>
          {/* Рамка проёма — правый косяк */}
          <mesh position={[
            DOOR_WIDTH / 2 + DOOR_FRAME_THICKNESS / 2,
            doorLocalY,
            baseDepth / 2 + DOOR_FRAME_DEPTH / 2
          ]}>
            <boxGeometry args={[DOOR_FRAME_THICKNESS, DOOR_HEIGHT, DOOR_FRAME_DEPTH]} />
            <meshStandardMaterial
              color={exteriorGolden}
              emissive={exteriorGlow}
              emissiveIntensity={active ? 0.4 : 0.25}
              metalness={0.3}
              roughness={0.6}
            />
          </mesh>
          {/* Рамка проёма — арочная часть сверху */}
          <mesh
            position={[0, doorLocalY + DOOR_HEIGHT / 2, baseDepth / 2 + DOOR_FRAME_DEPTH / 2]}
            rotation={[0, 0, 0]}
          >
            <torusGeometry args={[DOOR_ARCH_RADIUS + DOOR_FRAME_THICKNESS / 2, DOOR_FRAME_THICKNESS / 2, 8, 24, Math.PI]} />
            <meshStandardMaterial
              color={exteriorGolden}
              emissive={exteriorGlow}
              emissiveIntensity={active ? 0.4 : 0.25}
              metalness={0.3}
              roughness={0.6}
            />
          </mesh>
          {/* Внутренняя задняя стена — приподнята вместе с полом */}
          <mesh position={[0, 0.06, -baseDepth / 2 + 0.06]}>
            <planeGeometry args={[baseWidth - 0.12, baseHeight - foundationHeight - 0.12]} />
            <meshStandardMaterial
              color={interiorWallColor}
              emissive={interiorGlow}
              emissiveIntensity={active ? 0.2 : 0.1}
              metalness={0.05}
              roughness={0.9}
              transparent
              opacity={0.85}
              side={THREE.FrontSide}
              polygonOffset
              polygonOffsetFactor={2}
              polygonOffsetUnits={2}
            />
          </mesh>
          {/* Внутренняя левая стена — приподнята вместе с полом */}
          <mesh position={[-baseWidth / 2 + 0.06, 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[baseDepth - 0.12, baseHeight - foundationHeight - 0.12]} />
            <meshStandardMaterial
              color={interiorSideColor}
              emissive={interiorSideGlow}
              emissiveIntensity={active ? 0.35 : 0.2}
              metalness={0.05}
              roughness={0.9}
              transparent
              opacity={0.85}
              side={THREE.FrontSide}
              polygonOffset
              polygonOffsetFactor={2}
              polygonOffsetUnits={2}
            />
          </mesh>
          {/* Внутренняя правая стена — приподнята вместе с полом */}
          <mesh position={[baseWidth / 2 - 0.06, 0.06, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[baseDepth - 0.12, baseHeight - foundationHeight - 0.12]} />
            <meshStandardMaterial
              color={interiorSideColor}
              emissive={interiorSideGlow}
              emissiveIntensity={active ? 0.35 : 0.2}
              metalness={0.05}
              roughness={0.9}
              transparent
              opacity={0.85}
              side={THREE.FrontSide}
              polygonOffset
              polygonOffsetFactor={2}
              polygonOffsetUnits={2}
            />
          </mesh>
          {/* Внутренний пол — выше внешнего пола и фундамента, чтобы не мельтешить */}
          <mesh position={[0, -(baseHeight - foundationHeight) / 2 + 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={9}>
            <planeGeometry args={[baseWidth - 0.12, baseDepth - 0.12]} />
            <meshStandardMaterial
              color={interiorFloorColor}
              emissive={0x6a4a9e}
              emissiveIntensity={active ? 0.7 : 0.5}
              metalness={0.05}
              roughness={0.4}
              transparent
              opacity={0.75}
              side={THREE.FrontSide}
              polygonOffset
              polygonOffsetFactor={4}
              polygonOffsetUnits={4}
            />
          </mesh>
          {/* Внутренний потолок */}
          <mesh position={[0, (baseHeight - foundationHeight) / 2 - 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[baseWidth - 0.12, baseDepth - 0.12]} />
            <meshStandardMaterial
              color={interiorCeilingColor}
              emissive={interiorGlow}
              emissiveIntensity={active ? 0.5 : 0.3}
              metalness={0.1}
              roughness={0.85}
              side={THREE.FrontSide}
              polygonOffset
              polygonOffsetFactor={2}
              polygonOffsetUnits={2}
            />
          </mesh>
        </group>

        <mesh position={[0, roofY, 0]} renderOrder={10}>
          <boxGeometry args={[baseWidth * 1.02, 0.08, baseDepth * 1.02]} />
          <meshLambertMaterial
            color={exteriorGolden}
            emissive={exteriorGlow}
            emissiveIntensity={active ? 0.25 : 0.12}
          />
        </mesh>

        <mesh position={[0, roofY + 0.12, 0]}>
          <sphereGeometry args={[0.08, 20, 20]} />
          <meshBasicMaterial
            color={exteriorGolden}
            transparent
            opacity={active ? 0.9 : 0.6}
          />
        </mesh>
      </group>
    </group>
  );
}
