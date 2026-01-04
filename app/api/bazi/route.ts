import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

/**
 * API маршрут для расчёта Бацзы
 * Использует готовый калькулятор из папки БаЦЗЫ
 */

// Кэш для модулей (чтобы не импортировать каждый раз)
let calculatorModuleCache: any = null;
let contentModuleCache: any = null;

async function loadModules() {
  // Если модули уже загружены, возвращаем их
  if (calculatorModuleCache && contentModuleCache) {
    return { calculatorModuleCache, contentModuleCache };
  }

  // Используем абсолютный путь от корня проекта
  const baziPath = resolve(process.cwd(), 'БаЦЗЫ');
  const calculatorPath = resolve(baziPath, 'bazi-calculator-expert.js');
  const contentPath = resolve(baziPath, 'content-generator.js');
  
  // Проверяем существование файлов
  if (!existsSync(calculatorPath)) {
    throw new Error(`Calculator file not found: ${calculatorPath}. Current working directory: ${process.cwd()}`);
  }
  if (!existsSync(contentPath)) {
    throw new Error(`Content generator file not found: ${contentPath}`);
  }
  
  try {
    // Используем pathToFileURL для корректного импорта ES модулей
    // Это необходимо для путей с кириллицей в Next.js
    const calculatorUrl = pathToFileURL(calculatorPath).href;
    const contentUrl = pathToFileURL(contentPath).href;
    
    // Импортируем модули
    calculatorModuleCache = await import(calculatorUrl);
    contentModuleCache = await import(contentUrl);
    
    return { calculatorModuleCache, contentModuleCache };
  } catch (importError: any) {
    console.error('Module import error:', {
      message: importError.message,
      code: importError.code,
      calculatorPath,
      contentPath,
      calculatorUrl: pathToFileURL(calculatorPath).href,
      contentUrl: pathToFileURL(contentPath).href,
      cwd: process.cwd()
    });
    throw new Error(`Failed to import modules: ${importError.message}`);
  }
}

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

    // Загружаем модули
    const { calculatorModuleCache, contentModuleCache } = await loadModules();
    
    const { getFullBaziAnalysis } = calculatorModuleCache;
    const { generateContent, formatContentForDisplay } = contentModuleCache;
    
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
              stack: error instanceof Error ? error.stack : undefined,
              cwd: process.cwd()
            }
          : undefined
      },
      { status: 500 }
    );
  }
}
