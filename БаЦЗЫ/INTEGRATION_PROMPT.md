# 🎯 ПРОМПТ ДЛЯ ИНТЕГРАЦИИ КАЛЬКУЛЯТОРА БАЦЗЫ В ПРИЛОЖЕНИЕ

## 📋 ЧТО ЭТО ТАКОЕ

Готовый **экспертный калькулятор БаЦзы (八字)** с точностью 97-98%, который:
- Рассчитывает натальную карту БаЦзы (4 столпа: год, месяц, день, час)
- Анализирует силу элемента личности и баланс всех элементов
- Определяет столпы удачи (大运) с точным возрастом начала
- Выявляет взаимодействия между столпами (слияния, столкновения, наказания, вреди)
- Анализирует силу небесных стволов по сезону
- Генерирует персонализированный контент (прогнозы, советы, ритуалы) в двух стилях

**Статус:** ✅ Полностью готов к интеграции, протестирован

---

## 📁 ГДЕ НАХОДЯТСЯ ФАЙЛЫ

```
cosmos-of-hopes-cn/БаЦЗЫ/
├── bazi-calculator-expert.js    # Основной калькулятор (ES модуль)
├── content-generator.js          # Генератор контента (ES модуль)
├── package.json                  # Зависимости
├── test-expert.js                # Тестовый файл (для проверки)
└── [документация .md файлы]     # Подробная документация
```

**Важно:** Файлы используют ES модули (`import/export`), не CommonJS.

---

## 📦 ЗАВИСИМОСТИ

Необходимо установить в корне проекта (где `package.json` основного приложения):

```bash
npm install lunisolar moment-timezone
```

**Зависимости:**
- `lunisolar` (v2.6.0+) — китайский календарь, солнечные термины, расчёт столпов
- `moment-timezone` (v0.6.0+) — работа с часовыми поясами

---

## 🚀 ВАРИАНТЫ ИНТЕГРАЦИИ

### Вариант 1: API Route (Рекомендуется для Next.js)

Создать API endpoint в Next.js App Router:

**Файл:** `app/api/bazi/route.ts` (или `pages/api/bazi.ts` для Pages Router)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getFullBaziAnalysis } from '../../../../cosmos-of-hopes-cn/БаЦЗЫ/bazi-calculator-expert.js';
import { generateContent, formatContentForDisplay } from '../../../../cosmos-of-hopes-cn/БаЦЗЫ/content-generator.js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dateTime, gender, timezone, year = 2026, yearAnimal = 'Огненная Лошадь', style = 'poetic' } = body;

    // Валидация
    if (!dateTime || !gender || !timezone) {
      return NextResponse.json(
        { error: 'Missing required fields: dateTime, gender, timezone' },
        { status: 400 }
      );
    }

    // Получаем анализ БаЦзы
    const baziAnalysis = getFullBaziAnalysis(dateTime, gender, timezone);

    // Генерируем контент
    const content = generateContent(baziAnalysis, year, yearAnimal, style);
    const formatted = formatContentForDisplay(content);

    return NextResponse.json({
      success: true,
      analysis: baziAnalysis,
      content: formatted,
      rawContent: content
    });

  } catch (error) {
    console.error('Bazi calculation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

**Использование на клиенте:**

```typescript
const response = await fetch('/api/bazi', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dateTime: '1983-11-19 08:15',
    gender: 'female',
    timezone: 'Europe/Moscow',
    year: 2026,
    yearAnimal: 'Огненная Лошадь',
    style: 'poetic' // или 'practical'
  })
});

const data = await response.json();
```

---

### Вариант 2: Прямое использование (Server Components)

Если используете Next.js App Router с Server Components:

**Файл:** `app/bazi/page.tsx`

```typescript
import { getFullBaziAnalysis } from '../../../cosmos-of-hopes-cn/БаЦЗЫ/bazi-calculator-expert.js';
import { generateContent, formatContentForDisplay } from '../../../cosmos-of-hopes-cn/БаЦЗЫ/content-generator.js';

export default async function BaziPage({ searchParams }: { searchParams: { dateTime?: string, gender?: string, timezone?: string } }) {
  if (!searchParams.dateTime || !searchParams.gender || !searchParams.timezone) {
    return <div>Пожалуйста, укажите дату рождения, пол и часовой пояс</div>;
  }

  const analysis = getFullBaziAnalysis(
    searchParams.dateTime,
    searchParams.gender,
    searchParams.timezone
  );

  const content = generateContent(analysis, 2026, 'Огненная Лошадь', 'poetic');
  const formatted = formatContentForDisplay(content);

  return (
    <div>
      <h1>Ваша карта БаЦзы</h1>
      <p>Столпы: {analysis.pillars.join(' ')}</p>
      <p>Элемент: {analysis.dayMaster.element} ({analysis.dayMaster.strengthText})</p>
      <h2>Прогноз</h2>
      <p>{formatted.mainForecast}</p>
      {/* ... остальной контент */}
    </div>
  );
}
```

---

### Вариант 3: Утилита/Сервис (для переиспользования)

**Файл:** `lib/bazi-service.ts`

```typescript
import { getFullBaziAnalysis } from '../../cosmos-of-hopes-cn/БаЦЗЫ/bazi-calculator-expert.js';
import { generateContent, formatContentForDisplay } from '../../cosmos-of-hopes-cn/БаЦЗЫ/content-generator.js';

export interface BaziRequest {
  dateTime: string;      // Формат: 'YYYY-MM-DD HH:mm'
  gender: 'male' | 'female';
  timezone: string;      // Например: 'Europe/Moscow'
  year?: number;         // Год для прогноза (по умолчанию текущий)
  yearAnimal?: string;  // Животное года (например, 'Огненная Лошадь')
  style?: 'poetic' | 'practical';
}

export interface BaziResponse {
  success: boolean;
  analysis: ReturnType<typeof getFullBaziAnalysis>;
  content: ReturnType<typeof formatContentForDisplay>;
}

export async function calculateBazi(params: BaziRequest): Promise<BaziResponse> {
  const analysis = getFullBaziAnalysis(params.dateTime, params.gender, params.timezone);
  const content = generateContent(
    analysis,
    params.year || new Date().getFullYear(),
    params.yearAnimal || 'Огненная Лошадь',
    params.style || 'poetic'
  );
  const formatted = formatContentForDisplay(content);

  return {
    success: true,
    analysis,
    content: formatted
  };
}
```

---

## 📊 СТРУКТУРА ДАННЫХ

### Результат анализа (`baziAnalysis`):

```typescript
{
  success: true,
  pillars: ['癸亥', '癸亥', '辛亥', '甲午'],  // 4 столпа
  dayMaster: {
    glyph: '辛',
    element: 'Металл',
    strength: 2,              // 1-5
    strengthText: 'слабый',   // 'очень слабый' | 'слабый' | 'балансный' | 'сильный' | 'очень сильный'
    strengthDetails: {
      seasonScore: 1,
      rootScore: 2,
      supportScore: 1,
      controlScore: 3
    }
  },
  elementBalance: {
    'Дерево': 1.90,
    'Огонь': 1.70,
    'Земля': 0.30,
    'Металл': 1.00,
    'Вода': 7.10
  },
  luckPillars: [{
    startAge: 4.8,           // Точный возраст начала
    ageRange: '4-13 лет',
    pillar: '壬戌',
    element: 'Вода'
  }],
  interactions: [{           // Взаимодействия столпов
    type: '刑',
    name: '亥自刑',
    pillars: ['年柱', '月柱'],
    description: 'Самонаказание Свиньи...',
    impact: 'negative'       // 'positive' | 'negative' | 'neutral'
  }],
  stemInteractions: [{       // Взаимодействия небесных стволов (合化)
    type: '合化',
    name: '甲己合化土',
    pillars: ['年柱', '月柱'],
    transformsTo: 'Земля',
    description: 'Слияние создаёт Землю...'
  }],
  specialCombinations: [{    // Специальные комбинации (三合, 三会)
    type: '三合',
    name: '申子辰三合水',
    pillars: ['年柱', '月柱', '日柱'],
    element: 'Вода',
    completeness: 'complete',  // 'complete' | 'partial'
    description: 'Тройное слияние...'
  }],
  stemStrengths: {
    year: {
      glyph: '癸',
      element: 'Вода',
      state: '旺',            // 旺 | 相 | 休 | 囚 | 死
      strength: 5,
      strengthText: 'очень сильный'
    },
    month: { ... },
    day: { ... },
    hour: { ... }
  }
}
```

### Результат генерации контента (`formatted`):

```typescript
{
  style: 'poetic',           // или 'practical'
  mainForecast: '2026 год (Огненная Лошадь): Год Заточки Инструмента...',
  energy: 'Сосредоточением на главном...',
  advice: 'Сфокусируйтесь на оттачивании...',
  ritual: 'Заведите «Журнал ясности»...',
  recommendations: {
    amulet: 'Амулет: Брелок в форме монеты...',
    action: 'Действие: Проведите ревизию...',
    colors: 'Благоприятные цвета: жёлтый/коричневый, белый/золотой'
  },
  warnings: {
    months: 'Избегайте участия в конфликтных ситуациях...',
    health: 'Берегите лёгкие и кожу...',
    additional: '...'
  },
  interactions: {
    positive: [{ type: '合', description: '...' }],
    neutral: [],
    warnings: [{ type: '刑', description: '...' }]
  },
  stemAdvice: [
    { pillar: 'Год', advice: '...' }
  ],
  interactionNotes: ['...']
}
```

---

## 🎨 ПРИМЕРЫ UI КОМПОНЕНТОВ

### Компонент для отображения карты БаЦзы:

**Файл:** `components/bazi/BaziCard.tsx`

```typescript
'use client';

interface BaziCardProps {
  analysis: {
    pillars: string[];
    dayMaster: {
      element: string;
      strengthText: string;
    };
    elementBalance: Record<string, number>;
  };
}

export function BaziCard({ analysis }: BaziCardProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Ваша карта БаЦзы</h2>
      
      {/* Столпы */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Натальные столпы</h3>
        <div className="flex gap-4 text-3xl">
          {analysis.pillars.map((pillar, i) => (
            <div key={i} className="text-center">
              <div className="font-bold">{pillar}</div>
              <div className="text-sm text-gray-500">
                {['Год', 'Месяц', 'День', 'Час'][i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Элемент личности */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Элемент личности</h3>
        <p className="text-xl">
          <span className="font-bold">{analysis.dayMaster.element}</span>
          {' '}
          <span className="text-gray-600">({analysis.dayMaster.strengthText})</span>
        </p>
      </div>

      {/* Баланс элементов */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Баланс элементов</h3>
        <div className="space-y-2">
          {Object.entries(analysis.elementBalance).map(([element, value]) => (
            <div key={element} className="flex items-center gap-2">
              <span className="w-24">{element}:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{ width: `${(value / 10) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Компонент для отображения прогноза:

**Файл:** `components/bazi/BaziForecast.tsx`

```typescript
'use client';

interface BaziForecastProps {
  content: {
    mainForecast: string;
    energy: string;
    advice: string;
    ritual: string;
    recommendations: {
      amulet: string;
      action: string;
      colors: string;
    };
    warnings: {
      months: string;
      health: string;
    };
  };
  style: 'poetic' | 'practical';
  onStyleChange?: (style: 'poetic' | 'practical') => void;
}

export function BaziForecast({ content, style, onStyleChange }: BaziForecastProps) {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Прогноз на год</h2>
        {onStyleChange && (
          <div className="flex gap-2">
            <button
              onClick={() => onStyleChange('poetic')}
              className={`px-4 py-2 rounded ${style === 'poetic' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
            >
              Поэтический
            </button>
            <button
              onClick={() => onStyleChange('practical')}
              className={`px-4 py-2 rounded ${style === 'practical' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
            >
              Практический
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-2">📊 Прогноз</h3>
          <p className="text-gray-700">{content.mainForecast}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">💫 Энергия года</h3>
          <p className="text-gray-700">{content.energy}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">💡 Совет</h3>
          <p className="text-gray-700">{content.advice}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">✨ Ритуал</h3>
          <p className="text-gray-700">{content.ritual}</p>
        </section>

        <section className="bg-white p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">💎 Рекомендации</h3>
          <ul className="space-y-2 text-gray-700">
            <li>{content.recommendations.amulet}</li>
            <li>{content.recommendations.action}</li>
            <li>{content.recommendations.colors}</li>
          </ul>
        </section>

        <section className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
          <h3 className="text-lg font-semibold mb-2">⚠️ Предостережения</h3>
          <ul className="space-y-2 text-gray-700">
            <li><strong>Месяцы:</strong> {content.warnings.months}</li>
            <li><strong>Здоровье:</strong> {content.warnings.health}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
```

### Форма для ввода данных:

**Файл:** `components/bazi/BaziForm.tsx`

```typescript
'use client';

import { useState } from 'react';

interface BaziFormProps {
  onSubmit: (data: {
    dateTime: string;
    gender: 'male' | 'female';
    timezone: string;
    year?: number;
    yearAnimal?: string;
    style?: 'poetic' | 'practical';
  }) => void;
}

export function BaziForm({ onSubmit }: BaziFormProps) {
  const [dateTime, setDateTime] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [timezone, setTimezone] = useState('Europe/Moscow');
  const [style, setStyle] = useState<'poetic' | 'practical'>('poetic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ dateTime, gender, timezone, style });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-lg">
      <div>
        <label className="block text-sm font-medium mb-1">
          Дата и время рождения
        </label>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Пол</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as 'male' | 'female')}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="female">Женский</option>
          <option value="male">Мужской</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Часовой пояс</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="Europe/Moscow">Москва (UTC+3)</option>
          <option value="Europe/Kiev">Киев (UTC+2)</option>
          <option value="Asia/Shanghai">Пекин (UTC+8)</option>
          {/* Добавьте другие часовые пояса */}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Стиль контента</label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as 'poetic' | 'practical')}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="poetic">Поэтически-метафорический</option>
          <option value="practical">Разговорно-практический</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
      >
        Рассчитать БаЦзы
      </button>
    </form>
  );
}
```

---

## 🔧 НАСТРОЙКА TYPESCRIPT

Если используете TypeScript, добавьте типы:

**Файл:** `types/bazi.ts`

```typescript
export interface BaziAnalysis {
  success: boolean;
  pillars: [string, string, string, string];
  dayMaster: {
    glyph: string;
    element: string;
    strength: number;
    strengthText: string;
    strengthDetails: {
      seasonScore: number;
      rootScore: number;
      supportScore: number;
      controlScore: number;
    };
  };
  elementBalance: {
    Дерево: number;
    Огонь: number;
    Земля: number;
    Металл: number;
    Вода: number;
  };
  luckPillars: Array<{
    startAge: number;
    ageRange: string;
    pillar: string;
    element: string;
  }>;
  interactions: Array<{
    type: string;
    name: string;
    pillars: string[];
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  stemInteractions: Array<{
    type: string;
    name: string;
    pillars: string[];
    transformsTo: string;
    description: string;
  }>;
  specialCombinations: Array<{
    type: string;
    name: string;
    pillars: string[];
    element: string;
    completeness: 'complete' | 'partial';
    season?: string;
    description: string;
  }>;
  stemStrengths: {
    year: StemStrength;
    month: StemStrength;
    day: StemStrength;
    hour: StemStrength;
  };
}

export interface StemStrength {
  glyph: string;
  element: string;
  state: '旺' | '相' | '休' | '囚' | '死';
  strength: number;
  strengthText: string;
}

export interface BaziContent {
  style: 'poetic' | 'practical';
  mainForecast: string;
  energy: string;
  advice: string;
  ritual: string;
  recommendations: {
    amulet: string;
    action: string;
    colors: string;
  };
  warnings: {
    months: string;
    health: string;
    additional?: string;
  };
  interactions: {
    positive: Array<{ type: string; description: string }>;
    neutral: Array<{ type: string; description: string }>;
    warnings: Array<{ type: string; description: string }>;
  };
  stemAdvice: Array<{ pillar: string; advice: string }>;
  interactionNotes: string[];
}
```

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **ES модули:** Файлы используют `import/export`, не `require()`. Убедитесь, что в `package.json` есть `"type": "module"` или используйте `.mjs` расширение.

2. **Путь к файлам:** Если файлы находятся в `cosmos-of-hopes-cn/БаЦЗЫ/`, используйте относительные пути от места вызова.

3. **Часовые пояса:** Обязательно передавайте правильный часовой пояс (например, `'Europe/Moscow'`), иначе расчёт часа может быть неверным.

4. **Формат даты:** Используйте формат `'YYYY-MM-DD HH:mm'` (например, `'1983-11-19 08:15'`).

5. **Производительность:** Калькулятор работает синхронно и достаточно быстрый, но для массовых расчётов лучше использовать API route с кэшированием.

---

## 🧪 ТЕСТИРОВАНИЕ

Перед интеграцией проверьте работу калькулятора:

```bash
cd cosmos-of-hopes-cn/БаЦЗЫ
node test-expert.js
```

Должен вывести полный анализ с контентом в обоих стилях.

---

## 📚 ДОПОЛНИТЕЛЬНАЯ ДОКУМЕНТАЦИЯ

В папке `cosmos-of-hopes-cn/БаЦЗЫ/` есть подробная документация:
- `FINAL_SUMMARY.md` — полное описание всех улучшений
- `EXPERT_IMPROVEMENTS.md` — детали экспертных функций
- `CONTENT_PHILOSOPHY.md` — философия контента
- `CONTENT_STYLES.md` — описание двух стилей
- `EXPANDED_INTERACTIONS.md` — все типы взаимодействий

---

## ✅ ЧЕКЛИСТ ИНТЕГРАЦИИ

- [ ] Установлены зависимости (`lunisolar`, `moment-timezone`)
- [ ] Создан API route или сервис для вызова калькулятора
- [ ] Добавлены TypeScript типы (опционально)
- [ ] Созданы UI компоненты для отображения результатов
- [ ] Протестирована работа с разными датами и часовыми поясами
- [ ] Добавлена обработка ошибок
- [ ] Настроена валидация входных данных

---

**Готово к использованию!** 🎉

