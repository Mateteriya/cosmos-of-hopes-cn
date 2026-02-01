/**
 * Тест для поиска точного момента перехода года от 1999 к 2000
 */

const lunisolar = require('lunisolar');
const moment = require('moment-timezone');

console.log('=== Поиск момента перехода от 1999 года (己卯) к 2000 году (庚辰) ===\n');

const year1999 = '己卯';
const year2000 = '庚辰';

// Проверяем моменты времени от 3 февраля до 5 февраля
console.log('Проверяем моменты от 3 февраля до 5 февраля 2000...\n');

const testTimes = [
  '2000-02-03 12:00:00',
  '2000-02-03 18:00:00',
  '2000-02-03 20:00:00',
  '2000-02-03 22:00:00',
  '2000-02-04 00:00:00',
  '2000-02-04 06:00:00',
  '2000-02-04 12:00:00',
  '2000-02-04 18:00:00',
  '2000-02-04 19:00:00',
  '2000-02-04 20:00:00',
  '2000-02-04 20:30:00',
  '2000-02-04 20:41:00'
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

// Проверяем момент 3 февраля 23:59
console.log('\n=== Проверка момента 3 февраля 23:59 ===');
const m359 = moment.tz('2000-02-03 23:59:00', 'YYYY-MM-DD HH:mm:ss', 'Asia/Shanghai');
const lsr359 = lunisolar(m359.toDate());
console.log('3 февраля 23:59 => Год:', lsr359.char8.year.name);

// Проверяем момент 4 февраля 00:00
console.log('\n=== Проверка момента 4 февраля 00:00 ===');
const m400 = moment.tz('2000-02-04 00:00:00', 'YYYY-MM-DD HH:mm:ss', 'Asia/Shanghai');
const lsr400 = lunisolar(m400.toDate());
console.log('4 февраля 00:00 => Год:', lsr400.char8.year.name);
