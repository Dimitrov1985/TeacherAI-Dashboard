# Руководство по анимации конфетти 🎉

## Что это?

При успешном входе (Sign In) или регистрации (Sign Up) на экране появляется красивая анимация конфетти/салюта — визуальное подтверждение успешной операции.

## Как это работает

### 1. **Пользователь нажимает Sign In / Sign Up**
```
Ввод email/password → Нажатие кнопки
```

### 2. **Запрос выполнен успешно**
```typescript
await login(email, password)  // или signup(...)
```

### 3. **Запускается анимация конфетти**
```typescript
await celebrateSuccess()  // 2 секунды салюта
```

### 4. **Редирект на главную страницу**
```typescript
navigate('/')
```

## Технические детали

### Библиотека: `canvas-confetti`

**Установка:**
```bash
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti
```

**Импорт:**
```typescript
import confetti from 'canvas-confetti'
```

### Утилиты (`src/lib/confetti.ts`)

#### 1. `celebrateSuccess()` — Основная анимация (2 сек)
```typescript
await celebrateSuccess()
```

**Особенности:**
- Длительность: 2 секунды
- Салют с двух сторон экрана
- Множественные всплески
- z-index: 9999 (поверх всего)
- Возвращает Promise — можно ждать окончания

**Реализация:**
```typescript
export function celebrateSuccess(): Promise<void> {
  return new Promise((resolve) => {
    const duration = 2000
    const interval = setInterval(() => {
      // Салют слева
      confetti({ origin: { x: 0.1, y: 0 } })
      // Салют справа
      confetti({ origin: { x: 0.9, y: 0 } })
    }, 250)
    
    setTimeout(() => {
      clearInterval(interval)
      resolve()
    }, duration)
  })
}
```

#### 2. `quickCelebration()` — Быстрая анимация (1.5 сек)
```typescript
await quickCelebration()
```

**Особенности:**
- Длительность: 1.5 секунды
- Серия салютов разных размеров
- Разные цвета и скорости
- Более яркий и быстрый эффект

#### 3. `simpleCelebration()` — Простой салют (1 сек)
```typescript
await simpleCelebration()
```

**Особенности:**
- Длительность: 1 секунда
- Один большой салют из центра
- Минималистичный эффект

## Примеры использования

### В LoginPage.tsx

**До (без конфетти):**
```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setIsSubmitting(true)

  try {
    await login(email, password)
    navigate('/')  // Сразу редирект
  } catch (error) {
    setErrors({ password: 'Invalid email or password' })
  } finally {
    setIsSubmitting(false)
  }
}
```

**После (с конфетти):**
```typescript
import { celebrateSuccess } from '../lib/confetti'

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setIsSubmitting(true)

  try {
    await login(email, password)
    
    // 🎉 Анимация конфетти
    await celebrateSuccess()
    
    // Редирект после анимации
    navigate('/')
  } catch (error) {
    setErrors({ password: 'Invalid email or password' })
  } finally {
    setIsSubmitting(false)
  }
}
```

### В SignUpPage.tsx

**Аналогично** — импортируем и вызываем перед `navigate('/')`.

## Настройка анимации

### Изменить длительность

В `src/lib/confetti.ts`:
```typescript
const duration = 3000  // 3 секунды вместо 2
```

### Изменить цвета

```typescript
confetti({
  particleCount: 100,
  colors: ['#ff0000', '#00ff00', '#0000ff'],  // Красный, зелёный, синий
})
```

### Изменить направление

```typescript
confetti({
  origin: { x: 0.5, y: 0.5 },  // Из центра
  angle: 90,                    // Вверх
  spread: 180,                  // Широкий разброс
})
```

### Использовать другую анимацию

В `LoginPage.tsx` / `SignUpPage.tsx`:
```typescript
// Вместо:
await celebrateSuccess()

// Использовать:
await quickCelebration()  // Быстрее
// или
await simpleCelebration() // Проще
```

## Пользовательский опыт

### Timing диаграмма:

```
0.0s  → Клик "Sign In"
1.0s  → Запрос к серверу выполнен
1.0s  → 🎉 Начало анимации конфетти
1.5s  → 🎉 Салют продолжается
2.5s  → 🎉 Салют продолжается
3.0s  → 🎉 Анимация завершена
3.0s  → Редирект на главную страницу
```

**Итого**: ~3 секунды от клика до редиректа (1 сек запрос + 2 сек конфетти)

## Accessibility (доступность)

### Для пользователей с эпилепсией

Если нужно добавить опцию отключения анимации:

```typescript
// В настройках пользователя
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!prefersReducedMotion) {
  await celebrateSuccess()
}
```

### Для старых браузеров

`canvas-confetti` поддерживает:
- ✅ Chrome 30+
- ✅ Firefox 25+
- ✅ Safari 7+
- ✅ Edge (все версии)

Фолбэк не нужен — просто не будет анимации на очень старых браузерах.

## Production оптимизация

### Bundle size

`canvas-confetti` весит **~10KB** (минифицированный + gzip).

**Tree-shaking**: Vite автоматически включит только то, что используется.

### Lazy loading (опционально)

Если хочешь загружать только при необходимости:

```typescript
async function handleSubmit(e: React.FormEvent) {
  try {
    await login(email, password)
    
    // Динамический импорт
    const { celebrateSuccess } = await import('../lib/confetti')
    await celebrateSuccess()
    
    navigate('/')
  } catch (error) {
    // ...
  }
}
```

## Troubleshooting

### Конфетти не отображается

**Проблема**: z-index слишком низкий  
**Решение**: Убедись что `zIndex: 9999` в настройках

### Анимация прерывается при редиректе

**Проблема**: Редирект происходит до окончания анимации  
**Решение**: Используй `await celebrateSuccess()` — не забудь `await`!

### Конфетти за пределами экрана

**Проблема**: `origin` неправильный  
**Решение**: `origin: { x: 0.5, y: 0.5 }` (центр экрана)

## Альтернативные эффекты

### Салют сверху (как дождь)

```typescript
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0 },  // Сверху экрана
  angle: 270,         // Вниз
  gravity: 0.5,       // Медленное падение
})
```

### Салют снизу (фейерверк)

```typescript
confetti({
  particleCount: 100,
  spread: 100,
  origin: { y: 1 },  // Снизу экрана
  angle: 90,          // Вверх
  startVelocity: 60,  // Быстрый старт
})
```

### Салют по кругу

```typescript
for (let i = 0; i < 360; i += 45) {
  confetti({
    particleCount: 30,
    angle: i,
    spread: 30,
    origin: { x: 0.5, y: 0.5 },
  })
}
```

## Интеграция с другими страницами

Эту же утилиту можно использовать где угодно:

### При успешном импорте студентов

```typescript
// В BulkImportModal.tsx
import { quickCelebration } from '../lib/confetti'

async function handleImport() {
  // ... импорт ...
  await quickCelebration()
  onClose()
}
```

### При создании плана урока

```typescript
// В GenerateLessonModal.tsx
import { simpleCelebration } from '../lib/confetti'

async function handleGenerate() {
  // ... генерация ...
  await simpleCelebration()
  // ...
}
```

---

**Библиотека**: [canvas-confetti на GitHub](https://github.com/catdad/canvas-confetti)  
**Документация**: [API Reference](https://www.npmjs.com/package/canvas-confetti)

**Создано с помощью Claude Code** 🤖  
Дата: 03.07.2026
