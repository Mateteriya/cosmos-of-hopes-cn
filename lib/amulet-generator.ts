/**
 * Алгоритм генерации персонального амулета-навигатора
 * Для зарегистрированных пользователей (Уровень 2)
 */

import {
  getSymbolClass,
  getSymbolsForGender,
  getColorsForAmulet,
  type BaziElement,
  type ElementStrength,
  getStrengthCategory,
  mapElement,
} from './amulet-library';

export interface BaziAnalysisData {
  dayMaster: {
    element: string; // Русское название
    strength: number; // 1-5
    strengthText: string;
  };
  usefulElements: string[]; // Русские названия
  imbalance?: {
    excess?: string[];
    deficient?: string[];
  };
}

export interface AmuletGenerationResult {
  task: string;
  priorityElements: BaziElement[];
  symbolClass: ReturnType<typeof getSymbolClass>;
  recommendedSymbols: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
  }>;
  recommendedColors: Array<{
    value: string;
    label: string;
  }>;
  recommendedMaterials: Array<{
    id: string;
    name: string;
    description: string;
    color: string;
  }>;
  explanation: string;
}

/**
 * Генерирует персональный амулет-навигатор
 */
export function generatePersonalizedAmulet(
  baziData: BaziAnalysisData,
  gender: 'male' | 'female'
): AmuletGenerationResult {
  // Конвертируем данные
  const element = mapElement(baziData.dayMaster.element);
  const strength = getStrengthCategory(baziData.dayMaster.strength);
  const usefulElements = baziData.usefulElements.map(mapElement);

  // Получаем символокласс с учётом гендера
  const symbolClass = getSymbolClass(element, strength, gender);

  if (!symbolClass) {
    throw new Error(`Не найден символокласс для элемента ${element}, силы ${strength} и гендера ${gender}`);
  }

  // Используем задачу из symbolClass
  const task = symbolClass.task;

  // Определяем приоритетные элементы на основе элемента амулета
  const priorityElements = [symbolClass.amuletElement, element];

  // Получаем символы (в новой структуре они уже разделены по гендеру)
  const availableSymbols = getSymbolsForGender(symbolClass, gender);
  const recommendedSymbols = availableSymbols.slice(0, 3).map((sym) => ({
    id: sym.id,
    name: sym.name,
    icon: sym.icon,
    description: sym.description,
  }));

  // Получаем цвета (в новой структуре они уже определены конкретно)
  const colorValues = getColorsForAmulet(symbolClass, priorityElements);
  const recommendedColors = colorValues.map((color) => ({
    value: color,
    label: getColorLabel(color),
  }));

  // Материалы
  const recommendedMaterials = symbolClass.materials;

  // Генерируем объяснение
  const explanation = generateExplanation(
    element,
    strength,
    symbolClass.task, // Используем задачу из symbolClass
    priorityElements,
    symbolClass,
    baziData.dayMaster.element
  );

  return {
    task,
    priorityElements,
    symbolClass,
    recommendedSymbols,
    recommendedColors,
    recommendedMaterials,
    explanation,
    finalDescription: '', // Будет сгенерировано позже
  };
}

/**
 * Генерирует текстовое объяснение амулета
 */
function generateExplanation(
  element: BaziElement,
  strength: ElementStrength,
  task: string,
  priorityElements: BaziElement[],
  symbolClass: ReturnType<typeof getSymbolClass>,
  elementName: string
): string {
  const elementNames: Record<BaziElement, string> = {
    fire: 'Огонь',
    wood: 'Дерево',
    water: 'Вода',
    earth: 'Земля',
    metal: 'Металл',
  };

  const priorityNames = priorityElements.map((el) => elementNames[el]).join(' + ');
  const amuletElementName = elementNames[symbolClass.amuletElement];

  let explanation = `На основе вашей карты ваш личный элемент **${elementName}** `;

  if (strength === 'weak') {
    explanation += `нуждается в поддержке. `;
  } else if (strength === 'balanced') {
    explanation += `находится в балансе. `;
  } else {
    explanation += `сильный и нуждается в балансировке. `;
  }

  explanation += `Задача амулета в 2026 году (Год Огненной Лошади): **${task}**. `;
  explanation += `Рекомендуем элемент амулета: **${amuletElementName}**. `;
  explanation += `Логика взаимодействия: ${symbolClass.interactionLogic}.`;

  return explanation;
}

/**
 * Получает название цвета по HEX
 */
export function getColorLabel(hex: string): string {
  const colorMap: Record<string, string> = {
    // Огонь
    '#DC2626': 'Алый',
    '#EA580C': 'Оранжевый',
    '#B91C1C': 'Киноварь',
    '#F87171': 'Коралловый',
    '#E5AC7A': 'Розовое золото',
    '#9D174D': 'Малиновый',
    '#FB923C': 'Персиковый',
    // Дерево
    '#16A34A': 'Зелёный',
    '#22C55E': 'Светло-зелёный',
    '#15803D': 'Лесной зелёный',
    '#047857': 'Изумрудный',
    '#84CC16': 'Шалфейный',
    '#34D399': 'Мятный',
    '#2DD4BF': 'Морской волны',
    // Вода
    '#2563EB': 'Синий',
    '#3B82F6': 'Светло-синий',
    '#1E3A8A': 'Синий',
    '#1E40AF': 'Тёмно-синий',
    '#000000': 'Чёрный',
    '#7C3AED': 'Фиалковый',
    '#38BDF8': 'Лазурный',
    '#0D9488': 'Аквамарин',
    '#4B5563': 'Графитовый',
    '#4F46E5': 'Индиго',
    // Земля
    '#CA8A04': 'Золотой',
    '#EAB308': 'Жёлтый',
    '#92400E': 'Терракотовый',
    '#B45309': 'Светло-коричневый',
    '#78350F': 'Коричневый',
    '#D6D3A5': 'Песочный',
    '#A16207': 'Охристый',
    '#65A30D': 'Оливковый',
    // Металл
    '#64748B': 'Серебряный',
    '#475569': 'Тёмно-серебряный',
    '#F1F5F9': 'Белый',
    '#CBD5E1': 'Светло-серый',
    '#334155': 'Тёмно-серый',
    '#6B7280': 'Серый',
    '#D4D4D8': 'Серебристый',
    '#A8A29E': 'Металлик',
    '#F9FAFB': 'Белый',
    '#7E22CE': 'Сливовый',
    // Дополнительные
    '#C0C0C0': 'Серебряный',
    '#EC4899': 'Розовый',
    '#06B6D4': 'Бирюзовый',
    '#065F46': 'Глубокий зелёный',
    '#D2B48C': 'Бежевый',
    '#FFFFFF': 'Белый',
  };

  return colorMap[hex] || hex;
}

/**
 * Генерирует финальное описание амулета
 */
export function generateFinalAmuletDescription(
  symbolName: string,
  materialName: string,
  colorName: string,
  priorityElements: BaziElement[],
  task: string
): string {
  const elementNames: Record<BaziElement, string> = {
    fire: 'Огонь',
    wood: 'Дерево',
    water: 'Вода',
    earth: 'Земля',
    metal: 'Металл',
  };

  const elementsText = priorityElements.map((el) => elementNames[el]).join(' и ');

  return `**${symbolName} из ${materialName} в ${colorName} тонах**. ${elementsText} помогают ${task.toLowerCase()}, создавая гармонию в вашей карте Бацзы. ${symbolName} символизирует вашу роль в большом механизме дел этого года.`;
}

