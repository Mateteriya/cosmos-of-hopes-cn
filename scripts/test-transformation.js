// scripts/test-transformation.js
// Тест преобразования конкретных слов

const { applyTransformationRules } = require('./rules-based-female-generator');

console.log('\n' + '='.repeat(80));
console.log('ТЕСТ ПРЕОБРАЗОВАНИЯ ЯН-СЛОВ');
console.log('='.repeat(80));

const testCases = [
  'Ваша сила может проявиться через щедрость',
  'Контролируйте свою энергию',
  'Расширяйте горизонты',
  'Действуйте обдуманно',
  'Ваша сила может проявиться через щедрость — способность давать «тень» и «плоды»'
];

testCases.forEach((test, i) => {
  console.log(`\n${i + 1}. ИСХОДНЫЙ: "${test}"`);
  const result = applyTransformationRules(test, 'forecast', 'Дерево', 'weak', 'poetic');
  console.log(`   РЕЗУЛЬТАТ: "${result}"`);
  console.log(`   ИЗМЕНИЛОСЬ: ${test !== result ? '✅ ДА' : '❌ НЕТ'}`);
});

