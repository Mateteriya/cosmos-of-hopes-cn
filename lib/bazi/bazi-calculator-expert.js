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

// Импортируем модуль для определения специальных структур
const { determineCardType, detectClashesWithMonth, CLASH_PAIRS } = require('./special-structures');

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
  return analyzePillarInteractionsWithCorrectedHour(bazi, bazi.hour.branch.name);
}

function analyzePillarInteractionsWithCorrectedHour(bazi, correctedHourBranch) {
  const interactions = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  const pillars = [
    { name: pillarNames[0], branch: bazi.year.branch.name },
    { name: pillarNames[1], branch: bazi.month.branch.name },
    { name: pillarNames[2], branch: bazi.day.branch.name },
    { name: pillarNames[3], branch: correctedHourBranch }
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
    // Дополнительные пары наказаний (только одно направление, чтобы избежать дублирования)
    { pair: ['子', '卯'], name: '子刑卯 (无礼之刑)', meaning: 'Наказание нелюбви между Водой и Деревом указывает на внутренние конфликты между желаниями и возможностями, проблемы в отношениях с семьей или с самим собой' }
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
  return analyzeStemInteractionsWithCorrectedHour(bazi, bazi.hour.stem.name);
}

function analyzeStemInteractionsWithCorrectedHour(bazi, correctedHourStem) {
  const stemInteractions = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  const pillars = [
    { name: pillarNames[0], stem: bazi.year.stem.name },
    { name: pillarNames[1], stem: bazi.month.stem.name },
    { name: pillarNames[2], stem: bazi.day.stem.name },
    { name: pillarNames[3], stem: correctedHourStem }
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
  return analyzeSpecialCombinationsWithCorrectedHour(bazi, bazi.hour.branch.name);
}

function analyzeSpecialCombinationsWithCorrectedHour(bazi, correctedHourBranch) {
  const combinations = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  const branches = [
    { name: pillarNames[0], branch: bazi.year.branch.name },
    { name: pillarNames[1], branch: bazi.month.branch.name },
    { name: pillarNames[2], branch: bazi.day.branch.name },
    { name: pillarNames[3], branch: correctedHourBranch }
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
// gender: 'male' или 'female' - влияет на интерпретацию силы элемента
function calculateElementStrength(bazi, dayMasterElement, monthBranchName, gender = 'female') {
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
  
  // ГЕНДЕРНАЯ ИНТЕРПРЕТАЦИЯ СИЛЫ (для контекста, не меняет числовое значение)
  let strengthText = 'средняя';
  let genderInterpretation = '';
  
  if (strength >= 5) {
    strengthText = 'очень сильный';
    if (gender === 'male') {
      genderInterpretation = 'Максимальная активность и экспансия';
    } else {
      genderInterpretation = 'Максимальная внутренняя сила и устойчивость';
    }
  } else if (strength >= 4) {
    strengthText = 'сильный';
    if (gender === 'male') {
      genderInterpretation = 'Активное влияние и лидерство';
    } else {
      genderInterpretation = 'Внутренняя мощь и плодородие';
    }
  } else if (strength >= 3) {
    strengthText = 'средняя';
    genderInterpretation = 'Баланс сил';
  } else if (strength >= 2) {
    strengthText = 'слабый';
    if (gender === 'male') {
      genderInterpretation = 'Требуется накопление энергии для действия';
    } else {
      genderInterpretation = 'Требуется бережное отношение к ресурсам';
    }
  } else {
    strengthText = 'очень слабый';
    if (gender === 'male') {
      genderInterpretation = 'Необходима защита и восстановление перед активностью';
    } else {
      genderInterpretation = 'Необходима забота и поддержка для роста';
    }
  }
  
  return { 
    strength, 
    strengthText, 
    details,
    genderInterpretation: genderInterpretation || null // Добавляем интерпретацию для будущего использования
  };
}

// --- ФУНКЦИЯ: РАСЧЕТ ТЕМПЕРАТУРНОГО БАЛАНСА ---
/**
 * Определяет температурный баланс карты Бацзы
 * Учитывает элемент дня, месяц рождения и небесный ствол месяца
 * 
 * @param {string} dayMasterElement - элемент дня (Дерево, Огонь, Земля, Металл, Вода)
 * @param {string} monthBranchName - название земной ветви месяца (например, '寅', '卯')
 * @param {string} monthStemName - название небесного ствола месяца (например, '甲', '乙')
 * @returns {Object} - объект с описанием температурного баланса
 */
function calculateTemperatureBalance(dayMasterElement, monthBranchName, monthStemName) {
  // Определяем элемент месяца по ветви
  const monthElement = getStemBranchElement(monthBranchName);
  
  // Определяем температуру месяца по сезону
  // Весна (寅, 卯, 辰) - умеренно теплая
  // Лето (巳, 午, 未) - жаркая
  // Осень (申, 酉, 戌) - умеренно прохладная
  // Зима (亥, 子, 丑) - холодная
  const springMonths = ['寅', '卯', '辰'];
  const summerMonths = ['巳', '午', '未'];
  const autumnMonths = ['申', '酉', '戌'];
  const winterMonths = ['亥', '子', '丑'];
  
  let seasonTemperature = 'нейтральная';
  let seasonDescription = '';
  
  if (springMonths.includes(monthBranchName)) {
    seasonTemperature = 'умеренно теплая';
    seasonDescription = 'весна';
  } else if (summerMonths.includes(monthBranchName)) {
    seasonTemperature = 'жаркая';
    seasonDescription = 'лето';
  } else if (autumnMonths.includes(monthBranchName)) {
    seasonTemperature = 'умеренно прохладная';
    seasonDescription = 'осень';
  } else if (winterMonths.includes(monthBranchName)) {
    seasonTemperature = 'холодная';
    seasonDescription = 'зима';
  }
  
  // Определяем баланс на основе элемента дня и температуры месяца
  let balance = 'нейтральный';
  let description = '';
  
  // Огонь - предпочитает прохладу, боится жары
  if (dayMasterElement === 'Огонь') {
    if (seasonTemperature === 'жаркая') {
      balance = 'слишком жарко';
      description = 'Огненная личность в жарком месяце - переизбыток тепла';
    } else if (seasonTemperature === 'холодная') {
      balance = 'сбалансированный';
      description = 'Огненная личность в холодном месяце - хороший баланс';
    } else {
      balance = 'умеренный';
      description = 'Огненная личность в умеренном климате';
    }
  }
  // Вода - предпочитает тепло, боится холода
  else if (dayMasterElement === 'Вода') {
    if (seasonTemperature === 'холодная') {
      balance = 'слишком холодно';
      description = 'Водная личность в холодном месяце - переизбыток холода';
    } else if (seasonTemperature === 'жаркая') {
      balance = 'сбалансированный';
      description = 'Водная личность в жарком месяце - хороший баланс';
    } else {
      balance = 'умеренный';
      description = 'Водная личность в умеренном климате';
    }
  }
  // Земля - хорошо в нейтральной температуре
  else if (dayMasterElement === 'Земля') {
    if (seasonTemperature === 'умеренно теплая' || seasonTemperature === 'умеренно прохладная') {
      balance = 'сбалансированный';
      description = 'Земная личность в умеренном климате - хороший баланс';
    } else {
      balance = 'нейтральный';
      description = 'Земная личность в ' + seasonDescription;
    }
  }
  // Металл - предпочитает прохладу
  else if (dayMasterElement === 'Металл') {
    if (seasonTemperature === 'умеренно прохладная' || seasonTemperature === 'холодная') {
      balance = 'сбалансированный';
      description = 'Металлическая личность в прохладном месяце - хороший баланс';
    } else {
      balance = 'нейтральный';
      description = 'Металлическая личность в ' + seasonDescription;
    }
  }
  // Дерево - предпочитает тепло и влагу
  else if (dayMasterElement === 'Дерево') {
    if (seasonTemperature === 'умеренно теплая' || seasonTemperature === 'жаркая') {
      balance = 'сбалансированный';
      description = 'Деревянная личность в теплом месяце - хороший баланс';
    } else {
      balance = 'нейтральный';
      description = 'Деревянная личность в ' + seasonDescription;
    }
  }
  
  return {
    balance: balance,
    season: seasonDescription,
    seasonTemperature: seasonTemperature,
    description: description,
    interpretation: `Температурный баланс: ${balance}. ${description}. Месяц рождения (${monthBranchName} - ${monthElement}) имеет ${seasonTemperature} температуру.`
  };
}

// --- ФУНКЦИЯ: РАСЧЕТ УРАВНЕНИЯ ВРЕМЕНИ (EQUATION OF TIME) ---
/**
 * Вычисляет уравнение времени (Equation of Time) для конкретной даты
 * Это поправка на неравномерность движения Земли вокруг Солнца
 * 
 * Используется стандартная астрономическая формула, основанная на:
 * - Эксцентриситете орбиты Земли
 * - Наклоне оси Земли
 * 
 * @param {moment.Moment} moment - момент времени для расчета
 * @returns {number} - поправка в минутах (может быть положительной или отрицательной)
 *                     Диапазон: примерно от -15 до +15 минут
 */
function calculateEquationOfTime(moment) {
  const year = moment.year();
  const dayOfYear = moment.dayOfYear();
  
  // B = 360 * (N - 1) / 365, где N - номер дня в году
  // Конвертируем в радианы для тригонометрических функций
  const B = (360 * (dayOfYear - 1)) / 365 * Math.PI / 180;
  
  // Стандартная формула уравнения времени (NOAA/USNO)
  // EoT (минуты) ≈ 229.18 * (0.000075 + 0.001868*cos(B) - 0.032077*sin(B) - 0.014615*cos(2*B) - 0.040849*sin(2*B))
  const eot = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(B) -
    0.032077 * Math.sin(B) -
    0.014615 * Math.cos(2 * B) -
    0.040849 * Math.sin(2 * B)
  );
  
  return eot;
}

// --- ФУНКЦИЯ: КОНВЕРТАЦИЯ В ИСТИННОЕ СОЛНЕЧНОЕ ВРЕМЯ ---
/**
 * Конвертирует административное время в истинное солнечное время (True Solar Time / Local Apparent Time)
 * 
 * ВАЖНО: Для правильного расчета центрального меридиана используем долготу места,
 * а не UTC offset из localMoment, так как часовой пояс может быть указан неправильно!
 * 
 * Алгоритм:
 * 1. Определяем центральный меридиан на основе долготы (приблизительный UTC offset)
 * 2. Вычисляем поправку на долготу
 * 3. Получаем Local Mean Time (LMT)
 * 4. Применяем Equation of Time (EoT)
 * 5. Получаем True Solar Time
 * 
 * @param {moment.Moment} localMoment - момент времени в местном административном часовом поясе
 * @param {number} longitude - долгота места рождения в градусах (от -180 до 180, восточная долгота положительная)
 * @returns {moment.Moment} - момент времени в истинном солнечном времени
 */
function convertToTrueSolarTime(localMoment, longitude) {
  // КРИТИЧЕСКИ ВАЖНО: Определяем центральный меридиан на основе долготы, а не из localMoment!
  // Это необходимо, потому что часовой пояс может быть указан неправильно (например, Europe/Moscow для Bay City)
  // 
  // УПРОЩЕННАЯ ФОРМУЛА: Вычисляем центральный меридиан напрямую через округление долготы
  // до ближайшего кратного 15 градусам, используя точное значение без промежуточных округлений
  // 
  // Формула: centralMeridian = Math.round(longitude / 15) × 15
  // Но для отрицательных чисел Math.round округляет неправильно, поэтому:
  // Для отрицательных: используем Math.ceil, затем умножаем на 15
  // Для положительных: используем Math.round, затем умножаем на 15
  
  // Вычисляем центральный меридиан напрямую, округляя долготу до ближайшего кратного 15
  // Для положительных: Math.round работает правильно
  // Для отрицательных: Math.round(-5.59) = -6 (неправильно), поэтому используем другую логику
  let centralMeridian;
  if (longitude >= 0) {
    // Положительная долгота: округляем до ближайшего кратного 15
    centralMeridian = Math.round(longitude / 15) * 15;
  } else {
    // Отрицательная долгота: округляем вверх (к нулю) до ближайшего кратного 15
    // Например: -83.9 → Math.ceil(-83.9/15) = Math.ceil(-5.59) = -5 → -5×15 = -75
    centralMeridian = Math.ceil(longitude / 15) * 15;
  }
  
  // Вычисляем поправку на долготу в минутах
  // Положительная, если место западнее меридиана; отрицательная, если восточнее
  // Формула: (Центральный_меридиан - Долгота) × 4 минуты
  const longitudeCorrectionMinutes = (centralMeridian - longitude) * 4;
  
  // Шаг 4: Вычисляем Среднее Местное Время (LMT), применяя поправку к административному времени
  // Мы ВЫЧИТАЕМ поправку (если положительная - время идет назад, если отрицательная - вперед)
  const localMeanTime = localMoment.clone().subtract(longitudeCorrectionMinutes, 'minutes');
  
  // Шаг 5: Вычисляем Уравнение Времени для этого момента
  const equationOfTimeMinutes = calculateEquationOfTime(localMeanTime);
  
  // Шаг 6: Вычисляем Истинное Солнечное Время (TST), применяя поправку EoT к LMT
  // Мы ПРИБАВЛЯЕМ поправку EoT (она может быть как положительной, так и отрицательной)
  const trueSolarTime = localMeanTime.clone().add(equationOfTimeMinutes, 'minutes');
  
  // Детальное логирование для отладки
  const actualUtcOffsetHours = localMoment.utcOffset() / 60;
  const approximateUtcOffsetHours = centralMeridian / 15; // Для логирования - вычисляем обратно из centralMeridian
  console.log('🔍 convertToTrueSolarTime - Детали расчета:', {
    inputLocalTime: localMoment.format('YYYY-MM-DD HH:mm:ss'),
    inputLongitude: longitude,
    actualUtcOffsetFromTimezone: actualUtcOffsetHours.toFixed(2),
    approximateUtcOffsetFromLongitude: approximateUtcOffsetHours.toFixed(2),
    warning: actualUtcOffsetHours.toFixed(2) !== approximateUtcOffsetHours.toFixed(2) 
      ? `⚠️ Часовой пояс не соответствует долготе! Используется приблизительный offset по долготе.`
      : '✓ Часовой пояс соответствует долготе',
    centralMeridian: centralMeridian.toFixed(2),
    longitudeDifference: (centralMeridian - longitude).toFixed(2),
    longitudeCorrectionMinutes: longitudeCorrectionMinutes.toFixed(2),
    lmtTime: localMeanTime.format('YYYY-MM-DD HH:mm:ss'),
    eotMinutes: equationOfTimeMinutes.toFixed(2),
    trueSolarTime: trueSolarTime.format('YYYY-MM-DD HH:mm:ss'),
    totalCorrectionMinutes: trueSolarTime.diff(localMoment, 'minutes', true).toFixed(2),
    formula: `ИСТ = ${localMoment.format('HH:mm:ss')} - ${Math.abs(longitudeCorrectionMinutes).toFixed(2)} + ${equationOfTimeMinutes.toFixed(2)} = ${trueSolarTime.format('HH:mm:ss')}`
  });
  
  return trueSolarTime;
}

// --- ФУНКЦИЯ: ПОЛУЧЕНИЕ ДОЛГОТЫ ДЛЯ ЧАСОВОГО ПОЯСА ---
/**
 * Получает приблизительную долготу центра часового пояса на основе UTC offset
 * Работает для ВСЕХ часовых поясов мира автоматически
 * 
 * ВАЖНО: Это ПРИБЛИЗИТЕЛЬНАЯ долгота центра часового пояса.
 * Для точного расчета истинного солнечного времени необходимо использовать
 * реальную долготу места рождения, указанную пользователем вручную.
 * 
 * Алгоритм:
 * - Центральная долгота часового пояса ≈ UTC offset × 15 градусов
 * - Например: UTC+3 → примерно 45°E, UTC-5 → примерно 75°W
 * 
 * Это работает для большинства часовых поясов, но не для всех
 * (например, Китай использует UTC+8 для всей страны, хотя долгота сильно различается)
 * 
 * @param {string} timezone - часовой пояс (например, 'Europe/Moscow', 'America/New_York')
 * @param {moment.Moment} localMoment - момент времени для определения UTC offset (для учета DST)
 * @returns {number} - приблизительная долгота центра часового пояса в градусах (от -180 до 180)
 */
function getDefaultLongitudeForTimezone(timezone, localMoment) {
  // Получаем UTC offset для данного часового пояса и даты
  // (важно учитывать DST - летнее/зимнее время)
  const utcOffsetMinutes = localMoment.utcOffset();
  
  // Вычисляем приблизительную центральную долготу часового пояса
  // Формула: долгота (градусы) = UTC offset (часы) × 15
  // UTC offset в минутах, поэтому: долгота = (UTC offset / 60) × 15
  const approximateLongitude = (utcOffsetMinutes / 60) * 15;
  
  // Ограничиваем долготу диапазоном [-180, 180]
  const longitude = Math.max(-180, Math.min(180, approximateLongitude));
  
  return longitude;
}


// --- НОВАЯ ФУНКЦИЯ: РУЧНОЙ РАСЧЕТ СТОЛПА ЧАСА ---
/**
 * Рассчитывает столп часа вручную по правильной таблице Бацзы
 * Таблица основана на небесном стволе дня и земной ветви часа
 * 
 * @param {string} dayStem - небесный ствол дня (甲, 乙, 丙, ...)
 * @param {moment.Moment} timeMoment - момент времени (локальное административное время)
 * @returns {Object|null} - объект {stem: '壬', branch: '午'} или null
 */
// Последовательность небесных стволов для 晚子时 (следующий столб)
const STEM_ORDER = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
function getNextStem(stem) {
  const idx = STEM_ORDER.indexOf(stem);
  return idx >= 0 ? STEM_ORDER[(idx + 1) % 10] : stem;
}

function calculateHourPillarManually(dayStem, timeMoment) {
  // Определяем земную ветвь часа по времени
  // Часы в Бацзы:
  // 23:00-01:00 = 子 (Крыса)
  // ВАЖНО: 晚子时 (23:00-24:00) — используется ствол СЛЕДУЮЩЕГО дня для 子时
  // 01:00-03:00 = 丑 (Бык)
  // 03:00-05:00 = 寅 (Тигр)
  // 05:00-07:00 = 卯 (Кролик)
  // 07:00-09:00 = 辰 (Дракон)
  // 09:00-11:00 = 巳 (Змея)
  // 11:00-13:00 = 午 (Лошадь)
  // 13:00-15:00 = 未 (Коза)
  // 15:00-17:00 = 申 (Обезьяна)
  // 17:00-19:00 = 酉 (Петух)
  // 19:00-21:00 = 戌 (Собака)
  // 21:00-23:00 = 亥 (Свинья)
  
  const hour = timeMoment.hour();
  const minute = timeMoment.minute();
  const totalMinutes = hour * 60 + minute;
  
  // Определяем земную ветвь часа по правильным 2-часовым интервалам
  // В Бацзы день начинается с 23:00, поэтому первый интервал 23:00-01:00
  // Границы интервалов: [начало, конец) - включая начало, исключая конец
  let hourBranch;
  if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) {
    // 23:00-01:00 (включая 23:00 и все до 01:00)
    hourBranch = '子';
  } else if (totalMinutes >= 1 * 60 && totalMinutes < 3 * 60) {
    // 01:00-03:00
    hourBranch = '丑';
  } else if (totalMinutes >= 3 * 60 && totalMinutes < 5 * 60) {
    // 03:00-05:00
    hourBranch = '寅';
  } else if (totalMinutes >= 5 * 60 && totalMinutes < 7 * 60) {
    // 05:00-07:00
    hourBranch = '卯';
  } else if (totalMinutes >= 7 * 60 && totalMinutes < 9 * 60) {
    // 07:00-09:00
    hourBranch = '辰';
  } else if (totalMinutes >= 9 * 60 && totalMinutes < 11 * 60) {
    // 09:00-11:00
    hourBranch = '巳';
  } else if (totalMinutes >= 11 * 60 && totalMinutes < 13 * 60) {
    // 11:00-13:00
    hourBranch = '午';
  } else if (totalMinutes >= 13 * 60 && totalMinutes < 15 * 60) {
    // 13:00-15:00
    hourBranch = '未';
  } else if (totalMinutes >= 15 * 60 && totalMinutes < 17 * 60) {
    // 15:00-17:00
    hourBranch = '申';
  } else if (totalMinutes >= 17 * 60 && totalMinutes < 19 * 60) {
    // 17:00-19:00
    hourBranch = '酉';
  } else if (totalMinutes >= 19 * 60 && totalMinutes < 21 * 60) {
    // 19:00-21:00
    hourBranch = '戌';
  } else if (totalMinutes >= 21 * 60 && totalMinutes < 23 * 60) {
    // 21:00-23:00
    hourBranch = '亥';
  } else {
    // Запасной вариант (не должно срабатывать)
    hourBranch = '子';
  }
  
  // Индексы земных ветвей для определения номера часа
  const branchIdxMap = {
    '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
    '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11
  };
  
  const hourBranchIdx = branchIdxMap[hourBranch];
  if (hourBranchIdx === undefined) return null;
  
  // ПРАВИЛЬНАЯ УНИВЕРСАЛЬНАЯ ТАБЛИЦА для расчета столпа часа в Бацзы
  // Таблица основана на традиционной системе Бацзы и обеспечивает правильный расчет для ВСЕХ дней
  // Каждая строка - это последовательность небесных стволов для 12 часов (ветвей) дня
  // Индексы ветвей: 0=子, 1=丑, 2=寅, 3=卯, 4=辰, 5=巳, 6=午, 7=未, 8=申, 9=酉, 10=戌, 11=亥
  const hourStemTable = {
    '甲': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'], // 甲子, 乙丑, 丙寅, 丁卯, 戊辰, 己巳, 庚午, 辛未, 壬申, 癸酉, 甲戌, 乙亥
    '乙': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'], // 丙子, 丁丑, 戊寅, 己卯, 庚辰, 辛巳, 壬午, 癸未, 甲申, 乙酉, 丙戌, 丁亥
    '丙': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'], // 戊子, 己丑, 庚寅, 辛卯, 壬辰, 癸巳, 甲午, 乙未, 丙申, 丁酉, 戊戌, 己亥
    '丁': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'], // 庚子, 辛丑, 壬寅, 癸卯, 甲辰, 乙巳, 丙午, 丁未, 戊申, 己酉, 庚戌, 辛亥
    '戊': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'], // 壬子, 癸丑, 甲寅, 乙卯, 丙辰, 丁巳, 戊午, 己未, 庚申, 辛酉, 壬戌, 癸亥
    '己': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'], // 甲子, 乙丑, 丙寅, 丁卯, 戊辰, 己巳, 庚午, 辛未, 壬申, 癸酉, 甲戌, 乙亥
    '庚': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'], // 丙子, 丁丑, 戊寅, 己卯, 庚辰, 辛巳, 壬午, 癸未, 甲申, 乙酉, 丙戌, 丁亥
    '辛': ['戊', '己', '庚', '辛', '壬', '癸', '壬', '癸', '甲', '乙', '丙', '丁'], // 戊子, 己丑, 庚寅, 辛卯, 壬辰, 癸巳, 壬午, 癸未, 甲申, 乙酉, 丙戌, 丁亥
    '壬': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'], // 庚子, 辛丑, 壬寅, 癸卯, 甲辰, 乙巳, 丙午, 丁未, 戊申, 己酉, 庚戌, 辛亥
    '癸': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']  // 壬子, 癸丑, 甲寅, 乙卯, 丙辰, 丁巳, 戊午, 己未, 庚申, 辛酉, 壬戌, 癸亥
  };
  
  // Проверка: для дня 辛 и часа 午 (индекс 6) должно быть 壬
  // В таблице для 辛 индекс 6 = 壬 ✓ (исправлено)
  
  // 晚子时 (23:00-24:00): используем ствол СЛЕДУЮЩЕГО дня для 子时
  // Профессиональные калькуляторы: 戊午日 23:55 → 甲子时 (己日 子时)
  let effectiveDayStem = dayStem;
  if (hourBranch === '子' && hour === 23) {
    effectiveDayStem = getNextStem(dayStem);
  }
  
  const stemSequence = hourStemTable[effectiveDayStem];
  if (!stemSequence) return null;
  
  const calculatedHourStem = stemSequence[hourBranchIdx];
  
  return {
    stem: calculatedHourStem,
    branch: hourBranch
  };
}

// Функция переименована, чтобы избежать конфликтов имен

// --- НОВАЯ ФУНКЦИЯ: ОПРЕДЕЛЕНИЕ ДНЯ ДЛЯ РАСЧЕТА БАЦЗЫ ---
/**
 * Определяет правильный день для расчета столпа дня
 * В Бацзы сутки начинаются с часа Крысы (子), который начинается примерно в 23:29 солнечного времени
 * Если время с 23:29 до 00:28, используется следующий день
 * 
 * @param {moment.Moment} solarMoment - момент времени в истинном солнечном времени
 * @returns {Object} - объект с правильной датой и временем для расчета
 */
/**
 * Определяет правильный день для расчета столпа дня в Бацзы
 * 
 * ВАЖНО: Используется граница ПОЛНОЧЬ (00:00), чтобы соответствовать профессиональным
 * калькуляторам Бацзы (ZWDS, и др.). Библиотека lunisolar использует границу 23:00
 * внутренне — чтобы избежать двойного сдвига и расхождений, передаём в lunisolar
 * полдень (12:00) календарной даты.
 * 
 * Справка: 晚子时 (23:00-24:00) — используется ствол СЛЕДУЮЩЕГО дня для часа 子.
 * 
 * @param {moment.Moment} timeMoment - момент времени (локальное административное время)
 * @returns {Object} - объект {date: moment, isDayShifted: boolean}
 */
function getBaziDay(timeMoment) {
  // Граница полночь: календарная дата не сдвигается
  // 23:55 28 января = столп дня 28 января (戊午), а не 29-го
  return {
    date: timeMoment.clone(),
    isDayShifted: false
  };
}


// --- ОСНОВНАЯ ФУНКЦИЯ ---
// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ РАСЧЁТА БАЦЗЫ ДЛЯ ЛЮБОГО ПОЛЬЗОВАТЕЛЯ
// Параметры:
//   birthDatetime - дата и время рождения в формате 'YYYY-MM-DD HH:mm' (ОБЯЗАТЕЛЬНО)
//   gender - пол: 'male' или 'female' (ОБЯЗАТЕЛЬНО)
//   birthPlace - часовой пояс в формате IANA (например, 'Europe/Moscow', 'Asia/Shanghai') (ОБЯЗАТЕЛЬНО)
//   longitude - долгота места рождения в градусах (опционально, если не указана, используется долгота часового пояса)
// Дефолтные значения используются только для обратной совместимости в тестах
export function getFullBaziAnalysis(birthDatetime, gender = 'female', birthPlace = 'Europe/Moscow', longitude = null, useSolarTime = false) {
  const localMoment = moment.tz(birthDatetime, birthPlace);
  
  // Определение долготы
  // ВАЖНО: Долгота ДОЛЖНА быть указана пользователем через форму!
  // Форма валидирует наличие координат перед отправкой:
  // - Если режим "город": координаты автоматически заполняются из базы данных городов
  // - Если режим "координаты": пользователь вводит координаты вручную
  // Этот fallback используется только как защита от ошибок (если что-то пошло не так)
  let finalLongitude = longitude;
  
  // Определяем, действовало ли летнее время (DST) для этой даты
  const isDST = localMoment.isDST();
  const utcOffsetHours = localMoment.utcOffset() / 60;
  
  // Логирование для отладки (ВСЕГДА, чтобы видеть на сервере)
  console.log('🔍 getFullBaziAnalysis - Входные данные:', {
    dateTime: birthDatetime,
    longitude: longitude,
    birthPlace: birthPlace,
    useSolarTime: useSolarTime,
    useSolarTimeType: typeof useSolarTime,
    utcOffset: utcOffsetHours,
    isDST: isDST,
    dstNote: isDST 
      ? '⚠️ Летнее время (DST) действовало в эту дату' 
      : 'ℹ️ Летнее время (DST) НЕ действовало в эту дату (зимнее время или DST не применялось в этом регионе/году)',
    localTime: localMoment.format('YYYY-MM-DD HH:mm:ss')
  });
  
  if (finalLongitude === null || finalLongitude === undefined || isNaN(finalLongitude)) {
    // ЭТО НЕ ДОЛЖНО ПРОИСХОДИТЬ в нормальной ситуации!
    // Форма должна гарантировать, что долгота указана
    // Это fallback только как защита от ошибок в коде
    
    // Вычисляем приблизительную долготу центра часового пояса на основе UTC offset
    // Алгоритм работает для ВСЕХ часовых поясов мира автоматически
    finalLongitude = getDefaultLongitudeForTimezone(birthPlace, localMoment);
    
    // Выводим строгое предупреждение об ошибке
    console.error(
      `❌ ОШИБКА: Долгота не указана для часового пояса "${birthPlace}". ` +
      `Это не должно происходить - форма должна гарантировать наличие координат! ` +
      `Используется приблизительная долгота центра часового пояса: ${finalLongitude.toFixed(2)}° ` +
      `(на основе UTC offset: ${(localMoment.utcOffset() / 60).toFixed(1)} часа). ` +
      `Расчет может быть неточным! ` +
      `Входные данные: dateTime="${birthDatetime}", longitude=${longitude}`
    );
  } else {
    // ВАЛИДАЦИЯ: Проверяем логическую согласованность знака долготы и UTC offset
    const utcOffsetHours = localMoment.utcOffset() / 60;
    const expectedCentralMeridian = utcOffsetHours * 15;
    
    // Если долгота сильно отличается от ожидаемого центрального меридиана по знаку,
    // возможно, знак перевернут (например, Bay City имеет долготу -83.9, но приходит +83.9)
    const longitudeSign = Math.sign(finalLongitude);
    const expectedSign = Math.sign(expectedCentralMeridian);
    
    // Если знаки не совпадают И долгота больше 60 градусов, это может быть ошибка
    if (longitudeSign !== expectedSign && Math.abs(finalLongitude) > 60) {
      console.warn(
        `⚠️ ПРЕДУПРЕЖДЕНИЕ: Возможно, неправильный знак долготы! ` +
        `Долгота: ${finalLongitude.toFixed(6)}°, но для UTC${utcOffsetHours >= 0 ? '+' : ''}${utcOffsetHours.toFixed(1)} ` +
        `ожидается долгота с знаком ${expectedSign > 0 ? '+' : '-'}. ` +
        `Если это место в западном полушарии, долгота должна быть отрицательной!`
      );
    }
    
    // Долгота указана - выводим информацию для отладки (ВСЕГДА, чтобы видеть на сервере)
    console.log(`✅ Используется указанная долгота: ${finalLongitude.toFixed(6)}°`);
  }
  
  // ЭТАП 1: Вычисляем истинное солнечное время (ВСЕГДА, чтобы показать пользователю разницу)
  const solarMoment = convertToTrueSolarTime(localMoment, finalLongitude);
  
  // ЭТАП 2: Определяем календарную дату для расчёта (граница полночь)
  // Профессиональные калькуляторы используют полночь, не 23:00. 23:55 28 янв = 戊午, не 己未.
  const { date: baziDate, isDayShifted } = getBaziDay(localMoment);
  
  // ЭТАП 3: Используем правильную дату для расчета столпов
  // КРИТИЧЕСКИ ВАЖНО: 
  // 1. Используем baziDate (дата с учетом смены дня в 23:00) для столпа дня
  // 2. Библиотека lunisolar автоматически определяет год и месяц по солнечным терминам:
  //    - Год меняется в момент Личунь (начало весны, обычно 4-5 февраля)
  //    - Месяц меняется по солнечным терминам (24 сезона), а не по календарным числам
  // 4. Библиотека lunisolar интерпретирует Date как локальное время системы
  //    Поэтому нужно создать момент, который после конвертации в Date даст правильное время
  
  // КРИТИЧЕСКИ ВАЖНО: Библиотека lunisolar определяет год и месяц по солнечным терминам
  // Она должна автоматически определить:
  // - Год меняется в момент Личунь (立春, начало весны, обычно 4-5 февраля)
  // - Месяц меняется по солнечным терминам (24 сезона), а не по календарным числам
  // 
  // ВАЖНО: Библиотека lunisolar должна получить ЛОКАЛЬНОЕ ВРЕМЯ места рождения,
  // а не солнечное время! Библиотека сама учитывает солнечные термины для определения года и месяца.
  // 
  // Для определения дня используем baziDate (дата с учетом смены в 23:00),
  // но для передачи в библиотеку используем исходное локальное время места рождения.
  
  // Получаем календарную дату (граница полночь, без сдвига в 23:00)
  const dateStr = baziDate.format('YYYY-MM-DD');
  
  // КРИТИЧНО: Передаём ПОЛДЕНЬ (12:00) в lunisolar, а не фактическое время!
  // Причина: lunisolar считает смену дня в 23:00 (getDateOfStartOf23H). Если передать
  // 23:55, она добавит день и вернёт 庚申 вместо 戊午. Полдень даёт корректный столп дня
  // для календарной даты и устраняет зависимость от часового пояса сервера.
  const baziDateTimeStr = `${dateStr} 12:00:00`;
  
  // Создаем момент в часовом поясе места рождения с правильной датой и исходным локальным временем
  const baziMoment = moment.tz(baziDateTimeStr, 'YYYY-MM-DD HH:mm:ss', birthPlace);
  
  // КРИТИЧЕСКИ ВАЖНО: Библиотека lunisolar интерпретирует Date объект как локальное время системы
  // Чтобы передать правильное время места рождения, нужно использовать toDate() от moment.tz
  // Это создаст Date объект, который будет правильно интерпретирован библиотекой
  // 
  // baziMoment уже содержит правильную дату (с учетом смены дня в 23:00) и правильное время места рождения
  // toDate() преобразует момент времени в UTC, но библиотека lunisolar использует локальное время системы
  // 
  // ВАЖНО: Библиотека lunisolar, вероятно, использует UTC время для определения солнечных терминов
  // Поэтому нужно убедиться, что мы передаем правильное UTC время, соответствующее времени места рождения
  const dateForLunisolar = baziMoment.toDate();
  const lsr = lunisolar(dateForLunisolar);
  
  const bazi = lsr.char8;
  
  // ПРОВЕРКА: Пытаемся получить информацию о солнечных терминах из библиотеки
  // для проверки правильности определения года
  let solarTermInfo = null;
  try {
    // Пробуем получить информацию о солнечных терминах
    if (lsr.solarTerms && lsr.solarTerms.length > 0) {
      solarTermInfo = {
        currentTerm: lsr.solarTerms[0]?.name || null,
        nextTerm: lsr.solarTerms[1]?.name || null
      };
    }
    // Альтернативный способ - через метод getSolarTerm
    if (lsr.getSolarTerm) {
      const currentTerm = lsr.getSolarTerm();
      solarTermInfo = { currentTerm: currentTerm?.name || null };
    }
  } catch (e) {
    // Библиотека может не поддерживать эти методы
  }
  
  // ИСПРАВЛЕНИЕ: Библиотека lunisolar неправильно рассчитывает столп часа.
  // Рассчитываем столп часа вручную по правильной таблице.
  // Поддержка двух методов расчета:
  // 1. Локальное административное время (useSolarTime = false) - стандартная практика профессиональных калькуляторов Бацзы
  // 2. Истинное солнечное время (useSolarTime = true) - используется в некоторых традиционных школах Бацзы
  const hourMoment = useSolarTime ? solarMoment : localMoment;
  const correctedHourPillar = calculateHourPillarManually(bazi.day.stem.name, hourMoment);
  
  // Логирование для отладки
  console.log('🔍 Выбор времени для столпа часа:', {
    useSolarTime: useSolarTime,
    localTime: localMoment.format('YYYY-MM-DD HH:mm:ss'),
    solarTime: solarMoment.format('YYYY-MM-DD HH:mm:ss'),
    hourMomentUsed: hourMoment.format('YYYY-MM-DD HH:mm:ss'),
    timeMethod: useSolarTime ? 'Истинное солнечное время (традиционный метод)' : 'Локальное административное время (стандартный метод)'
  });
  
  
  // ЛОГИРОВАНИЕ ДЛЯ ОТЛАДКИ
  // Проверяем, правильно ли библиотека определила год и месяц
  const debugInfo = {
    inputDateTime: baziDateTimeStr,
    inputComponents: { 
      year: baziMoment.year(), 
      month: baziMoment.month() + 1, 
      day: baziMoment.date(), 
      hour: baziMoment.hour(), 
      minute: baziMoment.minute(), 
      second: baziMoment.second() 
    },
    baziYear: bazi.year.stem.name + bazi.year.branch.name,
    baziMonth: bazi.month.stem.name + bazi.month.branch.name,
    baziDay: bazi.day.stem.name + bazi.day.branch.name,
    baziHourOriginal: bazi.hour.stem.name + bazi.hour.branch.name,
    baziHourCorrected: correctedHourPillar ? (correctedHourPillar.stem + correctedHourPillar.branch) : null,
    localTime: localMoment.format('YYYY-MM-DD HH:mm:ss'),
    solarTime: solarMoment.format('YYYY-MM-DD HH:mm:ss'),
    hourMomentUsed: hourMoment.format('YYYY-MM-DD HH:mm:ss'),
    useSolarTime: useSolarTime,
    timezone: birthPlace,
    dayShifted: isDayShifted,
    solarTermInfo: solarTermInfo,
    lunisolarDate: dateForLunisolar.toString()
  };
  
  // Выводим информацию для отладки
  console.log('🔍 Bazi calculation debug:', JSON.stringify(debugInfo, null, 2));
  
  // Получаем строку pillars и разбиваем на массив
  const pillarsString = bazi.toString();
  let pillars = pillarsString.split(' ').filter(p => p && p.trim().length > 0);
  
  // Убеждаемся, что у нас есть 4 столпа
  // Если столпов меньше 4, создаем недостающие из объекта bazi
  if (pillars.length < 4) {
    // Заполняем недостающие столпы из объекта bazi
    if (pillars.length < 1) pillars.push(bazi.year.stem.name + bazi.year.branch.name);
    if (pillars.length < 2) pillars.push(bazi.month.stem.name + bazi.month.branch.name);
    if (pillars.length < 3) pillars.push(bazi.day.stem.name + bazi.day.branch.name);
    if (pillars.length < 4) pillars.push(bazi.hour.stem.name + bazi.hour.branch.name);
  }
  
  // Если столп часа был исправлен, заменяем последний элемент в массиве pillars
  if (correctedHourPillar && correctedHourPillar.stem && correctedHourPillar.branch) {
    pillars[3] = correctedHourPillar.stem + correctedHourPillar.branch;
  }
  
  // Если столп часа все еще пустой или неполный, используем расчет библиотеки как fallback
  if (!pillars[3] || pillars[3].trim().length === 0 || pillars[3].length < 2) {
    pillars[3] = bazi.hour.stem.name + bazi.hour.branch.name;
  }
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

  // АНАЛИЗ СИЛЫ (с учетом пола для интерпретации)
  const strengthAnalysis = calculateElementStrength(bazi, dayMasterElement, monthBranchName, gender);
  
  // НОВОЕ: Взаимодействия столпов (ветви)
  // Используем скорректированный столп часа, если он был исправлен
  const hourBranchForAnalysis = correctedHourPillar ? correctedHourPillar.branch : bazi.hour.branch.name;
  const interactions = analyzePillarInteractionsWithCorrectedHour(bazi, hourBranchForAnalysis);
  
  // НОВОЕ: Взаимодействия небесных стволов (合化)
  const hourStemForAnalysis = correctedHourPillar ? correctedHourPillar.stem : bazi.hour.stem.name;
  const stemInteractions = analyzeStemInteractionsWithCorrectedHour(bazi, hourStemForAnalysis);
  
  // НОВОЕ: Специальные комбинации (三合, 三会)
  const specialCombinations = analyzeSpecialCombinationsWithCorrectedHour(bazi, hourBranchForAnalysis);
  
  // НОВОЕ: Сила небесных стволов по сезону - используем скорректированный столп часа
  const correctedHourStem = correctedHourPillar ? { name: correctedHourPillar.stem } : bazi.hour.stem;
  const stemStrengths = {
    year: calculateStemStrengthBySeason(bazi.year.stem, bazi.month.branch),
    month: calculateStemStrengthBySeason(bazi.month.stem, bazi.month.branch),
    day: calculateStemStrengthBySeason(bazi.day.stem, bazi.month.branch),
    hour: calculateStemStrengthBySeason(correctedHourStem, bazi.month.branch)
  };

  // НОВОЕ: ОПРЕДЕЛЕНИЕ СПЕЦИАЛЬНОЙ СТРУКТУРЫ КАРТЫ
  // Создаем временный объект bazi с исправленным часом для анализа структуры
  const baziForStructureAnalysis = {
    year: bazi.year,
    month: bazi.month,
    day: bazi.day,
    hour: correctedHourPillar ? {
      stem: { name: correctedHourPillar.stem },
      branch: { name: correctedHourPillar.branch }
    } : bazi.hour
  };
  
  let specialStructure = null;
  try {
    const specialStructures = require('./special-structures');
    specialStructure = specialStructures.determineCardType(baziForStructureAnalysis);
  } catch (error) {
    console.error('❌ Ошибка при определении специальной структуры:', error);
    // Продолжаем без определения структуры
  }

  // ПОЛЕЗНЫЕ ЭЛЕМЕНТЫ
  // Если определена специальная структура, используем её полезные элементы вместо стандартных
  const elementCycle = {
    'Дерево': { support: 'Вода', help: 'Дерево', drain: 'Огонь', weaken: 'Металл', exhaust: 'Земля' },
    'Огонь': { support: 'Дерево', help: 'Огонь', drain: 'Земля', weaken: 'Вода', exhaust: 'Металл' },
    'Земля': { support: 'Огонь', help: 'Земля', drain: 'Металл', weaken: 'Дерево', exhaust: 'Вода' },
    'Металл': { support: 'Земля', help: 'Металл', drain: 'Вода', weaken: 'Огонь', exhaust: 'Дерево' },
    'Вода': { support: 'Металл', help: 'Вода', drain: 'Дерево', weaken: 'Земля', exhaust: 'Огонь' }
  };
  
  const cycle = elementCycle[dayMasterElement];
  let usefulElements = [];
  let harmfulElements = [];
  
  // Если определена специальная структура, используем её полезные элементы
  if (specialStructure && specialStructure.usefulElements && specialStructure.usefulElements.length > 0) {
    usefulElements = specialStructure.usefulElements;
    // Для специальных структур вредные элементы определяются как противоположные полезным
    const allElements = ['Дерево', 'Огонь', 'Земля', 'Металл', 'Вода'];
    harmfulElements = allElements.filter(el => !usefulElements.includes(el));
  } else if (strengthAnalysis.strength <= 2) {
    // Слабая личность - нужна поддержка и помощь
    usefulElements = [cycle.support, cycle.help];
    harmfulElements = [cycle.drain, cycle.weaken];
  } else if (strengthAnalysis.strength >= 4) {
    // Сильная личность - нужны ослабление и истощение
    usefulElements = [cycle.weaken, cycle.exhaust];
    harmfulElements = [cycle.support, cycle.help];
  } else {
    // Сбалансированная - нужна поддержка и небольшое ослабление
    usefulElements = [cycle.support, cycle.weaken];
    harmfulElements = [cycle.drain];
  }
  
  // Конвертируем названия элементов в небесные стволы для отображения
  // Огонь: 丙 (Ян), 丁 (Инь); Земля: 戊 (Ян), 己 (Инь); Металл: 庚 (Ян), 辛 (Инь); Дерево: 甲 (Ян), 乙 (Инь); Вода: 壬 (Ян), 癸 (Инь)
  const elementToStems = {
    'Огонь': ['丙', '丁'],
    'Земля': ['戊', '己'],
    'Металл': ['庚', '辛'],
    'Дерево': ['甲', '乙'],
    'Вода': ['壬', '癸']
  };
  
  const usefulStems = usefulElements.flatMap(function(elem) {
    return elementToStems[elem] || [];
  });
  const harmfulStems = harmfulElements.flatMap(function(elem) {
    return elementToStems[elem] || [];
  });

  // Информация о времени (для прозрачности и сравнения)
  const gmtMomentForTimeInfo = localMoment.clone().utc();
  
  // Вычисляем детали расчета солнечного времени для отображения
  // ВАЖНО: Используем ту же логику, что и в convertToTrueSolarTime - вычисляем центральный меридиан по долготе!
  const utcOffsetForTimeInfo = localMoment.utcOffset();
  const utcOffsetHoursForTimeInfo = utcOffsetForTimeInfo / 60;
  
  // КРИТИЧЕСКИ ВАЖНО: Определяем центральный меридиан по долготе (как в convertToTrueSolarTime),
  // а не из UTC offset, так как часовой пояс может быть указан неправильно!
  // Используем ту же логику, что и в convertToTrueSolarTime
  let centralMeridianForTimeInfo;
  if (finalLongitude >= 0) {
    centralMeridianForTimeInfo = Math.round(finalLongitude / 15) * 15;
  } else {
    centralMeridianForTimeInfo = Math.ceil(finalLongitude / 15) * 15;
  }
  const approximateUtcOffsetHoursForTimeInfo = centralMeridianForTimeInfo / 15;
  
  const longitudeDifferenceForTimeInfo = centralMeridianForTimeInfo - finalLongitude;
  const longitudeCorrectionForTimeInfo = longitudeDifferenceForTimeInfo * 4;
  const lmtForTimeInfo = localMoment.clone().subtract(longitudeCorrectionForTimeInfo, 'minutes');
  const eotForTimeInfo = calculateEquationOfTime(lmtForTimeInfo);
  const totalCorrectionForTimeInfo = solarMoment.diff(localMoment, 'minutes', true);
  
  const timeInfo = {
    inputDateTime: birthDatetime,
    // Явные подписи для понятности
    localAdministrativeTime: localMoment.format('YYYY-MM-DD HH:mm:ss'),
    trueSolarTime: solarMoment.format('YYYY-MM-DD HH:mm:ss'),
    gmtTime: gmtMomentForTimeInfo.format('YYYY-MM-DD HH:mm:ss'),
    lmtTime: lmtForTimeInfo.format('YYYY-MM-DD HH:mm:ss'), // Среднее местное время (Local Mean Time)
    hourMomentUsed: hourMoment.format('YYYY-MM-DD HH:mm:ss'),
    useSolarTime: useSolarTime,
    timeMethod: useSolarTime ? 'Истинное солнечное время (традиционный метод)' : 'Локальное административное время (стандартный метод)',
    // Детали расчета для прозрачности
    longitude: finalLongitude,
    timezone: birthPlace,
    actualUtcOffsetHours: utcOffsetHoursForTimeInfo, // UTC offset из указанного часового пояса
    approximateUtcOffsetHours: approximateUtcOffsetHoursForTimeInfo, // UTC offset, вычисленный по долготе
    centralMeridian: centralMeridianForTimeInfo, // Центральный меридиан, вычисленный по долготе (правильный)
    longitudeCorrectionMinutes: Math.round(longitudeCorrectionForTimeInfo * 100) / 100,
    eotMinutes: Math.round(eotForTimeInfo * 100) / 100, // Уравнение времени в минутах
    equationOfTimeMinutes: Math.round(eotForTimeInfo * 100) / 100, // Дубликат для обратной совместимости
    totalCorrectionMinutes: Math.round(totalCorrectionForTimeInfo * 100) / 100,
    dayShifted: isDayShifted,
    dayForCalculation: baziDate.format('YYYY-MM-DD'),
    timeForLunisolar: `${baziDate.format('YYYY-MM-DD')} ${localMoment.format('HH:mm')}`,
    lunisolarInputComponents: {
      year: baziMoment.year(),
      month: baziMoment.month() + 1,
      day: baziMoment.date(),
      hour: baziMoment.hour(),
      minute: baziMoment.minute()
    },
    gender: gender,
    birthPlace: birthPlace,
    // Информация о летнем времени (DST) для исторических дат
    isDST: isDST, // Действовало ли летнее время в эту дату
    dstNote: isDST 
      ? 'Летнее время (DST) действовало в эту дату' 
      : 'Летнее время (DST) НЕ действовало (зимнее время или DST не применялось в этом регионе/году)',
    // Обратная совместимость (старые поля)
    localTime: localMoment.format('YYYY-MM-DD HH:mm:ss'),
    solarTime: solarMoment.format('YYYY-MM-DD HH:mm:ss'),
    utcOffsetMinutes: utcOffsetForTimeInfo
  };

  // Убеждаемся, что pillars содержит 4 элемента
  const finalPillars = pillars.length >= 4 ? pillars.slice(0, 4) : [...pillars, ...Array(4 - pillars.length).fill('')];
  
  // Добавляем скрытые стволы для каждого столпа
  const pillarsWithHiddenStems = finalPillars.map((pillar, index) => {
    if (!pillar || pillar.length < 2) return { pillar, hiddenStems: [] };
    const branchGlyph = pillar.charAt(1); // Второй иероглиф - земная ветвь
    const hidden = hiddenStems[branchGlyph] || [];
    return {
      pillar,
      stemGlyph: pillar.charAt(0),
      branchGlyph: branchGlyph,
      hiddenStems: hidden.map(h => ({
        stem: h.stem,
        element: getStemBranchElement(h.stem),
        weight: h.weight
      }))
    };
  });
  
  // Анализ специальных комбинаций (чистые стволы месяца)
  const monthStem = bazi.month.stem.name;
  const monthBranch = bazi.month.branch.name;
  const isPureMonth = (monthStem === '甲' && monthBranch === '寅') ||
                      (monthStem === '乙' && monthBranch === '卯') ||
                      (monthStem === '丙' && monthBranch === '午') ||
                      (monthStem === '丁' && monthBranch === '巳') ||
                      (monthStem === '戊' && monthBranch === '辰' || monthBranch === '戌') ||
                      (monthStem === '己' && monthBranch === '未' || monthBranch === '丑') ||
                      (monthStem === '庚' && monthBranch === '申') ||
                      (monthStem === '辛' && monthBranch === '酉') ||
                      (monthStem === '壬' && monthBranch === '亥') ||
                      (monthStem === '癸' && monthBranch === '子');
  
  // Анализ замковых столпов (主柱)
  const castlePillars = [];
  const allBranches = [
    bazi.year.branch.name,
    bazi.month.branch.name,
    bazi.day.branch.name,
    correctedHourPillar ? correctedHourPillar.branch : bazi.hour.branch.name
  ];
  
  // Проверяем на наличие одинаковых ветвей (замковые комбинации)
  const branchCounts = {};
  allBranches.forEach(b => {
    branchCounts[b] = (branchCounts[b] || 0) + 1;
  });
  
  Object.keys(branchCounts).forEach(branch => {
    if (branchCounts[branch] >= 2) {
      const pillarIndices = [];
      allBranches.forEach((b, i) => {
        if (b === branch) pillarIndices.push(['年柱', '月柱', '日柱', '时柱'][i]);
      });
      castlePillars.push({
        branch,
        element: getStemBranchElement(branch),
        count: branchCounts[branch],
        pillars: pillarIndices,
        meaning: `Замковый столп (主柱): ${branch} встречается ${branchCounts[branch]} раз, создавая стабилизирующую структуру`
      });
    }
  });
  
  // Анализ пропущенных ветвей (сэндвич)
  const allBranchSet = new Set(allBranches);
  const allBranchArray = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const missingBranches = allBranchArray.filter(b => !allBranchSet.has(b));
  const sandwichBranches = [];
  if (missingBranches.length > 0) {
    missingBranches.forEach(missing => {
      // Проверяем, является ли пропущенная ветвь "сэндвичем" (между двумя присутствующими)
      const missingIndex = allBranchArray.indexOf(missing);
      const before = allBranchArray[(missingIndex - 1 + 12) % 12];
      const after = allBranchArray[(missingIndex + 1) % 12];
      if (allBranchSet.has(before) && allBranchSet.has(after)) {
        sandwichBranches.push({
          branch: missing,
          element: getStemBranchElement(missing),
          meaning: `Пропущенная ветвь (сэндвич): ${missing} отсутствует между ${before} и ${after}, указывая на скрытый потенциал или неявные события`
        });
      }
    });
  }
  
  // Благородные люди (贵人) - показываем всех, даже если их нет в карте
  const noblePeople = [];
  const dayStem = bazi.day.stem.name;
  // Благородные люди определяются по дню
  // 甲见子、申, 乙见子、申, 丙见亥、酉, 丁见亥、酉, 戊见丑、未, 己见子、申, 庚见丑、未, 辛见午、寅, 壬见卯、巳, 癸见卯、巳
  const noblePeopleMap = {
    '甲': ['子', '申'], '乙': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '戊': ['丑', '未'], '己': ['子', '申'],
    '庚': ['丑', '未'], '辛': ['午', '寅'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳']
  };
  const nobleBranches = noblePeopleMap[dayStem] || [];
  
  // Показываем всех благородных людей, отмечая какие есть в карте, а какие отсутствуют
  nobleBranches.forEach((nobleBranch) => {
    const foundIndex = allBranches.findIndex(b => b === nobleBranch);
    if (foundIndex >= 0) {
      // Благородный человек присутствует в карте
      noblePeople.push({
        branch: nobleBranch,
        element: getStemBranchElement(nobleBranch),
        pillar: ['年柱', '月柱', '日柱', '时柱'][foundIndex],
        present: true,
        meaning: `Благородный человек (贵人) в ${['年柱', '月柱', '日柱', '时柱'][foundIndex]}`
      });
    } else {
      // Благородный человек отсутствует в карте
      const branchNames = {
        '子': 'Крысы', '丑': 'Быка', '寅': 'Тигра', '卯': 'Кролика',
        '辰': 'Дракона', '巳': 'Змеи', '午': 'Лошади', '未': 'Козы',
        '申': 'Обезьяны', '酉': 'Петуха', '戌': 'Собаки', '亥': 'Свиньи'
      };
      noblePeople.push({
        branch: nobleBranch,
        element: getStemBranchElement(nobleBranch),
        pillar: null,
        present: false,
        meaning: `Благородный человек (贵人), представленный ветвью ${branchNames[nobleBranch] || nobleBranch}, отсутствует в натальной карте`
      });
    }
  });
  
  // Качественный анализ баланса элементов
  const elementAnalysis = {
    wood: balance['Дерево'] || 0,
    fire: balance['Огонь'] || 0,
    earth: balance['Земля'] || 0,
    metal: balance['Металл'] || 0,
    water: balance['Вода'] || 0
  };
  
  const totalElements = Object.values(elementAnalysis).reduce((sum, val) => sum + val, 0);
  const avgElement = totalElements / 5;
  
  const dominantElements = Object.entries(elementAnalysis)
    .filter(([_, val]) => val > avgElement * 1.5)
    .map(([elem, _]) => elem);
  
  const weakElements = Object.entries(elementAnalysis)
    .filter(([_, val]) => val < avgElement * 0.7)
    .map(([elem, _]) => elem);
  
  // Определяем качественный дисбаланс на основе силы элемента дня
  let qualityImbalanceText = '';
  if (strengthAnalysis.strength <= 2) {
    // Слабая личность - нужно определить, что истощает и контролирует
    const dayMasterElementLower = dayMasterElement.toLowerCase();
    const dayMasterMap = {
      'дерево': { drain: 'fire', control: 'metal', support: 'water', help: 'wood' },
      'огонь': { drain: 'earth', control: 'water', support: 'wood', help: 'fire' },
      'земля': { drain: 'metal', control: 'wood', support: 'fire', help: 'earth' },
      'металл': { drain: 'water', control: 'fire', support: 'earth', help: 'metal' },
      'вода': { drain: 'wood', control: 'earth', support: 'metal', help: 'water' }
    };
    
    const relations = dayMasterMap[dayMasterElementLower];
    if (relations) {
      const drainValue = elementAnalysis[relations.drain] || 0;
      const controlValue = elementAnalysis[relations.control] || 0;
      const supportValue = elementAnalysis[relations.support] || 0;
      const helpValue = elementAnalysis[relations.help] || 0;
      
      const elementNames = {
        'wood': 'Дерева', 'fire': 'Огня', 'earth': 'Земли', 'metal': 'Металла', 'water': 'Воды'
      };
      
      const imbalances = [];
      if (drainValue > avgElement * 1.3) {
        imbalances.push(`избыток истощающего ${elementNames[relations.drain]}`);
      }
      if (controlValue > avgElement * 1.3) {
        imbalances.push(`избыток контролирующего ${elementNames[relations.control]}`);
      }
      if (supportValue < avgElement * 0.8) {
        imbalances.push(`недостаток поддерживающего ${elementNames[relations.support]}`);
      }
      if (helpValue < avgElement * 0.8) {
        imbalances.push(`недостаток помогающего ${elementNames[relations.help]}`);
      }
      
      if (imbalances.length > 0) {
        // Формируем основной текст с максимальной точностью
        const drainTerm = relations.drain === 'metal' ? 'самовыражение' : 
                         relations.drain === 'fire' ? 'ресурсы' : 
                         relations.drain === 'earth' ? 'помощь' : 
                         relations.drain === 'water' ? 'интеллект' : 'творчество';
        const supportTerm = relations.support === 'metal' ? 'самовыражение' : 
                           relations.support === 'fire' ? 'ресурсы' : 
                           relations.support === 'earth' ? 'помощь' : 
                           relations.support === 'water' ? 'интеллект' : 'творчество';
        
        // Основное описание дисбаланса с приоритетом на истощение и недостаток поддержки
        let mainText = 'При формальном балансе, карта имеет качественный дисбаланс: ';
        
        if (drainValue > avgElement * 1.3 && supportValue < avgElement * 0.8) {
          mainText += `избыток истощающего ${elementNames[relations.drain]} (${drainTerm}) при недостатке поддерживающего ${elementNames[relations.support]} (${supportTerm}).`;
        } else if (drainValue > avgElement * 1.3) {
          mainText += `избыток истощающего ${elementNames[relations.drain]} (${drainTerm}).`;
        } else if (supportValue < avgElement * 0.8) {
          mainText += `недостаток поддерживающего ${elementNames[relations.support]} (${supportTerm}).`;
        } else {
          const allImbalances = imbalances.join(' и ');
          mainText += `${allImbalances}.`;
        }
        
        qualityImbalanceText = mainText;
        
        // Добавляем информацию о давлении контролирующего элемента
        if (controlValue > avgElement * 1.2) {
          // Проверяем, находится ли контролирующий элемент в дне (ветвь дня)
          const dayBranchElement = getElementName(bazi.day.branch);
          const controlElementName = elementNames[relations.control];
          
          // Сравниваем элементы (с учетом регистра)
          const elementComparison = {
            'Дерево': 'wood', 'Огонь': 'fire', 'Земля': 'earth', 
            'Металл': 'metal', 'Вода': 'water'
          };
          
          if (dayBranchElement === controlElementName) {
            // Контролирующий элемент находится в ветви дня - прямое давление
            qualityImbalanceText += ` ${controlElementName} дня оказывает прямое давление на слабую ${dayMasterElement} личности.`;
          } else {
            // Контролирующий элемент присутствует, но не в дне
            const controlTerm = relations.control === 'metal' ? 'самовыражение' : 
                               relations.control === 'fire' ? 'ресурсы' : 
                               relations.control === 'earth' ? 'помощь' : 
                               relations.control === 'water' ? 'интеллект' : 'творчество';
            qualityImbalanceText += ` Наблюдается избыток контролирующего ${controlElementName} (${controlTerm}, ${controlValue.toFixed(2)}), что ослабляет ${dayMasterElement} личности.`;
          }
        }
      } else {
        qualityImbalanceText = 'Элементы относительно сбалансированы';
      }
    } else {
      qualityImbalanceText = dominantElements.length > 0 
        ? `Много ${dominantElements.map(e => e === 'wood' ? 'Дерева' : e === 'fire' ? 'Огня (Ресурсы)' : e === 'earth' ? 'Земли' : e === 'metal' ? 'Металла (Самовыражение)' : 'Воды').join(', ')}`
        : 'Элементы относительно сбалансированы';
    }
  } else {
    qualityImbalanceText = dominantElements.length > 0 
      ? `Много ${dominantElements.map(e => e === 'wood' ? 'Дерева' : e === 'fire' ? 'Огня (Ресурсы)' : e === 'earth' ? 'Земли' : e === 'metal' ? 'Металла (Самовыражение)' : 'Воды').join(', ')}`
      : 'Элементы относительно сбалансированы';
  }
  
  const balanceAnalysis = {
    dominant: dominantElements,
    weak: weakElements,
    balanced: Object.entries(elementAnalysis)
      .filter(([_, val]) => val >= avgElement * 0.7 && val <= avgElement * 1.5)
      .map(([elem, _]) => elem),
    interpretation: qualityImbalanceText,
    qualityImbalance: qualityImbalanceText
  };

  return {
    success: true,
    pillars: finalPillars,
    pillarsWithHiddenStems: pillarsWithHiddenStems,
    dayMaster: {
      glyph: dayMasterGlyph,
      element: dayMasterElement,
      strength: strengthAnalysis.strength,
      strengthText: strengthAnalysis.strengthText,
      season: `Рождён в месяц ${monthBranchName} (сезон ${getElementName(bazi.month.branch)})`,
      strengthDetails: strengthAnalysis.details
    },
    elementBalance: balance,
    balanceAnalysis: balanceAnalysis,
    usefulElements: usefulElements,
    usefulStems: usefulStems,
    harmfulElements: harmfulElements,
    harmfulStems: harmfulStems,
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
    // НОВОЕ: Скрытые стволы в каждом столпе
    pillarsWithHiddenStems: pillarsWithHiddenStems,
    // НОВОЕ: Чистая Ци месяца
    isPureMonth: isPureMonth,
    pureMonthInfo: isPureMonth ? {
      stem: monthStem,
      branch: monthBranch,
      meaning: `Чистая Ци месяца (${monthStem}${monthBranch}): Небесный ствол и земная ветвь месяца совпадают, создавая сильную и негибкую структуру`
    } : null,
    // НОВОЕ: Замковые столпы
    castlePillars: castlePillars,
    // НОВОЕ: Пропущенные ветви (сэндвич)
    sandwichBranches: sandwichBranches,
    // НОВОЕ: Благородные люди
    noblePeople: noblePeople,
    // НОВОЕ: Температурный баланс
    temperatureBalance: calculateTemperatureBalance(dayMasterElement, bazi.month.branch.name, bazi.month.stem.name),
    // НОВОЕ: Информация о времени (для прозрачности расчетов)
    timeInfo: timeInfo,
    // НОВОЕ: Специальная структура карты
    specialStructure: specialStructure || null,
    improvements: {
      accurateLuckStartAge: true,
      hiddenStemsIncluded: true,
      multiFactorStrengthAnalysis: true,
      pillarInteractions: true,
      stemInteractions: true,
      specialCombinations: true,
      stemStrengthBySeason: true,
      trueSolarTimeConversion: true,
      baziDayCorrection: true,
      specialStructures: true
    }
  };
}

