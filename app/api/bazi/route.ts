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
    const { dateTime, gender, timezone, year = 2026, yearAnimal = 'Огненная Лошадь', style = 'poetic' } = body;

    // Валидация
    if (!dateTime || !gender || !timezone) {
      return NextResponse.json(
        { error: 'Missing required fields: dateTime, gender, timezone' },
        { status: 400 }
      );
    }

    // Получаем анализ Бацзы
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
