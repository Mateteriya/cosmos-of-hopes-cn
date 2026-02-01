// gender-modifiers.js - ГЕНДЕРНЫЕ МОДИФИКАТОРЫ ДЛЯ КОНТЕНТА БАЦЗЫ
// Быстрое решение для учета пола в прогнозах до полной переработки системы

/**
 * Гендерные модификаторы для разных типов контента
 * Используются для адаптации базового контента под пол пользователя
 */
export const genderModifiers = {
  male: {
    // Метафоры и образы для мужчин
    metaphors: {
      'дерево': ['дуб', 'бамбук', 'кедр', 'сильный ствол'],
      'огонь': ['факел', 'пламя', 'костер', 'солнце'],
      'земля': ['гора', 'скала', 'крепость', 'фундамент'],
      'металл': ['меч', 'щит', 'клинок', 'броня'],
      'вода': ['океан', 'поток', 'река', 'водопад']
    },
    // Глаголы действия для мужчин
    actionVerbs: {
      'проявите': 'активно проявите',
      'развивайте': 'расширяйте',
      'укрепляйте': 'защищайте',
      'создавайте': 'строите',
      'поддерживайте': 'защищайте',
      'ищите': 'добивайтесь',
      'находите': 'завоевывайте'
    },
    // Фокусы для разных сфер
    focus: {
      career: ['лидерство', 'экспансия', 'конкуренция', 'достижения'],
      relationships: ['инициатива', 'защита', 'ответственность', 'решительность'],
      health: ['физическая сила', 'выносливость', 'активность', 'вызовы'],
      energy: ['мощь', 'динамика', 'экспансия', 'влияние']
    },
    // Стиль формулировок
    style: {
      direct: true,
      assertive: true,
      actionOriented: true
    }
  },
  female: {
    // Метафоры и образы для женщин
    metaphors: {
      'дерево': ['ива', 'сакура', 'виноградная лоза', 'цветущее дерево'],
      'огонь': ['огонек', 'свеча', 'тепло очага', 'луна'],
      'земля': ['сад', 'почва', 'долина', 'дом'],
      'металл': ['зеркало', 'украшение', 'монета', 'колокольчик'],
      'вода': ['родник', 'озеро', 'ручей', 'роса']
    },
    // Глаголы действия для женщин
    actionVerbs: {
      'проявите': 'укрепите проявление',
      'расширяйте': 'развивайте',
      'защищайте': 'поддерживайте',
      'строите': 'создавайте',
      'защищайте': 'оберегайте',
      'добивайтесь': 'привлекайте',
      'завоевывайте': 'притягивайте'
    },
    // Фокусы для разных сфер
    focus: {
      career: ['стабильность', 'сотрудничество', 'гармония', 'развитие'],
      relationships: ['гармония', 'поддержка', 'забота', 'понимание'],
      health: ['баланс', 'гибкость', 'восстановление', 'красота'],
      energy: ['внутренняя сила', 'устойчивость', 'плодородие', 'творчество']
    },
    // Стиль формулировок
    style: {
      direct: false,
      assertive: false,
      actionOriented: false,
      nurturing: true,
      collaborative: true
    }
  }
};

/**
 * Применяет гендерные модификаторы к тексту контента
 * @param {string} content - Исходный текст
 * @param {string} gender - 'male' или 'female'
 * @param {string} element - Элемент Бацзы (Дерево, Огонь, и т.д.)
 * @param {string} contentType - Тип контента (forecast, energy, advice, ritual, transformation)
 * @returns {string} - Модифицированный текст
 */
export function applyGenderModifiers(content, gender, element, contentType = 'forecast') {
  if (!content || typeof content !== 'string') return content;
  
  const modifiers = genderModifiers[gender] || genderModifiers.female;
  let modifiedContent = content;
  
  // Заменяем глаголы действия
  Object.entries(modifiers.actionVerbs).forEach(([original, replacement]) => {
    const regex = new RegExp(original, 'gi');
    modifiedContent = modifiedContent.replace(regex, replacement);
  });
  
  // Заменяем местоимения и обращения
  if (gender === 'male') {
    modifiedContent = modifiedContent.replace(/ваша/g, 'ваша');
    modifiedContent = modifiedContent.replace(/вы будете/g, 'вы будете');
    modifiedContent = modifiedContent.replace(/вам/g, 'вам');
  } else {
    modifiedContent = modifiedContent.replace(/ваша/g, 'ваша');
    modifiedContent = modifiedContent.replace(/вы будете/g, 'вы будете');
    modifiedContent = modifiedContent.replace(/вам/g, 'вам');
  }
  
  // Добавляем гендерно-специфичные фразы в зависимости от типа контента
  if (contentType === 'advice') {
    const focus = modifiers.focus;
    if (gender === 'male') {
      // Добавляем акцент на активность для мужчин
      if (modifiedContent.includes('сосредоточьтесь')) {
        modifiedContent = modifiedContent.replace(
          'сосредоточьтесь',
          'активно сосредоточьтесь'
        );
      }
    } else {
      // Добавляем акцент на гармонию для женщин
      if (modifiedContent.includes('сосредоточьтесь')) {
        modifiedContent = modifiedContent.replace(
          'сосредоточьтесь',
          'мягко сосредоточьтесь'
        );
      }
    }
  }
  
  // Модифицируем метафоры в зависимости от элемента
  const elementLower = element.toLowerCase();
  const elementMap = {
    'дерево': 'дерево',
    'огонь': 'огонь',
    'земля': 'земля',
    'металл': 'металл',
    'вода': 'вода'
  };
  
  const elementKey = elementMap[elementLower] || elementLower;
  const metaphors = modifiers.metaphors[elementKey];
  
  if (metaphors && metaphors.length > 0) {
    // Заменяем общие метафоры на гендерно-специфичные (если есть в тексте)
    metaphors.forEach((metaphor, index) => {
      // Это можно использовать для будущих улучшений
    });
  }
  
  return modifiedContent;
}

/**
 * Получает гендерно-специфичный совет для ритуала
 * @param {string} gender - 'male' или 'female'
 * @param {string} element - Элемент Бацзы
 * @returns {string} - Дополнительный совет
 */
export function getGenderSpecificRitualAdvice(gender, element) {
  if (gender === 'male') {
    return 'Для мужской энергии рекомендуется выполнять ритуал утром или в первой половине дня, когда энергия Ян наиболее активна.';
  } else {
    return 'Для женской энергии рекомендуется выполнять ритуал вечером или во второй половине дня, когда энергия Инь наиболее гармонична.';
  }
}

/**
 * Получает гендерно-специфичный фокус для трансформации
 * @param {string} gender - 'male' или 'female'
 * @param {string} element - Элемент Бацзы
 * @returns {string} - Фокус трансформации
 */
export function getGenderSpecificTransformationFocus(gender, element) {
  const focus = genderModifiers[gender]?.focus || genderModifiers.female.focus;
  
  if (gender === 'male') {
    return `Ваша трансформация будет связана с ${focus.career[0]} и ${focus.energy[0]}. Вы обретете способность активно влиять на окружающий мир.`;
  } else {
    return `Ваша трансформация будет связана с ${focus.career[0]} и ${focus.energy[0]}. Вы обретете способность создавать гармонию и красоту вокруг себя.`;
  }
}

