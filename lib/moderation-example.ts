/**
 * Примеры использования библиотеки модерации контента
 */

import { moderateText, moderateFile, moderateContent, DEFAULT_WISH_CONFIG, DEFAULT_FILE_CONFIG, STRICT_CONFIG } from './content-moderation';

// ============================================================================
// ПРИМЕР 1: Проверка текста желания (wish_text)
// ============================================================================

export function exampleModerateWishText() {
  // Пример 1: Безопасный текст
  const safeText = 'Хочу счастливого нового года и много радости!';
  const result1 = moderateText(safeText, DEFAULT_WISH_CONFIG);
  console.log('Безопасный текст:', result1);
  // Результат: { valid: true }
  
  // Пример 2: Текст с запрещенным словом
  const badText = 'Хочу куплю новую машину';
  const result2 = moderateText(badText, DEFAULT_WISH_CONFIG);
  console.log('Текст с запрещенным словом:', result2);
  // Результат: { valid: false, error: 'Текст содержит запрещенные слова или фразы', reason: 'forbidden_word' }
  
  // Пример 3: Текст со ссылкой (спам)
  const spamText = 'Хочу посетить сайт https://example.com';
  const result3 = moderateText(spamText, DEFAULT_WISH_CONFIG);
  console.log('Текст со ссылкой:', result3);
  // Результат: { valid: false, error: 'Текст содержит ссылки (URL)', reason: 'spam' }
  
  // Пример 4: Текст слишком длинный
  const longText = 'Хочу '.repeat(50); // 250 символов
  const result4 = moderateText(longText, DEFAULT_WISH_CONFIG);
  console.log('Слишком длинный текст:', result4);
  // Результат: { valid: false, error: 'Текст слишком длинный (макс. 200 символов)', reason: 'too_long' }
}

// ============================================================================
// ПРИМЕР 2: Проверка файла (фото пользователя)
// ============================================================================

export function exampleModerateFile() {
  // Создаем тестовый файл (в реальном использовании это будет File из input)
  const validFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
  Object.defineProperty(validFile, 'size', { value: 2 * 1024 * 1024 }); // 2MB
  
  const result1 = moderateFile(validFile, DEFAULT_FILE_CONFIG);
  console.log('Валидный файл:', result1);
  // Результат: { valid: true }
  
  // Слишком большой файл
  const largeFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
  Object.defineProperty(largeFile, 'size', { value: 10 * 1024 * 1024 }); // 10MB
  
  const result2 = moderateFile(largeFile, DEFAULT_FILE_CONFIG);
  console.log('Слишком большой файл:', result2);
  // Результат: { valid: false, error: 'Файл слишком большой (макс. 5.0 MB)', reason: 'file_too_large' }
  
  // Неподдерживаемый тип файла
  const pdfFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });
  const result3 = moderateFile(pdfFile, DEFAULT_FILE_CONFIG);
  console.log('Неподдерживаемый тип файла:', result3);
  // Результат: { valid: false, error: 'Неподдерживаемый тип файла...', reason: 'invalid_file' }
}

// ============================================================================
// ПРИМЕР 3: Комплексная проверка (текст + файл)
// ============================================================================

export function exampleModerateContent() {
  const text = 'Хочу счастливого нового года!';
  const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
  Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 }); // 2MB
  
  const result = moderateContent(text, file, {
    ...DEFAULT_WISH_CONFIG,
    ...DEFAULT_FILE_CONFIG,
  });
  console.log('Комплексная проверка:', result);
  // Результат: { valid: true } если всё в порядке
}

// ============================================================================
// ПРИМЕР 4: Использование в компоненте React
// ============================================================================

/*
// В компоненте создания амулета
import { moderateText, DEFAULT_WISH_CONFIG } from '@/lib/content-moderation';

function AmuletCreator() {
  const [wishText, setWishText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleWishChange = (text: string) => {
    setWishText(text);
    
    // Проверяем текст при вводе
    const result = moderateText(text, DEFAULT_WISH_CONFIG);
    if (!result.valid) {
      setError(result.error || 'Некорректный текст');
    } else {
      setError(null);
    }
  };
  
  const handleSave = () => {
    // Финальная проверка перед сохранением
    const result = moderateText(wishText, DEFAULT_WISH_CONFIG);
    if (!result.valid) {
      alert(result.error);
      return;
    }
    
    // Сохраняем амулет
    // ...
  };
  
  return (
    <div>
      <textarea
        value={wishText}
        onChange={(e) => handleWishChange(e.target.value)}
        maxLength={200}
      />
      {error && <div className="error">{error}</div>}
      <button onClick={handleSave}>Сохранить</button>
    </div>
  );
}
*/

// ============================================================================
// ПРИМЕР 5: Использование на сервере (строгая проверка)
// ============================================================================

/*
// В API route или серверной функции
import { moderateText, STRICT_CONFIG } from '@/lib/content-moderation';

export async function verifyAmuletContent(text: string, file?: File) {
  // Строгая проверка на сервере
  const result = moderateText(text, STRICT_CONFIG);
  
  if (!result.valid) {
    return {
      success: false,
      error: result.error,
      reason: result.reason,
    };
  }
  
  // Если есть файл, проверяем его
  if (file) {
    const fileResult = moderateFile(file, DEFAULT_FILE_CONFIG);
    if (!fileResult.valid) {
      return {
        success: false,
        error: fileResult.error,
        reason: fileResult.reason,
      };
    }
  }
  
  // Все проверки пройдены
  return {
    success: true,
  };
}
*/
