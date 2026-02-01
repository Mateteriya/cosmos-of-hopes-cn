/**
 * Скрипт для генерации тестовых амулетов с каждой картинкой
 * Показывает примеры всех символов для проверки
 */

const fs = require('fs');
const path = require('path');

// Путь к папке с картинками
const picturesDir = path.join(__dirname, '..', 'public', 'pictures');

// Маппинг символов на файлы картинок (из AmuletSymbolIcons.tsx)
const SYMBOL_IMAGE_MAP = {
  // Дерево
  'tree': ['дерево.png'],
  'anchor': ['якорь.png'],
  'roots': ['дерево.png'],
  'bridge': ['мост.png'],
  'ship': ['корабль.png'],
  'tree_world': ['дерево.png'],
  'axe': ['топор.png'],
  'bow': ['лук и стрела.png'],
  'sprout': ['росток..png'],
  'leaf': ['лист.png'],
  'nest': ['гнездо.png'],
  'blossom': ['цветущая веточкаr.png'],
  'rainbow': ['радуга.png'],
  'vine': ['цветущая веточкаr.png'],
  'bow_arrow': ['лук и стрела.png'],
  'fruit': ['плод.png'],
  
  // Огонь
  'hammer': ['молот.png'],
  'campfire': ['костер.png'],
  'shield': ['крепость.png'],
  'sun': ['солнце.png'],
  'torch': ['факел.png'],
  'ring': ['кольцо.png'],
  'volcano': ['вулкан.gif'],
  'dragon': ['дракон.png'],
  'lightning': ['вулкан.gif'],
  'candle': ['свеча.png'],
  'heart': ['сердце.png'],
  'lotus': ['цветущая веточкаr.png'],
  'phoenix': ['феникс.png'],
  'butterfly': ['бабочка.png'],
  'eye': ['глаз.png'],
  'crown': ['корона27.png'],
  
  // Земля
  'mountain': ['гора.png'],
  'tower': ['крепость.png'],
  'crystal': ['кристалл.png'],
  'labyrinth': ['лабиринт.png'],
  'scales': ['весы.png', 'весы1.png'], // ДВЕ картинки
  'gear': ['шестерня.png'],
  'fortress': ['крепость.png'],
  'compass': ['компас.png'],
  'garden': ['сад.png'],
  'house': ['дом.png'],
  'crystal_lattice': ['КРИСТАЛЛИЧЕСКАЯ РЕШЕТКА.png'],
  
  // Металл
  'nail': ['гвоздь.png'],
  'cube': ['куб.png'],
  'bell': ['колокол.png'],
  'circle': ['кольцо.png'],
  'sword': ['кинжал.png'],
  'anvil': ['наковальня.png'],
  'clock': ['часы.png'],
  'key': ['ключ.png'],
  'needle': ['гвоздь.png'],
  'lock': ['замок.png'],
  'small_bell': ['колоколчик.png'],
  'mirror': ['зеркало.png'],
  'coin': ['кольцо.png'],
  'dagger': ['кинжал.png'],
  'scissors': ['ножницы.png'],
  
  // Вода
  'helm': ['штурвал.png'],
  'sail': ['парус.png'],
  'turtle': ['черепаха.png'],
  'fish': ['волна.png'],
  'wave': ['волна.png'],
  'ice': ['кристалл.png'],
  'trident': ['трезубец.png'],
  'shell': ['раковина.png'],
  'drop': ['волна.png'],
  'swan': ['лебедь.png'],
  'moon': ['луна.png'],
  'pearl': ['жемчужина.png'],
  'vase': ['кувшин.png'],
  
  // Уровень 1
  'horse': ['подкова.png'],
  'horseshoe': ['подкова.png'],
};

// Получаем список всех файлов картинок
function getImageFiles() {
  try {
    const files = fs.readdirSync(picturesDir);
    return files.filter(f => f.endsWith('.png') || f.endsWith('.gif'));
  } catch (error) {
    console.error('Ошибка чтения папки pictures:', error);
    return [];
  }
}

// Генерируем список тестовых амулетов
function generateTestAmulets() {
  const imageFiles = getImageFiles();
  const testAmulets = [];
  
  // Для каждого символа создаем тестовый амулет
  Object.entries(SYMBOL_IMAGE_MAP).forEach(([symbolId, imageFilesForSymbol]) => {
    imageFilesForSymbol.forEach((imageFile, index) => {
      testAmulets.push({
        symbolId,
        imageFile,
        imageIndex: index,
        totalImages: imageFilesForSymbol.length,
        exists: imageFiles.includes(imageFile),
      });
    });
  });
  
  return testAmulets;
}

// Формируем отчет
function generateReport() {
  const imageFiles = getImageFiles();
  const testAmulets = generateTestAmulets();
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 ОТЧЕТ О ТЕСТОВЫХ АМУЛЕТАХ');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`📁 Всего файлов картинок: ${imageFiles.length}`);
  console.log(`🎯 Всего символов: ${Object.keys(SYMBOL_IMAGE_MAP).length}`);
  console.log(`🧪 Всего тестовых амулетов: ${testAmulets.length}\n`);
  
  // Проверяем наличие картинок
  const missingImages = testAmulets.filter(a => !a.exists);
  if (missingImages.length > 0) {
    console.log('⚠️  Отсутствующие картинки:');
    missingImages.forEach(a => {
      console.log(`   - ${a.symbolId}: ${a.imageFile}`);
    });
    console.log('');
  } else {
    console.log('✅ Все картинки найдены!\n');
  }
  
  // Группируем по символам
  const symbolsWithMultipleImages = testAmulets.filter(a => a.totalImages > 1);
  if (symbolsWithMultipleImages.length > 0) {
    console.log('🔄 Символы с несколькими картинками:');
    const uniqueSymbols = [...new Set(symbolsWithMultipleImages.map(a => a.symbolId))];
    uniqueSymbols.forEach(symbolId => {
      const images = testAmulets.filter(a => a.symbolId === symbolId);
      console.log(`   - ${symbolId}: ${images.length} картинок`);
      images.forEach(img => {
        console.log(`     ${img.imageIndex + 1}. ${img.imageFile} ${img.exists ? '✓' : '✗'}`);
      });
    });
    console.log('');
  }
  
  // Список всех тестовых амулетов
  console.log('📋 Список всех тестовых амулетов:');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  let currentSymbol = '';
  testAmulets.forEach(amulet => {
    if (amulet.symbolId !== currentSymbol) {
      if (currentSymbol) console.log('');
      currentSymbol = amulet.symbolId;
      console.log(`🎴 ${amulet.symbolId.toUpperCase()}:`);
    }
    const status = amulet.exists ? '✓' : '✗';
    const variant = amulet.totalImages > 1 ? ` (Вариант ${amulet.imageIndex + 1}/${amulet.totalImages})` : '';
    console.log(`   ${status} ${amulet.imageFile}${variant}`);
  });
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ Отчет сформирован!');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Выводим URL для тестовой страницы
  console.log('🌐 Для просмотра всех символов откройте:');
  console.log('   http://localhost:3000/test-amulets\n');
}

// Запускаем генерацию отчета
generateReport();
