// Скрипт для подсчета архетипов в прогнозах Бацзы

const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'content-generator.js'), 'utf8');

// Элементы
const elements = ['Дерево', 'Огонь', 'Земля', 'Металл', 'Вода'];

// Уровни силы
const strengths = ['weak', 'medium', 'strong'];

// Типы прогнозов (архетипы контента)
const types = ['forecast', 'energy', 'advice', 'ritual', 'transformation'];

// Стили
const styles = ['poetic', 'practical'];

console.log('=== АРХЕТИПЫ В ПРОГНОЗАХ БАЦЗЫ ===\n');

console.log('1. ЭЛЕМЕНТЫ (архетипы стихий):');
elements.forEach((el, i) => console.log(`   ${i + 1}. ${el}`));
console.log(`   Всего: ${elements.length} элементов\n`);

console.log('2. УРОВНИ СИЛЫ (архетипы силы):');
strengths.forEach((str, i) => {
  const names = { weak: 'Слабый', medium: 'Балансный', strong: 'Сильный' };
  console.log(`   ${i + 1}. ${str} (${names[str]})`);
});
console.log(`   Всего: ${strengths.length} уровней\n`);

console.log('3. ТИПЫ ПРОГНОЗОВ (архетипы контента):');
const typeNames = {
  forecast: 'Прогноз года',
  energy: 'Энергия года',
  advice: 'Совет',
  ritual: 'Ритуал',
  transformation: 'Превращение'
};
types.forEach((type, i) => console.log(`   ${i + 1}. ${type} (${typeNames[type]})`));
console.log(`   Всего: ${types.length} типов\n`);

console.log('4. СТИЛИ ПОДАЧИ:');
styles.forEach((style, i) => {
  const names = { poetic: 'Поэтический (метафорический)', practical: 'Разговорный (практический)' };
  console.log(`   ${i + 1}. ${style} (${names[style]})`);
});
console.log(`   Всего: ${styles.length} стилей\n`);

// Подсчет комбинаций
const totalCombinations = elements.length * strengths.length * types.length * styles.length;
const combinationsPerStyle = elements.length * strengths.length * types.length;

console.log('=== ИТОГО ===');
console.log(`Комбинаций на стиль: ${combinationsPerStyle}`);
console.log(`   (${elements.length} элементов × ${strengths.length} силы × ${types.length} типов)`);
console.log(`\nОБЩЕЕ КОЛИЧЕСТВО АРХЕТИПОВ: ${totalCombinations}`);
console.log(`   (${elements.length} × ${strengths.length} × ${types.length} × ${styles.length})`);

// Проверка наличия контента
console.log('\n=== ПРОВЕРКА ЗАПОЛНЕННОСТИ ===');
let foundCount = 0;
let totalExpected = totalCombinations;

elements.forEach(element => {
  strengths.forEach(strength => {
    types.forEach(type => {
      styles.forEach(style => {
        const matrixName = style === 'poetic' ? 'poeticContentMatrix' : 'practicalContentMatrix';
        const pattern = new RegExp(`${element}.*${strength}.*${type}`, 's');
        if (content.includes(matrixName) && pattern.test(content)) {
          foundCount++;
        }
      });
    });
  });
});

console.log(`Найдено комбинаций: ${foundCount} из ${totalExpected}`);
console.log(`Заполнено: ${Math.round((foundCount / totalExpected) * 100)}%`);

