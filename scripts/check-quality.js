// scripts/check-quality.js
// Проверка качества преобразований

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/female-archetypes-generated.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('📊 ПРОВЕРКА КАЧЕСТВА ПРЕОБРАЗОВАНИЙ\n');
console.log(`Всего архетипов: ${data.length}\n`);

// Выбираем несколько примеров для проверки
const samples = [
  data.find(d => d.element === 'Дерево' && d.strength === 'weak' && d.contentType === 'forecast'),
  data.find(d => d.element === 'Огонь' && d.strength === 'medium' && d.contentType === 'advice'),
  data.find(d => d.element === 'Металл' && d.strength === 'strong' && d.contentType === 'ritual')
].filter(Boolean);

samples.forEach((item, i) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`ПРИМЕР ${i + 1}: ${item.element} - ${item.strength} - ${item.contentType}`);
  console.log('='.repeat(80));
  
  console.log('\n📝 МУЖСКОЙ (поэтический):');
  console.log(item.male.poetic);
  
  console.log('\n✨ ЖЕНСКИЙ (поэтический):');
  console.log(item.female.poetic);
  
  console.log('\n📝 МУЖСКОЙ (практический):');
  console.log(item.male.practical);
  
  console.log('\n✨ ЖЕНСКИЙ (практический):');
  console.log(item.female.practical);
  
  // Проверка изменений
  const poeticChanged = item.male.poetic !== item.female.poetic;
  const practicalChanged = item.male.practical !== item.female.practical;
  
  console.log('\n📈 СТАТИСТИКА:');
  console.log(`   Поэтический изменен: ${poeticChanged ? '✅' : '❌'}`);
  console.log(`   Практический изменен: ${practicalChanged ? '✅' : '❌'}`);
  console.log(`   Длина мужского (поэт): ${item.male.poetic.length} символов`);
  console.log(`   Длина женского (поэт): ${item.female.poetic.length} символов`);
  console.log(`   Длина мужского (практ): ${item.male.practical.length} символов`);
  console.log(`   Длина женского (практ): ${item.female.practical.length} символов`);
});

// Общая статистика
console.log('\n\n' + '='.repeat(80));
console.log('ОБЩАЯ СТАТИСТИКА');
console.log('='.repeat(80));

const poeticChanged = data.filter(d => d.male.poetic !== d.female.poetic).length;
const practicalChanged = data.filter(d => d.male.practical !== d.female.practical).length;
const bothChanged = data.filter(d => d.male.poetic !== d.female.poetic && d.male.practical !== d.female.practical).length;

console.log(`\n📊 Изменено текстов:`);
console.log(`   Поэтических: ${poeticChanged}/${data.length} (${Math.round(poeticChanged/data.length*100)}%)`);
console.log(`   Практических: ${practicalChanged}/${data.length} (${Math.round(practicalChanged/data.length*100)}%)`);
console.log(`   Оба стиля: ${bothChanged}/${data.length} (${Math.round(bothChanged/data.length*100)}%)`);

// Проверка на наличие ключевых слов Ян → Инь
const yangWords = ['прояви', 'завоюй', 'победи', 'контролируй', 'атакуй', 'расширяй'];
const yinWords = ['укрепи проявление', 'обрети', 'впусти победу', 'наблюдай', 'найди уязвимые места', 'углубляй'];

let yangFound = 0;
let yinFound = 0;

data.forEach(item => {
  const femalePoetic = item.female.poetic.toLowerCase();
  const femalePractical = item.female.practical.toLowerCase();
  
  yangWords.forEach(word => {
    if (femalePoetic.includes(word) || femalePractical.includes(word)) {
      yangFound++;
    }
  });
  
  yinWords.forEach(phrase => {
    if (femalePoetic.includes(phrase) || femalePractical.includes(phrase)) {
      yinFound++;
    }
  });
});

console.log(`\n🔍 Проверка трансформаций:`);
console.log(`   Найдено Ян-слов: ${yangFound} (меньше = лучше)`);
console.log(`   Найдено Инь-фраз: ${yinFound} (больше = лучше)`);

console.log('\n✅ Проверка завершена!\n');

