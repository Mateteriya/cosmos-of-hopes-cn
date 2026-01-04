import { NextRequest, NextResponse } from 'next/server';

/**
 * API маршрут для расчёта Бацзы
 * Использует готовый калькулятор из папки БаЦЗЫ
 */

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

    // Импорт ES модулей через абсолютный путь с file:// протоколом
    // Next.js не поддерживает динамические относительные пути с кириллицей
    const path = await import('path');
    const { pathToFileURL } = await import('url');
    const baziPath = path.resolve(process.cwd(), 'БаЦЗЫ');
    const calculatorPath = path.join(baziPath, 'bazi-calculator-expert.js');
    const contentPath = path.join(baziPath, 'content-generator.js');
    
    // Используем file:// протокол для корректного импорта
    const calculatorUrl = pathToFileURL(calculatorPath).href;
    const contentUrl = pathToFileURL(contentPath).href;
    
    const { getFullBaziAnalysis } = await import(calculatorUrl);
    const { generateContent, formatContentForDisplay } = await import(contentUrl);
    
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error', success: false },
      { status: 500 }
    );
  }
}

