// scripts/check-yang-examples.js
// Проверка конкретных примеров Ян-слов

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/female-archetypes-generated.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('\n' + '='.repeat(80));
console.log('ПРИМЕРЫ ЯН-СЛОВ В НОВОМ ФАЙЛЕ');
console.log('='.repeat(80));

// Ищем пример с "проявиться"
const ex1 = data.find(d => d.element === 'Дерево' && d.strength === 'weak' && d.contentType === 'forecast');

if (ex1) {
  console.log('\n\nПРИМЕР: Дерево - weak - forecast');
  console.log('-'.repeat(80));
  
  const maleText = ex1.male.poetic;
  const femaleText = ex1.female.poetic;
  
  // Ищем "проявиться" в женском тексте
  const index = femaleText.toLowerCase().indexOf('проявиться');
  if (index !== -1) {
    console.log('\n❌ НАЙДЕНО "проявиться" в женском тексте:');
    console.log('Контекст:', femaleText.substring(Math.max(0, index - 50), Math.min(femaleText.length, index + 100)));
    console.log('\nМУЖСКОЙ оригинал:');
    const maleIndex = maleText.toLowerCase().indexOf('проявиться');
    if (maleIndex !== -1) {
      console.log('Контекст:', maleText.substring(Math.max(0, maleIndex - 50), Math.min(maleText.length, maleIndex + 100)));
    }
  }
  
  // Ищем "контролируйте"
  const index2 = femaleText.toLowerCase().indexOf('контролируйте');
  if (index2 !== -1) {
    console.log('\n❌ НАЙДЕНО "контролируйте" в женском тексте:');
    console.log('Контекст:', femaleText.substring(Math.max(0, index2 - 50), Math.min(femaleText.length, index2 + 100)));
  }
  
  // Ищем "расширяйте"
  const index3 = femaleText.toLowerCase().indexOf('расширяйте');
  if (index3 !== -1) {
    console.log('\n❌ НАЙДЕНО "расширяйте" в женском тексте:');
    console.log('Контекст:', femaleText.substring(Math.max(0, index3 - 50), Math.min(femaleText.length, index3 + 100)));
  }
  
  // Ищем "действуйте"
  const index4 = femaleText.toLowerCase().indexOf('действуйте');
  if (index4 !== -1) {
    console.log('\n❌ НАЙДЕНО "действуйте" в женском тексте:');
    console.log('Контекст:', femaleText.substring(Math.max(0, index4 - 50), Math.min(femaleText.length, index4 + 100)));
  }
}

