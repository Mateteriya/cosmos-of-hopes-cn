'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Текстура поверхности жижи — только градиент (без волн)
function useSludgeSurfaceTexture() {
  return useMemo(() => {
    const w = 256;
    const h = 256;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) / 2 - 4;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0, 'rgba(190, 255, 130, 0.55)');
    grad.addColorStop(0.5, 'rgba(150, 230, 100, 0.4)');
    grad.addColorStop(1, 'rgba(110, 190, 70, 0.28)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

// Текстура только линий-волн (прозрачный фон)
function useSludgeWavesTexture() {
  return useMemo(() => {
    const w = 256;
    const h = 256;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) / 2 - 4;
    ctx.clearRect(0, 0, w, h);
    for (let i = 1; i <= 14; i++) {
      const r = (maxR * i) / 14;
      const alpha = 0.25 + 0.2 * (1 - i / 14);
      ctx.strokeStyle = `rgba(200, 255, 160, ${alpha})`;
      ctx.lineWidth = i % 2 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    const spiral = (startAngle: number, turns: number, lineWidth: number, alpha: number) => {
      ctx.strokeStyle = `rgba(230, 255, 190, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      for (let k = 0; k <= 120; k++) {
        const t = (k / 120) * Math.PI * 2 * turns;
        const r = 6 + (t / (Math.PI * 2 * turns)) * (maxR - 12);
        const x = cx + r * Math.cos(t + startAngle);
        const y = cy + r * Math.sin(t + startAngle);
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    spiral(0, 2.5, 2, 0.5);
    spiral(Math.PI * 0.6, 2, 1.5, 0.38);
    spiral(Math.PI * 1.2, 1.5, 1, 0.3);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

// Текстура шестерёнок для внешних стен
function useGearsTexture() {
  return useMemo(() => {
    const w = 128;
    const h = 128;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(0, 0, w, h);
    const drawGear = (cx: number, cy: number, r: number, teeth: number) => {
      ctx.strokeStyle = 'rgba(60,95,140,0.85)';
      ctx.lineWidth = 2.5;
      const step = (Math.PI * 2) / teeth;
      for (let i = 0; i < teeth; i++) {
        const a1 = i * step - step * 0.35;
        const a2 = i * step;
        const a3 = i * step + step * 0.35;
        const rOut = r;
        const rIn = r * 0.82;
        ctx.beginPath();
        ctx.moveTo(cx + rIn * Math.cos(a1), cy + rIn * Math.sin(a1));
        ctx.lineTo(cx + rOut * Math.cos(a2), cy + rOut * Math.sin(a2));
        ctx.lineTo(cx + rIn * Math.cos(a3), cy + rIn * Math.sin(a3));
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
      ctx.stroke();
    };
    drawGear(32, 32, 14, 10);
    drawGear(96, 96, 12, 8);
    drawGear(96, 32, 10, 6);
    drawGear(32, 96, 10, 6);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

interface RegretRecyclingStationProps {
  position: [number, number, number];
  active?: boolean;
  level?: number;
}

/**
 * Центр переработки сожалений.
 * Полупрозрачное здание; на крыше — большой вращающийся резервуар с кислотной «жижей».
 * Две трубы разного цвета проходят через крышу внутрь, переходят в два вертикальных
 * вращающихся барабана; из барабанов трубы ведут к выходам в противоположных стенах.
 * Под кончиками труб — резервуары: «отработанная/вредная» жижа и «полезный материал».
 */
export default function RegretRecyclingStation({
  position,
  active = true,
  level = 1,
}: RegretRecyclingStationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const roofReservoirRef = useRef<THREE.Group>(null);
  const drumLeftRef = useRef<THREE.Group>(null);
  const drumRightRef = useRef<THREE.Group>(null);
  const surfaceDiscRef = useRef<THREE.Mesh>(null);
  const surfaceWavesRef = useRef<THREE.Mesh>(null);
  const surfaceAngleRef = useRef(0);
  const elevatorCabinRef = useRef<THREE.Group>(null);
  const escalatorGroupRef = useRef<THREE.Group>(null);
  const escalatorPhaseRef = useRef(0);
  const escalatorDirectionRef = useRef<'up' | 'down'>('up');

  const wallColor = new THREE.Color(0x6ab8e8);
  const roofColor = new THREE.Color(0x98fb98);
  const foundationColor = new THREE.Color(0x5ab8a8);
  const glowColor = new THREE.Color(0xc8f0f0);
  const pipeWasteColor = new THREE.Color(0xb85858);
  const pipeUsefulColor = new THREE.Color(0x58c8a0);
  const acidSludgeColor = new THREE.Color(0x88ff44);
  const wasteReservoirColor = new THREE.Color(0x8b3a3a);
  const usefulReservoirColor = new THREE.Color(0x48b878);
  const yardColor = new THREE.Color(0x6b7c6b); // приглушённый серо-зелёный (двор)

  const baseWidth = 1.5;
  const baseHeight = 1.2 * level;
  const baseDepth = 1.5;
  const foundationHeight = 0.1;
  const foundationCenterY = -baseHeight / 2 + foundationHeight / 2;
  // Двор — покрытие под зданием, выходит за пределы фундамента
  const yardAreaScale = Math.sqrt(1.5 * 1.3 * 1.3); // площадь двора в 1.5×1.3×1.3 раза
  const yardWidth = (baseWidth * 1.08 + 0.5) * yardAreaScale;
  const yardDepth = (baseDepth * 1.08 + 0.5) * yardAreaScale;
  const yardHeight = 0.03;
  const yardCenterY = foundationCenterY - foundationHeight / 2 - yardHeight / 2;
  const liftAboveGrid = 0.053; // подъём двора и домика над сеткой (+0.02, чтобы пол внутри не просвечивала сетка)
  const buildingCenterY =
    -baseHeight / 2 + foundationHeight + (baseHeight - foundationHeight) / 2;
  const roofCenterY =
    -baseHeight / 2 + foundationHeight + (baseHeight - foundationHeight) + 0.06;
  const roofTopY = roofCenterY + 0.06;

  const auraMargin = 0.02;
  const auraOverhang = 0.02;
  const gearsTexture = useGearsTexture();
  const sludgeSurfaceTexture = useSludgeSurfaceTexture();
  const sludgeWavesTexture = useSludgeWavesTexture();

  const roofReservoirRadius = 0.38;
  const roofReservoirHeight = 0.22;
  const roofReservoirY = roofTopY + roofReservoirHeight / 2;

  const pipeOffsetX = 0.28;
  const pipeRadius = 0.045;
  const drumRadius = 0.1;
  const drumHeight = 0.4;
  const drumY = buildingCenterY;

  const exitY = foundationCenterY + foundationHeight + 0.22;
  const tipStickOut = 0.12;

  const drumTopY = drumY + drumHeight / 2;
  const drumBottomY = drumY - drumHeight / 2;
  const pipeDrumGap = 0.02; // зазор между трубой и барабаном — убирает мельтешение (наложение) в месте стыка
  const verticalPipeLength = drumTopY - roofTopY - pipeDrumGap;
  const verticalPipeCenterY = roofTopY + verticalPipeLength / 2;

  const connectorPipeLength = drumBottomY - exitY - pipeDrumGap;
  const connectorPipeCenterY = (drumBottomY - pipeDrumGap + exitY) / 2; // центр нижнего отрезка трубы (зазор у барабана)

  const horizontalPipeLengthLeft = baseWidth / 2 - pipeOffsetX + tipStickOut;
  const horizontalPipeCenterXLeft = -(pipeOffsetX + baseWidth / 2 + tipStickOut) / 2;
  const horizontalPipeLengthRight = baseWidth / 2 - pipeOffsetX + tipStickOut;
  const horizontalPipeCenterXRight = (pipeOffsetX + baseWidth / 2 + tipStickOut) / 2;

  const surfaceDiscY = roofReservoirY + roofReservoirHeight * 0.38;

  // Эскалатор: стойка и ступеньки как были; последняя ступенька при касании стойки — исчезает
  const yardTopY = yardCenterY + yardHeight / 2;
  const stairStepCount = 14; // больше ступенек при меньшей высоте каждой
  const escalatorRoofMargin = 0.04;
  const escalatorUpperHousingLift = 0.06;
  const escalatorHousingW = 0.12;
  const escalatorHousingH = 0.18;
  const escalatorLowerHousingH = escalatorHousingH / 1.4; // нижняя стойка ниже в 1.4 раза
  const stairStepDepth = 0.14;
  const stairWidth = 0.4;
  const escalatorHousingD = stairWidth + 0.08;
  const escalatorLowerHousingD = stairWidth + 0.12; // ширина нижней стойки пошире, чтобы кнопки размещались на ней
  const escalatorLowerHousingW = escalatorHousingW + 0.06; // глубина нижней стойки подлиннее
  const escalatorUpperHousingW = escalatorHousingW * 2; // верхняя стойка в два раза толще по глубине
  const lowerHousingOffsetTowardHouse = 0.03; // ещё отодвинуто на 0.02 (было 0.05)
  const stairStepHeight = (roofTopY - escalatorRoofMargin - escalatorHousingH + escalatorUpperHousingLift - yardTopY) / stairStepCount;
  const stepVisualScale = 0.52; // ступеньки тоньше (было 0.72)
  const stepHeightScale = 1 / 2.5; // ступеньки ниже по высоте в 2.5 раза
  const stepVisualHeight = stairStepHeight * stepVisualScale * stepHeightScale;
  const stepVisualDepth = stairStepDepth * stepVisualScale;
  const stepVisualWidth = stairWidth * stepVisualScale;
  // Нижняя стойка: по X — ровно там, где первая ступенька (stairXFar); по Y — не проваливаться под двор
  const firstStepBottomY = yardTopY + stairStepHeight / 2 - stepVisualHeight / 2;
  const lowerHousingCenterY = Math.max(
    firstStepBottomY - escalatorLowerHousingH / 2,
    yardTopY + escalatorLowerHousingH / 2
  ); // верх стойки у низа первой ступеньки, но низ стойки не ниже двора
  // Верхняя стойка: уровень входа ступеньки — по верху стойки (стойка сдвинута на +0.12 по Y)
  const topStepBottomY = yardTopY + (stairStepCount - 1) * stairStepHeight;
  const upperHousingCenterY = topStepBottomY - escalatorHousingH / 2;
  const upperHousingLiftY = 0.16; // подъём верхней стойки (немного повыше)
  const upperHousingTopY = upperHousingCenterY + upperHousingLiftY + escalatorHousingH / 2; // до сюда ступенька доходит и «заходит» в стойку
  const upperHousingWallOffset = 0.02; // микро-отступ от стены здания (стойка не заходит внутрь)
  const upperHousingCenterX = -baseWidth / 2 - escalatorUpperHousingW / 2 - upperHousingWallOffset;
  const escalatorHorizontalRun = 0.42;
  const escalatorTopMargin = 0.38; // отступ от домика (место под пандус сверху)
  const escalatorOffsetTowardHouse = stairWidth / 5; // вся лестница чуть ближе к домику
  const stairXNear = -baseWidth / 2 - escalatorTopMargin + escalatorOffsetTowardHouse;
  const stairXFar = stairXNear - escalatorHorizontalRun;
  const stairZ = 0;
  const escalatorOffsetTowardRailings = -0.04; // эскалатор чуть ближе к перилам (по Z)
  const escalatorZ = stairZ + escalatorOffsetTowardRailings;
  const upperHousingOffsetZ = escalatorLowerHousingD / 5; // верхняя стойка сдвинута «в сторону» (по Z), чуть меньше чем 1/3
  const upperHousingPosZ = escalatorZ + upperHousingOffsetZ; // базовая позиция по Z
  const platformAndHousingExtraZ = 0.06; // удлинение помоста и верхней стойки вдоль стены (по Z) — одно и то же
  const upperHousingD = escalatorLowerHousingD + 0.05 + platformAndHousingExtraZ; // верхняя стойка: шире к перилам + удлинена вдоль стены
  const upperHousingCenterZ = upperHousingPosZ - (upperHousingD - escalatorLowerHousingD) / 2; // центр сдвинут к перилам (-Z)
  const platformThickness = 0.04; // толщина помоста
  const platformStickOutX = 0.18; // глубже — торчит подальше во двор
  const upperPlatformDepth = escalatorLowerHousingD * 0.32 + platformAndHousingExtraZ; // помост вдоль стены, поуже
  const upperPlatformX = upperHousingCenterX - escalatorUpperHousingW / 2 - platformStickOutX / 2; // помост прикреплён к стойке, торчит в сторону эскалатора
  const upperPlatformZOffset = 0.18; // помост ближе к правому краю стойки (по Z)
  const upperPlatformZ = upperHousingCenterZ + upperPlatformZOffset;
  const platformTopY = upperHousingCenterY + upperHousingLiftY + platformThickness / 2;
  const platformRailingHeight = 0.08;
  const platformRailingPostRadius = 0.012;
  const platformRailingRailThickness = 0.015;
  const platformRailingRailWidth = 0.025;
  const escalatorSpeed = 0.4;

  // Перила с одной стороны эскалатора: от нижней стойки до верхней, на ножках (сторона: -Z)
  const railingZ = escalatorZ - stepVisualWidth / 2 - 0.06; // перила сбоку от эскалатора
  const railingStartY = lowerHousingCenterY + escalatorLowerHousingH / 2;
  const railingEndY = upperHousingCenterY + upperHousingLiftY;
  // Верхняя стойка: центр в -X от домика; край «к улице/двору/эскалатору» — меньший X (upperHousingCenterX - W/2)
  const railingEndX = upperHousingCenterX - escalatorUpperHousingW / 2 + 0.02; // на верхней стойке, у края к эскалатору/двору (не на крыше домика)
  const railingPostHeight = 0.14;
  const railingPostCount = 2; // только нижняя и верхняя ножки
  const railingPostRadius = 0.015;
  const railingRailThickness = 0.02;
  const railingRailWidth = 0.03;
  // Поручень: от верха нижней ножки до верха верхней ножки (верхняя грань верхней ножки)
  const railingHandrailStartY = railingStartY + railingPostHeight;
  const railingHandrailEndY = upperHousingTopY + railingPostHeight; // верхняя грань верхней ножки
  const railingLength = Math.sqrt((railingEndX - stairXFar) ** 2 + (railingHandrailEndY - railingHandrailStartY) ** 2);
  const railingAngle = Math.atan2(railingHandrailEndY - railingHandrailStartY, railingEndX - stairXFar);

  // Лифт: диапазон по Y
  const elevatorBottomY = foundationCenterY + foundationHeight + 0.14;
  const elevatorTopY = buildingCenterY + (baseHeight - foundationHeight) / 2 - 0.22;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speed = active ? 0.012 : 0.006;
    if (roofReservoirRef.current) {
      roofReservoirRef.current.rotation.y += speed;
    }
    if (drumLeftRef.current) {
      drumLeftRef.current.rotation.y += speed * 1.2;
    }
    if (drumRightRef.current) {
      drumRightRef.current.rotation.y += speed * 1.2;
    }

    // Поверхность — крутится вокруг мировой вертикали (Y). Порядок YXZ: сначала Y (спин), потом X (наклон -90°)
    const surfaceRotationSpeed = active ? 0.008 : 0.004;
    surfaceAngleRef.current += surfaceRotationSpeed;
    const surfaceRotY = surfaceAngleRef.current;
    if (surfaceDiscRef.current) {
      surfaceDiscRef.current.rotation.order = 'YXZ';
      surfaceDiscRef.current.rotation.set(-Math.PI / 2, surfaceRotY, 0);
      const mat = surfaceDiscRef.current.material as THREE.MeshPhysicalMaterial;
      if (mat) {
        const t = Math.sin(time * 0.75) * 0.5 + 0.5;
        const tMetal = Math.sin(time * 0.6 + 1.2) * 0.5 + 0.5;
        mat.opacity = active ? 0.15 + 0.8 * t : 0.4 + 0.5 * t;
        mat.metalness = 0.15 + 0.6 * tMetal;
        mat.roughness = 0.35 - 0.2 * tMetal;
        mat.emissiveIntensity = active ? 0.15 + 0.25 * t : 0.1 + 0.15 * t;
      }
    }
    if (surfaceWavesRef.current) {
      surfaceWavesRef.current.rotation.order = 'YXZ';
      surfaceWavesRef.current.rotation.set(-Math.PI / 2, surfaceRotY, 0);
      // Кольца мерцают: от кислотно-зелёного до почти прозрачного
      const wavesMat = surfaceWavesRef.current.material as THREE.MeshBasicMaterial;
      if (wavesMat) {
        const shimmer = 0.5 + 0.5 * Math.sin(time * (active ? 0.55 : 0.38));
        wavesMat.opacity = 0.12 + 0.78 * shimmer;
        wavesMat.transparent = true;
        wavesMat.color.setHex(0x88ff44);
        if (wavesMat.map) wavesMat.map.offset.set(0, 0);
      }
    }
    // Лифт: кабина движется вверх-вниз
    if (elevatorCabinRef.current) {
      const phase = 0.5 + 0.5 * Math.sin(time * (active ? 0.28 : 0.18));
      elevatorCabinRef.current.position.y = elevatorBottomY + (elevatorTopY - elevatorBottomY) * phase;
    }
    // Эскалатор: ступени движутся; сверху доходят до верхней стойки и скрываются у её верха (upperHousingTopY)
    const housingBottomY = upperHousingTopY;
    const emergenceLevel = firstStepBottomY; // верх нижней стойки — ступенька появляется выше этого уровня
    if (escalatorGroupRef.current && escalatorGroupRef.current.children.length === stairStepCount) {
      const dir = escalatorDirectionRef.current === 'up' ? 1 : -1;
      escalatorPhaseRef.current += (active ? escalatorSpeed : escalatorSpeed * 0.5) * dir * 0.016;
      const phase = escalatorPhaseRef.current;
      const stepExtentX = stairXFar - stairXNear;
      escalatorGroupRef.current.children.forEach((child, k) => {
        if (child instanceof THREE.Group) {
          const mesh = child.children[0] as THREE.Mesh;
          if (!mesh) return;
          let o = k + phase;
          o = o - Math.floor(o / stairStepCount) * stairStepCount;
          if (o < 0) o += stairStepCount;
          const stepCenterY = yardTopY + stairStepHeight / 2 + o * stairStepHeight;
          child.position.x = stairXFar - o * (stepExtentX / (stairStepCount - 1 || 1));
          child.position.y = stepCenterY;
          child.position.z = escalatorZ;
          const stepBottom = stepCenterY - stepVisualHeight / 2;
          const stepTopY = stepCenterY + stepVisualHeight / 2;
          if (stepTopY >= housingBottomY) {
            mesh.visible = false;
            mesh.scale.set(1, 1, 1);
            mesh.position.y = 0;
          } else {
            const visibleBottom = stepBottom < emergenceLevel ? emergenceLevel : stepBottom;
            const visibleTop = stepTopY > housingBottomY ? housingBottomY : stepTopY;
            const visibleHeight = visibleTop - visibleBottom;
            if (visibleHeight <= 0.001) {
              mesh.visible = false;
              mesh.scale.set(1, 1, 1);
              mesh.position.y = 0;
            } else {
              mesh.visible = true;
              mesh.scale.set(1, visibleHeight / stepVisualHeight, 1);
              mesh.position.y = (visibleBottom + visibleTop) / 2 - stepCenterY;
            }
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[position[0], position[1] + liftAboveGrid, position[2]]}>
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

      {/* Двор — покрытие под зданием, выходит за пределы фундамента; фундамент стоит на нём */}
      <mesh position={[0, yardCenterY, 0]} renderOrder={5}>
        <boxGeometry args={[yardWidth, yardHeight, yardDepth]} />
        <meshLambertMaterial
          color={yardColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.06 : 0.03}
          transparent
          opacity={1}
          depthWrite={true}
        />
      </mesh>

      {/* Фундамент */}
      <mesh position={[0, foundationCenterY, 0]} renderOrder={10}>
        <boxGeometry args={[baseWidth * 1.08, foundationHeight, baseDepth * 1.08]} />
        <meshLambertMaterial
          color={foundationColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.15 : 0.08}
          transparent
          opacity={1}
          depthWrite={true}
        />
      </mesh>

      {/* Эскалатор: нижняя стойка под первой ступенькой, сдвиг к домику */}
      <group position={[stairXFar + lowerHousingOffsetTowardHouse, lowerHousingCenterY, escalatorZ]}>
        <mesh renderOrder={10}>
          <boxGeometry args={[escalatorLowerHousingW, escalatorLowerHousingH, escalatorLowerHousingD]} />
          <meshStandardMaterial
            color={0x9a9fa5}
            emissive={0x404448}
            emissiveIntensity={active ? 0.05 : 0.02}
            metalness={0.65}
            roughness={0.45}
          />
        </mesh>
        <lineSegments renderOrder={11}>
          <edgesGeometry args={[new THREE.BoxGeometry(escalatorLowerHousingW, escalatorLowerHousingH, escalatorLowerHousingD)]} />
          <lineBasicMaterial color={0x70767e} />
        </lineSegments>
      </group>
      {/* Верхняя стойка: у стены домика, чуть шире в сторону перил */}
      <group position={[upperHousingCenterX, upperHousingCenterY + upperHousingLiftY, upperHousingCenterZ]}>
        <mesh renderOrder={10}>
          <boxGeometry args={[escalatorUpperHousingW, escalatorHousingH, upperHousingD]} />
          <meshStandardMaterial
            color={0x9a9fa5}
            emissive={0x404448}
            emissiveIntensity={active ? 0.05 : 0.02}
            metalness={0.65}
            roughness={0.45}
          />
        </mesh>
        <lineSegments renderOrder={11}>
          <edgesGeometry args={[new THREE.BoxGeometry(escalatorUpperHousingW, escalatorHousingH, upperHousingD)]} />
          <lineBasicMaterial color={0x70767e} />
        </lineSegments>
      </group>
      {/* Помост (торчащий «пол») в сторону эскалатора, сдвинут вправо от ступенек */}
      <mesh
        position={[
          upperPlatformX,
          upperHousingCenterY + upperHousingLiftY,
          upperPlatformZ,
        ]}
        renderOrder={10}
      >
        <boxGeometry args={[platformStickOutX, platformThickness, upperPlatformDepth]} />
        <meshStandardMaterial
          color={0xa8adb8}
          emissive={0x454855}
          emissiveIntensity={active ? 0.05 : 0.02}
          metalness={0.6}
          roughness={0.5}
        />
      </mesh>
      {/* Перила помоста: передняя сторона (к двору) и справа; ножки стоят на помосте; цвет неон-синий */}
      {[
        [upperPlatformX - platformStickOutX / 2 + platformRailingPostRadius, upperPlatformZ - upperPlatformDepth / 2 + platformRailingPostRadius],
        [upperPlatformX - platformStickOutX / 2 + platformRailingPostRadius, upperPlatformZ + upperPlatformDepth / 2 - platformRailingPostRadius],
        [upperPlatformX + platformStickOutX / 2 - platformRailingPostRadius, upperPlatformZ + upperPlatformDepth / 2 - platformRailingPostRadius],
      ].map(([px, pz], i) => (
        <mesh
          key={`platform-post-${i}`}
          position={[px, platformTopY + platformRailingHeight / 2, pz]}
          renderOrder={11}
        >
          <cylinderGeometry args={[platformRailingPostRadius, platformRailingPostRadius, platformRailingHeight, 8]} />
          <meshStandardMaterial color={0x00ccff} emissive={0x0066aa} emissiveIntensity={active ? 0.5 : 0.25} metalness={0.4} roughness={0.3} />
        </mesh>
      ))}
      <mesh
        position={[
          upperPlatformX - platformStickOutX / 2,
          platformTopY + platformRailingHeight,
          upperPlatformZ,
        ]}
        renderOrder={11}
      >
        <boxGeometry args={[platformRailingRailWidth, platformRailingRailThickness, upperPlatformDepth]} />
        <meshStandardMaterial color={0x00ccff} emissive={0x0066aa} emissiveIntensity={active ? 0.5 : 0.25} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh
        position={[
          upperPlatformX,
          platformTopY + platformRailingHeight,
          upperPlatformZ + upperPlatformDepth / 2,
        ]}
        renderOrder={11}
      >
        <boxGeometry args={[platformStickOutX, platformRailingRailThickness, platformRailingRailWidth]} />
        <meshStandardMaterial color={0x00ccff} emissive={0x0066aa} emissiveIntensity={active ? 0.5 : 0.25} metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Перила с одной стороны: ножки + поручень, неоново-синие */}
      {Array.from({ length: railingPostCount }).map((_, i) => {
        const postX = i === 0 ? stairXFar : railingEndX;
        const postBaseY = i === 0 ? railingStartY : upperHousingTopY; // верхняя ножка — на верхней грани стойки
        return (
          <mesh
            key={`railing-post-${i}`}
            position={[postX, postBaseY + railingPostHeight / 2, railingZ]}
            renderOrder={11}
          >
            <cylinderGeometry args={[railingPostRadius, railingPostRadius, railingPostHeight, 8]} />
            <meshStandardMaterial
              color={0x00ccff}
              emissive={0x0066aa}
              emissiveIntensity={active ? 0.5 : 0.25}
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>
        );
      })}
      <mesh
        position={[
          (stairXFar + railingEndX) / 2,
          (railingHandrailStartY + railingHandrailEndY) / 2,
          railingZ,
        ]}
        rotation={[0, 0, railingAngle]}
        renderOrder={11}
      >
        <boxGeometry args={[railingLength, railingRailThickness, railingRailWidth]} />
        <meshStandardMaterial
          color={0x00ccff}
          emissive={0x0066aa}
          emissiveIntensity={active ? 0.5 : 0.25}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
      <group ref={escalatorGroupRef}>
        {Array.from({ length: stairStepCount }).map((_, i) => {
          const stepExtentX = stairXFar - stairXNear;
          const stepX = stairXFar - i * (stepExtentX / (stairStepCount - 1 || 1));
          const stepY = yardTopY + stairStepHeight / 2 + i * stairStepHeight;
          return (
            <group key={`esc-${i}`} position={[stepX, stepY, escalatorZ]}>
              <mesh renderOrder={11}>
                <boxGeometry args={[stepVisualDepth, stepVisualHeight, stepVisualWidth]} />
                <meshStandardMaterial
                  color={foundationColor}
                  emissive={glowColor}
                  emissiveIntensity={active ? 0.12 : 0.06}
                  metalness={0.2}
                  roughness={0.7}
                />
              </mesh>
            </group>
          );
        })}
      </group>
      {/* Переключатель на нижней стойке: на стойке, с отступом от границ и крошечным отступом от поверхности (без мельтешения) */}
      <group position={[stairXFar + lowerHousingOffsetTowardHouse, lowerHousingCenterY, escalatorZ]} renderOrder={12}>
        <mesh position={[0, escalatorLowerHousingH / 2 - 0.02, -(escalatorLowerHousingD / 2 - 0.02) - 0.012]}>
          <boxGeometry args={[0.06, 0.05, 0.04]} />
          <meshStandardMaterial color={0xdd9944} emissive={0xaa6622} emissiveIntensity={escalatorDirectionRef.current === 'down' ? 0.4 : 0.1} />
        </mesh>
        <mesh position={[0, escalatorLowerHousingH / 2 - 0.02, (escalatorLowerHousingD / 2 - 0.02) + 0.012]}>
          <boxGeometry args={[0.06, 0.05, 0.04]} />
          <meshStandardMaterial color={0x88cc88} emissive={0x448844} emissiveIntensity={escalatorDirectionRef.current === 'up' ? 0.4 : 0.1} />
        </mesh>
      </group>
      {/* Переключатель на верхней стойке: на стойке, как на нижней — отступ от границ, крошечный от поверхности */}
      <group position={[upperHousingCenterX, upperHousingCenterY + upperHousingLiftY, upperHousingCenterZ]} renderOrder={12}>
        <mesh position={[0, escalatorHousingH / 2 - 0.02, -(upperHousingD / 2 - 0.02) - 0.012]}>
          <boxGeometry args={[0.06, 0.05, 0.04]} />
          <meshStandardMaterial color={0x88cc88} emissive={0x448844} emissiveIntensity={escalatorDirectionRef.current === 'up' ? 0.4 : 0.1} />
        </mesh>
        <mesh position={[0, escalatorHousingH / 2 - 0.02, (upperHousingD / 2 - 0.02) + 0.012]}>
          <boxGeometry args={[0.06, 0.05, 0.04]} />
          <meshStandardMaterial color={0xdd9944} emissive={0xaa6622} emissiveIntensity={escalatorDirectionRef.current === 'down' ? 0.4 : 0.1} />
        </mesh>
      </group>

      {/* Лифт внутри здания: шахта справа (+X), кабина движется вверх-вниз */}
      <mesh position={[baseWidth / 2 + 0.02, buildingCenterY, 0.12]} renderOrder={12}>
        <boxGeometry args={[0.1, baseHeight - foundationHeight - 0.1, 0.2]} />
        <meshStandardMaterial
          color={0x607080}
          emissive={0x304050}
          emissiveIntensity={active ? 0.15 : 0.08}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      <group ref={elevatorCabinRef} position={[baseWidth / 2 + 0.02, elevatorBottomY, 0.12]}>
        <mesh>
          <boxGeometry args={[0.07, 0.22, 0.16]} />
          <meshStandardMaterial
            color={0xaaccff}
            emissive={0x5588aa}
            emissiveIntensity={active ? 0.4 : 0.2}
            metalness={0.4}
            roughness={0.35}
          />
        </mesh>
      </group>

      {/* Основной объём — полупрозрачные стены с шестерёнками */}
      <mesh position={[0, buildingCenterY, 0]}>
        <boxGeometry args={[baseWidth, baseHeight - foundationHeight, baseDepth]} />
        <meshStandardMaterial
          map={gearsTexture}
          color={wallColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.4 : 0.2}
          metalness={0.5}
          roughness={0.25}
          transparent
          opacity={0.72}
          envMapIntensity={0}
        />
      </mesh>

      {/* Крыша — плита */}
      <mesh position={[0, roofCenterY, 0]} renderOrder={10}>
        <boxGeometry args={[baseWidth * 1.04, 0.12, baseDepth * 1.04]} />
        <meshStandardMaterial
          color={roofColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.35 : 0.18}
          metalness={0.15}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, roofCenterY + 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={11}>
        <planeGeometry args={[baseWidth * 1.04, baseDepth * 1.04]} />
        <meshStandardMaterial
          map={gearsTexture}
          color={roofColor}
          emissive={glowColor}
          emissiveIntensity={active ? 0.35 : 0.18}
          metalness={0.15}
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Большой вращающийся резервуар на крыше */}
      <group ref={roofReservoirRef} position={[0, roofReservoirY, 0]}>
        <mesh>
          <cylinderGeometry args={[roofReservoirRadius, roofReservoirRadius * 0.98, roofReservoirHeight, 24, 1, true]} />
          <meshPhysicalMaterial
            color={0xb0d0e8}
            emissive={0x224466}
            emissiveIntensity={0.05}
            metalness={0.15}
            roughness={0.2}
            transparent
            opacity={0.32}
            depthWrite={true}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -roofReservoirHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[roofReservoirRadius * 0.98, 24]} />
          <meshPhysicalMaterial
            color={0xa0c0d0}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            depthWrite={true}
          />
        </mesh>
        <mesh position={[0, -roofReservoirHeight * 0.02, 0]}>
          <cylinderGeometry args={[roofReservoirRadius * 0.84, roofReservoirRadius * 0.84, roofReservoirHeight * 0.78, 32]} />
          <meshPhysicalMaterial
            color={acidSludgeColor}
            emissive={acidSludgeColor}
            emissiveIntensity={active ? 0.6 : 0.35}
            metalness={0.12}
            roughness={0.55}
            transparent={false}
            opacity={1}
            depthWrite={true}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
            clearcoat={0.4}
            clearcoatRoughness={0.3}
            sheen={0.15}
            sheenColor={0xccff99}
            sheenRoughness={0.6}
          />
        </mesh>
      </group>

      {/* Поверхность жижи — фиксированная позиция в центре, вращение вокруг своей оси */}
      <mesh
        ref={surfaceDiscRef}
        position={[0, surfaceDiscY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[roofReservoirRadius * 0.82, 32]} />
        <meshPhysicalMaterial
          map={sludgeSurfaceTexture}
          color={0xbbff99}
          emissive={0x558833}
          emissiveIntensity={active ? 0.35 : 0.2}
          metalness={0.2}
          roughness={0.25}
          transparent
          opacity={0.9}
          depthWrite={true}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
          sheen={0.25}
          sheenColor={0xeeffcc}
          sheenRoughness={0.4}
        />
      </mesh>
      <mesh
        ref={surfaceWavesRef}
        position={[0, surfaceDiscY + 0.001, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[roofReservoirRadius * 0.82, 32]} />
        <meshBasicMaterial
          map={sludgeWavesTexture}
          color={0x88ff44}
          transparent
          opacity={0.5}
          depthWrite={false}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
        />
      </mesh>

      {/* Труба «вредная» (левая): из крыши вниз → барабан → горизонтально влево → резервуар внизу */}
      <mesh position={[-pipeOffsetX, verticalPipeCenterY, 0]}>
        <cylinderGeometry args={[pipeRadius, pipeRadius, verticalPipeLength, 12]} />
        <meshStandardMaterial color={pipeWasteColor} emissive={pipeWasteColor} emissiveIntensity={active ? 0.3 : 0.15} metalness={0.4} roughness={0.5} />
      </mesh>

      <group ref={drumLeftRef} position={[-pipeOffsetX, drumY, 0]}>
        <mesh>
          <cylinderGeometry args={[drumRadius, drumRadius, drumHeight, 16]} />
          <meshStandardMaterial color={pipeWasteColor} emissive={pipeWasteColor} emissiveIntensity={active ? 0.35 : 0.18} metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[drumRadius + 0.02, 0, 0]}>
          <boxGeometry args={[0.03, drumHeight * 0.9, 0.02]} />
          <meshStandardMaterial color={0x6a4040} emissive={0x8a6060} emissiveIntensity={0.15} />
        </mesh>
      </group>

      <mesh position={[-pipeOffsetX, connectorPipeCenterY, 0]}>
        <cylinderGeometry args={[pipeRadius, pipeRadius, connectorPipeLength, 12]} />
        <meshStandardMaterial color={pipeWasteColor} emissive={pipeWasteColor} emissiveIntensity={active ? 0.28 : 0.14} metalness={0.4} roughness={0.5} />
      </mesh>

      <mesh position={[horizontalPipeCenterXLeft, exitY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[pipeRadius, pipeRadius, horizontalPipeLengthLeft, 12]} />
        <meshStandardMaterial color={pipeWasteColor} emissive={pipeWasteColor} emissiveIntensity={active ? 0.28 : 0.14} metalness={0.4} roughness={0.5} />
      </mesh>

      <mesh position={[-baseWidth / 2 - tipStickOut - 0.08, foundationCenterY + 0.14, 0]}>
        <cylinderGeometry args={[0.1, 0.11, 0.25, 16]} />
        <meshStandardMaterial color={wasteReservoirColor} emissive={wasteReservoirColor} emissiveIntensity={active ? 0.5 : 0.25} metalness={0.1} roughness={0.8} transparent opacity={0.9} />
      </mesh>

      {/* Труба «полезная» (правая) */}
      <mesh position={[pipeOffsetX, verticalPipeCenterY, 0]}>
        <cylinderGeometry args={[pipeRadius, pipeRadius, verticalPipeLength, 12]} />
        <meshStandardMaterial color={pipeUsefulColor} emissive={pipeUsefulColor} emissiveIntensity={active ? 0.3 : 0.15} metalness={0.4} roughness={0.5} />
      </mesh>

      <group ref={drumRightRef} position={[pipeOffsetX, drumY, 0]}>
        <mesh>
          <cylinderGeometry args={[drumRadius, drumRadius, drumHeight, 16]} />
          <meshStandardMaterial color={pipeUsefulColor} emissive={pipeUsefulColor} emissiveIntensity={active ? 0.35 : 0.18} metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[drumRadius + 0.02, 0, 0]}>
          <boxGeometry args={[0.03, drumHeight * 0.9, 0.02]} />
          <meshStandardMaterial color={0x408060} emissive={0x509070} emissiveIntensity={0.15} />
        </mesh>
      </group>

      <mesh position={[pipeOffsetX, connectorPipeCenterY, 0]}>
        <cylinderGeometry args={[pipeRadius, pipeRadius, connectorPipeLength, 12]} />
        <meshStandardMaterial color={pipeUsefulColor} emissive={pipeUsefulColor} emissiveIntensity={active ? 0.28 : 0.14} metalness={0.4} roughness={0.5} />
      </mesh>

      <mesh position={[horizontalPipeCenterXRight, exitY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[pipeRadius, pipeRadius, horizontalPipeLengthRight, 12]} />
        <meshStandardMaterial color={pipeUsefulColor} emissive={pipeUsefulColor} emissiveIntensity={active ? 0.28 : 0.14} metalness={0.4} roughness={0.5} />
      </mesh>

      <mesh position={[baseWidth / 2 + tipStickOut + 0.08, foundationCenterY + 0.14, 0]}>
        <cylinderGeometry args={[0.1, 0.11, 0.25, 16]} />
        <meshStandardMaterial color={usefulReservoirColor} emissive={usefulReservoirColor} emissiveIntensity={active ? 0.55 : 0.3} metalness={0.1} roughness={0.8} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
