# 🔒 Supabase Security Setup Guide

## Шаг 1: Создать Supabase проект

1. Перейти на https://app.supabase.com
2. Создать новый проект
3. Записать:
   - Project URL (например: `https://xxxxx.supabase.co`)
   - Anon key (публичный ключ)
   - Service role key (приватный ключ - ТОЛЬКО для backend!)

## Шаг 2: Создать таблицу teachers

Выполнить SQL в Supabase SQL Editor:

```sql
-- Создать таблицу для профилей учителей
CREATE TABLE teachers (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включить Row Level Security (RLS)
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Policy: Пользователь может читать и обновлять только свой профиль
CREATE POLICY "Users can read own profile"
  ON teachers
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON teachers
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON teachers
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Шаг 3: Настроить Email Authentication

1. В Supabase Dashboard → Authentication → Settings
2. **Disable email confirmation** (для разработки):
   - Enable "Disable email confirmations"
   - Это позволит тестировать без подтверждения email

3. **Для продакшена** настройте SMTP:
   - Settings → Auth → SMTP Settings
   - Добавьте настройки вашего email провайдера

## Шаг 4: Настроить .env файл

Создать `.env` в корне проекта:

```env
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Supabase (Frontend - публичные ключи)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Backend (ПРИВАТНЫЙ ключ - только для API endpoints)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL для CORS
VITE_APP_URL=http://localhost:3001
```

⚠️ **ВАЖНО:** 
- `VITE_*` переменные доступны на frontend
- `SUPABASE_SERVICE_ROLE_KEY` НИКОГДА не должен попасть на frontend!

## Шаг 5: Обновить Vercel Environment Variables

Если деплоите на Vercel:

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Добавить ВСЕ переменные из `.env`
3. Убедиться что `SUPABASE_SERVICE_ROLE_KEY` помечен как **Secret**

## Шаг 6: Тестирование

### Проверить аутентификацию:

```typescript
// В браузере console:
const { data, error } = await supabase.auth.signUp({
  email: 'test@test.com',
  password: 'password123'
})
console.log(data, error)
```

### Проверить защиту API:

```bash
# Без токена - должен вернуть 401
curl -X POST http://localhost:3001/api/generate-plan-secure \
  -H "Content-Type: application/json"

# С токеном - должен работать
curl -X POST http://localhost:3001/api/generate-plan-secure \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Шаг 7: Миграция данных (опционально)

Для переноса существующих данных из localStorage на Supabase:

```sql
-- Создать таблицы для данных
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  class_id UUID,
  -- ... остальные поля
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own students"
  ON students
  USING (auth.uid() = teacher_id);
```

## Безопасность Checklist

✅ Row Level Security (RLS) включен  
✅ Service Role Key не используется на frontend  
✅ API endpoints защищены authentication middleware  
✅ Rate limiting настроен  
✅ CORS headers настроены  
✅ Input validation на всех endpoints  
✅ Email confirmation включен (для продакшена)  

## Troubleshooting

### Ошибка: "Invalid JWT"
- Проверьте что используете правильный URL и anon key
- Токен может быть expired - попробуйте повторный login

### Ошибка: "Row level security violation"
- Проверьте policies в Supabase
- Убедитесь что `auth.uid()` совпадает с `teacher_id`

### Rate limit слишком строгий
- Измените параметры в `_middleware.ts`:
```typescript
checkRateLimit(userId, 'endpoint', {
  maxRequests: 20, // увеличить
  windowMs: 60 * 1000
})
```
