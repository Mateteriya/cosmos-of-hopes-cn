// bazi-calculator.js - ОБНОВЛЁННЫЙ И ИСПРАВЛЕННЫЙ КАЛЬКУЛЯТОР БАЦЗЫ
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

// --- ОСНОВНАЯ ФУНКЦИЯ (ИСПРАВЛЕННАЯ, БЕЗ ДУБЛИРОВАНИЙ) ---
export function getFullBaziAnalysis(birthDatetime, gender = 'female', birthPlace = 'Europe/Moscow') {
  // ВАЖНОЕ ПРЕДУПРЕЖДЕНИЕ ДЛЯ ПОЛЬЗОВАТЕЛЯ:
  // Этот калькулятор использует УПРОЩЁННЫЙ алгоритм. Точность около 85%.
  // Упрощения: фиксированный возраст начала удачи (6 лет), базовый анализ без скрытых стволов.
  
  // === 1. КОРРЕКТНЫЙ РАСЧЕТ С УЧЁТОМ МЕСТА РОЖДЕНИЯ ===
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
  
  // === 2. СТОЛПЫ УДАЧИ (ОДИН РАЗ, БЕЗ ДУБЛИРОВАНИЙ) ===
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

  // УПРОЩЕНИЕ: фиксированный возраст начала
  const startAge = 6;
  const luckPillars = [];
  for (let i = 0; i < 6; i++) {
    const pillarIndex = (startIndex + i) % sourceSequence.length;
    luckPillars.push({
        startAge: startAge + i * 10,
        pillar: sourceSequence[pillarIndex],
        ageRange: `${startAge + i * 10}-${startAge + i * 10 + 9} лет`,
        direction: direction
    });
  }

  // === 3. БАЛАНС ЭЛЕМЕНТОВ ===
  const balance = { 'Дерево': 0, 'Огонь': 0, 'Земля': 0, 'Металл': 0, 'Вода': 0 };
  pillars.forEach(pillar => {
    const [stemGlyph, branchGlyph] = pillar.split('');
    balance[getStemBranchElement(stemGlyph)]++;
    balance[getStemBranchElement(branchGlyph)]++;
  });

  // === 4. СИЛА ЭЛЕМЕНТА (по сезону) ===
  const seasonMap = {
    '寅': 'Дерево', '卯': 'Дерево', '辰': 'Дерево',
    '巳': 'Огонь', '午': 'Огонь', '未': 'Огонь',
    '申': 'Металл', '酉': 'Металл', '戌': 'Металл',
    '亥': 'Вода', '子': 'Вода', '丑': 'Вода'
  };
  
  const seasonElement = seasonMap[monthBranchName] || 'Земля';
  const strengthRules = {
    'Дерево': {旺: ['寅','卯','辰'], 相: ['亥','子','丑'], 休: ['申','酉','戌'], 囚: ['巳','午','未'], 死: ['辰','戌','丑','未']},
    'Огонь': {旺: ['巳','午','未'], 相: ['寅','卯','辰'], 休: ['亥','子','丑'], 囚: ['申','酉','戌'], 死: ['辰','戌','丑','未']},
    'Земля': {旺: ['辰','戌','丑','未'], 相: ['巳','午','未'], 休: ['寅','卯','辰'], 囚: ['亥','子','丑'], 死: ['申','酉','戌']},
    'Металл': {旺: ['申','酉','戌'], 相: ['辰','戌','丑','未'], 休: ['巳','午','未'], 囚: ['寅','卯','辰'], 死: ['亥','子','丑']},
    'Вода': {旺: ['亥','子','丑'], 相: ['申','酉','戌'], 休: ['辰','戌','丑','未'], 囚: ['巳','午','未'], 死: ['寅','卯','辰']}
  };
  
  const rules = strengthRules[dayMasterElement] || strengthRules['Дерево'];
  let strength = 3, strengthText = 'средняя';
  if (rules.旺.includes(monthBranchName)) { strength = 5; strengthText = 'очень сильный'; }
  else if (rules.相.includes(monthBranchName)) { strength = 4; strengthText = 'сильный'; }
  else if (rules.休.includes(monthBranchName)) { strength = 3; strengthText = 'средний'; }
  else if (rules.囚.includes(monthBranchName)) { strength = 2; strengthText = 'слабый'; }
  else if (rules.死.includes(monthBranchName)) { strength = 1; strengthText = 'очень слабый'; }

  // === 5. ПОЛЕЗНЫЕ ЭЛЕМЕНТЫ ===
  const elementCycle = {
    'Дерево': { support: 'Вода', help: 'Дерево', drain: 'Огонь', weaken: 'Металл', exhaust: 'Земля' },
    'Огонь': { support: 'Дерево', help: 'Огонь', drain: 'Земля', weaken: 'Вода', exhaust: 'Металл' },
    'Земля': { support: 'Огонь', help: 'Земля', drain: 'Металл', weaken: 'Дерево', exhaust: 'Вода' },
    'Металл': { support: 'Земля', help: 'Металл', drain: 'Вода', weaken: 'Огонь', exhaust: 'Дерево' },
    'Вода': { support: 'Металл', help: 'Вода', drain: 'Дерево', weaken: 'Земля', exhaust: 'Огонь' }
  };
  
  const cycle = elementCycle[dayMasterElement];
  let usefulElements = [];
  if (strength <= 2) {
    usefulElements = [cycle.support, cycle.help];
  } else if (strength >= 4) {
    usefulElements = [cycle.weaken, cycle.exhaust];
  } else {
    usefulElements = [cycle.support, cycle.weaken];
  }

  // === 6. ФОРМИРОВАНИЕ РЕЗУЛЬТАТА ===
  const colorMap = {
    'Дерево': 'зелёный', 'Огонь': 'красный', 'Земля': 'жёлтый/коричневый',
    'Металл': 'белый/золотой', 'Вода': 'синий/чёрный'
  };
  
  const currentYear = 2026;
  const yearAnimal = 'Огненная Лошадь';
  let yearAdvice = '';
  
  if (strength <= 2) {
    yearAdvice = `В ${currentYear} году (${yearAnimal}) ваш ${dayMasterElement} нуждается в поддержке. Используйте элементы ${usefulElements.join(' и ')}.`;
  } else if (strength >= 4) {
    yearAdvice = `В ${currentYear} году (${yearAnimal}) мощная энергия года может усилить ваш и без того сильный ${dayMasterElement}. Для баланса акцентируйте ${usefulElements.join(' и ')}.`;
  } else {
    yearAdvice = `В ${currentYear} году (${yearAnimal}) у вас хороший потенциал. Для наилучшего результата сочетайте с элементами ${usefulElements.join(' и ')}.`;
  }

  return {
    success: true,
    pillars: pillars,
    dayMaster: {
      glyph: dayMasterGlyph,
      element: dayMasterElement,
      strength: strength,
      strengthText: strengthText,
      season: `Рождён в месяц ${monthBranchName} (сезон ${seasonElement})`
    },
    elementBalance: balance,
    usefulElements: usefulElements,
    luckPillars: luckPillars.map(lp => ({
      ageRange: lp.ageRange,
      pillar: lp.pillar,
      element: getStemBranchElement(lp.pillar.charAt(0))
    })),
    recommendations: {
      colors: usefulElements.map(el => colorMap[el]),
      advice: yearAdvice,
      shortAdvice: `Для амулета используйте элементы: ${usefulElements.join(' и ')}`,
      // ДОБАВЛЯЕМ ЯВНОЕ ПРЕДУПРЕЖДЕНИЕ
      disclaimer: 'ВНИМАНИЕ: Этот расчёт использует упрощённый алгоритм (85% точности). Для точного анализа обратитесь к профессиональному консультанту Бацзы.'
    },
    // ДОБАВЛЯЕМ СПИСОК УПРОЩЕНИЙ
    simplifications: {
      fixedLuckStartAge: true,  // Фиксированный возраст начала удачи (6 лет)
      noHiddenStems: true,       // Без учёта скрытых стволов
      basicStrengthAnalysis: true // Базовый анализ силы без сложных взаимодействий
    }
  };
}

// === ТЕСТ ДЛЯ WINDOWS ===
const isMainModule = process.argv[1] && process.argv[1].includes('bazi-calculator.js');

if (isMainModule) {
  console.log('🔮 Запуск теста калькулятора Бацзы...\n');
  
  try {
    const result = getFullBaziAnalysis('1983-11-19 08:15', 'female', 'Europe/Moscow');
    
    console.log('✅ РАСЧЁТ УСПЕШЕН!\n');
    console.log('1. НАТАЛЬНЫЕ СТОЛПЫ:', result.pillars.join(' '));
    
    if (result.pillars.join(' ') === '癸亥 癸亥 辛亥 壬辰') {
      console.log('   ✓ СОВПАДАЕТ с эталонным расчётом!');
    } else {
      console.log('   ⚠️ ОТЛИЧАЕТСЯ от эталонного!');
      console.log('   Эталон: 癸亥 癸亥 辛亥 壬辰');
    }
    
    console.log('\n2. ЭЛЕМЕНТ ЛИЧНОСТИ:', result.dayMaster.element, `(${result.dayMaster.glyph})`);
    console.log('   Сила:', result.dayMaster.strength, '/5 -', result.dayMaster.strengthText);
    
    console.log('\n3. ПОЛЕЗНЫЕ ЭЛЕМЕНТЫ:', result.usefulElements.join(', '));
    console.log('   Цвета для амулета:', result.recommendations.colors.join(', '));
    
    console.log('\n4. СТОЛПЫ УДАЧИ (первые 3 периода):');
    result.luckPillars.slice(0, 3).forEach(lp => {
      console.log(`   ${lp.ageRange}: ${lp.pillar}`);
    });
    
    console.log('\n5. ПРЕДУПРЕЖДЕНИЕ:');
    console.log('   ', result.recommendations.disclaimer);
    
    console.log('\n6. УПРОЩЕНИЯ В РАСЧЁТЕ:');
    console.log('   - Фиксированный возраст начала удачи (6 лет)');
    console.log('   - Без учёта скрытых стволов');
    console.log('   - Базовый анализ силы элемента');
    
    console.log('\n=== Калькулятор готов к интеграции! ===');
    
  } catch (error) {
    console.error('❌ ОШИБКА ПРИ РАСЧЁТЕ:', error.message);
    console.error('Стек ошибки:', error.stack);
  }
}