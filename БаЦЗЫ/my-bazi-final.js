import lunisolar from 'lunisolar';

// ПРАВИЛЬНАЯ конфигурация (нашла эталонный результат)
const lsr = lunisolar('1983-11-19 08:15', { offset: 0, isUTC: false });
const bazi = lsr.char8;

// Словари для перевода
const stemNames = {
  '甲': 'Дерево Ян', '乙': 'Дерево Инь',
  '丙': 'Огонь Ян', '丁': 'Огонь Инь',
  '戊': 'Земля Ян', '己': 'Земля Инь',
  '庚': 'Металл Ян', '辛': 'Металл Инь',
  '壬': 'Вода Ян', '癸': 'Вода Инь'
};

const branchNames = {
  '子': 'Крыса', '丑': 'Бык', '寅': 'Тигр', '卯': 'Кролик',
  '辰': 'Дракон', '巳': 'Змея', '午': 'Лошадь', '未': 'Коза',
  '申': 'Обезьяна', '酉': 'Петух', '戌': 'Собака', '亥': 'Свинья'
};

console.log('=== МОЯ КАРТА БАЦЗЫ (Расшифровка) ===\n');

// Выводим каждый столп с расшифровкой
const pillars = ['Год', 'Месяц', 'День', 'Час'];
pillars.forEach((name, idx) => {
  const pillar = bazi.list[idx]; // [Год, Месяц, День, Час]
  const s = pillar.stem; // Небесный ствол
  const b = pillar.branch; // Земная ветвь

  console.log(`${name}: ${s}${b}`);
  console.log(`  Ствол: ${s} — ${stemNames[s]}`);
  console.log(`  Ветвь: ${b} — ${branchNames[b]}`);
  console.log('---');
});

console.log('\n✅ Ключевой вывод для меня:');
console.log(`Мой элемент личности (Господин Дня): ${bazi.day.stem} — ${stemNames[bazi.day.stem]}`);
console.log(`Этот элемент определяет мою основную энергию и характер.`);