// scripts/export-male-archetypes-v2.js
// Улучшенный экспорт мужских архетипов с правильным извлечением обоих стилей

const fs = require('fs');
const path = require('path');

// Импортируем матрицы напрямую из файла
const contentGeneratorPath = path.join(__dirname, '../lib/bazi/content-generator.js');
const contentGeneratorCode = fs.readFileSync(contentGeneratorPath, 'utf8');

// Функция безопасного извлечения матриц
function extractMatrices() {
  try {
    // Создаем изолированный контекст для выполнения
    const vm = require('vm');
    const sandbox = {
      module: { exports: {} },
      exports: {},
      require: require,
      console: console
    };
    
    // Выполняем код в изолированном контексте
    const script = new vm.Script(contentGeneratorCode);
    script.runInNewContext(sandbox);
    
    // Пытаемся получить матрицы из экспорта или глобального контекста
    const poeticContentMatrix = sandbox.poeticContentMatrix || sandbox.module.exports.poeticContentMatrix;
    const practicalContentMatrix = sandbox.practicalContentMatrix || sandbox.module.exports.practicalContentMatrix;
    const contentVariations = sandbox.contentVariations || sandbox.module.exports.contentVariations;
    
    if (poeticContentMatrix && practicalContentMatrix) {
      return { poeticContentMatrix, practicalContentMatrix, contentVariations };
    }
  } catch (error) {
    console.warn('Не удалось извлечь через VM:', error.message);
  }
  
  // Fallback: парсинг через регулярные выражения
  return parseMatricesFromCode(contentGeneratorCode);
}

// Парсинг матриц из кода (более надежный метод)
function parseMatricesFromCode(code) {
  console.log('Используется парсинг через регулярные выражения...');
  
  const elements = ['Дерево', 'Огонь', 'Земля', 'Металл', 'Вода'];
  const strengths = ['weak', 'medium', 'strong'];
  const contentTypes = ['forecast', 'energy', 'advice', 'ritual', 'transformation'];
  
  const poeticMatrix = {};
  const practicalMatrix = {};
  const variations = {};
  
  // Парсим poeticContentMatrix
  elements.forEach(element => {
    poeticMatrix[element] = {};
    practicalMatrix[element] = {};
    
    strengths.forEach(strength => {
      poeticMatrix[element][strength] = {};
      practicalMatrix[element][strength] = {};
      
      contentTypes.forEach(contentType => {
        // Ищем в poeticContentMatrix
        const poeticPattern = new RegExp(
          `poeticContentMatrix\\s*=\\s*{[\\s\\S]*?['"]${element}['"]:\\s*{[\\s\\S]*?${strength}:\\s*{[\\s\\S]*?${contentType}:\\s*["']([^"']+(?:['"][^"']*)*)["']`,
          'g'
        );
        
        const poeticMatch = poeticPattern.exec(code);
        if (poeticMatch && poeticMatch[1]) {
          poeticMatrix[element][strength][contentType] = poeticMatch[1]
            .replace(/\\n/g, '\n')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"');
        }
        
        // Ищем в practicalContentMatrix
        const practicalPattern = new RegExp(
          `practicalContentMatrix\\s*=\\s*{[\\s\\S]*?['"]${element}['"]:\\s*{[\\s\\S]*?${strength}:\\s*{[\\s\\S]*?${contentType}:\\s*["']([^"']+(?:['"][^"']*)*)["']`,
          'g'
        );
        
        const practicalMatch = practicalPattern.exec(code);
        if (practicalMatch && practicalMatch[1]) {
          practicalMatrix[element][strength][contentType] = practicalMatch[1]
            .replace(/\\n/g, '\n')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"');
        }
      });
    });
  });
  
  return { poeticContentMatrix: poeticMatrix, practicalContentMatrix: practicalMatrix, contentVariations: variations };
}

// Основная функция экспорта
function exportMaleArchetypes() {
  console.log('🚀 Начинаю экспорт мужских архетипов (v2)...\n');
  
  try {
    const { poeticContentMatrix, practicalContentMatrix, contentVariations } = extractMatrices();
    
    const elements = ['Дерево', 'Огонь', 'Земля', 'Металл', 'Вода'];
    const strengths = ['weak', 'medium', 'strong'];
    const contentTypes = ['forecast', 'energy', 'advice', 'ritual', 'transformation'];
    
    const archetypesData = [];
    let totalFound = 0;
    let poeticFound = 0;
    let practicalFound = 0;
    
    elements.forEach(element => {
      strengths.forEach(strength => {
        contentTypes.forEach(contentType => {
          // Получаем поэтический текст
          const poeticText = poeticContentMatrix?.[element]?.[strength]?.[contentType] || '';
          
          // Получаем практический текст
          const practicalText = practicalContentMatrix?.[element]?.[strength]?.[contentType] || '';
          
          // Если есть вариации, берем первый вариант
          const variationPoetic = contentVariations?.[element]?.[strength]?.['poetic']?.[contentType];
          const variationPractical = contentVariations?.[element]?.[strength]?.['practical']?.[contentType];
          
          const finalPoetic = variationPoetic && Array.isArray(variationPoetic) && variationPoetic.length > 0
            ? variationPoetic[0]
            : poeticText;
          
          const finalPractical = variationPractical && Array.isArray(variationPractical) && variationPractical.length > 0
            ? variationPractical[0]
            : practicalText;
          
          if (finalPoetic || finalPractical) {
            archetypesData.push({
              archetypeKey: `${element}_${strength}`,
              element: element,
              strength: strength,
              contentType: contentType,
              male: {
                poetic: finalPoetic || finalPractical || '', // Fallback если нет поэтического
                practical: finalPractical || finalPoetic || '' // Fallback если нет практического
              }
            });
            
            totalFound++;
            if (finalPoetic) poeticFound++;
            if (finalPractical) practicalFound++;
          }
        });
      });
    });
    
    // Создаем директорию для данных
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Сохраняем в JSON
    const outputPath = path.join(dataDir, 'male-archetypes-export.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(archetypesData, null, 2),
      'utf8'
    );
    
    console.log(`✅ Экспортировано ${archetypesData.length} текстовых записей`);
    console.log(`📁 Сохранено в: ${outputPath}`);
    console.log(`📊 Найдено:`);
    console.log(`   - Поэтических текстов: ${poeticFound}`);
    console.log(`   - Практических текстов: ${practicalFound}`);
    console.log(`   - Всего: ${totalFound}`);
    
    // Статистика
    const stats = {
      total: archetypesData.length,
      byElement: {},
      byStrength: {},
      byContentType: {},
      styles: {
        poetic: poeticFound,
        practical: practicalFound,
        both: archetypesData.filter(a => a.male.poetic && a.male.practical).length
      }
    };
    
    archetypesData.forEach(item => {
      stats.byElement[item.element] = (stats.byElement[item.element] || 0) + 1;
      stats.byStrength[item.strength] = (stats.byStrength[item.strength] || 0) + 1;
      stats.byContentType[item.contentType] = (stats.byContentType[item.contentType] || 0) + 1;
    });
    
    console.log('\n📊 Статистика экспорта:');
    console.log(JSON.stringify(stats, null, 2));
    
    // Проверка качества
    const emptyPoetic = archetypesData.filter(a => !a.male.poetic || a.male.poetic.trim() === '').length;
    const emptyPractical = archetypesData.filter(a => !a.male.practical || a.male.practical.trim() === '').length;
    const sameTexts = archetypesData.filter(a => a.male.poetic === a.male.practical).length;
    
    console.log('\n⚠️  Проверка качества:');
    console.log(`   - Пустых поэтических: ${emptyPoetic}`);
    console.log(`   - Пустых практических: ${emptyPractical}`);
    console.log(`   - Одинаковых текстов: ${sameTexts} (это нормально, если практический стиль еще не заполнен)`);
    
    return archetypesData;
  } catch (error) {
    console.error('❌ Ошибка экспорта:', error);
    throw error;
  }
}

// Запуск
if (require.main === module) {
  exportMaleArchetypes();
}

module.exports = { exportMaleArchetypes };

