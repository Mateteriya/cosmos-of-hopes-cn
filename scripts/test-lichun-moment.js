/**
 * Тест для определения момента Личунь библиотекой lunisolar
 */

const lunisolar = require('lunisolar');
const moment = require('moment-timezone');

console.log('=== Поиск момента Личунь для 2000 года ===\n');

// Ищем момент перехода от 1999 года к 2000 году
const year1999 = '己卯';
const year2000 = '庚辰';

console.log('Проверяем моменты вокруг 4 февраля 2000...\n');

// Проверяем разные моменты времени
const testTimes = [
  '2000-02-04 20:00:00',
  '2000-02-04 20:20:00',
  '2000-02-04 20:30:00',
  '2000-02-04 20:40:00',
  '2000-02-04 20:41:00',
  '2000-02-04 20:50:00',
  '2000-02-04 21:00:00',
  '2000-02-05 00:00:00',
  '2000-02-05 12:00:00'
];

for (const timeStr of testTimes) {
  const m = moment.tz(timeStr, 'YYYY-MM-DD HH:mm:ss', 'Asia/Shanghai');
  const lsr = lunisolar(m.toDate());
  const year = lsr.char8.year.name;
  const isCorrect = year === year2000;
  console.log(`${timeStr} (${m.toDate().toISOString()}) => Год: ${year} ${isCorrect ? '✓' : '✗'}`);
}
