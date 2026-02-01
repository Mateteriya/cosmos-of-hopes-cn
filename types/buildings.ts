/**
 * Типы для системы зданий
 */

export type Sphere = 'mind' | 'emotions' | 'body' | 'society';

export type BuildingType =
  // Сфера Разума
  | 'focus_tower'
  | 'маяк'
  | 'skills_library'
  | 'prototyping_lab'
  | 'observatory'
  | 'data_core'
  // Сфера Эмоций
  | 'calm_power_station'
  | 'regret_recycling_station'
  | 'simulation_chamber'
  // Сфера Тела
  | 'energy_source'
  | 'deep_sleep_capsule'
  | 'rhythm_matrix'
  | 'nutrient_synthesizer'
  | 'serendipity_park'
  // Сфера Связей
  | 'close_relations_embassy'
  | 'ted_presentation_hub'
  | 'protocol_firewall'
  | 'network_scanner'
  // Проекты Синтеза
  | 'feelings_to_actions_aqueduct'
  | 'open_source_hub'
  | 'bio_regulator';

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  sphere: Sphere;
  area: string;
  position: { x: number; y: number; z: number };
  built: boolean;
  active: boolean;
  level: number; // Уровень здания (1-5)
  connections: string[]; // ID связанных зданий
}

export interface BuildingConfig {
  type: BuildingType;
  name: string;
  sphere: Sphere;
  area: string;
  size: {
    width: number;
    height: number;
    depth: number;
  };
  color: {
    primary: string;
    secondary: string;
    glow: string;
  };
  animation: {
    pulse: boolean;
    rotate: boolean;
    float: boolean;
  };
}
