const fs = require('fs');
const content = fs.readFileSync('content-generator.js', 'utf8');

// Словари антонимов для проверки противоречий
const antonyms = {
  'быстро': ['медленно', 'постепенно', 'неспешно'],
  'медленно': ['быстро', 'стремительно', 'сразу'],
  'много': ['мало', 'немного', 'немножко'],
  'мало': ['много', 'множество', 'большое количество'],
  'активно': ['пассивно', 'спокойно', 'тихо'],
  'пассивно': ['активно', 'энергично'],
  'сразу': ['постепенно', 'медленно', 'поэтапно'],
  'постепенно': ['сразу', 'мгновенно', 'быстро'],
  'все': ['одно', 'некоторые', 'часть'],
  'одно': ['все', 'много', 'несколько'],
  'открыто': ['закрыто', 'скрыто', 'тайно'],
  'закрыто': ['открыто', 'публично'],
  'гибко': ['жестко', 'твердо', 'непоколебимо'],
  'жестко': ['гибко', 'мягко', 'податливо'],
  'экономно': ['расточительно', 'щедро', 'много'],
  'расточительно': ['экономно', 'бережно'],
  'концентрироваться': ['распыляться', 'разбрасываться'],
  'распыляться': ['концентрироваться', 'фокусироваться'],
  'отказываться': ['соглашаться', 'принимать'],
  'соглашаться': ['отказываться', 'отвергать'],
  'ускорять': ['замедлять', 'тормозить'],
  'замедлять': ['ускорять', 'торопиться'],
  'увеличивать': ['уменьшать', 'сокращать'],
  'уменьшать': ['увеличивать', 'расширять'],
  'расширять': ['сужать', 'ограничивать'],
  'сужать': ['расширять', 'увеличивать'],
  'давать': ['брать', 'забирать'],
  'брать': ['давать', 'отдавать'],
  'контролировать': ['отпускать', 'освобождать'],
  'отпускать': ['контролировать', 'держать'],
  'напрягаться': ['расслабляться', 'отдыхать'],
  'расслабляться': ['напрягаться', 'активизироваться'],
  'торопиться': ['не спешить', 'медлить'],
  'не спешить': ['торопиться', 'спешить']
};

// Функция для извлечения всех текстов из одной категории
function extractTexts(element, strength, style, type) {
  const pattern = new RegExp(
    `'${element}':\\s*\\{[\\s\\S]*?${strength}:\\s*\\{[\\s\\S]*?${style}:\\s*\\{[\\s\\S]*?${type}:\\s*\\[([\\s\\S]*?)\\]`,
    'm'
  );
  
  const match = content.match(pattern);
  if (!match) return [];
  
  const arrayContent = match[1];
  const texts = arrayContent.match(/"[^"]+"/g) || [];
  return texts.map(t => t.replace(/"/g, '').toLowerCase());
}

// Функция для поиска слов в тексте
function findWords(text, wordList) {
  const found = [];
  for (const word of wordList) {
    if (text.includes(word)) {
      found.push(word);
    }
  }
  return found;
}

// Функция для проверки противоречий между двумя текстами
function checkContradiction(text1, text2) {
  const contradictions = [];
  
  for (const [word, antonymsList] of Object.entries(antonyms)) {
    const hasWord1 = text1.includes(word);
    const hasAntonym2 = antonymsList.some(ant => text2.includes(ant));
    
    if (hasWord1 && hasAntonym2) {
      const foundAntonym = antonymsList.find(ant => text2.includes(ant));
      contradictions.push({
        word1: word,
        word2: foundAntonym,
        text1: text1.substring(0, 100) + '...',
        text2: text2.substring(0, 100) + '...'
      });
    }
    
    const hasWord2 = text2.includes(word);
    const hasAntonym1 = antonymsList.some(ant => text1.includes(ant));
    
    if (hasWord2 && hasAntonym1) {
      const foundAntonym = antonymsList.find(ant => text1.includes(ant));
      contradictions.push({
        word1: foundAntonym,
        word2: word,
        text1: text1.substring(0, 100) + '...',
        text2: text2.substring(0, 100) + '...'
      });
    }
  }
  
  return contradictions;
}

// Основная функция проверки
function checkAllContradictions() {
  const elements = ['Металл', 'Дерево', 'Огонь', 'Земля', 'Вода'];
  const strengths = ['weak', 'medium', 'strong'];
  const styles = ['poetic', 'practical'];
  const types = ['energy', 'advice', 'ritual', 'transformation'];
  
  const allContradictions = [];
  
  console.log('=== ПРОВЕРКА НА ПРОТИВОРЕЧИЯ ===\n');
  
  elements.forEach(element => {
    strengths.forEach(strength => {
      styles.forEach(style => {
        types.forEach(type => {
          const texts = extractTexts(element, strength, style, type);
          
          if (texts.length < 2) return;
          
          // Проверяем каждую пару текстов
          for (let i = 0; i < texts.length; i++) {
            for (let j = i + 1; j < texts.length; j++) {
              const contradictions = checkContradiction(texts[i], texts[j]);
              
              if (contradictions.length > 0) {
                allContradictions.push({
                  element,
                  strength,
                  style,
                  type,
                  textIndex1: i + 1,
                  textIndex2: j + 1,
                  contradictions
                });
              }
            }
          }
        });
      });
    });
  });
  
  if (allContradictions.length === 0) {
    console.log('✅ ПРОТИВОРЕЧИЙ НЕ НАЙДЕНО!\n');
    console.log('Все тексты в рамках одной категории согласованы между собой.');
  } else {
    console.log(`⚠️  НАЙДЕНО ПРОТИВОРЕЧИЙ: ${allContradictions.length}\n`);
    
    allContradictions.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.element} → ${item.strength} → ${item.style} → ${item.type}`);
      console.log(`   Текст ${item.textIndex1} vs Текст ${item.textIndex2}:`);
      
      item.contradictions.forEach(cont => {
        console.log(`   ⚠️  Противоречие: "${cont.word1}" vs "${cont.word2}"`);
        console.log(`      Текст 1: ${cont.text1}`);
        console.log(`      Текст 2: ${cont.text2}`);
      });
    });
  }
  
  console.log(`\n=== ИТОГО ===`);
  console.log(`Проверено комбинаций: ${elements.length * strengths.length * styles.length * types.length}`);
  console.log(`Найдено потенциальных противоречий: ${allContradictions.length}`);
  
  return allContradictions;
}

// Запуск проверки
checkAllContradictions();

