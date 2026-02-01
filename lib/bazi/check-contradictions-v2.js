const fs = require('fs');
const content = fs.readFileSync('content-generator.js', 'utf8');

// Более точные паттерны для проверки реальных противоречий
const contradictionPatterns = [
  {
    name: 'Скорость действий',
    patterns: [
      { positive: /\b(быстро|сразу|мгновенно|немедленно|срочно)\b/i, negative: /\b(медленно|постепенно|неспешно|поэтапно|медленный)\b/i },
      { positive: /\b(торопиться|спешить|ускорять)\b/i, negative: /\b(не спешить|медлить|замедлять)\b/i }
    ]
  },
  {
    name: 'Количество задач',
    patterns: [
      { positive: /\b(много|несколько|множество|все|всех)\s+(задач|дел|проектов|направлений)\b/i, negative: /\b(одно|один|одна)\s+(задача|дело|проект|направление)\b/i },
      { positive: /\b(распыляться|разбрасываться|много)\b/i, negative: /\b(концентрироваться|фокусироваться|одно)\b/i }
    ]
  },
  {
    name: 'Активность vs Пассивность',
    patterns: [
      { positive: /\b(активно|энергично|динамично|действовать)\b/i, negative: /\b(пассивно|спокойно|тихо|ждать|отдыхать)\b/i },
      { positive: /\b(напрягаться|активизироваться)\b/i, negative: /\b(расслабляться|отдыхать|восстанавливаться)\b/i }
    ]
  },
  {
    name: 'Контроль vs Отпускание',
    patterns: [
      { positive: /\b(контролировать|держать|управлять|планировать)\b/i, negative: /\b(отпускать|освобождать|доверять|плыть по течению)\b/i }
    ]
  },
  {
    name: 'Гибкость vs Жесткость',
    patterns: [
      { positive: /\b(гибко|мягко|адаптироваться|уступать)\b/i, negative: /\b(жестко|твердо|непоколебимо|стоять на своем)\b/i }
    ]
  },
  {
    name: 'Расширение vs Сужение',
    patterns: [
      { positive: /\b(расширять|увеличивать|больше|много)\b/i, negative: /\b(сужать|уменьшать|меньше|мало|ограничивать)\b/i }
    ]
  }
];

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
  return texts.map(t => t.replace(/"/g, ''));
}

// Функция для проверки реальных противоречий
function checkRealContradiction(text1, text2) {
  const contradictions = [];
  
  for (const category of contradictionPatterns) {
    for (const pattern of category.patterns) {
      const hasPositive1 = pattern.positive.test(text1);
      const hasNegative2 = pattern.negative.test(text2);
      
      const hasPositive2 = pattern.positive.test(text2);
      const hasNegative1 = pattern.negative.test(text1);
      
      if ((hasPositive1 && hasNegative2) || (hasPositive2 && hasNegative1)) {
        const match1 = text1.match(pattern.positive) || text1.match(pattern.negative);
        const match2 = text2.match(pattern.positive) || text2.match(pattern.negative);
        
        contradictions.push({
          category: category.name,
          text1Match: match1 ? match1[0] : '',
          text2Match: match2 ? match2[0] : '',
          text1: text1.length > 120 ? text1.substring(0, 120) + '...' : text1,
          text2: text2.length > 120 ? text2.substring(0, 120) + '...' : text2
        });
      }
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
  
  console.log('=== ПРОВЕРКА НА РЕАЛЬНЫЕ ПРОТИВОРЕЧИЯ ===\n');
  console.log('Проверяются следующие типы противоречий:');
  contradictionPatterns.forEach(cat => console.log(`  - ${cat.name}`));
  console.log('');
  
  elements.forEach(element => {
    strengths.forEach(strength => {
      styles.forEach(style => {
        types.forEach(type => {
          const texts = extractTexts(element, strength, style, type);
          
          if (texts.length < 2) return;
          
          // Проверяем каждую пару текстов
          for (let i = 0; i < texts.length; i++) {
            for (let j = i + 1; j < texts.length; j++) {
              const contradictions = checkRealContradiction(texts[i], texts[j]);
              
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
    console.log('✅ РЕАЛЬНЫХ ПРОТИВОРЕЧИЙ НЕ НАЙДЕНО!\n');
    console.log('Все тексты в рамках одной категории согласованы между собой.');
    console.log('Разные варианты дают разные подходы, но не противоречат друг другу.');
  } else {
    console.log(`⚠️  НАЙДЕНО РЕАЛЬНЫХ ПРОТИВОРЕЧИЙ: ${allContradictions.length}\n`);
    
    allContradictions.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.element} → ${item.strength} → ${item.style} → ${item.type}`);
      console.log(`   Текст ${item.textIndex1} vs Текст ${item.textIndex2}:`);
      
      item.contradictions.forEach(cont => {
        console.log(`   ⚠️  [${cont.category}]`);
        console.log(`      Найдено: "${cont.text1Match}" vs "${cont.text2Match}"`);
        console.log(`      Текст 1: ${cont.text1}`);
        console.log(`      Текст 2: ${cont.text2}`);
      });
    });
  }
  
  console.log(`\n=== ИТОГО ===`);
  console.log(`Проверено комбинаций: ${elements.length * strengths.length * styles.length * types.length}`);
  console.log(`Найдено реальных противоречий: ${allContradictions.length}`);
  
  if (allContradictions.length === 0) {
    console.log('\n✅ ВСЕ ТЕКСТЫ СОГЛАСОВАНЫ!');
  }
  
  return allContradictions;
}

// Запуск проверки
checkAllContradictions();

