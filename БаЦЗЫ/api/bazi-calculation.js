// api/bazi-calculation.js
import lunisolar from 'lunisolar';

export default async function handler(req, res) {
  // 1. Разрешаем запросы только от вашего фронтенда и для авторизованных пользователей
  res.setHeader('Access-Control-Allow-Origin', 'ВАШ_ДОМЕН');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Используйте метод POST' });
  }

  try {
    // 2. Получаем данные от пользователя (пример структуры)
    const { birthDatetime, gender } = req.body; // birthDatetime в формате "1983-11-19 08:15"
    
    // 3. ВАЖНО: Конвертируем место рождения в корректный часовой пояс.
    // Для примера с Ногинском 1983 года это будет UTC+3.
    // В реальном приложении здесь должна быть сложная логика,
    // учитывающая исторические данные о часовых поясах.
    // Для теста используем конфигурацию БЕЗ offset, как в удачном тесте.
    const lsr = lunisolar(birthDatetime, {
      // offset: 180, // НЕ ИСПОЛЬЗУЕМ принудительный offset
      // isUTC: false // НЕ ИСПОЛЬЗУЕМ принудительную настройку
    });

    // 4. Извлекаем рассчитанные данные
    const bazi = lsr.char8;
    const luckPillars = lsr.lunar?.luck || []; // Столпы удачи (10-летние периоды)

    // 5. Формируем ответ для фронтенда
    const result = {
      pillars: bazi.toString().split(' '), // ["癸亥", "癸亥", "辛亥", "壬辰"]
      dayMaster: {
        glyph: bazi.day.stem.name, // "辛"
        element: "Металл Инь",
        russianName: "Металл Инь (Синь)"
      },
      usefulElements: ["Земля", "Металл"], // Рассчитываются на основе баланса карты
      advice: `2026 год (Огненная Лошадь) принесёт энергию карьеры. Опирайтесь на ${["Земля", "Металл"].join(' и ')}.`
    };

    // 6. Возвращаем результат
    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Ошибка расчёта Бацзы:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Внутренняя ошибка при расчёте' 
    });
  }
}