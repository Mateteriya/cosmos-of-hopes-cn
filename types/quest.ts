/**
 * Quest program types for monthly flow.
 */

export type QuestProgramMode = 'bazi' | 'name' | 'template' | 'combined';

export type QuestTaskKind = 'mission' | 'habit' | 'ritual' | 'reflection' | 'challenge' | 'support';

export type QuestCadence = 'daily' | 'weekly' | 'biweekly' | 'one_time' | 'monthly';

export type QuestEffort = 'low' | 'medium' | 'high';

export type QuestQuestionType = 'scale' | 'single_choice' | 'multi_choice' | 'text' | 'boolean';

export type QuestAnswer = string | number | boolean | string[];

export interface QuestProgramSource {
  mode: QuestProgramMode;
  signals: string[];
  notes?: string;
}

export interface QuestNarrative {
  role: string;
  opening: string;
  closing: string;
}

export interface QuestMonthConstraints {
  maxWeeklyTasks: number;
  maxDailyTasks: number;
  allowSkip: boolean;
  skipPolicy?: string;
  repeatPolicy?: string;
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
}

export interface QuestWeekPlan {
  weekIndex: number;
  title: string;
  focus: string;
  taskIds: string[];
}

export interface QuestRitual {
  id: string;
  title: string;
  cadence: QuestCadence;
  steps: string[];
  taskIds?: string[];
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
}

export interface QuestChecklistItem {
  id: string;
  label: string;
  description?: string;
  relatedTaskIds?: string[];
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
}

export interface QuestMetric {
  id: string;
  label: string;
  unit?: string;
  target?: number;
  min?: number;
  max?: number;
  relatedTaskIds?: string[];
}

export interface QuestMonthCheckIn {
  checklist: QuestChecklistItem[];
  questions: QuestCheckInQuestion[];
  metrics: QuestMetric[];
  reflectionPrompts: string[];
}

export interface QuestMapUnlock {
  id: string;
  title: string;
  condition: string;
  when: 'mid_month' | 'end_month';
}

export interface QuestMapProgression {
  visualTheme?: string;
  buildingUnlocks: QuestMapUnlock[];
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
}

export interface QuestMonthProgram {
  id: string;
  version: string;
  monthIndex: number;
  title: string;
  theme: string;
  intent: string;
  focusAreas: string[];
  narrative: QuestNarrative;
  source: QuestProgramSource;
  constraints: QuestMonthConstraints;
  tasks: QuestTask[];
  schedule: QuestMonthSchedule;
  checkpoints: QuestCheckpoint[];
  endCheckIn: QuestMonthCheckIn;
  outcome: QuestMonthOutcome;
  mapProgress: QuestMapProgression;
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
