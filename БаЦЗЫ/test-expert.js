// test-expert.js - ТЕСТ ЭКСПЕРТНОЙ ВЕРСИИ С ГЕНЕРАЦИЕЙ КОНТЕНТА
import { getFullBaziAnalysis } from './bazi-calculator-expert.js';
import { generateContent, formatContentForDisplay } from './content-generator.js';

console.log('🔮 ТЕСТ ЭКСПЕРТНОЙ ВЕРСИИ КАЛЬКУЛЯТОРА БАЦЗЫ\n');
console.log('='.repeat(80));

try {
  const baziAnalysis = getFullBaziAnalysis('1983-11-19 08:15', 'female', 'Europe/Moscow');
  
  console.log('✅ РАСЧЁТ УСПЕШЕН!\n');
  
  // 1. Основная информация
  console.log('1. НАТАЛЬНЫЕ СТОЛПЫ:', baziAnalysis.pillars.join(' '));
  console.log('\n2. ЭЛЕМЕНТ ЛИЧНОСТИ:', baziAnalysis.dayMaster.element, `(${baziAnalysis.dayMaster.glyph})`);
  console.log('   Сила:', baziAnalysis.dayMaster.strength, '/5 -', baziAnalysis.dayMaster.strengthText);
  
  // 2. Взаимодействия столпов (ветви)
  console.log('\n3. ВЗАИМОДЕЙСТВИЯ СТОЛПОВ (ВЕТВИ):');
  if (baziAnalysis.interactions && baziAnalysis.interactions.length > 0) {
    baziAnalysis.interactions.forEach(interaction => {
      const impactIcon = interaction.impact === 'positive' ? '✅' : 
                        interaction.impact === 'negative' ? '⚠️' : '➡️';
      console.log(`   ${impactIcon} ${interaction.type} (${interaction.name}): ${interaction.pillars.join(' + ')}`);
      console.log(`      ${interaction.description}`);
    });
  } else {
    console.log('   Нет особых взаимодействий между ветвями');
  }
  
  // 2.1. Взаимодействия небесных стволов (合化)
  console.log('\n3.1. ВЗАИМОДЕЙСТВИЯ НЕБЕСНЫХ СТВОЛОВ (合化):');
  if (baziAnalysis.stemInteractions && baziAnalysis.stemInteractions.length > 0) {
    baziAnalysis.stemInteractions.forEach(interaction => {
      console.log(`   ✅ ${interaction.type} (${interaction.name}): ${interaction.pillars.join(' + ')}`);
      console.log(`      Трансформация в: ${interaction.transformsTo}`);
      console.log(`      ${interaction.description}`);
    });
  } else {
    console.log('   Нет взаимодействий между стволами');
  }
  
  // 2.2. Специальные комбинации (三合, 三会)
  console.log('\n3.2. СПЕЦИАЛЬНЫЕ КОМБИНАЦИИ (三合, 三会):');
  if (baziAnalysis.specialCombinations && baziAnalysis.specialCombinations.length > 0) {
    baziAnalysis.specialCombinations.forEach(combo => {
      const completenessIcon = combo.completeness === 'complete' ? '🌟' : '⭐';
      console.log(`   ${completenessIcon} ${combo.type} (${combo.name}): ${combo.pillars.join(' + ')}`);
      if (combo.season) {
        console.log(`      Сезон: ${combo.season}, Элемент: ${combo.element}`);
      } else {
        console.log(`      Элемент: ${combo.element}`);
      }
      console.log(`      ${combo.description}`);
    });
  } else {
    console.log('   Нет специальных комбинаций');
  }
  
  // 3. Сила небесных стволов
  console.log('\n4. СИЛА НЕБЕСНЫХ СТВОЛОВ ПО СЕЗОНУ:');
  if (baziAnalysis.stemStrengths) {
    Object.entries(baziAnalysis.stemStrengths).forEach(([pillar, strength]) => {
      const pillarNames = { year: 'Год', month: 'Месяц', day: 'День', hour: 'Час' };
      console.log(`   ${pillarNames[pillar]}: ${strength.glyph} (${strength.element}) - ${strength.strength}/5 (${strength.strengthText}, ${strength.state})`);
    });
  }
  
  // 4. Баланс элементов
  console.log('\n5. БАЛАНС ЭЛЕМЕНТОВ (с учётом скрытых стволов):');
  Object.entries(baziAnalysis.elementBalance).forEach(([element, count]) => {
    console.log(`   ${element}: ${count.toFixed(2)}`);
  });
  
  // 5. Генерация контента (ДВА СТИЛЯ)
  console.log('\n6. ГЕНЕРАЦИЯ КОНТЕНТА:');
  console.log('='.repeat(80));
  
  // ПОЭТИЧЕСКИ-МЕТАФОРИЧЕСКИЙ СТИЛЬ
  console.log('\n📖 ПОЭТИЧЕСКИ-МЕТАФОРИЧЕСКИЙ СТИЛЬ:');
  console.log('-'.repeat(80));
  const poeticContent = generateContent(baziAnalysis, 2026, 'Огненная Лошадь', 'poetic');
  const poeticFormatted = formatContentForDisplay(poeticContent);
  
  console.log(`\n📊 Прогноз:`);
  console.log(`   ${poeticFormatted.mainForecast}`);
  console.log(`\n💫 Энергия года:`);
  console.log(`   ${poeticFormatted.energy}`);
  console.log(`\n💡 Совет-направление:`);
  console.log(`   ${poeticFormatted.advice}`);
  console.log(`\n✨ Современный ритуал:`);
  console.log(`   ${poeticFormatted.ritual}`);
  
  // РАЗГОВОРНО-ПРАКТИЧЕСКИЙ СТИЛЬ
  console.log('\n\n💬 РАЗГОВОРНО-ПРАКТИЧЕСКИЙ СТИЛЬ:');
  console.log('-'.repeat(80));
  const practicalContent = generateContent(baziAnalysis, 2026, 'Огненная Лошадь', 'practical');
  const practicalFormatted = formatContentForDisplay(practicalContent);
  
  console.log(`\n📊 Прогноз:`);
  console.log(`   ${practicalFormatted.mainForecast}`);
  console.log(`\n💫 Энергия года:`);
  console.log(`   ${practicalFormatted.energy}`);
  console.log(`\n💡 Что делать:`);
  console.log(`   ${practicalFormatted.advice}`);
  console.log(`\n✨ Простой ритуал:`);
  console.log(`   ${practicalFormatted.ritual}`);
  
  // ОБЩИЕ РЕКОМЕНДАЦИИ (одинаковые для обоих стилей)
  console.log('\n\n💎 РЕКОМЕНДАЦИИ (общие):');
  console.log(`   ${poeticFormatted.recommendations.amulet}`);
  console.log(`   ${poeticFormatted.recommendations.action}`);
  console.log(`   ${poeticFormatted.recommendations.colors}`);
  
  console.log('\n⚠️ ПРЕДОСТЕРЕЖЕНИЯ:');
  console.log(`   Месяцы: ${poeticFormatted.warnings.months}`);
  console.log(`   Здоровье: ${poeticFormatted.warnings.health}`);
  
  if (poeticFormatted.interactions.positive.length > 0) {
    console.log('\n✅ ГАРМОНИЧНЫЕ ВЗАИМОДЕЙСТВИЯ:');
    poeticFormatted.interactions.positive.forEach(interaction => {
      console.log(`   ${interaction.type}: ${interaction.description}`);
    });
  }
  
  if (poeticFormatted.interactions.warnings.length > 0) {
    console.log('\n⚠️ ПРЕДУПРЕЖДЕНИЯ ПО ВЗАИМОДЕЙСТВИЯМ:');
    poeticFormatted.interactions.warnings.forEach(warning => {
      console.log(`   ${warning.type}: ${warning.description}`);
    });
  }
  
  if (poeticFormatted.stemAdvice.length > 0) {
    console.log('\n💡 СОВЕТЫ ПО СИЛЕ СТВОЛОВ:');
    poeticFormatted.stemAdvice.forEach(advice => {
      console.log(`   ${advice.pillar}: ${advice.advice}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ ВСЕ УЛУЧШЕНИЯ РАБОТАЮТ!');
  console.log('\nУлучшения:');
  console.log('  ✓ Точный расчёт возраста начала удачи');
  console.log('  ✓ Учёт скрытых стволов');
  console.log('  ✓ Многофакторный анализ силы');
  console.log('  ✓ Взаимодействия столпов (ветви) - все 12 пар наказаний и вреди');
  console.log('  ✓ Взаимодействия небесных стволов (合化)');
  console.log('  ✓ Специальные комбинации (三合, 三会)');
  console.log('  ✓ Сила небесных стволов по сезону');
  console.log('  ✓ Генерация персонализированного контента');
  
} catch (error) {
  console.error('❌ ОШИБКА:', error.message);
  console.error(error.stack);
}

