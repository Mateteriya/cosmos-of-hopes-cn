// Тестовый скрипт для проверки расширенной библиотеки рекомендаций
import { generateAdvancedRecommendations } from './content-generator.js';

// Профиль 1: Слабый Огонь, нуждающийся в поддержке
const profile1 = {
  element: 'Огонь',
  strength: 1.2, // Категория "Слабый"
  usefulElements: ['Дерево', 'Огонь'], // Питание и поддержка
  interactions: [
    { type: '冲 (Столкновение)', pillar: 'месяц', impact: 'dynamic' } // Столкновение в карьерном столпе
  ],
  imbalance: { excess: ['Вода'], deficient: ['Огонь', 'Земля'] },
  activePillar: 'месяц' // Карьера активирована
};

// Профиль 2: Очень сильный Металл, требующий контроля
const profile2 = {
  element: 'Металл',
  strength: 5.8, // Категория "Очень сильный"
  usefulElements: ['Огонь', 'Вода'], // Контроль и смягчение
  interactions: [
    { type: '合 (Слияние)', pillar: 'день', impact: 'positive' } // Слияние в личном столпе
  ],
  imbalance: { excess: ['Металл', 'Земля'], deficient: ['Огонь'] },
  activePillar: 'день' // Личность и партнерство активированы
};

// Профиль 3: Сбалансированная Вода с триадой поддержки
const profile3 = {
  element: 'Вода',
  strength: 3.0, // Категория "Сбалансированный"
  usefulElements: ['Металл', 'Вода'], // Источник и поддержка
  interactions: [
    { type: '三合 (Триада)', pillar: 'год', impact: 'very_positive' } // Триада в столпе года
  ],
  imbalance: { excess: [], deficient: ['Дерево'] },
  activePillar: 'год' // Внешний мир активирован
};

// Функция для красивого вывода
function printRecommendation(profile, profileNumber) {
  console.log('\n' + '='.repeat(80));
  console.log(`ПРОФИЛЬ ${profileNumber}: ${profile.element} (сила: ${profile.strength})`);
  console.log('='.repeat(80));
  
  try {
    const recommendation = generateAdvancedRecommendations(
      profile.element,
      profile.strength,
      profile.usefulElements,
      profile.interactions,
      profile.imbalance,
      profile.activePillar
    );
    
    console.log('\n🔮 АМУЛЕТ:');
    console.log(recommendation.amulet);
    
    console.log('\n🎯 ДЕЙСТВИЕ:');
    console.log(recommendation.action);
    
    console.log('\n🎨 ЦВЕТА:');
    console.log(recommendation.colors);
    
    console.log('\n💚 ЗДОРОВЬЕ:');
    console.log(recommendation.health);
    
    if (recommendation.specialNote) {
      console.log('\n✨ ОСОБОЕ ПРИМЕЧАНИЕ:');
      console.log(recommendation.specialNote.trim());
    }
    
    if (recommendation.balanceNote) {
      console.log('\n⚖️ БАЛАНС:');
      console.log(recommendation.balanceNote);
    }
    
    if (recommendation.yearContext) {
      console.log('\n📅 КОНТЕКСТ ГОДА (2026 - Огненная Лошадь):');
      console.log(recommendation.yearContext);
    }
    
  } catch (error) {
    console.error('❌ ОШИБКА:', error.message);
    console.error(error.stack);
  }
}

// Запуск тестов
console.log('🧪 ТЕСТИРОВАНИЕ РАСШИРЕННОЙ БИБЛИОТЕКИ РЕКОМЕНДАЦИЙ BAZI NAVIGATOR');
console.log('='.repeat(80));

printRecommendation(profile1, 1);
printRecommendation(profile2, 2);
printRecommendation(profile3, 3);

console.log('\n' + '='.repeat(80));
console.log('✅ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО');
console.log('='.repeat(80));
