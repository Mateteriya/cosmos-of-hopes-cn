// special-structures.js
// Модуль для определения специальных структур Бацзы
// Трансформационные структуры, Структуры Следования, Редкие структуры

// --- СЛОВАРИ ВЗАИМОДЕЙСТВИЙ ---

// Столкновения (冲) - 6 пар противоположностей
const CLASH_PAIRS = {
  "子": "午", "午": "子", // Крыса - Лошадь (Вода-Огонь, Север-Юг)
  "丑": "未", "未": "丑", // Бык - Коза (Земля Инь - Земля Инь)
  "寅": "申", "申": "寅", // Тигр - Обезьяна (Дерево-Металл)
  "卯": "酉", "酉": "卯", // Кролик - Петух (Дерево-Металл)
  "辰": "戌", "戌": "辰", // Дракон - Собака (Земля Ян - Земля Ян)
  "巳": "亥", "亥": "巳"  // Змея - Свинья (Огонь-Вода)
};

// Слияния Небесных Стволов (天干合) - 5 пар
const HEAVENLY_STEM_MERGERS = {
  "甲": "己", "己": "甲", // Дерево Ян + Земля Инь → Дерево
  "乙": "庚", "庚": "乙", // Дерево Инь + Металл Ян → Металл
  "丙": "辛", "辛": "丙", // Огонь Ян + Металл Инь → Вода
  "丁": "壬", "壬": "丁", // Огонь Инь + Вода Ян → Дерево
  "戊": "癸", "癸": "戊"  // Земля Ян + Вода Инь → Огонь
};

// Элементы, создаваемые слияниями Небесных Стволов
const MERGER_RESULT_ELEMENTS = {
  "甲己": "Дерево", "己甲": "Дерево",
  "乙庚": "Металл", "庚乙": "Металл",
  "丙辛": "Вода", "辛丙": "Вода",
  "丁壬": "Дерево", "壬丁": "Дерево",
  "戊癸": "Огонь", "癸戊": "Огонь"
};

// Слияния Земных Ветвей (地支合) - 6 пар
const EARTHLY_BRANCH_MERGERS = [
  { pair: ["子", "丑"], element: "Земля", name: "子丑合" },
  { pair: ["寅", "亥"], element: "Дерево", name: "寅亥合" },
  { pair: ["卯", "戌"], element: "Огонь", name: "卯戌合" },
  { pair: ["辰", "酉"], element: "Металл", name: "辰酉合" },
  { pair: ["巳", "申"], element: "Вода", name: "巳申合" },
  { pair: ["午", "未"], element: "Земля", name: "午未合" }
];

// Вред (害) - 6 пар
const HARM_PAIRS = {
  "子": "未", "未": "子",
  "丑": "午", "午": "丑",
  "寅": "巳", "巳": "寅",
  "卯": "辰", "辰": "卯",
  "申": "亥", "亥": "申",
  "酉": "戌", "戌": "酉"
};

// Наказания (刑) - включая тройные и самонаказание
const PUNISHMENT_PAIRS = {
  // Тройное наказание Дерева-Огня-Металла
  "寅": ["巳"], "巳": ["申"], "申": ["寅"],
  // Тройное наказание Земли
  "丑": ["戌"], "戌": ["未"], "未": ["丑"],
  // Самонаказание (自刑)
  "辰": ["辰"], "午": ["午"], "酉": ["酉"], "亥": ["亥"]
};

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

/**
 * Получает элемент (пять элементов) для Небесного Ствола или Земной Ветви
 */
function getElement(glyph) {
  const elementMap = {
    // Небесные Стволы
    '甲': 'Дерево', '乙': 'Дерево',
    '丙': 'Огонь', '丁': 'Огонь',
    '戊': 'Земля', '己': 'Земля',
    '庚': 'Металл', '辛': 'Металл',
    '壬': 'Вода', '癸': 'Вода',
    // Земные Ветви
    '寅': 'Дерево', '卯': 'Дерево',
    '巳': 'Огонь', '午': 'Огонь',
    '辰': 'Земля', '戌': 'Земля', '丑': 'Земля', '未': 'Земля',
    '申': 'Металл', '酉': 'Металл',
    '亥': 'Вода', '子': 'Вода'
  };
  return elementMap[glyph] || null;
}

/**
 * Получает все Небесные Стволы и Земные Ветви карты
 */
function getChartComponents(bazi) {
  return {
    stems: {
      year: bazi.year.stem.name,
      month: bazi.month.stem.name,
      day: bazi.day.stem.name,
      hour: bazi.hour.stem.name
    },
    branches: {
      year: bazi.year.branch.name,
      month: bazi.month.branch.name,
      day: bazi.day.branch.name,
      hour: bazi.hour.branch.name
    }
  };
}

/**
 * Получает скрытые стволы (藏干) для Земной Ветви
 */
function getHiddenStems(branch) {
  const hiddenStemsMap = {
    '子': ['癸'], // Свинья: Вода Инь
    '丑': ['己', '癸', '辛'], // Бык: Земля Инь, Вода Инь, Металл Инь
    '寅': ['甲', '丙', '戊'], // Тигр: Дерево Ян, Огонь Ян, Земля Ян
    '卯': ['乙'], // Кролик: Дерево Инь
    '辰': ['戊', '乙', '癸'], // Дракон: Земля Ян, Дерево Инь, Вода Инь
    '巳': ['丙', '戊', '庚'], // Змея: Огонь Ян, Земля Ян, Металл Ян
    '午': ['丁', '己'], // Лошадь: Огонь Инь, Земля Инь
    '未': ['己', '丁', '乙'], // Коза: Земля Инь, Огонь Инь, Дерево Инь
    '申': ['庚', '壬', '戊'], // Обезьяна: Металл Ян, Вода Ян, Земля Ян
    '酉': ['辛'], // Петух: Металл Инь
    '戌': ['戊', '辛', '丁'], // Собака: Земля Ян, Металл Инь, Огонь Инь
    '亥': ['壬', '甲'] // Свинья: Вода Ян, Дерево Ян
  };
  return hiddenStemsMap[branch] || [];
}

/**
 * Проверяет, есть ли элемент Ресурса (рождающий Господина Дня)
 */
function hasResourceSupport(dayMasterElement, chart) {
  const resourceMap = {
    'Дерево': 'Вода',
    'Огонь': 'Дерево',
    'Земля': 'Огонь',
    'Металл': 'Земля',
    'Вода': 'Металл'
  };
  const resourceElement = resourceMap[dayMasterElement];
  
  const components = getChartComponents(chart);
  const allStems = [components.stems.year, components.stems.month, components.stems.day, components.stems.hour];
  const allBranches = [components.branches.year, components.branches.month, components.branches.day, components.branches.hour];
  
  // Проверяем Небесные Стволы
  for (const stem of allStems) {
    if (getElement(stem) === resourceElement) {
      return true;
    }
  }
  
  // Проверяем Земные Ветви и их скрытые стволы
  for (const branch of allBranches) {
    if (getElement(branch) === resourceElement) {
      return true;
    }
    const hiddenStems = getHiddenStems(branch);
    for (const hiddenStem of hiddenStems) {
      if (getElement(hiddenStem) === resourceElement) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Проверяет, есть ли элемент Братства (того же элемента, что и Господин Дня)
 */
function hasBrotherSupport(dayMasterElement, dayMasterGlyph, chart) {
  const components = getChartComponents(chart);
  const allStems = [components.stems.year, components.stems.month, components.stems.hour];
  const allBranches = [components.branches.year, components.branches.month, components.branches.day, components.branches.hour];
  
  // Проверяем Небесные Стволы (кроме самого дня)
  for (const stem of allStems) {
    if (getElement(stem) === dayMasterElement && stem !== dayMasterGlyph) {
      return true;
    }
  }
  
  // Проверяем Земные Ветви и их скрытые стволы
  for (const branch of allBranches) {
    if (getElement(branch) === dayMasterElement) {
      return true;
    }
    const hiddenStems = getHiddenStems(branch);
    for (const hiddenStem of hiddenStems) {
      if (getElement(hiddenStem) === dayMasterElement && hiddenStem !== dayMasterGlyph) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Проверяет, есть ли "корень" (корневая поддержка) для Господина Дня
 */
function hasRootSupport(dayMasterGlyph, chart) {
  const components = getChartComponents(chart);
  const dayMasterElement = getElement(dayMasterGlyph);
  
  // Проверяем Земные Ветви на наличие того же элемента
  const allBranches = [components.branches.year, components.branches.month, components.branches.day, components.branches.hour];
  
  for (const branch of allBranches) {
    if (getElement(branch) === dayMasterElement) {
      // Проверяем, есть ли в скрытых стволах тот же ствол
      const hiddenStems = getHiddenStems(branch);
      for (const hiddenStem of hiddenStems) {
        if (hiddenStem === dayMasterGlyph) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Подсчитывает количество элементов определенного типа в карте
 */
function countElementsInChart(element, chart) {
  let count = 0;
  const components = getChartComponents(chart);
  
  const allStems = [components.stems.year, components.stems.month, components.stems.day, components.stems.hour];
  const allBranches = [components.branches.year, components.branches.month, components.branches.day, components.branches.hour];
  
  // Считаем Небесные Стволы
  for (const stem of allStems) {
    if (getElement(stem) === element) {
      count++;
    }
  }
  
  // Считаем Земные Ветви и их скрытые стволы (с весом)
  for (const branch of allBranches) {
    if (getElement(branch) === element) {
      count++;
    }
    const hiddenStems = getHiddenStems(branch);
    for (const hiddenStem of hiddenStems) {
      if (getElement(hiddenStem) === element) {
        count += 0.3; // Скрытые стволы имеют меньший вес
      }
    }
  }
  
  return count;
}

/**
 * Получает элемент, который контролирует указанный элемент
 */
function getControllingElement(element) {
  const controlMap = {
    'Дерево': 'Металл',
    'Огонь': 'Вода',
    'Земля': 'Дерево',
    'Металл': 'Огонь',
    'Вода': 'Земля'
  };
  return controlMap[element];
}

/**
 * Получает элемент, который порождает указанный элемент
 */
function getGeneratingElement(element) {
  const generateMap = {
    'Дерево': 'Вода',
    'Огонь': 'Дерево',
    'Земля': 'Огонь',
    'Металл': 'Земля',
    'Вода': 'Металл'
  };
  return generateMap[element];
}

/**
 * Получает элемент, который контролирует Господина Дня
 */
function getDayMasterControllingElement(dayMasterElement) {
  return getControllingElement(dayMasterElement);
}

/**
 * Получает элемент Самовыражения (который рождается от Господина Дня)
 */
function getDayMasterOutputElement(dayMasterElement) {
  const outputMap = {
    'Дерево': 'Огонь',
    'Огонь': 'Земля',
    'Земля': 'Металл',
    'Металл': 'Вода',
    'Вода': 'Дерево'
  };
  return outputMap[dayMasterElement];
}

// --- ОСНОВНОЙ АЛГОРИТМ ОПРЕДЕЛЕНИЯ ТИПА КАРТЫ ---

/**
 * Определяет тип карты Бацзы по алгоритму "воронки"
 * @param {Object} bazi - объект с данными карты Бацзы
 * @returns {Object} - { type: string, usefulElements: string[], details: Object }
 */
function determineCardType(bazi) {
  const components = getChartComponents(bazi);
  const dayMasterGlyph = components.stems.day;
  const dayMasterElement = getElement(dayMasterGlyph);
  const monthBranch = components.branches.month;
  const monthBranchElement = getElement(monthBranch);
  
  // Шаг 1: Проверка на структуры Трансформации
  const transformation = isTransformationStructure(bazi, dayMasterGlyph, dayMasterElement, monthBranch, monthBranchElement);
  if (transformation.isMatch) {
    return {
      type: 'Transformation Structure',
      typeRu: 'Структура Трансформации (化格)',
      usefulElements: transformation.usefulElements,
      details: transformation.details
    };
  }
  
  // Шаг 2: Проверка на структуры Следования
  const follow = isFollowStructure(bazi, dayMasterGlyph, dayMasterElement);
  if (follow.isMatch) {
    return {
      type: 'Follow Structure',
      typeRu: `Структура Следования (${follow.subtypeRu})`,
      usefulElements: follow.usefulElements,
      details: follow.details
    };
  }
  
  // Шаг 3: Проверка на вибрационные структуры
  const vibrational = isVibrationalStructure(bazi, dayMasterElement);
  if (vibrational.isMatch) {
    return {
      type: 'Vibrational Structure',
      typeRu: 'Вибрационная структура',
      usefulElements: vibrational.usefulElements,
      details: vibrational.details
    };
  }
  
  // Шаг 4: Проверка на редкие структуры
  const rare = isRareStructure(bazi);
  if (rare.isMatch) {
    return {
      type: 'Rare Structure',
      typeRu: rare.structureNameRu,
      usefulElements: rare.usefulElements,
      details: rare.details
    };
  }
  
  // Шаг 5: Стандартный анализ силы/слабости
  return analyzeNormalStrength(bazi, dayMasterElement);
}

// --- ФУНКЦИИ ОПРЕДЕЛЕНИЯ СПЕЦИАЛЬНЫХ СТРУКТУР ---

/**
 * Проверяет, является ли карта структурой Трансформации (化格)
 */
function isTransformationStructure(bazi, dayMasterGlyph, dayMasterElement, monthBranch, monthBranchElement) {
  const components = getChartComponents(bazi);
  
  // Условие 1: Проверяем слияние Небесного Ствола дня с соседним (месяц или час)
  let mergerPair = null;
  let transformationElement = null;
  
  const dayStem = components.stems.day;
  const monthStem = components.stems.month;
  const hourStem = components.stems.hour;
  
  // Проверяем слияние с месяцем
  if (HEAVENLY_STEM_MERGERS[dayStem] === monthStem || HEAVENLY_STEM_MERGERS[monthStem] === dayStem) {
    const pairKey = dayStem + monthStem;
    transformationElement = MERGER_RESULT_ELEMENTS[pairKey] || MERGER_RESULT_ELEMENTS[monthStem + dayStem];
    if (transformationElement) {
      mergerPair = { stem1: dayStem, stem2: monthStem, position: 'month' };
    }
  }
  
  // Проверяем слияние с часом
  if (!mergerPair && (HEAVENLY_STEM_MERGERS[dayStem] === hourStem || HEAVENLY_STEM_MERGERS[hourStem] === dayStem)) {
    const pairKey = dayStem + hourStem;
    transformationElement = MERGER_RESULT_ELEMENTS[pairKey] || MERGER_RESULT_ELEMENTS[hourStem + dayStem];
    if (transformationElement) {
      mergerPair = { stem1: dayStem, stem2: hourStem, position: 'hour' };
    }
  }
  
  if (!mergerPair || !transformationElement) {
    return { isMatch: false };
  }
  
  // Условие 2: Сезон должен поддерживать трансформацию
  // Месячная ветвь должна быть элементом трансформации
  if (monthBranchElement !== transformationElement) {
    return { isMatch: false };
  }
  
  // Условие 3: Господин Дня слаб и не имеет поддержки
  if (hasResourceSupport(dayMasterElement, bazi)) {
    return { isMatch: false };
  }
  if (hasBrotherSupport(dayMasterElement, dayMasterGlyph, bazi)) {
    return { isMatch: false };
  }
  if (hasRootSupport(dayMasterGlyph, bazi)) {
    return { isMatch: false };
  }
  
  // Условие 4: Нет "разрушителя" (элемента, который контролирует элемент трансформации)
  const controllingElement = getControllingElement(transformationElement);
  const controllingCount = countElementsInChart(controllingElement, bazi);
  if (controllingCount >= 1.5) { // Сильный разрушитель
    return { isMatch: false };
  }
  
  // Все условия выполнены - это структура Трансформации
  const generatingElement = getGeneratingElement(transformationElement);
  
  return {
    isMatch: true,
    usefulElements: [transformationElement, generatingElement],
    details: {
      mergerPair: mergerPair,
      transformationElement: transformationElement,
      generatingElement: generatingElement
    }
  };
}

/**
 * Проверяет, является ли карта структурой Следования (从格)
 */
function isFollowStructure(bazi, dayMasterGlyph, dayMasterElement) {
  // Условие 1: Господин Дня экстремально слаб
  if (hasResourceSupport(dayMasterElement, bazi)) {
    return { isMatch: false };
  }
  if (hasBrotherSupport(dayMasterElement, dayMasterGlyph, bazi)) {
    return { isMatch: false };
  }
  if (hasRootSupport(dayMasterGlyph, bazi)) {
    return { isMatch: false };
  }
  
  // Условие 2: Один из других элементов доминирует
  const wealthElement = getDayMasterControllingElement(dayMasterElement);
  const powerElement = getDayMasterControllingElement(dayMasterElement); // То же самое
  const outputElement = getDayMasterOutputElement(dayMasterElement);
  const generatingOutputElement = getGeneratingElement(outputElement);
  
  // Следование за Богатством (从财格)
  const wealthCount = countElementsInChart(wealthElement, bazi);
  const outputCountForWealth = countElementsInChart(outputElement, bazi);
  if (wealthCount >= 2.5 && outputCountForWealth >= 1) {
    return {
      isMatch: true,
      subtypeRu: 'Следование за Богатством (从财格)',
      usefulElements: [wealthElement, outputElement],
      details: {
        dominantElement: wealthElement,
        supportingElement: outputElement,
        wealthCount: wealthCount,
        outputCount: outputCountForWealth
      }
    };
  }
  
  // Следование за Властью (从杀格)
  if (wealthCount >= 2.5) {
    return {
      isMatch: true,
      subtypeRu: 'Следование за Властью (从杀格)',
      usefulElements: [powerElement],
      details: {
        dominantElement: powerElement,
        powerCount: wealthCount
      }
    };
  }
  
  // Следование за Самовыражением (从儿格)
  if (outputCountForWealth >= 2.5) {
    return {
      isMatch: true,
      subtypeRu: 'Следование за Самовыражением (从儿格)',
      usefulElements: [outputElement, generatingOutputElement],
      details: {
        dominantElement: outputElement,
        generatingElement: generatingOutputElement,
        outputCount: outputCountForWealth
      }
    };
  }
  
  return { isMatch: false };
}

/**
 * Проверяет вибрационные структуры (двухэлементные)
 */
function isVibrationalStructure(bazi, dayMasterElement) {
  // Простая проверка: если карта содержит только два элемента в значительном количестве
  const elements = ['Дерево', 'Огонь', 'Земля', 'Металл', 'Вода'];
  const elementCounts = {};
  
  for (const element of elements) {
    elementCounts[element] = countElementsInChart(element, bazi);
  }
  
  // Сортируем элементы по количеству
  const sortedElements = Object.entries(elementCounts)
    .filter(([_, count]) => count > 0.5)
    .sort((a, b) => b[1] - a[1]);
  
  // Если только два элемента доминируют (сумма > 70% от общего)
  if (sortedElements.length === 2) {
    const total = sortedElements[0][1] + sortedElements[1][1];
    const allTotal = Object.values(elementCounts).reduce((a, b) => a + b, 0);
    
    if (total / allTotal >= 0.7) {
      return {
        isMatch: true,
        usefulElements: sortedElements.map(([element]) => element),
        details: {
          dominantElements: sortedElements.map(([element, count]) => ({ element, count }))
        }
      };
    }
  }
  
  return { isMatch: false };
}

/**
 * Проверяет редкие структуры (например, "Летящая Лошадь")
 */
function isRareStructure(bazi) {
  const components = getChartComponents(bazi);
  const branches = [components.branches.year, components.branches.month, components.branches.day, components.branches.hour];
  
  // Подсчитываем частоту каждой ветви
  const branchCounts = {};
  for (const branch of branches) {
    branchCounts[branch] = (branchCounts[branch] || 0) + 1;
  }
  
  // Проверяем на структуру "три одинаковые ветви"
  for (const [branch, count] of Object.entries(branchCounts)) {
    if (count >= 3) {
      // Определяем сталкивающуюся ветвь
      const clashingBranch = CLASH_PAIRS[branch];
      if (clashingBranch && !branches.includes(clashingBranch)) {
        // Сталкивающаяся ветвь отсутствует - это редкая структура
        const clashingElement = getElement(clashingBranch);
        const generatingElement = getGeneratingElement(clashingElement);
        
        // Определяем название структуры на русском
        const branchNames = {
          '子': 'Крысы', '丑': 'Быка', '寅': 'Тигра', '卯': 'Кролика',
          '辰': 'Дракона', '巳': 'Змеи', '午': 'Лошади', '未': 'Козы',
          '申': 'Обезьяны', '酉': 'Петуха', '戌': 'Собаки', '亥': 'Свиньи'
        };
        const clashingBranchNames = {
          '子': 'Лошадью', '丑': 'Козой', '寅': 'Обезьяной', '卯': 'Петухом',
          '辰': 'Собакой', '巳': 'Свиньей', '午': 'Крысой', '未': 'Быком',
          '申': 'Тигром', '酉': 'Кроликом', '戌': 'Драконом', '亥': 'Змеей'
        };
        
        return {
          isMatch: true,
          structureNameRu: `Редкая структура: Три ${branchNames[branch] || branch} сталкиваются с ${clashingBranchNames[clashingBranch] || clashingBranch}`,
          usefulElements: [clashingElement, generatingElement],
          details: {
            repeatedBranch: branch,
            repeatedCount: count,
            clashingBranch: clashingBranch,
            clashingElement: clashingElement
          }
        };
      }
    }
  }
  
  return { isMatch: false };
}

/**
 * Стандартный анализ силы/слабости (если нет специальных структур)
 */
function analyzeNormalStrength(bazi, dayMasterElement) {
  // Подсчитываем поддержку Господина Дня
  const resourceElement = getGeneratingElement(dayMasterElement);
  const brotherCount = countElementsInChart(dayMasterElement, bazi) - 1; // -1 для самого Господина Дня
  const resourceCount = countElementsInChart(resourceElement, bazi);
  
  const totalSupport = brotherCount + resourceCount;
  const isStrong = totalSupport >= 2;
  
  // Определяем полезные элементы
  let usefulElements = [];
  
  if (isStrong) {
    // Сильный Господин Дня: нужны элементы, которые он может контролировать или использовать
    const controllingElement = getDayMasterControllingElement(dayMasterElement);
    const outputElement = getDayMasterOutputElement(dayMasterElement);
    usefulElements = [controllingElement, outputElement];
  } else {
    // Слабый Господин Дня: нужны поддержка
    usefulElements = [dayMasterElement, resourceElement];
  }
  
  return {
    type: 'Normal Structure',
    typeRu: isStrong ? 'Сильная структура' : 'Слабая структура',
    usefulElements: usefulElements,
    details: {
      strength: isStrong ? 'strong' : 'weak',
      brotherCount: brotherCount,
      resourceCount: resourceCount,
      totalSupport: totalSupport
    }
  };
}

/**
 * Определяет столкновения с приходящим месяцем
 * @param {Object} bazi - объект карты Бацзы
 * @param {string} comingMonthBranch - Земная Ветвь приходящего месяца
 * @returns {Array} - массив столкновений [{ pillar: string, clash: string, meaning: string }]
 */
function detectClashesWithMonth(bazi, comingMonthBranch) {
  const clashes = [];
  const components = getChartComponents(bazi);
  
  const pillars = [
    { name: '年柱', branch: components.branches.year },
    { name: '月柱', branch: components.branches.month },
    { name: '日柱', branch: components.branches.day },
    { name: '时柱', branch: components.branches.hour }
  ];
  
  for (const pillar of pillars) {
    const clashingBranch = CLASH_PAIRS[pillar.branch];
    if (clashingBranch === comingMonthBranch) {
      clashes.push({
        pillar: pillar.name,
        branch: pillar.branch,
        clash: comingMonthBranch,
        meaning: `Столкновение ${pillar.branch} с ${comingMonthBranch}`
      });
    }
  }
  
  return clashes;
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CLASH_PAIRS,
    HEAVENLY_STEM_MERGERS,
    MERGER_RESULT_ELEMENTS,
    EARTHLY_BRANCH_MERGERS,
    HARM_PAIRS,
    PUNISHMENT_PAIRS,
    determineCardType,
    detectClashesWithMonth
  };
}
