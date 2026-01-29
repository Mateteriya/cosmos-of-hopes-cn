/**
 * Quest program types for monthly flow.
 */

export type QuestProgramMode = 'bazi' | 'name' | 'template' | 'combined';

export type LocaleCode = 'en' | 'ru' | 'zh';

export type TranslationMap<T> = Partial<Record<LocaleCode, T>>;

export interface QuestMonthProgramText {
  title?: string;
  theme?: string;
  intent?: string;
  focusAreas?: string[];
}

export interface QuestNarrativeText {
  role?: string;
  archetype?: string;
  heroRole?: string;
  opening?: string;
  closing?: string;
}

export interface QuestProgramSourceText {
  notes?: string;
  combinedInsights?: string[];
}

export interface QuestBaziSourceText {
  year?: string;
  elementFocus?: string;
  chartSummary?: string;
  recommendations?: string[];
  warning?: string;
}

export interface QuestNumerologySourceText {
  nameNumberLabel?: string;
  lifePathNumberLabel?: string;
  themes?: string[];
  recommendations?: string[];
  notes?: string;
}

export interface QuestTaskText {
  title?: string;
  summary?: string;
  instructions?: string[];
  completionCriteria?: string;
  safetyNotes?: string[];
}

export interface QuestWeekPlanText {
  title?: string;
  focus?: string;
}

export interface QuestRitualText {
  title?: string;
  steps?: string[];
}

export interface QuestCheckpointText {
  label?: string;
  prompts?: string[];
}

export interface QuestChecklistItemText {
  label?: string;
  description?: string;
}

export interface QuestCheckInQuestionText {
  prompt?: string;
  options?: string[];
  relatedFocus?: string;
}

export interface QuestMetricText {
  label?: string;
  unit?: string;
}

export interface QuestMonthCheckInText {
  reflectionPrompts?: string[];
}

export interface QuestMonthOutcomeText {
  summary?: string;
  achievements?: string[];
  artifacts?: string[];
}

export interface QuestMapUnlockText {
  title?: string;
  condition?: string;
}

export interface QuestMonthConstraintsText {
  skipPolicy?: string;
  repeatPolicy?: string;
}

export interface QuestPersonalWishText {
  title?: string;
  description?: string;
  motivation?: string;
  alignment?: string;
  monthlyStep?: string;
  milestones?: string[];
  safetyNotes?: string[];
}

export type QuestTaskKind = 'mission' | 'habit' | 'ritual' | 'reflection' | 'challenge' | 'support';

export type QuestCadence = 'daily' | 'weekly' | 'biweekly' | 'one_time' | 'monthly';

export type QuestEffort = 'low' | 'medium' | 'high';

export type QuestQuestionType = 'scale' | 'single_choice' | 'multi_choice' | 'text' | 'boolean';

export type QuestAnswer = string | number | boolean | string[];

export interface QuestBaziSource {
  year: string;
  elementFocus?: string;
  chartSummary?: string;
  recommendations?: string[];
  warning?: string;
  translations?: TranslationMap<QuestBaziSourceText>;
}

export interface QuestNumerologySource {
  nameNumber?: number;
  lifePathNumber?: number;
  themes?: string[];
  recommendations?: string[];
  notes?: string;
  translations?: TranslationMap<QuestNumerologySourceText>;
}

export interface QuestProgramSource {
  mode: QuestProgramMode;
  signals: string[];
  notes?: string;
  combinedInsights?: string[];
  bazi?: QuestBaziSource;
  numerology?: QuestNumerologySource;
  translations?: TranslationMap<QuestProgramSourceText>;
}

export interface QuestNarrative {
  role: string;
  archetype: string;
  heroRole: string;
  opening: string;
  closing: string;
  translations?: TranslationMap<QuestNarrativeText>;
}

export interface QuestMonthConstraints {
  maxWeeklyTasks: number;
  maxDailyTasks: number;
  allowSkip: boolean;
  skipPolicy?: string;
  repeatPolicy?: string;
  translations?: TranslationMap<QuestMonthConstraintsText>;
}

export interface QuestTask {
  id: string;
  title: string;
  summary: string;
  kind: QuestTaskKind;
  cadence: QuestCadence;
  effort: QuestEffort;
  durationMinutes?: number;
  instructions: string[];
  completionCriteria: string;
  optional?: boolean;
  tags?: string[];
  relatedSkills?: string[];
  safetyNotes?: string[];
  translations?: TranslationMap<QuestTaskText>;
}

export interface QuestWeekPlan {
  weekIndex: number;
  title: string;
  focus: string;
  taskIds: string[];
  translations?: TranslationMap<QuestWeekPlanText>;
}

export interface QuestRitual {
  id: string;
  title: string;
  cadence: QuestCadence;
  steps: string[];
  taskIds?: string[];
  translations?: TranslationMap<QuestRitualText>;
}

export interface QuestMonthSchedule {
  weeks: QuestWeekPlan[];
  rituals: QuestRitual[];
}

export interface QuestCheckpoint {
  id: string;
  label: string;
  dayOfMonth: number;
  prompts: string[];
  required: boolean;
  translations?: TranslationMap<QuestCheckpointText>;
}

export interface QuestChecklistItem {
  id: string;
  label: string;
  description?: string;
  relatedTaskIds?: string[];
  translations?: TranslationMap<QuestChecklistItemText>;
}

export interface QuestCheckInQuestion {
  id: string;
  prompt: string;
  type: QuestQuestionType;
  required: boolean;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  relatedFocus?: string;
  translations?: TranslationMap<QuestCheckInQuestionText>;
}

export interface QuestMetric {
  id: string;
  label: string;
  unit?: string;
  target?: number;
  min?: number;
  max?: number;
  relatedTaskIds?: string[];
  translations?: TranslationMap<QuestMetricText>;
}

export interface QuestMonthCheckIn {
  checklist: QuestChecklistItem[];
  questions: QuestCheckInQuestion[];
  metrics: QuestMetric[];
  reflectionPrompts: string[];
  translations?: TranslationMap<QuestMonthCheckInText>;
}

export interface QuestMapUnlock {
  id: string;
  title: string;
  condition: string;
  when: 'mid_month' | 'end_month';
  translations?: TranslationMap<QuestMapUnlockText>;
}

export interface QuestMapProgression {
  visualTheme?: string;
  buildingUnlocks: QuestMapUnlock[];
}

export interface QuestPersonalWish {
  title: string;
  description: string;
  motivation: string;
  alignment: string;
  monthlyStep: string;
  milestones?: string[];
  supportTaskIds?: string[];
  safetyNotes?: string[];
  translations?: TranslationMap<QuestPersonalWishText>;
}

export interface QuestNextMonthGate {
  requiredChecklistIds: string[];
  minimumScore?: number;
  fallbackMonthId?: string;
}

export interface QuestMonthOutcome {
  summary: string;
  achievements: string[];
  artifacts: string[];
  nextMonthGate: QuestNextMonthGate;
  translations?: TranslationMap<QuestMonthOutcomeText>;
}

export interface QuestMonthProgram {
  id: string;
  version: string;
  monthIndex: number;
  title: string;
  theme: string;
  intent: string;
  focusAreas: string[];
  translations?: TranslationMap<QuestMonthProgramText>;
  narrative: QuestNarrative;
  source: QuestProgramSource;
  constraints: QuestMonthConstraints;
  tasks: QuestTask[];
  schedule: QuestMonthSchedule;
  checkpoints: QuestCheckpoint[];
  endCheckIn: QuestMonthCheckIn;
  outcome: QuestMonthOutcome;
  mapProgress: QuestMapProgression;
  personalWish?: QuestPersonalWish;
}

export interface QuestMonthCompletionReport {
  monthId: string;
  completedTaskIds: string[];
  skippedTaskIds: string[];
  repeatedTaskIds: string[];
  checklistResults: Record<string, boolean>;
  answers: Record<string, QuestAnswer>;
  metricValues: Record<string, number>;
  notes?: string;
}

export type QuestAdjustmentType =
  | 'reduce_scope'
  | 'increase_scope'
  | 'swap_focus'
  | 'carry_over_task'
  | 'drop_task'
  | 'add_support';

export interface QuestAdjustment {
  type: QuestAdjustmentType;
  reason: string;
  taskId?: string;
  focusArea?: string;
}

export interface QuestNextMonthPlan {
  nextMonthId: string;
  summary: string;
  adjustments: QuestAdjustment[];
  carryOverTaskIds: string[];
  dropTaskIds: string[];
  warnings: string[];
  encouragement: string;
}
