import { QuestMonthProgram } from '@/types/quest';

export const monthTemplate: QuestMonthProgram = {
  id: 'month-01-awareness-foundation',
  version: '1.0.0',
  monthIndex: 1,
  title: 'Month 1: Awareness Foundation',
  theme: 'Self-observation and gentle structure',
  intent: 'Build baseline awareness, notice patterns, and establish simple rituals.',
  focusAreas: ['attention', 'energy', 'habits'],
  translations: {
    ru: {
      title: 'Месяц 1: Основа осознанности',
      theme: 'Самонаблюдение и мягкая структура',
      intent: 'Создать базовую осознанность, заметить паттерны и выстроить простые ритуалы.',
      focusAreas: ['внимание', 'энергия', 'привычки'],
    },
  },
  narrative: {
    role: 'Observer',
    archetype: 'The Watcher',
    heroRole: 'Observer',
    opening: 'You enter the quest as an observer. The goal is to notice without judgment.',
    closing: 'You leave the month with a clear baseline and a map of key patterns.',
    translations: {
      ru: {
        role: 'Наблюдатель',
        archetype: 'Смотритель',
        heroRole: 'Наблюдатель',
        opening: 'Ты входишь в квест как наблюдатель. Цель — замечать без оценок.',
        closing: 'Ты завершаешь месяц с ясной базой и картой ключевых паттернов.',
      },
    },
  },
  source: {
    mode: 'template',
    signals: ['baseline month', 'low intensity', 'foundation'],
    notes: 'Use before personalized months or as a safe fallback.',
    combinedInsights: ['Baseline month before personalization.', 'Low intensity to build consistency.'],
    bazi: {
      year: '2026 Fire Horse',
      elementFocus: 'fire',
      chartSummary: 'Year energy supports movement, courage, and direct action.',
      recommendations: ['Start with short decisive actions.', 'Notice where intensity rises quickly.'],
      warning: 'Avoid burnout by pacing yourself.',
      translations: {
        ru: {
          year: '2026 Огненная Лошадь',
          elementFocus: 'огонь',
          chartSummary: 'Энергия года поддерживает движение, смелость и прямые действия.',
          recommendations: ['Начинай с коротких решительных шагов.', 'Отмечай, где интенсивность быстро растет.'],
          warning: 'Береги себя от выгорания, держи темп.',
        },
      },
    },
    numerology: {
      themes: ['self-discipline', 'inner balance'],
      recommendations: ['Use simple daily anchors to stay consistent.'],
      notes: 'Template layer until personal numerology is available.',
      translations: {
        ru: {
          nameNumberLabel: 'Число имени',
          lifePathNumberLabel: 'Число жизненного пути',
          themes: ['самодисциплина', 'внутренний баланс'],
          recommendations: ['Используй простые ежедневные якоря для устойчивости.'],
          notes: 'Шаблонный слой до персональной нумерологии.',
        },
      },
    },
    translations: {
      ru: {
        notes: 'Использовать перед персонализированными месяцами или как безопасный вариант.',
        combinedInsights: ['Базовый месяц перед персонализацией.', 'Низкая интенсивность для устойчивости.'],
      },
    },
  },
  constraints: {
    maxWeeklyTasks: 6,
    maxDailyTasks: 3,
    allowSkip: true,
    skipPolicy: 'You may skip up to 2 tasks per week without penalty.',
    repeatPolicy: 'You may repeat any completed task to gain confidence.',
    translations: {
      ru: {
        skipPolicy: 'Можно пропустить до 2 задач в неделю без штрафа.',
        repeatPolicy: 'Можно повторять выполненные задачи, чтобы укрепить привычку.',
      },
    },
  },
  tasks: [
    {
      id: 'task-observer-log',
      title: 'Observer log',
      summary: 'Write short notes about energy, triggers, and wins.',
      kind: 'habit',
      cadence: 'daily',
      effort: 'low',
      durationMinutes: 5,
      instructions: [
        'Morning: rate energy from 1-5.',
        'Evening: note one trigger and one win.',
        'Keep it short and factual.',
      ],
      completionCriteria: 'At least 2 notes completed in a day.',
      optional: false,
      tags: ['awareness', 'journal'],
      relatedSkills: ['self-observation'],
      translations: {
        ru: {
          title: 'Дневник наблюдателя',
          summary: 'Короткие записи про энергию, триггеры и победы.',
          instructions: [
            'Утром: оцени энергию по шкале 1-5.',
            'Вечером: отметь один триггер и одну победу.',
            'Пиши коротко и по фактам.',
          ],
          completionCriteria: 'Не менее 2 записей за день.',
        },
      },
    },
    {
      id: 'task-micro-pause',
      title: 'Micro pause',
      summary: 'Take three short pauses to reset attention.',
      kind: 'habit',
      cadence: 'daily',
      effort: 'low',
      durationMinutes: 3,
      instructions: [
        'Set a reminder for three moments in the day.',
        'Pause, breathe slowly for 30 seconds, and label your current state.',
      ],
      completionCriteria: 'Three pauses completed in a day.',
      optional: false,
      tags: ['attention', 'reset'],
      relatedSkills: ['emotional regulation'],
      translations: {
        ru: {
          title: 'Микропауза',
          summary: 'Три короткие паузы для перезагрузки внимания.',
          instructions: [
            'Поставь напоминание на три момента в день.',
            'Остановись, подыши 30 секунд и назови свое состояние.',
          ],
          completionCriteria: 'Три паузы за день.',
        },
      },
    },
    {
      id: 'task-energy-audit',
      title: 'Energy audit',
      summary: 'Map activities that drain or recharge you.',
      kind: 'mission',
      cadence: 'one_time',
      effort: 'medium',
      durationMinutes: 40,
      instructions: [
        'List 5 activities that drain energy.',
        'List 5 activities that recharge energy.',
        'Pick one quick change for the next week.',
      ],
      completionCriteria: 'Two lists created and one change selected.',
      optional: false,
      tags: ['energy', 'planning'],
      translations: {
        ru: {
          title: 'Аудит энергии',
          summary: 'Карта действий, которые забирают или восстанавливают силы.',
          instructions: [
            'Составь список из 5 источников утечки энергии.',
            'Составь список из 5 источников восстановления.',
            'Выбери одно быстрое изменение на следующую неделю.',
          ],
          completionCriteria: 'Два списка составлены и одно изменение выбрано.',
        },
      },
    },
    {
      id: 'task-trigger-map',
      title: 'Trigger map',
      summary: 'Capture common trigger patterns and responses.',
      kind: 'mission',
      cadence: 'weekly',
      effort: 'medium',
      durationMinutes: 30,
      instructions: [
        'Pick one difficult moment from the week.',
        'Write: situation, feelings, reaction, better response.',
      ],
      completionCriteria: 'One trigger map completed each week.',
      optional: false,
      tags: ['awareness', 'patterns'],
      translations: {
        ru: {
          title: 'Карта триггеров',
          summary: 'Фиксация типичных триггеров и реакций.',
          instructions: [
            'Выбери один сложный момент недели.',
            'Запиши: ситуация, чувства, реакция, лучший ответ.',
          ],
          completionCriteria: 'Одна карта триггеров в неделю.',
        },
      },
    },
    {
      id: 'task-sleep-window',
      title: 'Sleep window',
      summary: 'Keep a stable sleep window at least 4 days a week.',
      kind: 'support',
      cadence: 'weekly',
      effort: 'medium',
      durationMinutes: 0,
      instructions: [
        'Set a preferred sleep window.',
        'Aim to follow it at least 4 days each week.',
      ],
      completionCriteria: 'Sleep window kept 4 days in a week.',
      optional: true,
      tags: ['energy', 'recovery'],
      translations: {
        ru: {
          title: 'Окно сна',
          summary: 'Стабильное окно сна минимум 4 дня в неделю.',
          instructions: [
            'Задай желаемое окно сна.',
            'Старайся соблюдать его минимум 4 дня.',
          ],
          completionCriteria: 'Окно сна соблюдено 4 дня за неделю.',
        },
      },
    },
    {
      id: 'task-weekly-review',
      title: 'Weekly review',
      summary: 'Review logs and select one adjustment.',
      kind: 'reflection',
      cadence: 'weekly',
      effort: 'low',
      durationMinutes: 20,
      instructions: [
        'Read your observer logs.',
        'Choose one thing to keep and one to change.',
      ],
      completionCriteria: 'One review and one adjustment recorded each week.',
      optional: false,
      tags: ['reflection', 'planning'],
      translations: {
        ru: {
          title: 'Еженедельный обзор',
          summary: 'Просмотри записи и выбери одно изменение.',
          instructions: [
            'Прочитай дневник наблюдателя.',
            'Выбери одно, что оставить, и одно, что изменить.',
          ],
          completionCriteria: 'Обзор и одно изменение записаны каждую неделю.',
        },
      },
    },
  ],
  schedule: {
    weeks: [
      {
        weekIndex: 1,
        title: 'Week 1: Baseline map',
        focus: 'Track energy and attention',
        taskIds: ['task-observer-log', 'task-micro-pause', 'task-energy-audit', 'task-weekly-review'],
        translations: {
          ru: {
            title: 'Неделя 1: Базовая карта',
            focus: 'Отслеживание энергии и внимания',
          },
        },
      },
      {
        weekIndex: 2,
        title: 'Week 2: Triggers',
        focus: 'Notice repeating patterns',
        taskIds: ['task-observer-log', 'task-micro-pause', 'task-trigger-map', 'task-weekly-review'],
        translations: {
          ru: {
            title: 'Неделя 2: Триггеры',
            focus: 'Замечать повторяющиеся паттерны',
          },
        },
      },
      {
        weekIndex: 3,
        title: 'Week 3: Recovery',
        focus: 'Stabilize energy',
        taskIds: ['task-observer-log', 'task-micro-pause', 'task-sleep-window', 'task-weekly-review'],
        translations: {
          ru: {
            title: 'Неделя 3: Восстановление',
            focus: 'Стабилизировать энергию',
          },
        },
      },
      {
        weekIndex: 4,
        title: 'Week 4: Integration',
        focus: 'Keep what works',
        taskIds: ['task-observer-log', 'task-micro-pause', 'task-trigger-map', 'task-weekly-review'],
        translations: {
          ru: {
            title: 'Неделя 4: Интеграция',
            focus: 'Сохранить то, что работает',
          },
        },
      },
    ],
    rituals: [
      {
        id: 'ritual-kickoff',
        title: 'Monthly kickoff',
        cadence: 'monthly',
        steps: [
          'Choose your primary focus area.',
          'Write your baseline expectation for the month.',
        ],
        taskIds: ['task-energy-audit'],
        translations: {
          ru: {
            title: 'Старт месяца',
            steps: ['Выбери основную область фокуса.', 'Запиши базовое ожидание на месяц.'],
          },
        },
      },
      {
        id: 'ritual-weekly-review',
        title: 'Weekly review ritual',
        cadence: 'weekly',
        steps: ['Read the observer log.', 'Write one adjustment for the next week.'],
        taskIds: ['task-weekly-review'],
        translations: {
          ru: {
            title: 'Ритуал недельного обзора',
            steps: ['Прочитай дневник наблюдателя.', 'Запиши одно изменение на следующую неделю.'],
          },
        },
      },
      {
        id: 'ritual-closure',
        title: 'Month closing',
        cadence: 'monthly',
        steps: ['Complete the end-of-month check-in.', 'Celebrate one win.'],
        translations: {
          ru: {
            title: 'Закрытие месяца',
            steps: ['Заполни финальный чек-ин.', 'Отпразднуй одну победу.'],
          },
        },
      },
    ],
  },
  checkpoints: [
    {
      id: 'checkpoint-mid',
      label: 'Mid-month pulse',
      dayOfMonth: 15,
      prompts: ['What pattern is most visible now?', 'What needs to be simplified?'],
      required: false,
      translations: {
        ru: {
          label: 'Пульс середины месяца',
          prompts: ['Какой паттерн сейчас заметнее всего?', 'Что нужно упростить?'],
        },
      },
    },
  ],
  endCheckIn: {
    checklist: [
      {
        id: 'checklist-observer-log',
        label: 'Observer log completed at least 20 days.',
        relatedTaskIds: ['task-observer-log'],
        translations: {
          ru: {
            label: 'Дневник наблюдателя заполнен минимум 20 дней.',
          },
        },
      },
      {
        id: 'checklist-trigger-map',
        label: 'Trigger map completed at least 3 times.',
        relatedTaskIds: ['task-trigger-map'],
        translations: {
          ru: {
            label: 'Карта триггеров выполнена минимум 3 раза.',
          },
        },
      },
      {
        id: 'checklist-weekly-review',
        label: 'Weekly review completed every week.',
        relatedTaskIds: ['task-weekly-review'],
        translations: {
          ru: {
            label: 'Еженедельный обзор выполнен каждую неделю.',
          },
        },
      },
    ],
    questions: [
      {
        id: 'question-consistency',
        prompt: 'How consistent were you with the observer log?',
        type: 'scale',
        required: true,
        scaleMin: 1,
        scaleMax: 5,
        relatedFocus: 'attention',
        translations: {
          ru: {
            prompt: 'Насколько стабильным был дневник наблюдателя?',
            relatedFocus: 'внимание',
          },
        },
      },
      {
        id: 'question-strongest-area',
        prompt: 'Which focus area felt strongest?',
        type: 'single_choice',
        required: true,
        options: ['attention', 'energy', 'habits'],
        translations: {
          ru: {
            prompt: 'Какая область фокуса была сильнее всего?',
            options: ['внимание', 'энергия', 'привычки'],
          },
        },
      },
      {
        id: 'question-learning',
        prompt: 'What did you learn about your triggers?',
        type: 'text',
        required: false,
        translations: {
          ru: {
            prompt: 'Что ты понял(а) о своих триггерах?',
          },
        },
      },
      {
        id: 'question-sleep-window',
        prompt: 'Did you keep the sleep window 4+ days per week?',
        type: 'boolean',
        required: false,
        relatedFocus: 'energy',
        translations: {
          ru: {
            prompt: 'Удалось держать окно сна 4+ дней в неделю?',
            relatedFocus: 'энергия',
          },
        },
      },
    ],
    metrics: [
      {
        id: 'metric-log-days',
        label: 'Days with observer log',
        unit: 'days',
        target: 20,
        min: 0,
        max: 31,
        relatedTaskIds: ['task-observer-log'],
        translations: {
          ru: {
            label: 'Дни с дневником наблюдателя',
            unit: 'дни',
          },
        },
      },
      {
        id: 'metric-pauses',
        label: 'Total micro pauses',
        unit: 'pauses',
        target: 60,
        min: 0,
        relatedTaskIds: ['task-micro-pause'],
        translations: {
          ru: {
            label: 'Всего микропауз',
            unit: 'паузы',
          },
        },
      },
      {
        id: 'metric-sleep-days',
        label: 'Sleep window days',
        unit: 'days',
        target: 16,
        min: 0,
        relatedTaskIds: ['task-sleep-window'],
        translations: {
          ru: {
            label: 'Дни с окном сна',
            unit: 'дни',
          },
        },
      },
    ],
    reflectionPrompts: [
      'What was the most surprising pattern you noticed?',
      'Which task felt easiest and why?',
      'What would you simplify next month?',
    ],
    translations: {
      ru: {
        reflectionPrompts: [
          'Какой паттерн оказался самым неожиданным?',
          'Какая задача давалась проще всего и почему?',
          'Что ты хочешь упростить в следующем месяце?',
        ],
      },
    },
  },
  outcome: {
    summary: 'Baseline awareness captured and first rituals established.',
    achievements: ['Self-observation baseline', 'Weekly reflection habit'],
    artifacts: ['Energy audit list', 'Trigger maps'],
    nextMonthGate: {
      requiredChecklistIds: ['checklist-observer-log', 'checklist-weekly-review'],
      minimumScore: 2,
      fallbackMonthId: 'month-01-awareness-foundation',
    },
    translations: {
      ru: {
        summary: 'Базовая осознанность зафиксирована, первые ритуалы закреплены.',
        achievements: ['Базовая самонаблюдательность', 'Привычка еженедельной рефлексии'],
        artifacts: ['Список аудита энергии', 'Карты триггеров'],
      },
    },
  },
  mapProgress: {
    visualTheme: 'foundation',
    buildingUnlocks: [
      {
        id: 'unlock-observer-tower',
        title: 'Observer Tower',
        condition: 'Complete the observer log at least 20 days.',
        when: 'end_month',
        translations: {
          ru: {
            title: 'Башня наблюдателя',
            condition: 'Заполни дневник наблюдателя минимум 20 дней.',
          },
        },
      },
      {
        id: 'unlock-compass-room',
        title: 'Compass Room',
        condition: 'Complete at least 3 trigger maps.',
        when: 'end_month',
        translations: {
          ru: {
            title: 'Комната компаса',
            condition: 'Сделай минимум 3 карты триггеров.',
          },
        },
      },
    ],
  },
  personalWish: {
    title: 'Personal wish',
    description: 'Define one meaningful wish you want to move toward this year.',
    motivation: 'Connect it with why it matters to you.',
    alignment: 'This month focuses on clarity and energy stability.',
    monthlyStep: 'Pick one small action that supports the wish.',
    milestones: ['Write the wish in one sentence.', 'Choose the first step for next month.'],
    supportTaskIds: ['task-observer-log', 'task-weekly-review'],
    safetyNotes: ['Keep it realistic and kind to yourself.'],
    translations: {
      ru: {
        title: 'Личное желание',
        description: 'Опиши одно важное желание, к которому хочешь приблизиться в этом году.',
        motivation: 'Свяжи его с тем, почему это важно для тебя.',
        alignment: 'В этом месяце фокус на ясности и стабильности энергии.',
        monthlyStep: 'Выбери одно маленькое действие, которое поддержит желание.',
        milestones: ['Сформулировать желание одним предложением.', 'Выбрать первый шаг на следующий месяц.'],
        safetyNotes: ['Держи цель реалистичной и бережной к себе.'],
      },
    },
  },
};

export default monthTemplate;
