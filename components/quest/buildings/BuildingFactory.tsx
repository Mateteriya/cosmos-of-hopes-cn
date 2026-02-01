'use client';

import React from 'react';
import { Building, BuildingType } from '@/types/buildings';
import Маяк from './Маяк';
import SkillsLibrary from './SkillsLibrary';
import PrototypingLab from './PrototypingLab';
import Observatory from './Observatory';
import DataCore from './DataCore';
import CalmPowerStation from './CalmPowerStation';
import RegretRecyclingStation from './RegretRecyclingStation';

interface BuildingFactoryProps {
  building: Building;
}

/**
 * Фабрика зданий
 * Создает соответствующий 3D-компонент на основе типа здания
 */
export default function BuildingFactory({ building }: BuildingFactoryProps) {
  // position уже содержит правильное смещение по Y (высота/2)
  // для того, чтобы основание здания было на уровне сетки (y=0)
  const position: [number, number, number] = [
    building.position.x,
    building.position.y,
    building.position.z,
  ];

  switch (building.type) {
    case 'focus_tower':
      return (
        <Маяк
          position={position}
          active={building.active}
          level={building.level}
        />
      );

    case 'маяк':
      return (
        <Маяк
          position={position}
          active={building.active}
          level={building.level}
        />
      );

    case 'skills_library':
      return (
        <SkillsLibrary
          position={position}
          active={building.active}
          level={building.level}
        />
      );

    case 'prototyping_lab':
      return (
        <PrototypingLab
          position={position}
          active={building.active}
          level={building.level}
        />
      );

    case 'observatory':
      return (
        <Observatory
          position={position}
          active={building.active}
          level={building.level}
        />
      );

    case 'data_core':
      return (
        <DataCore
          position={position}
          active={building.active}
          level={building.level}
        />
      );

    case 'calm_power_station':
      return (
        <CalmPowerStation
          position={position}
          active={building.active}
          level={building.level}
        />
      );

    case 'regret_recycling_station':
      return (
        <RegretRecyclingStation
          position={position}
          active={building.active}
          level={building.level}
        />
      );

    // Другие здания будут добавлены позже
    default:
      // Заглушка для неизвестных типов зданий
      return (
        <mesh position={position}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      );
  }
}
