/**
 * Описания элементов У-Син и их силы
 * Философские и практические объяснения для пользователей
 */

export type BaziElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type ElementStrength = 'weak' | 'balanced' | 'strong';

export interface ElementExplanation {
  element: BaziElement;
  strength: ElementStrength;
  essence: string; // Суть элемента
  state: string; // Состояние при этой силе
  task: string; // Задача для работы с энергией
  practice: string; // Практический совет
  femaleNuance?: string; // Женский нюанс
  maleNuance?: string; // Мужской нюанс
}

// Маппинг русских названий на ключи
const ELEMENT_MAP: Record<string, BaziElement> = {
  'Металл': 'metal',
  'Дерево': 'wood',
  'Вода': 'water',
  'Огонь': 'fire',
  'Земля': 'earth',
};

// Маппинг силы
function mapStrength(strengthText: string): ElementStrength {
  const lower = strengthText.toLowerCase();
  if (lower.includes('слабый') || lower.includes('очень слабый')) return 'weak';
  if (lower.includes('сильный') || lower.includes('очень сильный')) return 'strong';
  return 'balanced';
}

// БИБЛИОТЕКА ОПИСАНИЙ

const ELEMENT_EXPLANATIONS: ElementExplanation[] = [
  // МЕТАЛЛ - СЛАБЫЙ
  {
    element: 'metal',
    strength: 'weak',
    essence: 'Тонкость, ясность, граница, чистота. Принцип различения и совершенства.',
    state: 'Чувствительность к дисгармонии, стремление к идеалу без силы реализации',
    task: 'Не затачивать, а полировать. Не рубить, а гранить',
    practice: 'Создание малых совершенств, ювелирная работа над деталями',
    femaleNuance: 'Зеркало, отражающее истину без искажений',
    maleNuance: 'Шлифовщик, доводящий до блеска',
  },
  // МЕТАЛЛ - БАЛАНСНЫЙ
  {
    element: 'metal',
    strength: 'balanced',
    essence: 'Тонкость, ясность, граница, чистота. Принцип различения и совершенства.',
    state: 'Гармония между гибкостью и твердостью',
    task: 'Быть и лезвием, и ножнами. Различать, но не разрушать',
    practice: 'Сбалансированная критика, четкие границы с сохранением связи',
  },
  // МЕТАЛЛ - СИЛЬНЫЙ
  {
    element: 'metal',
    strength: 'strong',
    essence: 'Тонкость, ясность, граница, чистота. Принцип различения и совершенства.',
    state: 'Непоколебимость принципов, резкость суждений',
    task: 'Не стать разрушительным. Направлять силу на преобразование, а не отсечение',
    practice: 'Хирургическая точность в решениях, создание структуры',
    femaleNuance: 'Скальпель, отделяющий здоровое от больного',
    maleNuance: 'Меч, охраняющий ценности',
  },

  // ДЕРЕВО - СЛАБОЕ
  {
    element: 'wood',
    strength: 'weak',
    essence: 'Рост, расширение, прямота, движение вверх. Принцип развития и проявления.',
    state: 'Желание роста без достаточной опоры',
    task: 'Не тянуться к солнцу, а углублять корни. Не расти ввысь, а укреплять ствол',
    practice: 'Маленькие ежедневные победы, поиск поддержки',
    femaleNuance: 'Ивовая ветвь — гибкость как сила',
    maleNuance: 'Молодой дубок — медленное укрепление',
  },
  // ДЕРЕВО - БАЛАНСНОЕ
  {
    element: 'wood',
    strength: 'balanced',
    essence: 'Рост, расширение, прямота, движение вверх. Принцип развития и проявления.',
    state: 'Гармоничный рост в такт сезонам',
    task: 'Давать плоды, не истощаясь. Проявлять, не подавляя',
    practice: 'Планомерное развитие, уважение к естественным циклам',
  },
  // ДЕРЕВО - СИЛЬНОЕ
  {
    element: 'wood',
    strength: 'strong',
    essence: 'Рост, расширение, прямота, движение вверх. Принцип развития и проявления.',
    state: 'Мощная экспансия, иногда подавление других',
    task: 'Направлять избыток в творчество. Быть опорой, а не преградой',
    practice: 'Крупные проекты, лидерство с заботой',
    femaleNuance: 'Великое древо — дающее тень и защиту',
    maleNuance: 'Кедр — несущий высоту и устойчивость',
  },

  // ВОДА - СЛАБАЯ
  {
    element: 'water',
    strength: 'weak',
    essence: 'Глубина, течение, адаптивность, мудрость. Принцип движения без формы.',
    state: 'Чувствительность к течениям, но недостаток напора',
    task: 'Не бороться с потоком, а изучать его. Не преодолевать, а обтекать',
    practice: 'Наблюдение, накопление мудрости, терпеливое ожидание',
    femaleNuance: 'Родник — чистота источника в тишине',
    maleNuance: 'Ручей — поиск пути через мягкость',
  },
  // ВОДА - БАЛАНСНАЯ
  {
    element: 'water',
    strength: 'balanced',
    essence: 'Глубина, течение, адаптивность, мудрость. Принцип движения без формы.',
    state: 'Гармония между глубиной и движением',
    task: 'Быть и озером, и рекой. Глубиной, которая течет',
    practice: 'Гибкая адаптация с сохранением сути',
  },
  // ВОДА - СИЛЬНАЯ
  {
    element: 'water',
    strength: 'strong',
    essence: 'Глубина, течение, адаптивность, мудрость. Принцип движения без формы.',
    state: 'Мощный поток, сметающий преграды',
    task: 'Не разрушать берега. Направлять силу в русло созидания',
    practice: 'Крупные перемены, трансформация ландшафта жизни',
    femaleNuance: 'Океан — глубина, рождающая течения',
    maleNuance: 'Потоп — обновляющий мир',
  },

  // ОГОНЬ - СЛАБЫЙ
  {
    element: 'fire',
    strength: 'weak',
    essence: 'Яркость, тепло, трансформация, вдохновение. Принцип озарения и страсти.',
    state: 'Искра, нуждающаяся в защите от ветра',
    task: 'Не разгораться, а тлеть. Не освещать мир, а согревать близких',
    practice: 'Маленькие ритуалы тепла, сохранение внутреннего огня',
    femaleNuance: 'Свеча — свет в интимном пространстве',
    maleNuance: 'Очаг — центр домашнего тепла',
  },
  // ОГОНЬ - БАЛАНСНЫЙ
  {
    element: 'fire',
    strength: 'balanced',
    essence: 'Яркость, тепло, трансформация, вдохновение. Принцип озарения и страсти.',
    state: 'Ровное пламя, дающее свет без ожогов',
    task: 'Согревать, не сжигая. Вдохновлять, не ослепляя',
    practice: 'Творчество с мерой, страсть с осознанностью',
  },
  // ОГОНЬ - СИЛЬНЫЙ
  {
    element: 'fire',
    strength: 'strong',
    essence: 'Яркость, тепло, трансформация, вдохновение. Принцип озарения и страсти.',
    state: 'Пожар энтузиазма, риск сжечь себя и других',
    task: 'Находить топливо, а не поглощать все вокруг',
    practice: 'Грандиозные проекты, лидерство через вдохновение',
    femaleNuance: 'Факел — освещающий путь другим',
    maleNuance: 'Солнце — дающее жизнь и рост',
  },

  // ЗЕМЛЯ - СЛАБАЯ
  {
    element: 'earth',
    strength: 'weak',
    essence: 'Стабильность, питание, центрированность, плодородие. Принцип основы и принятия.',
    state: 'Плодородный слой без глубины',
    task: 'Не держать, а принимать. Не контролировать, а питать',
    practice: 'Малые устойчивые привычки, заземление через простые действия',
    femaleNuance: 'Лужайка — мягкая поддержка каждого ростка',
    maleNuance: 'Пахотная земля — готовность принять семя',
  },
  // ЗЕМЛЯ - БАЛАНСНАЯ
  {
    element: 'earth',
    strength: 'balanced',
    essence: 'Стабильность, питание, центрированность, плодородие. Принцип основы и принятия.',
    state: 'Гармония между устойчивостью и гибкостью',
    task: 'Быть и горой, и долиной. Опора, которая дает свободу',
    practice: 'Создание структуры с пространством для роста',
  },
  // ЗЕМЛЯ - СИЛЬНАЯ
  {
    element: 'earth',
    strength: 'strong',
    essence: 'Стабильность, питание, центрированность, плодородие. Принцип основы и принятия.',
    state: 'Непоколебимость, граничащая с неподатливостью',
    task: 'Не отвергать, а преобразовывать. Не стоять на месте, а быть фундаментом движения',
    practice: 'Крупные системы, создание долговременных основ',
    femaleNuance: 'Мать-земля — рождающая и принимающая',
    maleNuance: 'Гора — точка отсчета в ландшафте',
  },
];

/**
 * Получить объяснение элемента по его названию и силе
 */
export function getElementExplanation(
  elementName: string,
  strengthText: string,
  gender?: 'male' | 'female'
): ElementExplanation | null {
  const element = ELEMENT_MAP[elementName];
  if (!element) return null;

  const strength = mapStrength(strengthText);
  const explanation = ELEMENT_EXPLANATIONS.find(
    (exp) => exp.element === element && exp.strength === strength
  );

  return explanation || null;
}

/**
 * Получить полное описание для отображения
 */
export function getFullElementDescription(
  elementName: string,
  strengthText: string,
  gender?: 'male' | 'female'
): string {
  const explanation = getElementExplanation(elementName, strengthText, gender);
  if (!explanation) return '';

  let description = `**СУТЬ:** ${explanation.essence}\n\n`;
  description += `**СОСТОЯНИЕ:** ${explanation.state}\n\n`;
  description += `**ЗАДАЧА:** ${explanation.task}\n\n`;
  description += `**ПРАКТИКА:** ${explanation.practice}`;

  if (gender && explanation[`${gender}Nuance` as keyof ElementExplanation]) {
    const nuance = explanation[`${gender}Nuance` as keyof ElementExplanation] as string;
    description += `\n\n**ВАШ НЮАНС:** ${nuance}`;
  }

  return description;
}

