// Скрипт для проверки использования пола в расчетах Бацзы

const fs = require('fs');
const path = require('path');

console.log('=== ПРОВЕРКА УЧЕТА ПОЛА В СИСТЕМЕ БАЦЗЫ ===\n');

// Читаем файлы
const calculatorPath = path.join(__dirname, 'bazi-calculator-expert.js');
const contentPath = path.join(__dirname, 'content-generator.js');
const apiPath = path.join(__dirname, '../../app/api/bazi/route.ts');

const calculator = fs.readFileSync(calculatorPath, 'utf8');
const content = fs.readFileSync(contentPath, 'utf8');
const api = fs.readFileSync(apiPath, 'utf8');

console.log('1. ГДЕ ПОЛ СОБИРАЕТСЯ:');
if (calculator.includes('gender') || calculator.includes('пол')) {
  console.log('   ✓ В калькуляторе упоминается пол');
} else {
  console.log('   ✗ В калькуляторе НЕТ упоминания пола');
}

console.log('\n2. ГДЕ ПОЛ ИСПОЛЬЗУЕТСЯ В РАСЧЕТАХ:');

// Проверяем использование gender в калькуляторе
const genderUsage = {
  luckDirection: calculator.includes('gender === \'male\'') || calculator.includes('gender === \'female\''),
  strengthCalculation: calculator.includes('calculateElementStrength') && calculator.includes('gender'),
  dayMaster: calculator.includes('dayMaster') && calculator.includes('gender')
};

console.log('   - Направление удачи (luck direction):', genderUsage.luckDirection ? '✓ УЧИТЫВАЕТСЯ' : '✗ НЕ УЧИТЫВАЕТСЯ');
console.log('   - Расчет силы элемента (strength):', genderUsage.strengthCalculation ? '✓ УЧИТЫВАЕТСЯ' : '✗ НЕ УЧИТЫВАЕТСЯ');
console.log('   - Хозяин дня (dayMaster):', genderUsage.dayMaster ? '✓ УЧИТЫВАЕТСЯ' : '✗ НЕ УЧИТЫВАЕТСЯ');

console.log('\n3. ГДЕ ПОЛ ИСПОЛЬЗУЕТСЯ В ГЕНЕРАЦИИ КОНТЕНТА:');

const contentUsage = {
  generateContent: content.includes('generateContent') && (content.includes('gender') || content.includes('пол')),
  selectContent: content.includes('gender') || content.includes('пол')
};

console.log('   - Функция generateContent:', contentUsage.generateContent ? '✓ УЧИТЫВАЕТСЯ' : '✗ НЕ УЧИТЫВАЕТСЯ');
console.log('   - Выбор контента:', contentUsage.selectContent ? '✓ УЧИТЫВАЕТСЯ' : '✗ НЕ УЧИТЫВАЕТСЯ');

console.log('\n4. ПЕРЕДАЧА ПОЛА В API:');
const apiUsage = {
  receives: api.includes('gender'),
  passes: api.includes('gender') && (api.includes('getFullBaziAnalysis') || api.includes('generateContent'))
};

console.log('   - API получает пол:', apiUsage.receives ? '✓ ДА' : '✗ НЕТ');
console.log('   - API передает пол дальше:', apiUsage.passes ? '✓ ДА' : '✗ НЕТ');

console.log('\n=== ВЫВОДЫ ===');
console.log('\nПРОБЛЕМЫ:');
if (!genderUsage.strengthCalculation) {
  console.log('   ⚠ ПОЛ НЕ УЧИТЫВАЕТСЯ при расчете силы элемента дня!');
  console.log('      Это критично - для мужчин и женщин могут быть разные правила.');
}
if (!contentUsage.generateContent) {
  console.log('   ⚠ ПОЛ НЕ УЧИТЫВАЕТСЯ при генерации контента!');
  console.log('      Прогнозы одинаковы для мужчин и женщин.');
}
if (!genderUsage.dayMaster) {
  console.log('   ⚠ ПОЛ НЕ УЧИТЫВАЕТСЯ при определении хозяина дня!');
}

console.log('\nЧТО РАБОТАЕТ:');
if (genderUsage.luckDirection) {
  console.log('   ✓ Пол учитывается для направления удачи (forward/backward)');
}

console.log('\n=== РЕКОМЕНДАЦИИ ===');
console.log('1. Проверить, влияет ли пол на расчет силы элемента в традиционной Бацзы');
console.log('2. Если да - добавить учет пола в calculateElementStrength()');
console.log('3. Если пол влияет на интерпретацию - добавить разные архетипы для мужчин/женщин');
console.log('4. Передать пол в generateContent() для персонализации контента');

