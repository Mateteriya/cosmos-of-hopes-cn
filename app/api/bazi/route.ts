import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

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

    // Используем абсолютный путь от корня проекта
    const baziPath = join(process.cwd(), 'БаЦЗЫ');
    const calculatorPath = join(baziPath, 'bazi-calculator-expert.js');
    const contentPath = join(baziPath, 'content-generator.js');
    
    // Проверяем существование файлов
    if (!existsSync(calculatorPath)) {
      throw new Error(`Calculator file not found: ${calculatorPath}`);
    }
    if (!existsSync(contentPath)) {
      throw new Error(`Content generator file not found: ${contentPath}`);
    }
    
    // Используем pathToFileURL для корректного импорта ES модулей
    // Это необходимо для путей с кириллицей в Next.js
    const calculatorUrl = pathToFileURL(calculatorPath).href;
    const contentUrl = pathToFileURL(contentPath).href;
    
    // Импортируем модули с кэшированием (добавляем timestamp для dev режима)
    const cacheBuster = process.env.NODE_ENV === 'development' ? `?t=${Date.now()}` : '';
    
    const calculatorModule = await import(calculatorUrl + cacheBuster);
    const contentModule = await import(contentUrl + cacheBuster);
    
    const { getFullBaziAnalysis } = calculatorModule;
    const { generateContent, formatContentForDisplay } = contentModule;
    
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
