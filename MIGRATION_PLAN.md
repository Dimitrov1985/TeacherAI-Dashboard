# 🚀 Security Migration Plan

## ✅ ЧТО УЖЕ СДЕЛАНО

### Фаза 1: Infrastructure ✅

- ✅ Установлен `@supabase/supabase-js`
- ✅ Создан `src/lib/supabase.ts` - Supabase client
- ✅ Создан `SupabaseAuthContext.tsx` - безопасный auth provider
- ✅ Создан `api/_middleware.ts`:
  - JWT token verification
  - Rate limiting
  - CORS headers
- ✅ Создан `api/generate-plan-secure.ts` - защищённый endpoint
- ✅ Создан `api/generate-homework-secure.ts` - защищённый endpoint
- ✅ Создан `SUPABASE_SETUP.md` - инструкция по настройке

## 📋 ЧТО НУЖНО СДЕЛАТЬ

### Фаза 2: Интеграция Auth (1-2 часа)

**Задачи:**

1. **Обновить App.tsx**
   ```typescript
   // Заменить AuthProvider на SupabaseAuthProvider
   import { SupabaseAuthProvider } from './context/SupabaseAuthContext'
   ```

2. **Обновить LoginPage.tsx**
   ```typescript
   // Использовать useSupabaseAuth вместо useAuth
   import { useSupabaseAuth } from '../context/SupabaseAuthContext'
   ```

3. **Обновить SignUpPage.tsx**
   - Аналогично LoginPage

4. **Обновить ProfilePage.tsx**
   - Использовать `useSupabaseAuth`
   - Обновить сохранение профиля через Supabase

5. **Обновить все API вызовы**
   - Добавить JWT token в headers
   - Изменить URLs на `-secure` endpoints

**Пример обновления API вызова:**

```typescript
// БЫЛО:
const response = await fetch('/api/generate-plan', {
  method: 'POST',
  body: JSON.stringify({ imageDataUrl })
})

// СТАЛО:
const { session } = useSupabaseAuth()
const response = await fetch('/api/generate-plan-secure', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}` // ✅
  },
  body: JSON.stringify({ imageDataUrl })
})
```

### Фаза 3: Миграция данных на Supabase (2-3 часа)

**Создать таблицы:**

```sql
-- Students
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  class_id UUID,
  subject_id UUID,
  period_id UUID,
  date_of_birth DATE,
  email TEXT,
  phone TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Homework
CREATE TABLE homework (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  class_id UUID REFERENCES classes(id),
  class_name TEXT,
  due_date DATE,
  submissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grades
CREATE TABLE grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  grade INTEGER NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('test', 'homework', 'classwork', 'exam', 'project')),
  topic TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Policies для всех таблиц
CREATE POLICY "Teachers can manage own data" ON students
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can manage own data" ON classes
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can manage own data" ON homework
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can manage own data" ON grades
  USING (auth.uid() = teacher_id);
```

**Обновить stores:**

```typescript
// src/lib/studentsStore.ts
import { supabase } from './supabase'

export async function loadStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function addStudent(student: Omit<Student, 'id'>): Promise<void> {
  const { error } = await supabase
    .from('students')
    .insert(student)
  
  if (error) throw error
  
  // Emit event для реактивности
  window.dispatchEvent(new Event('students-changed'))
}
```

### Фаза 4: Дополнительная безопасность (1 час)

1. **CSP Headers**
   ```typescript
   // vercel.json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "Content-Security-Policy",
             "value": "default-src 'self'; connect-src 'self' https://*.supabase.co https://api.anthropic.com"
           }
         ]
       }
     ]
   }
   ```

2. **Исправить npm audit**
   ```bash
   npm audit fix --force
   npm update @vercel/node@latest
   ```

3. **Убрать console.log в продакшене**
   ```typescript
   // src/lib/logger.ts
   export const logger = {
     log: (...args: any[]) => {
       if (import.meta.env.DEV) {
         console.log(...args)
       }
     },
     error: (...args: any[]) => {
       console.error(...args) // Всегда логируем ошибки
     }
   }
   ```

4. **Заменить document.write**
   ```typescript
   // src/lib/printJournal.ts
   import DOMPurify from 'dompurify'
   
   const sanitized = DOMPurify.sanitize(html)
   printWindow.document.body.innerHTML = sanitized
   ```

## 🎯 ПРИОРИТЕТЫ

### Сегодня (критично):
1. ✅ Настроить Supabase проект (следуя `SUPABASE_SETUP.md`)
2. ⏳ Обновить Auth (Фаза 2, задачи 1-4)
3. ⏳ Обновить API calls с токенами (Фаза 2, задача 5)

### Эта неделя (важно):
4. ⏳ Создать таблицы в Supabase (Фаза 3)
5. ⏳ Переписать stores на Supabase (Фаза 3)
6. ⏳ Исправить npm audit (Фаза 4)

### Следующая неделя (желательно):
7. ⏳ Добавить CSP headers
8. ⏳ Настроить production SMTP
9. ⏳ Добавить monitoring

## 🧪 ТЕСТИРОВАНИЕ

После каждой фазы проверить:

- [ ] Регистрация работает
- [ ] Login работает
- [ ] Logout работает
- [ ] AI генерация работает (с токеном)
- [ ] Rate limiting срабатывает
- [ ] 401 без токена
- [ ] Данные сохраняются в Supabase
- [ ] RLS policies работают

## 📊 МОНИТОРИНГ

После деплоя:

1. **Supabase Dashboard → Database → Tables**
   - Проверить что данные сохраняются

2. **Supabase Dashboard → Authentication → Users**
   - Проверить регистрации

3. **Vercel Dashboard → Analytics**
   - Следить за 401/429 ошибками

4. **Anthropic Dashboard → Usage**
   - Следить за использованием API quota

## ⚠️ ВАЖНО

- ❌ НЕ удалять старый AuthContext.tsx до полного тестирования
- ❌ НЕ деплоить на продакшн до завершения Фазы 2
- ✅ Делать backup `.env` файла
- ✅ Тестировать каждую фазу отдельно
- ✅ Использовать git branches для каждой фазы

## 🆘 ROLLBACK ПЛАН

Если что-то сломалось:

1. Откатить git: `git reset --hard HEAD~1`
2. Восстановить старый AuthProvider в App.tsx
3. Восстановить старые API endpoints (без `-secure`)
4. Удалить Supabase auth calls

## 📝 СЛЕДУЮЩИЕ ШАГИ

1. Прочитать `SUPABASE_SETUP.md`
2. Создать Supabase проект
3. Добавить credentials в `.env`
4. Начать Фазу 2

**Готовы начать?** 🚀
