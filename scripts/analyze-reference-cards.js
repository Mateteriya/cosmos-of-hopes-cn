// analyze-reference-cards.js
// Скрипт для анализа эталонных карт и сравнения результатов разных калькуляторов

/**
 * ИНСТРУКЦИЯ ПО ИСПОЛЬЗОВАНИЮ:
 * 
 * 1. Создайте файл reference-cards-data.json с данными по шаблону ниже
 * 2. Запустите: node scripts/analyze-reference-cards.js
 * 3. Скрипт выведет:
 *    - Список карт с полным согласием
 *    - Список карт с расхождениями
 *    - Предложения по улучшению алгоритма
 */

// ШАБЛОН ДАННЫХ (reference-cards-data.json):
/*
{
  "referenceCards": [
    {
      "name": "Дональд Трамп",
      "birthDate": "1946-06-14",
      "birthTime": "10:54",
      "birthPlace": "America/New_York",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "gender": "male",
      "sources": [
        {
          "name": "Mingli.ru",
          "pillars": ["丙戌", "甲午", "己巳", "己巳"],
          "structure": {
            "type": "Follow Structure",
            "subtype": "从杀格",
            "subtypeRu": "Следование за Властью",
            "usefulElements": ["Металл", "Земля"]
          },
          "notes": "Экстремально слабый Господин Дня, доминирует элемент Власти"
        },
        {
          "name": "Наш калькулятор",
          "pillars": ["丙戌", "甲午", "己巳", "己巳"],
          "structure": {
            "type": "Normal Structure",
            "strength": "weak",
            "usefulElements": ["Огонь", "Дерево"]
          },
          "notes": "Не определил специальную структуру"
        }
      ]
    }
  ]
}
*/

const fs = require('fs');
const path = require('path');

// Путь к файлу с данными
const DATA_FILE = path.join(__dirname, '../reference-cards-data.json');

function analyzeReferenceCards() {
  // Проверяем, существует ли файл с данными
  if (!fs.existsSync(DATA_FILE)) {
    console.log('❌ Файл reference-cards-data.json не найден!');
    console.log('\n📝 Создайте файл reference-cards-data.json в корне проекта.');
    console.log('   Используйте шаблон из комментариев в начале этого файла.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const cards = data.referenceCards || [];

  console.log('🔍 АНАЛИЗ ЭТАЛОННЫХ КАРТ БАЦЗЫ\n');
  console.log(`Всего карт: ${cards.length}\n`);

  // Группируем карты
  const fullyAgreed = [];
  const disagreed = [];
  const structurePatterns = {};

  for (const card of cards) {
    const sources = card.sources || [];
    
    if (sources.length < 2) {
      console.log(`⚠️  Карта "${card.name}": недостаточно источников для сравнения`);
      continue;
    }

    // Извлекаем типы структур из всех источников
    const structures = sources.map(s => ({
      source: s.name,
      type: s.structure?.type || 'Unknown',
      subtype: s.structure?.subtypeRu || s.structure?.subtype || '',
      usefulElements: s.structure?.usefulElements || []
    }));

    // Проверяем согласие
    const uniqueTypes = new Set(structures.map(s => s.type));
    const allAgree = uniqueTypes.size === 1 && !uniqueTypes.has('Unknown') && !uniqueTypes.has('Normal Structure');

    if (allAgree) {
      fullyAgreed.push({
        name: card.name,
        agreedStructure: structures[0].type,
        subtype: structures[0].subtype,
        sources: structures,
        card: card
      });

      // Собираем паттерны
      if (!structurePatterns[structures[0].type]) {
        structurePatterns[structures[0].type] = [];
      }
      structurePatterns[structures[0].type].push({
        name: card.name,
        pillars: sources[0].pillars,
        details: structures[0]
      });
    } else {
      disagreed.push({
        name: card.name,
        structures: structures,
        card: card
      });
    }
  }

  // Выводим результаты
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ КАРТЫ С ПОЛНЫМ СОГЛАСИЕМ');
  console.log('═══════════════════════════════════════════════════════\n');

  if (fullyAgreed.length === 0) {
    console.log('❌ Не найдено карт с полным согласием.');
    console.log('   Это может означать, что:');
    console.log('   1. Нужно больше данных');
    console.log('   2. Калькуляторы используют разные алгоритмы');
    console.log('   3. Нужно проверить корректность данных\n');
  } else {
    for (const card of fullyAgreed) {
      console.log(`📌 ${card.name}`);
      console.log(`   Структура: ${card.agreedStructure}${card.subtype ? ` (${card.subtype})` : ''}`);
      console.log(`   Полезные элементы: ${card.sources[0].usefulElements.join(', ')}`);
      console.log(`   Столпы: ${card.card.sources[0].pillars.join(' ')}`);
      console.log('');
    }

    // Анализируем паттерны
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔬 ПАТТЕРНЫ ДЛЯ КАЖДОЙ СТРУКТУРЫ');
    console.log('═══════════════════════════════════════════════════════\n');

    for (const [structureType, examples] of Object.entries(structurePatterns)) {
      console.log(`\n📊 ${structureType} (${examples.length} примеров):`);
      
      // Анализируем общие признаки
      const allPillars = examples.map(e => e.pillars).flat();
      const dayMasterElements = new Set();
      const usefulElements = new Set();
      
      // Здесь можно добавить более детальный анализ
      for (const example of examples) {
        console.log(`   - ${example.name}: ${example.pillars.join(' ')}`);
        if (example.details.usefulElements) {
          example.details.usefulElements.forEach(el => usefulElements.add(el));
        }
      }
      
      if (usefulElements.size > 0) {
        console.log(`   🎯 Общие полезные элементы: ${Array.from(usefulElements).join(', ')}`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('⚠️  КАРТЫ С РАСХОЖДЕНИЯМИ');
  console.log('═══════════════════════════════════════════════════════\n');

  if (disagreed.length === 0) {
    console.log('✅ Нет карт с расхождениями! Все калькуляторы согласны.\n');
  } else {
    for (const card of disagreed) {
      console.log(`📌 ${card.name}`);
      console.log(`   Дата: ${card.card.birthDate} ${card.card.birthTime || ''}`);
      console.log(`   Расхождение:`);
      for (const struct of card.structures) {
        console.log(`     - ${struct.source}: ${struct.type}${struct.subtype ? ` (${struct.subtype})` : ''}`);
        if (struct.usefulElements.length > 0) {
          console.log(`       Полезные: ${struct.usefulElements.join(', ')}`);
        }
      }
      console.log('');
    }
  }

  // Генерируем рекомендации
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('💡 РЕКОМЕНДАЦИИ ПО УЛУЧШЕНИЮ');
  console.log('═══════════════════════════════════════════════════════\n');

  if (fullyAgreed.length > 0) {
    console.log('✅ Для карт с согласием:');
    console.log('   1. Изучите формальные признаки этих карт');
    console.log('   2. Убедитесь, что наш алгоритм их распознает');
    console.log('   3. Если нет — доработайте условия определения\n');
  }

  if (disagreed.length > 0) {
    console.log('⚠️  Для карт с расхождениями:');
    console.log('   1. Проанализируйте, почему калькуляторы расходятся');
    console.log('   2. Проверьте скрытые стволы, взаимодействия');
    console.log('   3. Уточните пороговые значения (сила, количество элементов)');
    console.log('   4. Добавьте эти случаи как тестовые\n');
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log(`📊 СТАТИСТИКА:`);
  console.log(`   Всего карт: ${cards.length}`);
  console.log(`   С согласием: ${fullyAgreed.length} (${Math.round(fullyAgreed.length / cards.length * 100)}%)`);
  console.log(`   С расхождениями: ${disagreed.length} (${Math.round(disagreed.length / cards.length * 100)}%)`);
  console.log('═══════════════════════════════════════════════════════\n');

  // Сохраняем отчет
  const report = {
    timestamp: new Date().toISOString(),
    totalCards: cards.length,
    fullyAgreed: fullyAgreed.length,
    disagreed: disagreed.length,
    structurePatterns,
    fullyAgreedCards: fullyAgreed,
    disagreedCards: disagreed
  };

  const reportFile = path.join(__dirname, '../reference-cards-analysis-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`📄 Детальный отчет сохранен: ${reportFile}\n`);
}

// Запускаем анализ
if (require.main === module) {
  analyzeReferenceCards();
}

module.exports = { analyzeReferenceCards };
