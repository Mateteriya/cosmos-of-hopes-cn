import { NextRequest, NextResponse } from 'next/server';

/**
 * API маршрут для расчёта Бацзы
 * Использует готовый калькулятор из папки lib/bazi
 */

// Статический импорт из lib (без кириллицы в пути)
import { getFullBaziAnalysis } from '@/lib/bazi/bazi-calculator-expert';
import { generateContent, formatContentForDisplay } from '@/lib/bazi/content-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dateTime, gender, timezone, longitude, latitude, useSolarTime = false, year = 2026, yearAnimal = 'Огненная Лошадь', style = 'poetic' } = body;

    // Валидация
    if (!dateTime || !gender || !timezone) {
      return NextResponse.json(
        { error: 'Missing required fields: dateTime, gender, timezone' },
        { status: 400 }
      );
    }

    // Обработка долготы
    // ВАЖНО: Форма должна гарантировать наличие координат перед отправкой
    // Если долгота не указана, это ошибка валидации формы!
    let longitudeValue: number | null = null;
    
    if (longitude !== undefined && longitude !== null && longitude !== '') {
      const parsed = parseFloat(String(longitude));
      if (!isNaN(parsed)) {
        longitudeValue = parsed;
      }
    }
    
    // Логирование для отладки (ВСЕГДА, чтобы видеть на сервере)
    console.log('🔍 API /api/bazi - Полученные данные:', {
      dateTime,
      timezone,
      longitude: longitudeValue,
      latitude,
      useSolarTime: useSolarTime,
      useSolarTimeType: typeof useSolarTime,
      rawLongitude: longitude
    });
    
    // Если долгота не указана, выводим предупреждение
    if (longitudeValue === null) {
      console.warn(
        `⚠️ ВНИМАНИЕ: Долгота не указана для расчета Бацзы. ` +
        `Форма должна гарантировать наличие координат! ` +
        `Часовой пояс: ${timezone}, Дата: ${dateTime}. ` +
        `Будет использована приблизительная долгота центра часового пояса.`
      );
    }

    // Получаем анализ Бацзы с учетом долготы и метода расчета часа
    const baziAnalysis = getFullBaziAnalysis(dateTime, gender, timezone, longitudeValue, useSolarTime);

    // Генерируем контент (с учетом пола для модификации)
    const content = generateContent(baziAnalysis, year, yearAnimal, style, gender);
    const formatted = formatContentForDisplay(content);
    
    // Дополнительное логирование для отладки (на сервере)
    console.log('🔍 API /api/bazi - Результат расчета:', {
      inputLongitude: longitudeValue,
      usedLongitude: baziAnalysis.timeInfo?.longitude,
      localTime: baziAnalysis.timeInfo?.localTime,
      gmtTime: baziAnalysis.timeInfo?.gmtTime,
      lmtTime: baziAnalysis.timeInfo?.lmtTime,
      solarTime: baziAnalysis.timeInfo?.solarTime,
      hourMomentUsed: baziAnalysis.timeInfo?.hourMomentUsed,
      useSolarTime: baziAnalysis.timeInfo?.useSolarTime,
      longitudeCorrectionMinutes: baziAnalysis.timeInfo?.longitudeCorrectionMinutes,
      eotMinutes: baziAnalysis.timeInfo?.eotMinutes,
      totalCorrectionMinutes: baziAnalysis.timeInfo?.totalCorrectionMinutes,
      utcOffsetMinutes: baziAnalysis.timeInfo?.utcOffsetMinutes,
      timezone: timezone
    });

    return NextResponse.json({
      success: true,
      analysis: baziAnalysis,
      content: formatted,
      rawContent: content,
      // Добавляем отладочную информацию в ответ (всегда, чтобы видеть в браузере)
      debug: {
        inputLongitude: longitudeValue,
        usedLongitude: baziAnalysis.timeInfo?.longitude,
        localTime: baziAnalysis.timeInfo?.localTime,
        gmtTime: baziAnalysis.timeInfo?.gmtTime,
        lmtTime: baziAnalysis.timeInfo?.lmtTime,
        solarTime: baziAnalysis.timeInfo?.solarTime,
        hourMomentUsed: baziAnalysis.timeInfo?.hourMomentUsed,
        useSolarTime: baziAnalysis.timeInfo?.useSolarTime,
        longitudeCorrectionMinutes: baziAnalysis.timeInfo?.longitudeCorrectionMinutes,
        eotMinutes: baziAnalysis.timeInfo?.eotMinutes,
        totalCorrectionMinutes: baziAnalysis.timeInfo?.totalCorrectionMinutes,
        utcOffsetMinutes: baziAnalysis.timeInfo?.utcOffsetMinutes,
        timezone: timezone,
        isDST: baziAnalysis.timeInfo?.isDST,
        dstNote: baziAnalysis.timeInfo?.dstNote,
        // Информация о летнем времени (DST) для исторических дат
        isDST: baziAnalysis.timeInfo?.isDST,
        dstNote: baziAnalysis.timeInfo?.dstNote,
        // Детальный расчет для проверки
        calculationSteps: {
          step1_localTime: baziAnalysis.timeInfo?.localTime,
          step2_gmtTime: baziAnalysis.timeInfo?.gmtTime,
          step3_utcOffset: baziAnalysis.timeInfo?.utcOffsetMinutes,
          step4_longitude: baziAnalysis.timeInfo?.longitude,
          step5_longitudeCorrection: baziAnalysis.timeInfo?.longitudeCorrectionMinutes,
          step6_lmtTime: baziAnalysis.timeInfo?.lmtTime,
          step7_eot: baziAnalysis.timeInfo?.eotMinutes,
          step8_solarTime: baziAnalysis.timeInfo?.solarTime
        }
      }
    });
  } catch (error) {
    console.error('Bazi calculation error:', error);
    
    // Детальная информация об ошибке для отладки
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        success: false,
        details: process.env.NODE_ENV === 'development' 
          ? {
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined
            }
          : undefined
      },
      { status: 500 }
    );
  }
}
