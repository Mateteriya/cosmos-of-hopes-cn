// scripts/export-male-archetypes.js
// Экспорт текущих мужских архетипов для генерации женских версий

const fs = require('fs');
const path = require('path');

// Импортируем текущую матрицу контента
// ВНИМАНИЕ: Нужно будет адаптировать под реальную структуру файла
const contentGeneratorPath = path.join(__dirname, '../lib/bazi/content-generator.js');

// Читаем файл и извлекаем матрицы
const contentGeneratorCode = fs.readFileSync(contentGeneratorPath, 'utf8');

// Парсим матрицы (упрощенный подход - можно улучшить)
function extractContentMatrix(code) {
  // Ищем определение poeticContentMatrix
  const poeticMatch = code.match(/const poeticContentMatrix = \{([\s\S]*?)\};/);
  const practicalMatch = code.match(/const practicalContentMatrix = \{([\s\S]*?)\};/);
  
  if (!poeticMatch || !practicalMatch) {
    throw new Error('Не удалось найти матрицы контента в файле');
  }
  
  // Парсим структуру (упрощенный парсинг)
  // В реальности нужно более сложный парсер или использовать eval в безопасном контексте
  try {
    // Создаем временный модуль для выполнения
    const tempModule = { exports: {} };
    const func = new Function('module', 'exports', `
      ${code}
      module.exports = { poeticContentMatrix, practicalContentMatrix };
    `);
    func(tempModule, tempModule.exports);
    
    return {
      poetic: tempModule.exports.poeticContentMatrix,
      practical: tempModule.exports.practicalContentMatrix
    };
  } catch (error) {
    console.error('Ошибка парсинга матриц:', error);
    // Альтернативный подход - ручной парсинг
    return parseMatricesManually(code);
  }
}

// Ручной парсинг матриц (fallback)
function parseMatricesManually(code) {
  console.log('Используется ручной парсинг матриц...');
  
  const elements = ['Дерево', 'Огонь', 'Земля', 'Металл', 'Вода'];
  const strengths = ['weak', 'medium', 'strong'];
  const contentTypes = ['forecast', 'energy', 'advice', 'ritual', 'transformation'];
  
  const archetypes = [];
  
  // Проходим по всем комбинациям
  elements.forEach(element => {
    strengths.forEach(strength => {
      contentTypes.forEach(contentType => {
        // Ищем текст в коде (упрощенный поиск)
        const pattern = new RegExp(
          `['"]${element}['"]:\\s*{[\\s\\S]*?${strength}:\\s*{[\\s\\S]*?${contentType}:\\s*["']([^"']+)["']`,
          'g'
        );
        
        const match = pattern.exec(code);
        if (match && match[1]) {
          archetypes.push({
            archetypeKey: `${element}_${strength}`,
            element: element,
            strength: strength,
            contentType: contentType,
            male: {
              poetic: match[1],
              practical: match[1] // Временно, нужно найти разговорную версию
            }
          });
        }
      });
    });
  });
  
  return { archetypes };
}

// Основная функция экспорта
function exportMaleArchetypes() {
  console.log('Начинаю экспорт мужских архетипов...');
  
  try {
    const matrices = extractContentMatrix(contentGeneratorCode);
    
    // Преобразуем в структурированный формат
    const archetypesData = [];
    
    if (matrices.archetypes) {
      // Если использовался ручной парсинг
      archetypesData.push(...matrices.archetypes);
    } else {
      // Если получили полные матрицы
      const elements = ['Дерево', 'Огонь', 'Земля', 'Металл', 'Вода'];
      const strengths = { weak: 'weak', medium: 'medium', strong: 'strong' };
      const contentTypes = ['forecast', 'energy', 'advice', 'ritual', 'transformation'];
      
      elements.forEach(element => {
        Object.entries(strengths).forEach(([key, strength]) => {
          const elementData = matrices.poetic[element];
          if (elementData && elementData[strength]) {
            contentTypes.forEach(contentType => {
              const poeticText = elementData[strength][contentType] || '';
              const practicalText = matrices.practical?.[element]?.[strength]?.[contentType] || '';
              
              archetypesData.push({
                archetypeKey: `${element}_${strength}`,
                element: element,
                strength: strength,
                contentType: contentType,
                male: {
                  poetic: poeticText,
                  practical: practicalText
                }
              });
            });
          }
        });
      });
    }
    
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
    
    // Статистика
    const stats = {
      total: archetypesData.length,
      byElement: {},
      byStrength: {},
      byContentType: {}
    };
    
    archetypesData.forEach(item => {
      stats.byElement[item.element] = (stats.byElement[item.element] || 0) + 1;
      stats.byStrength[item.strength] = (stats.byStrength[item.strength] || 0) + 1;
      stats.byContentType[item.contentType] = (stats.byContentType[item.contentType] || 0) + 1;
    });
    
    console.log('\n📊 Статистика экспорта:');
    console.log(JSON.stringify(stats, null, 2));
    
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

