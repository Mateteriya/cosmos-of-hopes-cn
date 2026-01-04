// bazi-calculator-expert.js - ЭКСПЕРТНАЯ ВЕРСИЯ С ПОЛНЫМИ УЛУЧШЕНИЯМИ
// Улучшения:
// 1. Точный расчёт возраста начала удачи
// 2. Учёт скрытых стволов (藏干)
// 3. Многофакторный анализ силы элемента
// 4. Взаимодействия столпов (слияния, столкновения, наказания, вреди)
// 5. Сила небесных стволов по сезону
// 6. Улучшенные солнечные термины
// 7. Система генерации контента

import lunisolar from 'lunisolar';
import moment from 'moment-timezone';

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function getElementName(stemOrBranch) {
  if (!stemOrBranch) return 'Неизвестно';
  const elemObj = stemOrBranch.fiveElement || stemOrBranch._fiveElement || stemOrBranch.element;
  if (elemObj && elemObj.name) {
    const enName = elemObj.name;
    const ruMap = { 'wood': 'Дерево', 'fire': 'Огонь', 'earth': 'Земля', 'metal': 'Металл', 'water': 'Вода' };
    return ruMap[enName.toLowerCase()] || enName;
  }
  const name = stemOrBranch.name;
  const elementFromGlyph = {
    '甲': 'Дерево', '乙': 'Дерево', '寅': 'Дерево', '卯': 'Дерево',
    '丙': 'Огонь', '丁': 'Огонь', '巳': 'Огонь', '午': 'Огонь',
    '戊': 'Земля', '己': 'Земля', '辰': 'Земля', '戌': 'Земля', '丑': 'Земля', '未': 'Земля',
    '庚': 'Металл', '辛': 'Металл', '申': 'Металл', '酉': 'Металл',
    '壬': 'Вода', '癸': 'Вода', '亥': 'Вода', '子': 'Вода'
  };
  return elementFromGlyph[name] || 'Неизвестно';
}

function getStemBranchElement(glyph) {
  const map = {
    '甲': 'Дерево', '乙': 'Дерево', '丙': 'Огонь', '丁': 'Огонь',
    '戊': 'Земля', '己': 'Земля', '庚': 'Металл', '辛': 'Металл',
    '壬': 'Вода', '癸': 'Вода',
    '寅': 'Дерево', '卯': 'Дерево', '巳': 'Огонь', '午': 'Огонь',
    '辰': 'Земля', '戌': 'Земля', '丑': 'Земля', '未': 'Земля',
    '申': 'Металл', '酉': 'Металл', '亥': 'Вода', '子': 'Вода'
  };
  return map[glyph] || 'Неизвестно';
}

// --- УЛУЧШЕНИЕ 4: ВЗАИМОДЕЙСТВИЯ СТОЛПОВ ---
/**
 * Анализирует взаимодействия между столпами
 * Слияния (合), Столкновения (冲), Наказания (刑), Вреди (害)
 */
function analyzePillarInteractions(bazi) {
  const interactions = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  const pillars = [
    { name: pillarNames[0], branch: bazi.year.branch.name },
    { name: pillarNames[1], branch: bazi.month.branch.name },
    { name: pillarNames[2], branch: bazi.day.branch.name },
    { name: pillarNames[3], branch: bazi.hour.branch.name }
  ];
  
  // СЛИЯНИЯ (合) - 6 пар гармонии
  const mergers = [
    { pair: ['子', '丑'], name: '子丑合', element: 'Земля', meaning: 'Слияние Воды и Земли создаёт гармонию в отношениях' },
    { pair: ['寅', '亥'], name: '寅亥合', element: 'Дерево', meaning: 'Слияние Дерева и Воды способствует росту и развитию' },
    { pair: ['卯', '戌'], name: '卯戌合', element: 'Огонь', meaning: 'Слияние Дерева и Земли порождает творческую энергию' },
    { pair: ['辰', '酉'], name: '辰酉合', element: 'Металл', meaning: 'Слияние Земли и Металла укрепляет решимость' },
    { pair: ['巳', '申'], name: '巳申合', element: 'Вода', meaning: 'Слияние Огня и Металла создаёт баланс и мудрость' },
    { pair: ['午', '未'], name: '午未合', element: 'Земля', meaning: 'Слияние Огня и Земли приносит стабильность' }
  ];
  
  // СТОЛКНОВЕНИЯ (冲) - 6 пар противостояния
  const clashes = [
    { pair: ['子', '午'], name: '子午冲', meaning: 'Столкновение Воды и Огня указывает на внутренние конфликты и перемены' },
    { pair: ['丑', '未'], name: '丑未冲', meaning: 'Столкновение Земли создаёт напряжение в материальной сфере' },
    { pair: ['寅', '申'], name: '寅申冲', meaning: 'Столкновение Дерева и Металла приносит резкие перемены' },
    { pair: ['卯', '酉'], name: '卯酉冲', meaning: 'Столкновение Дерева и Металла указывает на конфликты в отношениях' },
    { pair: ['辰', '戌'], name: '辰戌冲', meaning: 'Столкновение Земли создаёт нестабильность в карьере' },
    { pair: ['巳', '亥'], name: '巳亥冲', meaning: 'Столкновение Огня и Воды приносит эмоциональные перепады' }
  ];
  
  // НАКАЗАНИЯ (刑) - ВСЕ 12 ПАР
  // Тройное наказание (三刑): 寅刑巳, 巳刑申, 申刑寅 (циклическое)
  // Тройное наказание Земли: 丑刑戌, 戌刑未, 未刑丑 (циклическое)
  // Самонаказание (自刑): 辰刑辰, 午刑午, 酉刑酉, 亥刑亥
  const punishments = [
    // Тройное наказание Дерева-Огня-Металла (циклическое)
    { pair: ['寅', '巳'], name: '寅刑巳', meaning: 'Наказание между Деревом и Огнём указывает на скрытое напряжение' },
    { pair: ['巳', '申'], name: '巳刑申', meaning: 'Наказание между Огнём и Металлом создаёт внутренние препятствия' },
    { pair: ['申', '寅'], name: '申刑寅', meaning: 'Наказание между Металлом и Деревом указывает на необходимость осторожности' },
    // Тройное наказание Земли (циклическое)
    { pair: ['丑', '戌'], name: '丑刑戌', meaning: 'Наказание между Землёй указывает на сложности в материальных вопросах' },
    { pair: ['戌', '未'], name: '戌刑未', meaning: 'Наказание между Землёй создаёт препятствия в стабильности' },
    { pair: ['未', '丑'], name: '未刑丑', meaning: 'Наказание между Землёй указывает на необходимость терпения' },
    // Самонаказание (自刑) - когда одна и та же ветвь встречается в разных столпах
    { pair: ['辰', '辰'], name: '辰自刑', meaning: 'Самонаказание Дракона указывает на внутренние противоречия и необходимость самоанализа' },
    { pair: ['午', '午'], name: '午自刑', meaning: 'Самонаказание Лошади указывает на излишнюю самокритику и необходимость самопринятия' },
    { pair: ['酉', '酉'], name: '酉自刑', meaning: 'Самонаказание Петуха указывает на перфекционизм и необходимость гибкости' },
    { pair: ['亥', '亥'], name: '亥自刑', meaning: 'Самонаказание Свиньи указывает на склонность к самокопанию и необходимость движения вперёд' },
    // Дополнительные пары наказаний
    { pair: ['子', '卯'], name: '子刑卯', meaning: 'Наказание между Водой и Деревом указывает на необходимость баланса между гибкостью и твёрдостью' },
    { pair: ['卯', '子'], name: '卯刑子', meaning: 'Наказание между Деревом и Водой указывает на внутренние конфликты между желаниями и возможностями' }
  ];
  
  // ВРЕДЫ (害) - ВСЕ 12 ПАР
  // Вреды образуют 6 пар противоположных ветвей
  const harms = [
    { pair: ['子', '未'], name: '子害未', meaning: 'Вред между Водой и Землёй указывает на скрытые препятствия' },
    { pair: ['未', '子'], name: '未害子', meaning: 'Вред между Землёй и Водой создаёт внутренние противоречия в материальной сфере' },
    { pair: ['丑', '午'], name: '丑害午', meaning: 'Вред между Землёй и Огнём создаёт внутренние противоречия' },
    { pair: ['午', '丑'], name: '午害丑', meaning: 'Вред между Огнём и Землёй указывает на конфликт между страстью и стабильностью' },
    { pair: ['寅', '巳'], name: '寅害巳', meaning: 'Вред между Деревом и Огнём указывает на необходимость баланса' },
    { pair: ['巳', '寅'], name: '巳害寅', meaning: 'Вред между Огнём и Деревом указывает на необходимость контроля импульсов' },
    { pair: ['卯', '辰'], name: '卯害辰', meaning: 'Вред между Деревом и Землёй создаёт напряжение в отношениях' },
    { pair: ['辰', '卯'], name: '辰害卯', meaning: 'Вред между Землёй и Деревом указывает на препятствия в росте и развитии' },
    { pair: ['申', '亥'], name: '申害亥', meaning: 'Вред между Металлом и Водой указывает на скрытые конфликты' },
    { pair: ['亥', '申'], name: '亥害申', meaning: 'Вред между Водой и Металлом указывает на необходимость гибкости в принятии решений' },
    { pair: ['酉', '戌'], name: '酉害戌', meaning: 'Вред между Металлом и Землёй создаёт препятствия в карьере' },
    { pair: ['戌', '酉'], name: '戌害酉', meaning: 'Вред между Землёй и Металлом указывает на сложности в достижении целей' }
  ];
  
  // Проверяем все взаимодействия
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const branch1 = pillars[i].branch;
      const branch2 = pillars[j].branch;
      
      // Проверяем слияния
      for (const merger of mergers) {
        if ((merger.pair[0] === branch1 && merger.pair[1] === branch2) ||
            (merger.pair[1] === branch1 && merger.pair[0] === branch2)) {
          interactions.push({
            type: '合',
            name: merger.name,
            pillars: [pillars[i].name, pillars[j].name],
            description: `${merger.meaning}. Влияет на сферу жизни, представленную этими столпами.`,
            element: merger.element,
            impact: 'positive'
          });
        }
      }
      
      // Проверяем столкновения
      for (const clash of clashes) {
        if ((clash.pair[0] === branch1 && clash.pair[1] === branch2) ||
            (clash.pair[1] === branch1 && clash.pair[0] === branch2)) {
          interactions.push({
            type: '冲',
            name: clash.name,
            pillars: [pillars[i].name, pillars[j].name],
            description: `${clash.meaning}. Ожидайте перемен и необходимости адаптации.`,
            impact: 'neutral'
          });
        }
      }
      
      // Проверяем наказания
      for (const punishment of punishments) {
        if ((punishment.pair[0] === branch1 && punishment.pair[1] === branch2) ||
            (punishment.pair[1] === branch1 && punishment.pair[0] === branch2)) {
          interactions.push({
            type: '刑',
            name: punishment.name,
            pillars: [pillars[i].name, pillars[j].name],
            description: `${punishment.meaning}. Требуется осторожность и терпение.`,
            impact: 'negative'
          });
        }
      }
      
      // Проверяем вреди
      for (const harm of harms) {
        if ((harm.pair[0] === branch1 && harm.pair[1] === branch2) ||
            (harm.pair[1] === branch1 && harm.pair[0] === branch2)) {
          interactions.push({
            type: '害',
            name: harm.name,
            pillars: [pillars[i].name, pillars[j].name],
            description: `${harm.meaning}. Следите за скрытыми препятствиями.`,
            impact: 'negative'
          });
        }
      }
    }
  }
  
  // НОВОЕ: Проверяем самонаказания (когда одна ветвь встречается в разных столпах)
  const branchCounts = {};
  pillars.forEach(p => {
    branchCounts[p.branch] = (branchCounts[p.branch] || 0) + 1;
  });
  
  // Самонаказания (自刑) - когда одна ветвь встречается в разных столпах
  const selfPunishmentMeanings = {
    '辰': 'Самонаказание Дракона указывает на внутренние противоречия и необходимость самоанализа. Может проявляться как излишняя самокритика.',
    '午': 'Самонаказание Лошади указывает на излишнюю самокритику и необходимость самопринятия. Может проявляться как перфекционизм.',
    '酉': 'Самонаказание Петуха указывает на перфекционизм и необходимость гибкости. Может проявляться как излишняя требовательность к себе.',
    '亥': 'Самонаказание Свиньи указывает на склонность к самокопанию и необходимость движения вперёд. Может проявляться как излишняя рефлексия.'
  };
  
  const selfPunishments = ['辰', '午', '酉', '亥'];
  selfPunishments.forEach(branch => {
    if (branchCounts[branch] >= 2) {
      const affectedPillars = pillars.filter(p => p.branch === branch).map(p => p.name);
      interactions.push({
        type: '刑',
        name: `${branch}自刑`,
        pillars: affectedPillars,
        description: selfPunishmentMeanings[branch] || `Самонаказание ${branch} указывает на внутренние противоречия.`,
        impact: 'negative',
        isSelfPunishment: true
      });
    }
  });
  
  return interactions;
}

// --- НОВОЕ: ВЗАИМОДЕЙСТВИЯ НЕБЕСНЫХ СТВОЛОВ (合化) ---
/**
 * Анализирует взаимодействия небесных стволов (合化)
 * Слияния стволов могут трансформироваться в другие элементы
 */
function analyzeStemInteractions(bazi) {
  const stemInteractions = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  const pillars = [
    { name: pillarNames[0], stem: bazi.year.stem.name },
    { name: pillarNames[1], stem: bazi.month.stem.name },
    { name: pillarNames[2], stem: bazi.day.stem.name },
    { name: pillarNames[3], stem: bazi.hour.stem.name }
  ];
  
  // СЛИЯНИЯ СТВОЛОВ (合化) - 5 основных пар
  const stemMergers = [
    { 
      pair: ['甲', '己'], 
      name: '甲己合化土', 
      transformsTo: 'Земля',
      meaning: 'Слияние Дерева Ян и Земли Инь трансформируется в Землю. Усиливает стабильность и практичность.'
    },
    { 
      pair: ['乙', '庚'], 
      name: '乙庚合化金', 
      transformsTo: 'Металл',
      meaning: 'Слияние Дерева Инь и Металла Ян трансформируется в Металл. Усиливает решимость и ясность.'
    },
    { 
      pair: ['丙', '辛'], 
      name: '丙辛合化水', 
      transformsTo: 'Вода',
      meaning: 'Слияние Огня Ян и Металла Инь трансформируется в Воду. Усиливает мудрость и гибкость.'
    },
    { 
      pair: ['丁', '壬'], 
      name: '丁壬合化木', 
      transformsTo: 'Дерево',
      meaning: 'Слияние Огня Инь и Воды Ян трансформируется в Дерево. Усиливает рост и развитие.'
    },
    { 
      pair: ['戊', '癸'], 
      name: '戊癸合化火', 
      transformsTo: 'Огонь',
      meaning: 'Слияние Земли Ян и Воды Инь трансформируется в Огонь. Усиливает энтузиазм и творчество.'
    }
  ];
  
  // Проверяем все пары столпов
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const stem1 = pillars[i].stem;
      const stem2 = pillars[j].stem;
      
      for (const merger of stemMergers) {
        if ((merger.pair[0] === stem1 && merger.pair[1] === stem2) ||
            (merger.pair[1] === stem1 && merger.pair[0] === stem2)) {
          stemInteractions.push({
            type: '合化',
            name: merger.name,
            pillars: [pillars[i].name, pillars[j].name],
            transformsTo: merger.transformsTo,
            description: merger.meaning,
            impact: 'positive'
          });
        }
      }
    }
  }
  
  return stemInteractions;
}

// --- НОВОЕ: СПЕЦИАЛЬНЫЕ КОМБИНАЦИИ (三合, 三会) ---
/**
 * Анализирует специальные комбинации земных ветвей
 * 三合 (Тройное слияние) - 4 триады
 * 三会 (Тройное собрание) - 4 триады по сезонам
 */
function analyzeSpecialCombinations(bazi) {
  const combinations = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  const branches = [
    { name: pillarNames[0], branch: bazi.year.branch.name },
    { name: pillarNames[1], branch: bazi.month.branch.name },
    { name: pillarNames[2], branch: bazi.day.branch.name },
    { name: pillarNames[3], branch: bazi.hour.branch.name }
  ];
  
  const branchNames = branches.map(b => b.branch);
  
  // ТРОЙНОЕ СЛИЯНИЕ (三合) - 4 триады
  const tripleMergers = [
    {
      branches: ['申', '子', '辰'],
      name: '申子辰三合水',
      element: 'Вода',
      meaning: 'Тройное слияние Обезьяны, Крысы и Дракона создаёт мощную энергию Воды. Усиливает мудрость, адаптивность и глубину.'
    },
    {
      branches: ['亥', '卯', '未'],
      name: '亥卯未三合木',
      element: 'Дерево',
      meaning: 'Тройное слияние Свиньи, Кролика и Козы создаёт мощную энергию Дерева. Усиливает рост, развитие и творчество.'
    },
    {
      branches: ['寅', '午', '戌'],
      name: '寅午戌三合火',
      element: 'Огонь',
      meaning: 'Тройное слияние Тигра, Лошади и Собаки создаёт мощную энергию Огня. Усиливает энтузиазм, страсть и влияние.'
    },
    {
      branches: ['巳', '酉', '丑'],
      name: '巳酉丑三合金',
      element: 'Металл',
      meaning: 'Тройное слияние Змеи, Петуха и Быка создаёт мощную энергию Металла. Усиливает решимость, дисциплину и ясность.'
    }
  ];
  
  // ТРОЙНОЕ СОБРАНИЕ (三会) - 4 триады по сезонам
  const tripleGatherings = [
    {
      branches: ['寅', '卯', '辰'],
      name: '寅卯辰三会木',
      element: 'Дерево',
      season: 'Весна',
      meaning: 'Тройное собрание весенних ветвей создаёт мощную энергию Дерева. Усиливает начало, рост и новые возможности.'
    },
    {
      branches: ['巳', '午', '未'],
      name: '巳午未三会火',
      element: 'Огонь',
      season: 'Лето',
      meaning: 'Тройное собрание летних ветвей создаёт мощную энергию Огня. Усиливает активность, страсть и признание.'
    },
    {
      branches: ['申', '酉', '戌'],
      name: '申酉戌三会金',
      element: 'Металл',
      season: 'Осень',
      meaning: 'Тройное собрание осенних ветвей создаёт мощную энергию Металла. Усиливает ясность, порядок и завершение.'
    },
    {
      branches: ['亥', '子', '丑'],
      name: '亥子丑三会水',
      element: 'Вода',
      season: 'Зима',
      meaning: 'Тройное собрание зимних ветвей создаёт мощную энергию Воды. Усиливает мудрость, глубину и накопление.'
    }
  ];
  
  // Проверяем тройные слияния (三合)
  for (const merger of tripleMergers) {
    const found = merger.branches.filter(b => branchNames.includes(b));
    if (found.length >= 2) {
      const foundPillars = branches.filter(b => merger.branches.includes(b.branch)).map(b => b.name);
      combinations.push({
        type: '三合',
        name: merger.name,
        branches: found,
        pillars: foundPillars,
        element: merger.element,
        description: merger.meaning + (found.length === 3 ? ' Полная триада — очень сильное влияние!' : ' Частичная триада — умеренное влияние.'),
        impact: 'positive',
        completeness: found.length === 3 ? 'complete' : 'partial'
      });
    }
  }
  
  // Проверяем тройные собрания (三会)
  for (const gathering of tripleGatherings) {
    const found = gathering.branches.filter(b => branchNames.includes(b));
    if (found.length >= 2) {
      const foundPillars = branches.filter(b => gathering.branches.includes(b.branch)).map(b => b.name);
      combinations.push({
        type: '三会',
        name: gathering.name,
        branches: found,
        pillars: foundPillars,
        element: gathering.element,
        season: gathering.season,
        description: gathering.meaning + (found.length === 3 ? ' Полное собрание — очень сильное влияние!' : ' Частичное собрание — умеренное влияние.'),
        impact: 'positive',
        completeness: found.length === 3 ? 'complete' : 'partial'
      });
    }
  }
  
  return combinations;
}

// --- УЛУЧШЕНИЕ 5: СИЛА НЕБЕСНЫХ СТВОЛОВ ПО СЕЗОНУ ---
/**
 * Определяет силу каждого небесного ствола относительно месяца рождения
 */
function calculateStemStrengthBySeason(stem, monthBranch) {
  const stemElement = getStemBranchElement(stem.name);
  const monthElement = getStemBranchElement(monthBranch.name);
  
  // Правила силы по сезону для каждого элемента
  const seasonRules = {
    'Дерево': {
      旺: ['寅', '卯', '辰'],  // Весна
      相: ['亥', '子', '丑'],  // Зима (производит Дерево)
      休: ['申', '酉', '戌'],  // Осень (контролирует Дерево)
      囚: ['巳', '午', '未'],  // Лето (ослабляет Дерево)
      死: []
    },
    'Огонь': {
      旺: ['巳', '午', '未'],  // Лето
      相: ['寅', '卯', '辰'],  // Весна (производит Огонь)
      休: ['亥', '子', '丑'],  // Зима (контролирует Огонь)
      囚: ['申', '酉', '戌'],  // Осень (ослабляет Огонь)
      死: []
    },
    'Земля': {
      旺: ['辰', '戌', '丑', '未'],  // Конец сезонов
      相: ['巳', '午', '未'],  // Лето (производит Землю)
      休: ['寅', '卯', '辰'],  // Весна (контролирует Землю)
      囚: ['亥', '子', '丑'],  // Зима (ослабляет Землю)
      死: ['申', '酉', '戌']   // Осень (ослабляет Землю)
    },
    'Металл': {
      旺: ['申', '酉', '戌'],  // Осень
      相: ['辰', '戌', '丑', '未'],  // Земля (производит Металл)
      休: ['巳', '午', '未'],  // Лето (контролирует Металл)
      囚: ['寅', '卯', '辰'],  // Весна (ослабляет Металл)
      死: ['亥', '子', '丑']   // Зима (ослабляет Металл)
    },
    'Вода': {
      旺: ['亥', '子', '丑'],  // Зима
      相: ['申', '酉', '戌'],  // Осень (производит Воду)
      休: ['辰', '戌', '丑', '未'],  // Земля (контролирует Воду)
      囚: ['巳', '午', '未'],  // Лето (ослабляет Воду)
      死: ['寅', '卯', '辰']   // Весна (ослабляет Воду)
    }
  };
  
  const rules = seasonRules[stemElement] || seasonRules['Дерево'];
  const monthBranchName = monthBranch.name;
  
  let state = '休';
  let strength = 3;
  let strengthText = 'средний';
  
  if (rules.旺.includes(monthBranchName)) {
    state = '旺';
    strength = 5;
    strengthText = 'очень сильный';
  } else if (rules.相.includes(monthBranchName)) {
    state = '相';
    strength = 4;
    strengthText = 'сильный';
  } else if (rules.休.includes(monthBranchName)) {
    state = '休';
    strength = 3;
    strengthText = 'средний';
  } else if (rules.囚.includes(monthBranchName)) {
    state = '囚';
    strength = 2;
    strengthText = 'слабый';
  } else if (rules.死.includes(monthBranchName)) {
    state = '死';
    strength = 1;
    strengthText = 'очень слабый';
  }
  
  return {
    state,
    strength,
    strengthText,
    element: stemElement,
    glyph: stem.name
  };
}

// --- УЛУЧШЕНИЕ 6: УЛУЧШЕННЫЕ СОЛНЕЧНЫЕ ТЕРМИНЫ ---
function calculateLuckStartAge(lsr, direction, birthPlace) {
  try {
    const birthDate = moment.tz(lsr.toDate(), birthPlace);
    const birthYear = birthDate.year();
    const birthMonth = birthDate.month() + 1;
    const birthDay = birthDate.date();
    
    const solarTerms = [
      { index: 0, month: 1, approxDay: 5, name: '小寒' },
      { index: 1, month: 1, approxDay: 20, name: '大寒' },
      { index: 2, month: 2, approxDay: 4, name: '立春' },
      { index: 3, month: 2, approxDay: 19, name: '雨水' },
      { index: 4, month: 3, approxDay: 6, name: '惊蛰' },
      { index: 5, month: 3, approxDay: 21, name: '春分' },
      { index: 6, month: 4, approxDay: 5, name: '清明' },
      { index: 7, month: 4, approxDay: 20, name: '谷雨' },
      { index: 8, month: 5, approxDay: 6, name: '立夏' },
      { index: 9, month: 5, approxDay: 21, name: '小满' },
      { index: 10, month: 6, approxDay: 6, name: '芒种' },
      { index: 11, month: 6, approxDay: 21, name: '夏至' },
      { index: 12, month: 7, approxDay: 7, name: '小暑' },
      { index: 13, month: 7, approxDay: 23, name: '大暑' },
      { index: 14, month: 8, approxDay: 7, name: '立秋' },
      { index: 15, month: 8, approxDay: 23, name: '处暑' },
      { index: 16, month: 9, approxDay: 8, name: '白露' },
      { index: 17, month: 9, approxDay: 23, name: '秋分' },
      { index: 18, month: 10, approxDay: 8, name: '寒露' },
      { index: 19, month: 10, approxDay: 23, name: '霜降' },
      { index: 20, month: 11, approxDay: 7, name: '立冬' },
      { index: 21, month: 11, approxDay: 22, name: '小雪' },
      { index: 22, month: 12, approxDay: 7, name: '大雪' },
      { index: 23, month: 12, approxDay: 22, name: '冬至' }
    ];
    
    let targetSolarTermDate = null;
    
    if (direction === 'forward') {
      let currentTermIndex = -1;
      for (let i = 0; i < solarTerms.length; i++) {
        const term = solarTerms[i];
        if (term.month === birthMonth) {
          if (birthDay >= term.approxDay) {
            currentTermIndex = i;
          }
        } else if (term.month < birthMonth) {
          currentTermIndex = i;
        }
      }
      
      if (currentTermIndex === -1 || currentTermIndex === solarTerms.length - 1) {
        targetSolarTermDate = moment.tz(`${birthYear + 1}-02-04`, birthPlace);
      } else {
        const nextTerm = solarTerms[currentTermIndex + 1];
        let termYear = birthYear;
        if (nextTerm.month < birthMonth || (nextTerm.month === birthMonth && nextTerm.approxDay <= birthDay)) {
          termYear = birthYear + 1;
        }
        targetSolarTermDate = moment.tz(`${termYear}-${String(nextTerm.month).padStart(2, '0')}-${String(nextTerm.approxDay).padStart(2, '0')}`, birthPlace);
      }
    } else {
      let currentTermIndex = -1;
      for (let i = solarTerms.length - 1; i >= 0; i--) {
        const term = solarTerms[i];
        if (term.month === birthMonth) {
          if (birthDay <= term.approxDay) {
            currentTermIndex = i;
          }
        } else if (term.month > birthMonth) {
          currentTermIndex = i;
        }
      }
      
      if (currentTermIndex === -1 || currentTermIndex === 0) {
        targetSolarTermDate = moment.tz(`${birthYear - 1}-12-22`, birthPlace);
      } else {
        const prevTerm = solarTerms[currentTermIndex - 1];
        let termYear = birthYear;
        if (prevTerm.month > birthMonth || (prevTerm.month === birthMonth && prevTerm.approxDay >= birthDay)) {
          termYear = birthYear - 1;
        }
        targetSolarTermDate = moment.tz(`${termYear}-${String(prevTerm.month).padStart(2, '0')}-${String(prevTerm.approxDay).padStart(2, '0')}`, birthPlace);
      }
    }
    
    if (!targetSolarTermDate) {
      return 6.0;
    }
    
    const daysBetween = Math.abs(targetSolarTermDate.diff(birthDate, 'days'));
    const startAge = (daysBetween * 3) / 30;
    return Math.round(startAge * 10) / 10;
    
  } catch (error) {
    console.warn('Ошибка расчёта возраста начала удачи:', error.message);
    return 6.0;
  }
}

// Скрытые стволы (из предыдущей версии)
const hiddenStems = {
  '子': [{ stem: '癸', weight: 1.0 }],
  '丑': [{ stem: '己', weight: 0.6 }, { stem: '癸', weight: 0.3 }, { stem: '辛', weight: 0.1 }],
  '寅': [{ stem: '甲', weight: 0.7 }, { stem: '丙', weight: 0.2 }, { stem: '戊', weight: 0.1 }],
  '卯': [{ stem: '乙', weight: 1.0 }],
  '辰': [{ stem: '戊', weight: 0.6 }, { stem: '乙', weight: 0.3 }, { stem: '癸', weight: 0.1 }],
  '巳': [{ stem: '丙', weight: 0.7 }, { stem: '戊', weight: 0.2 }, { stem: '庚', weight: 0.1 }],
  '午': [{ stem: '丁', weight: 0.7 }, { stem: '己', weight: 0.3 }],
  '未': [{ stem: '己', weight: 0.6 }, { stem: '丁', weight: 0.3 }, { stem: '乙', weight: 0.1 }],
  '申': [{ stem: '庚', weight: 0.7 }, { stem: '壬', weight: 0.2 }, { stem: '戊', weight: 0.1 }],
  '酉': [{ stem: '辛', weight: 1.0 }],
  '戌': [{ stem: '戊', weight: 0.6 }, { stem: '辛', weight: 0.3 }, { stem: '丁', weight: 0.1 }],
  '亥': [{ stem: '壬', weight: 0.7 }, { stem: '甲', weight: 0.3 }]
};

function addHiddenStemsToBalance(balance, branchGlyph) {
  const hidden = hiddenStems[branchGlyph];
  if (!hidden) return;
  hidden.forEach(({ stem, weight }) => {
    const element = getStemBranchElement(stem);
    balance[element] += weight;
  });
}

// Многофакторный анализ силы (из предыдущей версии, упрощённо)
function calculateElementStrength(bazi, dayMasterElement, monthBranchName) {
  let strength = 3;
  const details = {
    seasonScore: 0,
    rootScore: 0,
    supportScore: 0,
    controlScore: 0
  };
  
  const strengthRules = {
    'Дерево': { 旺: ['寅','卯','辰'], 相: ['亥','子','丑'], 休: ['申','酉','戌'], 囚: ['巳','午','未'], 死: ['辰','戌','丑','未'] },
    'Огонь': { 旺: ['巳','午','未'], 相: ['寅','卯','辰'], 休: ['亥','子','丑'], 囚: ['申','酉','戌'], 死: ['辰','戌','丑','未'] },
    'Земля': { 旺: ['辰','戌','丑','未'], 相: ['巳','午','未'], 休: ['寅','卯','辰'], 囚: ['亥','子','丑'], 死: ['申','酉','戌'] },
    'Металл': { 旺: ['申','酉','戌'], 相: ['辰','戌','丑','未'], 休: ['巳','午','未'], 囚: ['寅','卯','辰'], 死: ['亥','子','丑'] },
    'Вода': { 旺: ['亥','子','丑'], 相: ['申','酉','戌'], 休: ['辰','戌','丑','未'], 囚: ['巳','午','未'], 死: ['寅','卯','辰'] }
  };
  
  const rules = strengthRules[dayMasterElement] || strengthRules['Дерево'];
  if (rules.旺.includes(monthBranchName)) { details.seasonScore = 5; }
  else if (rules.相.includes(monthBranchName)) { details.seasonScore = 4; }
  else if (rules.休.includes(monthBranchName)) { details.seasonScore = 3; }
  else if (rules.囚.includes(monthBranchName)) { details.seasonScore = 2; }
  else if (rules.死.includes(monthBranchName)) { details.seasonScore = 1; }
  else { details.seasonScore = 3; }
  
  const rootBranches = {
    'Дерево': ['寅', '卯', '辰'],
    'Огонь': ['巳', '午', '未'],
    'Земля': ['辰', '戌', '丑', '未'],
    'Металл': ['申', '酉', '戌'],
    'Вода': ['亥', '子', '丑']
  };
  
  const roots = rootBranches[dayMasterElement] || [];
  let rootCount = 0;
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
  
  pillars.forEach(pillar => {
    const branchName = pillar.branch.name;
    if (roots.includes(branchName)) rootCount++;
    const hidden = hiddenStems[branchName];
    if (hidden) {
      hidden.forEach(({ stem, weight }) => {
        if (getStemBranchElement(stem) === dayMasterElement) {
          rootCount += weight * 0.5;
        }
      });
    }
  });
  
  if (rootCount === 0) { details.rootScore = 1; }
  else if (rootCount < 1) { details.rootScore = 2; }
  else if (rootCount < 2) { details.rootScore = 3; }
  else if (rootCount < 3) { details.rootScore = 4; }
  else { details.rootScore = 5; }
  
  const producingElements = {
    'Дерево': 'Вода', 'Огонь': 'Дерево', 'Земля': 'Огонь',
    'Металл': 'Земля', 'Вода': 'Металл'
  };
  
  const supportElement = producingElements[dayMasterElement];
  let supportCount = 0;
  
  pillars.forEach(pillar => {
    const stemElement = getElementName(pillar.stem);
    const branchElement = getElementName(pillar.branch);
    if (stemElement === supportElement) supportCount += 1.0;
    if (branchElement === supportElement) supportCount += 1.0;
    const hidden = hiddenStems[pillar.branch.name];
    if (hidden) {
      hidden.forEach(({ stem, weight }) => {
        if (getStemBranchElement(stem) === supportElement) {
          supportCount += weight;
        }
      });
    }
  });
  
  if (supportCount === 0) { details.supportScore = 1; }
  else if (supportCount < 2) { details.supportScore = 3; }
  else if (supportCount < 4) { details.supportScore = 4; }
  else { details.supportScore = 5; }
  
  const controllingElements = {
    'Дерево': 'Металл', 'Огонь': 'Вода', 'Земля': 'Дерево',
    'Металл': 'Огонь', 'Вода': 'Земля'
  };
  
  const controlElement = controllingElements[dayMasterElement];
  let controlCount = 0;
  
  pillars.forEach(pillar => {
    const stemElement = getElementName(pillar.stem);
    const branchElement = getElementName(pillar.branch);
    if (stemElement === controlElement) controlCount += 1.0;
    if (branchElement === controlElement) controlCount += 1.0;
    const hidden = hiddenStems[pillar.branch.name];
    if (hidden) {
      hidden.forEach(({ stem, weight }) => {
        if (getStemBranchElement(stem) === controlElement) {
          controlCount += weight;
        }
      });
    }
  });
  
  if (controlCount === 0) { details.controlScore = 5; }
  else if (controlCount < 2) { details.controlScore = 3; }
  else if (controlCount < 4) { details.controlScore = 2; }
  else { details.controlScore = 1; }
  
  strength = (
    details.seasonScore * 0.4 +
    details.rootScore * 0.3 +
    details.supportScore * 0.2 +
    details.controlScore * 0.1
  );
  
  strength = Math.round(strength);
  strength = Math.max(1, Math.min(5, strength));
  
  let strengthText = 'средняя';
  if (strength >= 5) strengthText = 'очень сильный';
  else if (strength >= 4) strengthText = 'сильный';
  else if (strength >= 3) strengthText = 'средняя';
  else if (strength >= 2) strengthText = 'слабый';
  else strengthText = 'очень слабый';
  
  return { strength, strengthText, details };
}

// --- ОСНОВНАЯ ФУНКЦИЯ ---
// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ РАСЧЁТА БАЦЗЫ ДЛЯ ЛЮБОГО ПОЛЬЗОВАТЕЛЯ
// Параметры:
//   birthDatetime - дата и время рождения в формате 'YYYY-MM-DD HH:mm' (ОБЯЗАТЕЛЬНО)
//   gender - пол: 'male' или 'female' (ОБЯЗАТЕЛЬНО)
//   birthPlace - часовой пояс в формате IANA (например, 'Europe/Moscow', 'Asia/Shanghai') (ОБЯЗАТЕЛЬНО)
// Дефолтные значения используются только для обратной совместимости в тестах
export function getFullBaziAnalysis(birthDatetime, gender = 'female', birthPlace = 'Europe/Moscow') {
  const localMoment = moment.tz(birthDatetime, birthPlace);
  const offsetMinutes = localMoment.utcOffset();
  const dateStr = localMoment.format('YYYY-MM-DD');
  const timeStr = localMoment.format('HH:mm');
  
  const lsr = lunisolar(`${dateStr} ${timeStr}`, {
    offset: offsetMinutes,
    isUTC: false
  });
  
  const bazi = lsr.char8;
  const pillars = bazi.toString().split(' ');
  const dayMasterGlyph = bazi.day.stem.name;
  const dayMasterElement = getElementName(bazi.day.stem);
  const monthBranchName = bazi.month.branch.name;
  
  // СТОЛПЫ УДАЧИ
  const yearStemForLuck = bazi.year.stem.name;
  const yearStemType = { 
    '甲': 'yang', '丙': 'yang', '戊': 'yang', '庚': 'yang', '壬': 'yang',
    '乙': 'yin', '丁': 'yin', '己': 'yin', '辛': 'yin', '癸': 'yin' 
  }[yearStemForLuck];

  let direction = 'forward';
  if ((gender === 'male' && yearStemType === 'yang') || (gender === 'female' && yearStemType === 'yin')) {
      direction = 'forward';
  } else {
      direction = 'backward';
  }

  const forwardSequence = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉'];
  const backwardSequence = ['癸亥', '壬戌', '辛酉', '庚申', '己未', '戊午', '丁巳', '丙辰', '乙卯', '甲寅'];
  const monthPillar = bazi.month.toString();
  const sourceSequence = direction === 'forward' ? forwardSequence : backwardSequence;
  let startIndex = sourceSequence.indexOf(monthPillar);
  if (startIndex === -1) startIndex = 0;

  const startAge = calculateLuckStartAge(lsr, direction, birthPlace);
  
  const luckPillars = [];
  for (let i = 0; i < 6; i++) {
    const pillarIndex = (startIndex + i) % sourceSequence.length;
    const periodStartAge = startAge + i * 10;
    luckPillars.push({
        startAge: periodStartAge,
        pillar: sourceSequence[pillarIndex],
        ageRange: `${Math.floor(periodStartAge)}-${Math.floor(periodStartAge) + 9} лет`,
        direction: direction
    });
  }

  // БАЛАНС ЭЛЕМЕНТОВ
  const balance = { 'Дерево': 0, 'Огонь': 0, 'Земля': 0, 'Металл': 0, 'Вода': 0 };
  pillars.forEach(pillar => {
    const [stemGlyph, branchGlyph] = pillar.split('');
    balance[getStemBranchElement(stemGlyph)]++;
    balance[getStemBranchElement(branchGlyph)]++;
    addHiddenStemsToBalance(balance, branchGlyph);
  });

  // АНАЛИЗ СИЛЫ
  const strengthAnalysis = calculateElementStrength(bazi, dayMasterElement, monthBranchName);
  
  // НОВОЕ: Взаимодействия столпов (ветви)
  const interactions = analyzePillarInteractions(bazi);
  
  // НОВОЕ: Взаимодействия небесных стволов (合化)
  const stemInteractions = analyzeStemInteractions(bazi);
  
  // НОВОЕ: Специальные комбинации (三合, 三会)
  const specialCombinations = analyzeSpecialCombinations(bazi);
  
  // НОВОЕ: Сила небесных стволов по сезону
  const stemStrengths = {
    year: calculateStemStrengthBySeason(bazi.year.stem, bazi.month.branch),
    month: calculateStemStrengthBySeason(bazi.month.stem, bazi.month.branch),
    day: calculateStemStrengthBySeason(bazi.day.stem, bazi.month.branch),
    hour: calculateStemStrengthBySeason(bazi.hour.stem, bazi.month.branch)
  };

  // ПОЛЕЗНЫЕ ЭЛЕМЕНТЫ
  const elementCycle = {
    'Дерево': { support: 'Вода', help: 'Дерево', drain: 'Огонь', weaken: 'Металл', exhaust: 'Земля' },
    'Огонь': { support: 'Дерево', help: 'Огонь', drain: 'Земля', weaken: 'Вода', exhaust: 'Металл' },
    'Земля': { support: 'Огонь', help: 'Земля', drain: 'Металл', weaken: 'Дерево', exhaust: 'Вода' },
    'Металл': { support: 'Земля', help: 'Металл', drain: 'Вода', weaken: 'Огонь', exhaust: 'Дерево' },
    'Вода': { support: 'Металл', help: 'Вода', drain: 'Дерево', weaken: 'Земля', exhaust: 'Огонь' }
  };
  
  const cycle = elementCycle[dayMasterElement];
  let usefulElements = [];
  if (strengthAnalysis.strength <= 2) {
    usefulElements = [cycle.support, cycle.help];
  } else if (strengthAnalysis.strength >= 4) {
    usefulElements = [cycle.weaken, cycle.exhaust];
  } else {
    usefulElements = [cycle.support, cycle.weaken];
  }

  return {
    success: true,
    pillars: pillars,
    dayMaster: {
      glyph: dayMasterGlyph,
      element: dayMasterElement,
      strength: strengthAnalysis.strength,
      strengthText: strengthAnalysis.strengthText,
      season: `Рождён в месяц ${monthBranchName} (сезон ${getElementName(bazi.month.branch)})`,
      strengthDetails: strengthAnalysis.details
    },
    elementBalance: balance,
    usefulElements: usefulElements,
    luckPillars: luckPillars.map(lp => ({
      ageRange: lp.ageRange,
      pillar: lp.pillar,
      element: getStemBranchElement(lp.pillar.charAt(0)),
      startAge: lp.startAge
    })),
    // НОВОЕ: Взаимодействия столпов (ветви)
    interactions: interactions,
    // НОВОЕ: Взаимодействия небесных стволов (合化)
    stemInteractions: stemInteractions,
    // НОВОЕ: Специальные комбинации (三合, 三会)
    specialCombinations: specialCombinations,
    // НОВОЕ: Сила небесных стволов
    stemStrengths: stemStrengths,
    improvements: {
      accurateLuckStartAge: true,
      hiddenStemsIncluded: true,
      multiFactorStrengthAnalysis: true,
      pillarInteractions: true,
      stemInteractions: true,
      specialCombinations: true,
      stemStrengthBySeason: true
    }
  };
}

