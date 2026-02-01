/**
 * Тест для проверки обработки исторического летнего времени (DST)
 * Проверяем, правильно ли moment-timezone определяет UTC offset для исторических дат
 */

const moment = require('moment-timezone');

// Тестовые случаи для различных стран и эпох
const testCases = [
  {
    name: 'Bay City, Michigan, США - 16 августа 1958 (летнее время должно действовать)',
    dateTime: '1958-08-16 07:05',
    timezone: 'America/Detroit',
    expectedOffset: -4, // Летнее время в августе: UTC-4
  },
  {
    name: 'Bay City, Michigan, США - 16 января 1958 (зимнее время)',
    dateTime: '1958-01-16 07:05',
    timezone: 'America/Detroit',
    expectedOffset: -5, // Зимнее время в январе: UTC-5
  },
  {
    name: 'Москва, Россия - 19 ноября 1983 (летнее время отменено с 1981)',
    dateTime: '1983-11-19 08:10',
    timezone: 'Europe/Moscow',
    expectedOffset: 3, // В 1983 году летнее время действовало до октября, ноябрь - зимнее время
  },
  {
    name: 'Москва, Россия - 19 июля 1983 (летнее время действует)',
    dateTime: '1983-07-19 08:10',
    timezone: 'Europe/Moscow',
    expectedOffset: 4, // Летнее время: UTC+4
  },
  {
    name: 'Москва, Россия - 19 ноября 1980 (ДО введения летнего времени в 1981)',
    dateTime: '1980-11-19 08:10',
    timezone: 'Europe/Moscow',
    expectedOffset: 3, // До 1981 года летнего времени не было, всегда UTC+3
  },
  {
    name: 'Нью-Йорк, США - 15 октября 2000 (летнее время еще действует)',
    dateTime: '2000-10-15 10:00',
    timezone: 'America/New_York',
    expectedOffset: -4, // В октябре 2000 года DST действовало до конца октября
  },
];

console.log('🧪 Тестирование обработки исторического летнего времени (DST)\n');
console.log('=' .repeat(80));

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log('-'.repeat(80));
  
  const momentObj = moment.tz(testCase.dateTime, 'YYYY-MM-DD HH:mm', testCase.timezone);
  const actualOffset = momentObj.utcOffset() / 60; // В часах
  const isDST = momentObj.isDST();
  
  console.log(`   Дата/время: ${testCase.dateTime}`);
  console.log(`   Timezone: ${testCase.timezone}`);
  console.log(`   UTC offset (фактический): UTC${actualOffset >= 0 ? '+' : ''}${actualOffset}`);
  console.log(`   UTC offset (ожидаемый): UTC${testCase.expectedOffset >= 0 ? '+' : ''}${testCase.expectedOffset}`);
  console.log(`   Летнее время (DST): ${isDST ? 'ДА' : 'НЕТ'}`);
  console.log(`   UTC время: ${momentObj.utc().format('YYYY-MM-DD HH:mm:ss')}`);
  
  const isCorrect = actualOffset === testCase.expectedOffset;
  if (isCorrect) {
    console.log(`   ✅ РЕЗУЛЬТАТ: ПРАВИЛЬНО`);
  } else {
    console.log(`   ❌ РЕЗУЛЬТАТ: ОШИБКА! Разница: ${actualOffset - testCase.expectedOffset} часов`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n📋 Справка по историческим изменениям DST:\n');

console.log('🇺🇸 США (America/Detroit, America/New_York):');
console.log('   - 1918-1919: Первое введение DST');
console.log('   - 1920-1941: DST отменено в большинстве штатов');
console.log('   - 1942-1945: "War Time" - постоянное летнее время');
console.log('   - 1946-1966: Региональные различия, хаос');
console.log('   - 1966: Uniform Time Act - стандартизация DST');
console.log('   - 2007: Energy Policy Act - изменение дат (с 2007 года DST начинается в марте, заканчивается в ноябре)');

console.log('\n🇷🇺 Россия/СССР (Europe/Moscow):');
console.log('   - 1917-1930: Летнее время действовало');
console.log('   - 1930-1981: "Декретное время" - постоянный UTC+3, БЕЗ летнего времени');
console.log('   - 1981-2011: Летнее время снова введено (UTC+4 летом)');
console.log('   - 2011-настоящее время: Летнее время отменено, постоянный UTC+3');

console.log('\n📚 Источник данных:');
console.log('   moment-timezone использует базу данных IANA Time Zone Database');
console.log('   https://www.iana.org/time-zones');
console.log('   Версия moment-timezone: 0.6.0');
