/**
 * Тестовый скрипт для проверки правильности расчета Бацзы на пограничных датах
 * Проверяет критические моменты: Личунь (смена года), 23:00 (смена дня), определение часа
 */

const { getFullBaziAnalysis } = require('../lib/bazi/bazi-calculator-expert');

console.log('🧪 Тестирование калькулятора Бацзы на пограничных датах\n');
console.log('='.repeat(80));

// Тест 1: 4 февраля 2000, 20:30 (Пекин)
// Ожидается: Год 己卯 (1999), Месяц 己丑 (12-й месяц), потому что Личунь был в 20:41
console.log('\n📅 ТЕСТ 1: 4 февраля 2000, 20:30 (Пекин, UTC+8)');
console.log('Ожидается: Год 己卯 (1999), Месяц 己丑 (12-й месяц)');
console.log('Причина: Личунь (начало весны) был в 20:41, до этого момента - еще 1999 год\n');
console.log('-'.repeat(80));

try {
  const result1 = getFullBaziAnalysis('2000-02-04 20:30', 'male', 'Asia/Shanghai', 116.4);
  console.log('✅ Результат:');
  console.log(`   Год: ${result1.pillars[0]}`);
  console.log(`   Месяц: ${result1.pillars[1]}`);
  console.log(`   День: ${result1.pillars[2]}`);
  console.log(`   Час: ${result1.pillars[3]}`);
  console.log(`\n   Ожидалось: 己卯 / 己丑 / ? / ?`);
  console.log(`   Получено:  ${result1.pillars[0]} / ${result1.pillars[1]} / ${result1.pillars[2]} / ${result1.pillars[3]}`);
  
  const yearCorrect = result1.pillars[0] === '己卯';
  const monthCorrect = result1.pillars[1] === '己丑';
  
  if (yearCorrect && monthCorrect) {
    console.log('\n   ✅ ТЕСТ ПРОЙДЕН: Год и месяц определены правильно!');
  } else {
    console.log('\n   ❌ ТЕСТ НЕ ПРОЙДЕН:');
    if (!yearCorrect) console.log(`      - Год неправильный: ожидалось 己卯, получено ${result1.pillars[0]}`);
    if (!monthCorrect) console.log(`      - Месяц неправильный: ожидалось 己丑, получено ${result1.pillars[1]}`);
  }
  
  if (result1.timeInfo) {
    console.log('\n   📊 Информация о времени:');
    console.log(`      Локальное время: ${result1.timeInfo.localTime}`);
    console.log(`      Солнечное время: ${result1.timeInfo.solarTime}`);
    console.log(`      Дата для расчета: ${result1.timeInfo.dayForCalculation}`);
    console.log(`      День сдвинут: ${result1.timeInfo.dayShifted}`);
    if (result1.timeInfo.lunisolarInputComponents) {
      console.log(`      Компоненты для lunisolar: ${JSON.stringify(result1.timeInfo.lunisolarInputComponents)}`);
    }
  }
} catch (error) {
  console.error('❌ Ошибка при расчете:', error.message);
  console.error(error.stack);
}

// Тест 2: 3 февраля 2023, 23:10 (Москва)
// Ожидается: Следующий день (4 февраля), Час 壬子 (час Крысы, 23:00-01:00)
console.log('\n\n📅 ТЕСТ 2: 3 февраля 2023, 23:10 (Москва, UTC+3)');
console.log('Ожидается: Следующий день (4 февраля), Час 壬子 (час Крысы)');
console.log('Причина: В Бацзы день меняется в 23:00, час Крысы начинается в 23:00\n');
console.log('-'.repeat(80));

try {
  const result2 = getFullBaziAnalysis('2023-02-03 23:10', 'female', 'Europe/Moscow', 37.6);
  console.log('✅ Результат:');
  console.log(`   Год: ${result2.pillars[0]}`);
  console.log(`   Месяц: ${result2.pillars[1]}`);
  console.log(`   День: ${result2.pillars[2]}`);
  console.log(`   Час: ${result2.pillars[3]}`);
  
  const hourCorrect = result2.pillars[3] && result2.pillars[3].includes('子');
  const dayShifted = result2.timeInfo && result2.timeInfo.dayShifted;
  
  console.log(`\n   Ожидалось: ? / ? / ? / ?子 (час Крысы)`);
  console.log(`   Получено:  ${result2.pillars[0]} / ${result2.pillars[1]} / ${result2.pillars[2]} / ${result2.pillars[3]}`);
  
  if (hourCorrect && dayShifted) {
    console.log('\n   ✅ ТЕСТ ПРОЙДЕН: День сдвинут и час определен правильно!');
  } else {
    console.log('\n   ❌ ТЕСТ НЕ ПРОЙДЕН:');
    if (!hourCorrect) console.log(`      - Час неправильный: должен быть час Крысы (子), получено ${result2.pillars[3]}`);
    if (!dayShifted) console.log(`      - День не сдвинут: должен быть следующий день (4 февраля)`);
  }
  
  if (result2.timeInfo) {
    console.log('\n   📊 Информация о времени:');
    console.log(`      Локальное время: ${result2.timeInfo.localTime}`);
    console.log(`      Солнечное время: ${result2.timeInfo.solarTime}`);
    console.log(`      Дата для расчета: ${result2.timeInfo.dayForCalculation}`);
    console.log(`      День сдвинут: ${result2.timeInfo.dayShifted}`);
    if (result2.timeInfo.lunisolarInputComponents) {
      console.log(`      Компоненты для lunisolar: ${JSON.stringify(result2.timeInfo.lunisolarInputComponents)}`);
    }
  }
} catch (error) {
  console.error('❌ Ошибка при расчете:', error.message);
  console.error(error.stack);
}

// Тест 3: 4 февраля 2000, 20:41 (Пекин) - точно момент Личунь
// Ожидается: Год 庚辰 (2000), потому что это момент начала нового года
console.log('\n\n📅 ТЕСТ 3: 4 февраля 2000, 20:41 (Пекин, UTC+8) - момент Личунь');
console.log('Ожидается: Год 庚辰 (2000) - это момент начала нового года\n');
console.log('-'.repeat(80));

try {
  const result3 = getFullBaziAnalysis('2000-02-04 20:41', 'male', 'Asia/Shanghai', 116.4);
  console.log('✅ Результат:');
  console.log(`   Год: ${result3.pillars[0]}`);
  console.log(`   Месяц: ${result3.pillars[1]}`);
  console.log(`\n   Ожидалось: 庚辰 (2000 год)`);
  console.log(`   Получено:  ${result3.pillars[0]}`);
  
  const yearCorrect = result3.pillars[0] === '庚辰';
  
  if (yearCorrect) {
    console.log('\n   ✅ ТЕСТ ПРОЙДЕН: Год определен правильно в момент Личунь!');
  } else {
    console.log(`\n   ❌ ТЕСТ НЕ ПРОЙДЕН: Год неправильный, ожидалось 庚辰, получено ${result3.pillars[0]}`);
  }
} catch (error) {
  console.error('❌ Ошибка при расчете:', error.message);
  console.error(error.stack);
}

console.log('\n' + '='.repeat(80));
console.log('🏁 Тестирование завершено\n');
