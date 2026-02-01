// scripts/generate-female-archetypes.js
// Генерация полных женских версий всех архетипов Бацзы
// ПОДДЕРЖИВАЕТ ДВА РЕЖИМА: AI (OpenAI/DeepSeek) и ПРАВИЛА (rules-based)

const fs = require('fs');
const path = require('path');
const { exportMaleArchetypes } = require('./export-male-archetypes');
const { applyTransformationRules } = require('./rules-based-female-generator');

// Определяем режим работы
const USE_AI = process.argv.includes('--ai') && process.env.OPENAI_API_KEY;
const USE_DEEPSEEK = process.argv.includes('--deepseek') && process.env.DEEPSEEK_API_KEY;
const USE_RULES = !USE_AI && !USE_DEEPSEEK; // По умолчанию используем правила

if (USE_RULES) {
  console.log('📋 Режим: Генерация на основе правил (БЕЗ внешних API)');
} else if (USE_AI) {
  console.log('🤖 Режим: OpenAI API');
  const { OpenAI } = require('openai');
  const { OPENAI_CONFIG, getPrompt } = require('./config/openai-config');
  var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else if (USE_DEEPSEEK) {
  console.log('🤖 Режим: DeepSeek API');
  // TODO: Добавить поддержку DeepSeek API при необходимости
  console.warn('⚠️  DeepSeek API пока не реализован, используется режим правил');
}

// Функция генерации женской версии
async function generateFemaleVersion(maleText, contentType, element, strength, style = 'poetic') {
  // Обработка массивов: если текст - массив строк, обрабатываем каждую строку
  if (Array.isArray(maleText)) {
    return maleText.map(item => {
      if (!item || (typeof item === 'string' && !item.trim())) return item;
      return applyTransformationRules(item, contentType, element, strength, style);
    });
  }
  
  if (!maleText || (typeof maleText === 'string' && !maleText.trim())) {
    console.warn(`Пустой текст для ${contentType}, ${element}, ${strength}`);
    return '';
  }
  
  // РЕЖИМ ПРАВИЛ (по умолчанию, БЕЗ API)
  if (USE_RULES || (!openai && !USE_DEEPSEEK)) {
    return applyTransformationRules(maleText, contentType, element, strength, style);
  }
  
  // РЕЖИМ AI (если доступен API)
  if (USE_AI && openai) {
    try {
      const { OPENAI_CONFIG, getPrompt } = require('./config/openai-config');
      const prompt = getPrompt(contentType, maleText, element, strength);
      
      const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: 'Ты - эксперт по китайской астрологии Бацзы, специализирующийся на женской энергетике и китайской культуре. Твои ответы должны быть естественными, культурно уместными и сохранять смысл оригинала.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: OPENAI_CONFIG.temperature,
      max_tokens: OPENAI_CONFIG.maxTokens,
      timeout: OPENAI_CONFIG.timeout
    });

    const generatedText = response.choices[0].message.content.trim();
    
    // Очистка от возможных артефактов промпта
    const cleaned = generatedText
      .replace(/^ЖЕНСКАЯ ВЕРСИЯ[:\s]*/i, '')
      .replace(/^ЖЕНСКОЕ[:\s]*/i, '')
      .replace(/^ЖЕНСКИЙ[:\s]*/i, '')
      .trim();
    
    return cleaned || generatedText;
  } catch (error) {
    console.error(`  ❌ Ошибка генерации для ${contentType}:`, error.message);
    
    // Retry логика
    if (error.status === 429 || error.status >= 500) {
      console.log(`  → Повторная попытка через ${OPENAI_CONFIG.retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, OPENAI_CONFIG.retryDelay));
      
      try {
        const response = await openai.chat.completions.create({
          model: OPENAI_CONFIG.model,
          messages: [{ role: 'user', content: getPrompt(contentType, maleText, element, strength) }],
          temperature: OPENAI_CONFIG.temperature,
          max_tokens: OPENAI_CONFIG.maxTokens
        });
        return response.choices[0].message.content.trim();
      } catch (retryError) {
        console.error(`  ❌ Ошибка при повторной попытке:`, retryError.message);
      }
    }
    
    // Fallback на правила
    console.log(`  → Используется режим правил для ${contentType}`);
    return applyTransformationRules(maleText, contentType, element, strength, style);
    }
  }
  
  // Если ничего не подошло, возвращаем оригинал
  return maleText;
}

// Основной цикл генерации
async function generateAllFemaleVersions() {
  console.log('🚀 Начинаю генерацию женских версий архетипов...\n');
  
  // Шаг 1: Экспорт мужских архетипов (если еще не экспортированы)
  const exportPath = path.join(__dirname, '../data/male-archetypes-export.json');
  let maleArchetypes;
  
  if (fs.existsSync(exportPath)) {
    console.log('📂 Загружаю экспортированные мужские архетипы...');
    maleArchetypes = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  } else {
    console.log('📤 Экспортирую мужские архетипы...');
    maleArchetypes = await exportMaleArchetypes();
  }
  
  console.log(`📊 Найдено ${maleArchetypes.length} текстовых записей для генерации\n`);
  
  // Шаг 2: Генерация женских версий
  const results = [];
  const batchSize = 5; // Пакетная обработка (меньше для избежания rate limits)
  let processed = 0;
  let errors = 0;
  
  // Создаем директорию для результатов
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Файл для промежуточного сохранения
  const checkpointPath = path.join(dataDir, 'female-archetypes-checkpoint.json');
  
  // Загружаем чекпоинт, если есть
  let checkpoint = { processed: 0, results: [] };
  if (fs.existsSync(checkpointPath)) {
    checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
    console.log(`📌 Найден чекпоинт: обработано ${checkpoint.processed} из ${maleArchetypes.length}`);
    
    const resume = process.argv.includes('--resume');
    if (resume) {
      results.push(...checkpoint.results);
      processed = checkpoint.processed;
      console.log(`▶️  Продолжаю с позиции ${processed}\n`);
    }
  }
  
  // Обработка пакетами
  for (let i = processed; i < maleArchetypes.length; i += batchSize) {
    const batch = maleArchetypes.slice(i, Math.min(i + batchSize, maleArchetypes.length));
    
    console.log(`\n📦 Обработка пакета ${Math.floor(i/batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, maleArchetypes.length)} из ${maleArchetypes.length})`);
    
    // Последовательная обработка внутри пакета (для контроля rate limits)
    for (const archetype of batch) {
      const index = maleArchetypes.indexOf(archetype);
      console.log(`  [${index + 1}/${maleArchetypes.length}] ${archetype.archetypeKey} - ${archetype.contentType}`);
      
      try {
        // Генерация поэтической версии
        const femalePoetic = await generateFemaleVersion(
          archetype.male.poetic,
          archetype.contentType,
          archetype.element,
          archetype.strength,
          'poetic'
        );
        
        // Генерация разговорной версии (практический стиль)
        const femalePractical = await generateFemaleVersion(
          archetype.male.practical || archetype.male.poetic, // Fallback если нет разговорной версии
          archetype.contentType,
          archetype.element,
          archetype.strength,
          'practical' // Указываем стиль для применения практических правил
        );

        results.push({
          ...archetype,
          female: {
            poetic: femalePoetic,
            practical: femalePractical
          },
          generatedAt: new Date().toISOString()
        });
        
        processed++;
        
        // Прогресс
        if (processed % 10 === 0) {
          const progress = Math.round((processed / maleArchetypes.length) * 100);
          console.log(`\n  📊 Прогресс: ${processed}/${maleArchetypes.length} (${progress}%)`);
        }
        
        // Сохранение чекпоинта каждые 50 записей
        if (processed % 50 === 0) {
          fs.writeFileSync(
            checkpointPath,
            JSON.stringify({ processed, results }, null, 2),
            'utf8'
          );
          console.log(`  💾 Чекпоинт сохранен`);
        }
        
        // Пауза между запросами
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`  ❌ Ошибка обработки архетипа:`, error.message);
        errors++;
        
        // Добавляем с fallback версией (правила)
        results.push({
          ...archetype,
          female: {
            poetic: applyTransformationRules(archetype.male.poetic, archetype.contentType, archetype.element, archetype.strength, 'poetic'),
            practical: applyTransformationRules(archetype.male.practical || archetype.male.poetic, archetype.contentType, archetype.element, archetype.strength, 'practical')
          },
          error: error.message,
          generatedAt: new Date().toISOString(),
          method: 'rules-fallback'
        });
        processed++;
      }
    }
    
    // Пауза между пакетами
    if (i + batchSize < maleArchetypes.length) {
      console.log(`  ⏸️  Пауза 3 секунды перед следующим пакетом...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Финальное сохранение
  const outputPath = path.join(dataDir, 'female-archetypes-generated.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(results, null, 2),
    'utf8'
  );
  
  // Удаляем чекпоинт после успешного завершения
  if (fs.existsSync(checkpointPath)) {
    fs.unlinkSync(checkpointPath);
  }

  console.log(`\n✅ Генерация завершена!`);
  console.log(`📁 Сохранено в: ${outputPath}`);
  console.log(`📊 Статистика:`);
  console.log(`   - Обработано: ${processed}/${maleArchetypes.length}`);
  console.log(`   - Ошибок: ${errors}`);
  console.log(`   - Успешно: ${processed - errors}`);
  
  return results;
}

// Запуск
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
Использование: node generate-female-archetypes.js [опции]

Режимы работы:
  (по умолчанию)  Генерация на основе правил (БЕЗ внешних API)
  --ai            Использовать OpenAI API (требует OPENAI_API_KEY)
  --deepseek      Использовать DeepSeek API (требует DEEPSEEK_API_KEY, пока не реализован)

Опции:
  --resume        Продолжить с последнего чекпоинта (только для AI режима)
  --help          Показать эту справку

Примеры:
  node generate-female-archetypes.js                    # Режим правил (рекомендуется)
  node generate-female-archetypes.js --ai               # OpenAI API
  node generate-female-archetypes.js --ai --resume      # Продолжить с чекпоинта
    `);
    process.exit(0);
  }
  
  generateAllFemaleVersions()
    .then(() => {
      console.log('\n🎉 Генерация успешно завершена!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Критическая ошибка:', error);
      process.exit(1);
    });
}

module.exports = { generateAllFemaleVersions, generateFemaleVersion };

