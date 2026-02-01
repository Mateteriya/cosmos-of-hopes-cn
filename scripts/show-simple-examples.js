// scripts/show-simple-examples.js
// Простые примеры преобразований

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/female-archetypes-generated.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('\n' + '='.repeat(80));
console.log('ПРИМЕРЫ ПРЕОБРАЗОВАНИЙ');
console.log('='.repeat(80));

// Пример 1
const ex1 = data.find(d => d.element === 'Дерево' && d.strength === 'weak' && d.contentType === 'forecast');
if (ex1) {
  console.log('\n\nПРИМЕР 1: Дерево - weak - forecast (ПОЭТИЧЕСКИЙ)');
  console.log('-'.repeat(80));
  console.log('\nМУЖСКОЙ:');
  console.log(ex1.male.poetic);
  console.log('\nЖЕНСКИЙ:');
  console.log(ex1.female.poetic);
}

// Пример 2
const ex2 = data.find(d => d.element === 'Огонь' && d.strength === 'medium' && d.contentType === 'advice');
if (ex2) {
  console.log('\n\n' + '='.repeat(80));
  console.log('ПРИМЕР 2: Огонь - medium - advice (ПРАКТИЧЕСКИЙ)');
  console.log('-'.repeat(80));
  console.log('\nМУЖСКОЙ:');
  console.log(ex2.male.practical);
  console.log('\nЖЕНСКИЙ:');
  console.log(ex2.female.practical);
}

// Пример 3
const ex3 = data.find(d => d.element === 'Металл' && d.strength === 'strong' && d.contentType === 'ritual');
if (ex3) {
  console.log('\n\n' + '='.repeat(80));
  console.log('ПРИМЕР 3: Металл - strong - ritual (ПОЭТИЧЕСКИЙ)');
  console.log('-'.repeat(80));
  console.log('\nМУЖСКОЙ:');
  console.log(ex3.male.poetic);
  console.log('\nЖЕНСКИЙ:');
  console.log(ex3.female.poetic);
}

// Анализ Ян-слов
console.log('\n\n' + '='.repeat(80));
console.log('АНАЛИЗ ЯН-СЛОВ');
console.log('='.repeat(80));

const yangWords = ['прояви', 'проявиться', 'контролируй', 'контролируйте', 'расширяй', 'расширяйте', 'действуй', 'действуйте'];
const foundYang = [];

data.forEach(item => {
  const femalePoetic = item.female.poetic.toLowerCase();
  const femalePractical = item.female.practical.toLowerCase();
  
  yangWords.forEach(word => {
    if (femalePoetic.includes(word) || femalePractical.includes(word)) {
      const text = femalePoetic.includes(word) ? item.female.poetic : item.female.practical;
      const index = text.toLowerCase().indexOf(word);
      const context = text.substring(Math.max(0, index - 30), Math.min(text.length, index + word.length + 50));
      
      foundYang.push({
        word: word,
        element: item.element,
        strength: item.strength,
        contentType: item.contentType,
        context: '...' + context + '...'
      });
    }
  });
});

console.log(`\n❌ НАЙДЕНО ЯН-СЛОВ: ${foundYang.length}`);
console.log(`\nПЕРВЫЕ 10 ПРИМЕРОВ:\n`);

foundYang.slice(0, 10).forEach((item, i) => {
  console.log(`${i + 1}. Слово "${item.word}" в ${item.element} - ${item.strength} - ${item.contentType}`);
  console.log(`   Контекст: ${item.context}\n`);
});

console.log('\n' + '='.repeat(80));
console.log('ОБЪЯСНЕНИЕ ПРОБЛЕМЫ');
console.log('='.repeat(80));
console.log(`
❌ ПРОБЛЕМА: В женских версиях остались Ян-слова (мужские паттерны).

📖 ЧТО ТАКОЕ ЯН-СЛОВА?
   Ян (阳) - мужская энергия: внешняя, активная, линейная
   Примеры: "прояви", "контролируй", "расширяй", "действуй"

📖 ЧТО ТАКОЕ ИНЬ-ФРАЗЫ?
   Инь (阴) - женская энергия: внутренняя, восприимчивая, цикличная
   Примеры: "укрепи проявление", "наблюдай", "углубляй", "прочувствуй"

❌ ПОЧЕМУ ЭТО ПРОБЛЕМА?
   1. Для китайской аудитории это фундаментальная ошибка
   2. Женщины получают мужские тексты, а не женские
   3. Теряется философская точность Бацзы
   4. Снижается доверие к приложению

✅ РЕШЕНИЕ:
   Нужно расширить правила преобразования, чтобы ВСЕ Ян-слова
   были заменены на Инь-фразы.
`);

