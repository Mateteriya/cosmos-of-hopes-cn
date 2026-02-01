/**
 * Библиотека правил модерации контента
 * Бесплатное решение для проверки текста и файлов
 */

// ============================================================================
// ЗАПРЕЩЕННЫЕ СЛОВА И ФРАЗЫ
// ============================================================================

import { FORBIDDEN_WORDS_BASE, FORBIDDEN_WORDS_STRICT } from './moderation-words';

/**
 * Базовый список запрещенных слов (матерные слова, оскорбления)
 * Импортируется из moderation-words.ts для удобства редактирования
 */
const FORBIDDEN_WORDS = FORBIDDEN_WORDS_BASE;

/**
 * Расширенный список запрещенных слов (более строгий, на сервере)
 * Импортируется из moderation-words.ts для удобства редактирования
 */
const STRICT_FORBIDDEN_WORDS = FORBIDDEN_WORDS_STRICT;

// ============================================================================
// ПАТТЕРНЫ ДЛЯ ОБНАРУЖЕНИЯ СПАМА
// ============================================================================

/**
 * Регулярные выражения для обнаружения спама и вредного контента
 */
const SPAM_PATTERNS = {
  // Ссылки (http, https, www)
  url: /https?:\/\/|www\./i,
  
  // Email адреса
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i,
  
  // Телефоны (различные форматы)
  phone: /\+?[0-9]{1,3}[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/i,
  
  // Криптовалютные адреса
  crypto: /[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59}/i,
  
  // Telegram, WhatsApp и другие мессенджеры
  messenger: /@[a-zA-Z0-9_]{5,}|telegram|whatsapp|vk\.com|t\.me/i,
};

// ============================================================================
// ИНТЕРФЕЙСЫ И ТИПЫ
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
  reason?: 'forbidden_word' | 'spam' | 'too_long' | 'too_short' | 'invalid_file' | 'file_too_large' | 'repetition';
}

export interface ModerationConfig {
  strict?: boolean; // Использовать строгий список запрещенных слов
  maxLength?: number; // Максимальная длина текста
  minLength?: number; // Минимальная длина текста
  maxFileSize?: number; // Максимальный размер файла в байтах
  allowedFileTypes?: string[]; // Разрешенные типы файлов
  checkRepetition?: boolean; // Проверять на повторения
  maxRepetitions?: number; // Максимальное количество повторений одного слова
}

// ============================================================================
// ФУНКЦИИ ПРОВЕРКИ
// ============================================================================

/**
 * Проверяет текст на запрещенные слова
 */
function checkForbiddenWords(text: string, strict: boolean = false): ValidationResult {
  const words = strict ? STRICT_FORBIDDEN_WORDS : FORBIDDEN_WORDS;
  const lowerText = text.toLowerCase();
  
  // Проверяем каждое запрещенное слово
  for (const word of words) {
    if (lowerText.includes(word.toLowerCase())) {
      return {
        valid: false,
        error: 'Текст содержит запрещенные слова или фразы',
        reason: 'forbidden_word',
      };
    }
  }
  
  return { valid: true };
}

/**
 * Проверяет текст на спам-паттерны
 */
function checkSpamPatterns(text: string): ValidationResult {
  // Проверяем все паттерны спама
  for (const [patternName, pattern] of Object.entries(SPAM_PATTERNS)) {
    if (pattern.test(text)) {
      const errorMessages: Record<string, string> = {
        url: 'Текст содержит ссылки (URL)',
        email: 'Текст содержит email адреса',
        phone: 'Текст содержит номера телефонов',
        crypto: 'Текст содержит криптовалютные адреса',
        messenger: 'Текст содержит контакты мессенджеров',
      };
      
      return {
        valid: false,
        error: errorMessages[patternName] || 'Текст содержит запрещенные элементы',
        reason: 'spam',
      };
    }
  }
  
  return { valid: true };
}

/**
 * Проверяет длину текста
 */
function checkTextLength(text: string, maxLength?: number, minLength?: number): ValidationResult {
  if (maxLength !== undefined && text.length > maxLength) {
    return {
      valid: false,
      error: `Текст слишком длинный (макс. ${maxLength} символов)`,
      reason: 'too_long',
    };
  }
  
  if (minLength !== undefined && text.length < minLength) {
    return {
      valid: false,
      error: `Текст слишком короткий (мин. ${minLength} символов)`,
      reason: 'too_short',
    };
  }
  
  return { valid: true };
}

/**
 * Проверяет текст на повторения (признак спама)
 */
function checkRepetition(text: string, maxRepetitions: number = 5): ValidationResult {
  const words = text.toLowerCase().split(/\s+/);
  const wordCounts: Record<string, number> = {};
  
  for (const word of words) {
    // Игнорируем очень короткие слова
    if (word.length < 3) continue;
    
    wordCounts[word] = (wordCounts[word] || 0) + 1;
    if (wordCounts[word] > maxRepetitions) {
      return {
        valid: false,
        error: 'Текст содержит слишком много повторений',
        reason: 'repetition',
      };
    }
  }
  
  return { valid: true };
}

/**
 * Проверяет файл на размер и тип
 */
function validateFile(file: File, maxSize?: number, allowedTypes?: string[]): ValidationResult {
  // Проверка размера
  if (maxSize !== undefined && file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Файл слишком большой (макс. ${maxSizeMB} MB)`,
      reason: 'file_too_large',
    };
  }
  
  // Проверка типа файла
  if (allowedTypes !== undefined && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Неподдерживаемый тип файла. Разрешены: ${allowedTypes.join(', ')}`,
      reason: 'invalid_file',
    };
  }
  
  return { valid: true };
}

// ============================================================================
// ОСНОВНЫЕ ФУНКЦИИ МОДЕРАЦИИ
// ============================================================================

/**
 * Проверяет текст контента на соответствие правилам модерации
 * 
 * @param text - Текст для проверки
 * @param config - Конфигурация проверки
 * @returns Результат проверки
 */
export function moderateText(text: string, config: ModerationConfig = {}): ValidationResult {
  const {
    strict = false,
    maxLength = 200,
    minLength = 1,
    checkRepetition: checkRep = true,
    maxRepetitions = 5,
  } = config;
  
  // 1. Проверка длины
  const lengthCheck = checkTextLength(text, maxLength, minLength);
  if (!lengthCheck.valid) {
    return lengthCheck;
  }
  
  // 2. Проверка на запрещенные слова
  const forbiddenCheck = checkForbiddenWords(text, strict);
  if (!forbiddenCheck.valid) {
    return forbiddenCheck;
  }
  
  // 3. Проверка на спам-паттерны
  const spamCheck = checkSpamPatterns(text);
  if (!spamCheck.valid) {
    return spamCheck;
  }
  
  // 4. Проверка на повторения (если включена)
  if (checkRep) {
    const repetitionCheck = checkRepetition(text, maxRepetitions);
    if (!repetitionCheck.valid) {
      return repetitionCheck;
    }
  }
  
  // Все проверки пройдены
  return { valid: true };
}

/**
 * Проверяет файл на соответствие правилам модерации
 * 
 * @param file - Файл для проверки
 * @param config - Конфигурация проверки
 * @returns Результат проверки
 */
export function moderateFile(file: File, config: ModerationConfig = {}): ValidationResult {
  const {
    maxFileSize = 5 * 1024 * 1024, // 5MB по умолчанию
    allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = config;
  
  return validateFile(file, maxFileSize, allowedFileTypes);
}

/**
 * Комплексная проверка контента (текст + файл)
 * 
 * @param text - Текст для проверки
 * @param file - Файл для проверки (опционально)
 * @param config - Конфигурация проверки
 * @returns Результат проверки
 */
export function moderateContent(
  text: string,
  file?: File,
  config: ModerationConfig = {}
): ValidationResult {
  // Проверяем текст
  const textCheck = moderateText(text, config);
  if (!textCheck.valid) {
    return textCheck;
  }
  
  // Проверяем файл (если есть)
  if (file) {
    const fileCheck = moderateFile(file, config);
    if (!fileCheck.valid) {
      return fileCheck;
    }
  }
  
  // Все проверки пройдены
  return { valid: true };
}

// ============================================================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С ЗАПРЕЩЕННЫМИ СЛОВАМИ
// ============================================================================

/**
 * Добавляет запрещенное слово в список (в runtime)
 * ВАЖНО: Это не сохраняется между сеансами, для постоянного сохранения нужно редактировать FORBIDDEN_WORDS
 */
export function addForbiddenWord(word: string, strict: boolean = false): void {
  const words = strict ? STRICT_FORBIDDEN_WORDS : FORBIDDEN_WORDS;
  if (!words.includes(word.toLowerCase())) {
    words.push(word.toLowerCase());
  }
}

/**
 * Проверяет, содержит ли текст запрещенные слова (без полной модерации)
 */
export function containsForbiddenWords(text: string, strict: boolean = false): boolean {
  return !checkForbiddenWords(text, strict).valid;
}

/**
 * Проверяет, содержит ли текст спам-паттерны (без полной модерации)
 */
export function containsSpamPatterns(text: string): boolean {
  return !checkSpamPatterns(text).valid;
}

// ============================================================================
// КОНФИГУРАЦИЯ ПО УМОЛЧАНИЮ
// ============================================================================

/**
 * Конфигурация по умолчанию для проверки желаний (wish_text)
 */
export const DEFAULT_WISH_CONFIG: ModerationConfig = {
  maxLength: 200,
  minLength: 1,
  strict: false,
  checkRepetition: true,
  maxRepetitions: 5,
};

/**
 * Конфигурация по умолчанию для проверки файлов (фото пользователей)
 */
export const DEFAULT_FILE_CONFIG: ModerationConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

/**
 * Конфигурация по умолчанию для строгой проверки (на сервере)
 */
export const STRICT_CONFIG: ModerationConfig = {
  maxLength: 200,
  minLength: 1,
  strict: true,
  checkRepetition: true,
  maxRepetitions: 3, // Более строго
};
