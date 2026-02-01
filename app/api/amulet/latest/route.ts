import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request: NextRequest) {
  try {
    // Получаем токен пользователя из заголовков или cookies
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!token || !supabaseUrl) {
      return NextResponse.json({ amulet: null }, { status: 200 });
    }

    // Создаем клиент Supabase с токеном пользователя
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Получаем информацию о пользователе
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ amulet: null }, { status: 200 });
    }

    // Ищем последний отправленный амулет пользователя в общее хранилище
    // Пока используем упрощенную логику - можно будет доработать после создания таблицы в БД
    // TODO: Реализовать запрос к таблице amulets после её создания в Supabase
    
    // Временное решение: возвращаем null, пока не будет реализована таблица
    return NextResponse.json({ amulet: null }, { status: 200 });

  } catch (error) {
    console.error('Ошибка получения амулета:', error);
    return NextResponse.json({ amulet: null }, { status: 200 });
  }
}
