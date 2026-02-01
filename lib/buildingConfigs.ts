import { BuildingConfig, BuildingType } from '@/types/buildings';

/**
 * Конфигурации для всех типов зданий
 * Основано на QUEST_BUILDINGS_DETAILS.md
 */

export const buildingConfigs: Record<BuildingType, BuildingConfig> = {
  // Сфера Разума
  focus_tower: {
    type: 'focus_tower',
    name: 'Башня Фокуса',
    sphere: 'mind',
    area: 'Фокус и Концентрация',
    size: { width: 0.8, height: 2.5, depth: 0.8 },
    color: {
      primary: '#4a90e2', // Голубой
      secondary: '#7b68ee', // Фиолетовый
      glow: '#00bfff', // Яркий голубой
    },
    animation: {
      pulse: true,
      rotate: false,
      float: true,
    },
  },

  маяк: {
    type: 'маяк',
    name: 'Маяк',
    sphere: 'mind',
    area: 'Фокус и Концентрация',
    size: { width: 0.8, height: 2.5, depth: 0.8 },
    color: {
      primary: '#4a90e2', // Голубой
      secondary: '#7b68ee', // Фиолетовый
      glow: '#00bfff', // Яркий голубой
    },
    animation: {
      pulse: true,
      rotate: false,
      float: true,
    },
  },

  skills_library: {
    type: 'skills_library',
    name: 'Библиотека Навыков',
    sphere: 'mind',
    area: 'Обучение и Память',
    size: { width: 1.5, height: 1.8, depth: 1.5 },
    color: {
      primary: '#5b9bd5', // Голубой
      secondary: '#8b7ec8', // Фиолетовый
      glow: '#87ceeb', // Небесно-голубой
    },
    animation: {
      pulse: true,
      rotate: false,
      float: false,
    },
  },

  prototyping_lab: {
    type: 'prototyping_lab',
    name: 'Лаборатория Прототипирования',
    sphere: 'mind',
    area: 'Креативность и Воображение',
    size: { width: 2, height: 1.5, depth: 2 },
    color: {
      primary: '#9370db', // Фиолетовый
      secondary: '#ba55d3', // Средний фиолетовый
      glow: '#ff00ff', // Неоновый фиолетовый
    },
    animation: {
      pulse: true,
      rotate: true,
      float: false,
    },
  },

  observatory: {
    type: 'observatory',
    name: 'Обсерватория Долгосрочного Планирования',
    sphere: 'mind',
    area: 'Принятие Решений и Планирование',
    size: { width: 1.8, height: 2.2, depth: 1.8 },
    color: {
      primary: '#4169e1', // Королевский синий
      secondary: '#6a5acd', // Сланцево-синий
      glow: '#00ced1', // Темно-бирюзовый
    },
    animation: {
      pulse: true,
      rotate: true,
      float: false,
    },
  },

  data_core: {
    type: 'data_core',
    name: 'Ядро Данных',
    sphere: 'mind',
    area: 'Обучение и Память',
    size: { width: 1.2, height: 1.5, depth: 1.2 },
    color: {
      primary: '#4682b4', // Стальной синий
      secondary: '#708090', // Серый
      glow: '#00ffff', // Циан
    },
    animation: {
      pulse: true,
      rotate: false,
      float: false,
    },
  },

  // Сфера Эмоций
  calm_power_station: {
    type: 'calm_power_station',
    name: 'Электростанция Спокойствия',
    sphere: 'emotions',
    area: 'Лагуна Спокойствия',
    size: { width: 1.8, height: 1.5, depth: 1.8 },
    color: {
      primary: '#ff69b4', // Розовый
      secondary: '#ff1493', // Глубокий розовый
      glow: '#ffb6c1', // Светло-розовый
    },
    animation: {
      pulse: true,
      rotate: false,
      float: true,
    },
  },

  regret_recycling_station: {
    type: 'regret_recycling_station',
    name: 'Станция Переработки Сожалений',
    sphere: 'emotions',
    area: 'Резильентность',
    size: { width: 1.5, height: 1.2, depth: 1.5 },
    color: {
      primary: '#87ceeb', // Небесно-голубой
      secondary: '#98fb98', // Бледно-зеленый
      glow: '#e0ffff', // Светло-голубой
    },
    animation: {
      pulse: true,
      rotate: false,
      float: false,
    },
  },

  simulation_chamber: {
    type: 'simulation_chamber',
    name: 'Симуляционная Камера',
    sphere: 'emotions',
    area: 'Резильентность',
    size: { width: 1, height: 1.2, depth: 1 },
    color: {
      primary: '#ff6347', // Томатный
      secondary: '#ff4500', // Красно-оранжевый
      glow: '#ffa500', // Оранжевый
    },
    animation: {
      pulse: true,
      rotate: true,
      float: false,
    },
  },

  // Сфера Тела
  energy_source: {
    type: 'energy_source',
    name: 'Источник Энергии',
    sphere: 'body',
    area: 'Источник Энергии',
    size: { width: 2, height: 2.5, depth: 2 },
    color: {
      primary: '#32cd32', // Лайм-зеленый
      secondary: '#00ff00', // Зеленый
      glow: '#90ee90', // Светло-зеленый
    },
    animation: {
      pulse: true,
      rotate: true,
      float: false,
    },
  },

  deep_sleep_capsule: {
    type: 'deep_sleep_capsule',
    name: 'Капсула Глубокого Сна',
    sphere: 'body',
    area: 'Покои Отдыха',
    size: { width: 0.8, height: 1.2, depth: 0.8 },
    color: {
      primary: '#9370db', // Фиолетовый
      secondary: '#8a2be2', // Синий фиолетовый
      glow: '#dda0dd', // Сливовый
    },
    animation: {
      pulse: true,
      rotate: false,
      float: true,
    },
  },

  rhythm_matrix: {
    type: 'rhythm_matrix',
    name: 'Матрица Ритма',
    sphere: 'body',
    area: 'Территория Движения',
    size: { width: 1.5, height: 0.3, depth: 1.5 },
    color: {
      primary: '#00ff7f', // Весенний зеленый
      secondary: '#00fa9a', // Средний весенний зеленый
      glow: '#7fff00', // Чартрез
    },
    animation: {
      pulse: true,
      rotate: true,
      float: false,
    },
  },

  nutrient_synthesizer: {
    type: 'nutrient_synthesizer',
    name: 'Нутриентный Синтезатор',
    sphere: 'body',
    area: 'Цитадель Питания',
    size: { width: 1.5, height: 1.2, depth: 1.5 },
    color: {
      primary: '#98fb98', // Бледно-зеленый
      secondary: '#90ee90', // Светло-зеленый
      glow: '#adff2f', // Зелено-желтый
    },
    animation: {
      pulse: true,
      rotate: false,
      float: false,
    },
  },

  serendipity_park: {
    type: 'serendipity_park',
    name: 'Парк Серендипности',
    sphere: 'body',
    area: 'Покои Отдыха',
    size: { width: 3, height: 0.5, depth: 3 },
    color: {
      primary: '#228b22', // Лесной зеленый
      secondary: '#2e8b57', // Морской зеленый
      glow: '#66cdaa', // Средний аквамариновый
    },
    animation: {
      pulse: true,
      rotate: false,
      float: false,
    },
  },

  // Сфера Связей
  close_relations_embassy: {
    type: 'close_relations_embassy',
    name: 'Посольство Близких Связей',
    sphere: 'society',
    area: 'Посольство Отношений',
    size: { width: 1.5, height: 1.8, depth: 1.5 },
    color: {
      primary: '#ffd700', // Золотой
      secondary: '#ffa500', // Оранжевый
      glow: '#ffff00', // Желтый
    },
    animation: {
      pulse: true,
      rotate: false,
      float: false,
    },
  },

  ted_presentation_hub: {
    type: 'ted_presentation_hub',
    name: 'Презентационный Хаб TED',
    sphere: 'society',
    area: 'Искусство Коммуникации',
    size: { width: 2, height: 1.5, depth: 2 },
    color: {
      primary: '#ff8c00', // Темно-оранжевый
      secondary: '#ff6347', // Томатный
      glow: '#ffa500', // Оранжевый
    },
    animation: {
      pulse: true,
      rotate: false,
      float: false,
    },
  },

  protocol_firewall: {
    type: 'protocol_firewall',
    name: 'Протокольный Файрвол',
    sphere: 'society',
    area: 'Таможня Личных Границ',
    size: { width: 4, height: 0.5, depth: 4 },
    color: {
      primary: '#daa520', // Золотистый
      secondary: '#b8860b', // Темно-золотистый
      glow: '#ffd700', // Золотой
    },
    animation: {
      pulse: true,
      rotate: false,
      float: false,
    },
  },

  network_scanner: {
    type: 'network_scanner',
    name: 'Сетевой Сканер',
    sphere: 'society',
    area: 'Искусство Коммуникации',
    size: { width: 1, height: 2.5, depth: 1 },
    color: {
      primary: '#ffd700', // Золотой
      secondary: '#ffa500', // Оранжевый
      glow: '#ffff00', // Желтый
    },
    animation: {
      pulse: true,
      rotate: true,
      float: false,
    },
  },

  // Проекты Синтеза
  feelings_to_actions_aqueduct: {
    type: 'feelings_to_actions_aqueduct',
    name: 'Акведук Из Чувств в Действия',
    sphere: 'emotions', // Связь между Эмоциями и Разумом
    area: 'Синтез',
    size: { width: 0.5, height: 1, depth: 5 },
    color: {
      primary: '#9370db', // Фиолетовый (смесь эмоций и разума)
      secondary: '#4a90e2', // Голубой
      glow: '#ff00ff', // Неоновый фиолетовый
    },
    animation: {
      pulse: true,
      rotate: false,
      float: false,
    },
  },

  open_source_hub: {
    type: 'open_source_hub',
    name: 'Хаб Open Source',
    sphere: 'mind', // Связь между Разумом и Связями
    area: 'Синтез',
    size: { width: 1.5, height: 1.5, depth: 1.5 },
    color: {
      primary: '#4a90e2', // Голубой (разум)
      secondary: '#ffd700', // Золотой (связи)
      glow: '#00ffff', // Циан
    },
    animation: {
      pulse: true,
      rotate: true,
      float: false,
    },
  },

  bio_regulator: {
    type: 'bio_regulator',
    name: 'Био-регулятор',
    sphere: 'body', // Связь между Телом и Эмоциями
    area: 'Синтез',
    size: { width: 1.2, height: 1.2, depth: 1.2 },
    color: {
      primary: '#32cd32', // Лайм-зеленый (тело)
      secondary: '#ff69b4', // Розовый (эмоции)
      glow: '#ff00ff', // Неоновый фиолетовый
    },
    animation: {
      pulse: true,
      rotate: false,
      float: true,
    },
  },
};

/**
 * Получить конфигурацию здания по типу
 */
export function getBuildingConfig(type: BuildingType): BuildingConfig {
  return buildingConfigs[type];
}
