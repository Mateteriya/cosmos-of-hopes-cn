/**
 * Тест для проверки определения года библиотекой lunisolar
 */

const lunisolar = require('lunisolar');
const moment = require('moment-timezone');

console.log('=== Тест определения года библиотекой lunisolar ===\n');

// Тест 1: 4 февраля 2000, 20:30 Пекин (до Личунь, ожидается 1999 год)
console.log('Тест 1: 4 февраля 2000, 20:30 Пекин (до Личунь)');
const m1 = moment.tz('2000-02-04 20:30:00', 'YYYY-MM-DD HH:mm:ss', 'Asia/Shanghai');
console.log('  UTC:', m1.toDate().toISOString());
console.log('  Local (system):', m1.toDate().toString());
const lsr1 = lunisolar(m1.toDate());
console.log('  Год:', lsr1.char8.year.name, '| Ожидается: 己卯 (1999)');
console.log('  Месяц:', lsr1.char8.month.name);
console.log('');

// Тест 2: 4 февраля 2000, 20:41 Пекин (момент Личунь, ожидается 2000 год)
console.log('Тест 2: 4 февраля 2000, 20:41 Пекин (момент Личунь)');
const m2 = moment.tz('2000-02-04 20:41:00', 'YYYY-MM-DD HH:mm:ss', 'Asia/Shanghai');
console.log('  UTC:', m2.toDate().toISOString());
const lsr2 = lunisolar(m2.toDate());
console.log('  Год:', lsr2.char8.year.name, '| Ожидается: 庚辰 (2000)');
console.log('  Месяц:', lsr2.char8.month.name);
console.log('');

// Тест 3: 4 февраля 2000, 20:29 Пекин (до Личунь, ожидается 1999 год)
console.log('Тест 3: 4 февраля 2000, 20:29 Пекин (до Личунь)');
const m3 = moment.tz('2000-02-04 20:29:00', 'YYYY-MM-DD HH:mm:ss', 'Asia/Shanghai');
console.log('  UTC:', m3.toDate().toISOString());
const lsr3 = lunisolar(m3.toDate());
console.log('  Год:', lsr3.char8.year.name, '| Ожидается: 己卯 (1999)');
console.log('  Месяц:', lsr3.char8.month.name);
console.log('');

// Проверка: может ли библиотека lunisolar работать с временем напрямую?
console.log('=== Проверка работы с UTC временем ===');
const utcDate = new Date('2000-02-04T12:30:00.000Z'); // UTC время, соответствующее 20:30 Пекин
console.log('UTC Date:', utcDate.toISOString());
const lsr4 = lunisolar(utcDate);
console.log('Год:', lsr4.char8.year.name);
console.log('Месяц:', lsr4.char8.month.name);
