import lunisolar from 'lunisolar';

/**
 * ПОЛНЫЙ АНАЛИЗ КАРТЫ БАЦЗЫ
 * Принимает дату, время (и место через корректный часовой пояс) и пол
 * Возвращает полный разбор карты и персонализированные рекомендации
 */
export function getBaziAnalysis(birthDatetime, gender = 'female') {
  // 1. РАСЧЕТ СТОЛПОВ
  // Для production НЕОБХОДИМО добавлять корректный offset на основе места рождения!
  const lsr = lunisolar(birthDatetime);
  const bazi = lsr.char8;

  // 2. ОПРЕДЕЛЕНИЕ ОСНОВНЫХ ПАРАМЕТРОВ
  const dayStem = bazi.day.stem;     // Господин Дня (элемент личности)
  const monthBranch = bazi.month.branch; // Ветвь месяца (сезон)
  
  // Собираем все элементы карты для анализа баланса
  const allElements = {
    Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0
  };

  // Функция для увеличения счетчика элементов
  const addElement = (stemOrBranch) => {
    const elemName = stemOrBranch.fiveElement.name; // 'Wood', 'Fire' и т.д.
    allElements[elemName] += 1;
  };

  // Анализируем все 8 иероглифов (4 ствола + 4 ветви)
  addElement(bazi.year.stem);
  addElement(bazi.year.branch);
  addElement(bazi.month.stem);
  addElement(bazi.month.branch);
  addElement(bazi.day.stem);
  addElement(bazi.day.branch);
  addElement(bazi.hour.stem);
  addElement(bazi.hour.branch);

  // 3. ОПРЕДЕЛЕНИЕ СИЛЫ ГОСПОДИНА ДНЯ (по сезону)
  const seasonStrength = {
    'Wood': {旺: ['寅','卯','辰'], 相: ['亥','子','丑'], 休: ['申','酉','戌'], 囚: ['巳','午','未'], 死: ['辰','戌','丑','未']},
    'Fire': {旺: ['巳','午','未'], 相: ['寅','卯','辰'], 休: ['亥','子','丑'], 囚: ['申','酉','戌'], 死: ['辰','戌','丑','未']},
    'Earth': {旺: ['辰','戌','丑','未'], 相: ['巳','午','未'], 休: ['寅','卯','辰'], 囚: ['亥','子','丑'], 死: ['申','酉','戌']},
    'Metal': {旺: ['申','酉','戌'], 相: ['辰','戌','丑','未'], 休: ['巳','午','未'], 囚: ['寅','卯','辰'], 死: ['亥','子','丑']},
    'Water': {旺: ['亥','子','丑'], 相: ['申','酉','戌'], 休: ['辰','戌','丑','未'], 囚: ['巳','午','未'], 死: ['寅','卯','辰']}
  };

  const elemName = dayStem.fiveElement.name; // Название элемента личности ('Wood', 'Fire'...)
  const monthZhi = monthBranch.name; // Название ветви месяца ('寅', '卯'...)
  const strengthRules = seasonStrength[elemName];
  
  let strengthLevel = 3; // По умолчанию - средняя (3 из 5)
  let strengthText = 'средняя';
  
  // Определяем силу по сезону
  if (strengthRules.旺.includes(monthZhi)) { strengthLevel = 5; strengthText = 'очень сильный'; }
  else if (strengthRules.相.includes(monthZhi)) { strengthLevel = 4; strengthText = 'сильный'; }
  else if (strengthRules.休.includes(monthZhi)) { strengthLevel = 3; strengthText = 'средний'; }
  else if (strengthRules.囚.includes(monthZhi)) { strengthLevel = 2; strengthText = 'слабый'; }
  else if (strengthRules.死.includes(monthZhi)) { strengthLevel = 1; strengthText = 'очень слабый'; }

  // 4. ОПРЕДЕЛЕНИЕ ПОЛЕЗНЫХ ЭЛЕМЕНТОВ (по балансу)
  // Правила: для слабого элемента - поддерживающие, для сильного - ослабляющие
  const elementRelations = {
    'Wood': { support: 'Water', help: 'Wood', drain: 'Fire', weaken: 'Metal', exhaust: 'Earth' },
    'Fire': { support: 'Wood', help: 'Fire', drain: 'Earth', weaken: 'Water', exhaust: 'Metal' },
    'Earth': { support: 'Fire', help: 'Earth', drain: 'Metal', weaken: 'Wood', exhaust: 'Water' },
    'Metal': { support: 'Earth', help: 'Metal', drain: 'Water', weaken: 'Fire', exhaust: 'Wood' },
    'Water': { support: 'Metal', help: 'Water', drain: 'Wood', weaken: 'Earth', exhaust: 'Fire' }
  };

  const relations = elementRelations[elemName];
  let usefulElements = [];

  if (strengthLevel <= 2) {
    // Слабый элемент: нужна поддержка и помощь
    usefulElements = [relations.support, relations.help];
  } else if (strengthLevel >= 4) {
    // Сильный элемент: нужны ослабление и истощение
    usefulElements = [relations.weaken, relations.exhaust];
  } else {
    // Средняя сила: балансируем
    usefulElements = [relations.support, relations.weaken];
  }

  // 5. ФОРМИРОВАНИЕ РЕКОМЕНДАЦИЙ
  const elementNamesRU = {
    'Wood': 'Дерево', 'Fire': 'Огонь', 'Earth': 'Земля', 
    'Metal': 'Металл', 'Water': 'Вода'
  };

  const ruUsefulElements = usefulElements.map(el => elementNamesRU[el]);
  
  // Базовая рекомендация
  let adviceBase = '';
  if (strengthLevel <= 2) {
    adviceBase = `Ваш ${elementNamesRU[elemName]} ослаблен. Для гармонии и удачи опирайтесь на поддержку ${ruUsefulElements.join(' и ')}.`;
  } else if (strengthLevel >= 4) {
    adviceBase = `Ваш ${elementNamesRU[elemName]} излишне силён. Для баланса используйте элементы ${ruUsefulElements.join(' и ')}.`;
  } else {
    adviceBase = `Ваш ${elementNamesRU[elemName]} сбалансирован. Для успеха поддерживайте равновесие с помощью ${ruUsefulElements.join(' и ')}.`;
  }

  // 6. ФОРМИРУЕМ ИТОГОВЫЙ ОБЪЕКТ
  return {
    pillars: bazi.toString().split(' '),
    dayMaster: {
      glyph: dayStem.name,
      element: elementNamesRU[elemName] || elemName,
      strength: strengthLevel,
      strengthText: strengthText
    },
    balance: allElements,
    usefulElements: ruUsefulElements,
    analysis: {
      season: monthBranch.name,
      strengthReason: `Рождён в сезон ${monthBranch.name} (${monthBranch.fiveElement.name})`
    },
    recommendations: {
      colors: ruUsefulElements.map(el => {
        const colorMap = { 'Дерево': 'зелёный', 'Огонь': 'красный', 'Земля': 'жёлтый', 'Металл': 'белый/золотой', 'Вода': 'синий/чёрный' };
        return colorMap[el];
      }),
      advice2026: `${adviceBase} В 2026 году (Огненная Лошадь) эта рекомендация особенно актуальна.`,
      shortAdvice: `Используйте ${ruUsefulElements.join(' и ')} для амулета.`
    }
  };
}

// 7. ТЕСТИРУЕМ НА ВАШИХ ДАННЫХ
const myAnalysis = getBaziAnalysis('1983-11-19 08:15');
console.log('=== ТЕСТ ДЛЯ ВАШЕЙ КАРТЫ ===');
console.log('Столпы:', myAnalysis.pillars.join(' '));
console.log('Элемент личности:', myAnalysis.dayMaster.element, `(сила: ${myAnalysis.dayMaster.strength}/5 - ${myAnalysis.dayMaster.strengthText})`);
console.log('Баланс элементов:', JSON.stringify(myAnalysis.balance));
console.log('Полезные элементы:', myAnalysis.usefulElements);
console.log('Рекомендации:', myAnalysis.recommendations.shortAdvice);
console.log('Совет на 2026:', myAnalysis.recommendations.advice2026);