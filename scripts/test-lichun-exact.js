/**
 * Поиск точного момента перехода года
 */

const lunisolar = require('lunisolar');
const moment = require('moment-timezone');

console.log('=== Поиск точного момента перехода от 1999 к 2000 году ===\n');

const year1999 = '己卯';
const year2000 = '庚辰';

// Переход происходит между 00:00 и 06:00 4 февраля
console.log('Переход происходит между 00:00 и 06:00 4 февраля...\n');

const testTimes = [
  '2000-02-04 00:00:00',
  '2000-02-04 01:00:00',
  '2000-02-04 02:00:00',
  '2000-02-04 03:00:00',
  '2000-02-04 04:00:00',
  '2000-02-04 05:00:00',
  '2000-02-04 06:00:00'
];

let lastYear = null;
for (const timeStr of testTimes) {
  const m = moment.tz(timeStr, 'YYYY-MM-DD HH:mm:ss', 'Asia/Shanghai');
  const lsr = lunisolar(m.toDate());
  const year = lsr.char8.year.name;
  const changed = lastYear && year !== lastYear;
  console.log(`${timeStr} (UTC: ${m.toDate().toISOString()}) => Год: ${year} ${changed ? '<<<< ПЕРЕХОД!' : ''}`);
  lastYear = year;
}

// Теперь проверим более точно между 03:00 и 05:00
console.log('\n=== Детальная проверка между 03:00 и 05:00 ===\n');

const detailedTimes = [
  '2000-02-04 03:00:00',
  '2000-02-04 03:30:00',
  '2000-02-04 04:00:00',
  '2000-02-04 04:30:00',
  '2000-02-04 05:00:00'
];

lastYear = null;
for (const timeStr of detailedTimes) {
  const m = moment.tz(timeStr, 'YYYY-MM-DD HH:mm:ss', 'Asia/Shanghai');
  const lsr = lunisolar(m.toDate());
  const year = lsr.char8.year.name;
  const changed = lastYear && year !== lastYear;
  console.log(`${timeStr} => Год: ${year} ${changed ? '<<<< ПЕРЕХОД!' : ''}`);
  lastYear = year;
}

// Вывод: библиотека lunisolar считает, что Личунь произошел между 04:00 и 05:00
// Но тест ожидает, что Личунь был в 20:41
