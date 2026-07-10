# 🎨 Система тематизации TeacherHub

## Быстрый старт

### 1. Переключение темы

Кнопка переключения темы уже добавлена в **Sidebar** (левая панель). Просто нажмите на иконку луны/солнца.

### 2. Использование в новых компонентах

```tsx
import { themeColors } from '../lib/themeUtils';

function MyComponent() {
  return (
    <div style={{
      backgroundColor: themeColors.bgSurface,
      color: themeColors.textPrimary,
      border: `1px solid ${themeColors.border}`,
      padding: '1rem',
      borderRadius: '0.5rem'
    }}>
      Ваш контент
    </div>
  );
}
```

### 3. Готовые стили

```tsx
import { cardStyles, buttonStyles, inputStyles } from '../lib/themeUtils';

// Карточка
<div style={cardStyles}>...</div>

// Кнопка
<button style={buttonStyles.primary}>Сохранить</button>

// Инпут
<input style={inputStyles} />
```

### 4. Цвета оценок

```tsx
import { getGradeColor } from '../lib/themeUtils';

<span style={{ color: getGradeColor(5) }}>5</span>
```

## Структура файлов

```
src/
├── index.css                    # CSS-переменные темы
├── components/
│   ├── ThemeToggle.tsx         # Переключатель темы
│   └── ThemeExamples.tsx       # Примеры всех компонентов
├── hooks/
│   └── useTheme.ts             # Хук для отслеживания темы
└── lib/
    └── themeUtils.ts           # Утилиты и готовые стили
```

## Доступные CSS-переменные

### Фоны
- `--bg-page` — фон страницы
- `--bg-surface` — фон карточек
- `--bg-surface-2` — вторичный фон
- `--bg-sidebar` — фон боковой панели

### Текст
- `--text-primary` — основной текст
- `--text-secondary` — вторичный текст
- `--text-muted` — приглушённый текст

### Цвета
- `--accent` — акцентный цвет
- `--accent-hover` — при наведении
- `--border` — границы
- `--grade-5`, `--grade-4`, `--grade-3`, `--grade-2` — оценки

## Примеры компонентов

Запустите приложение и импортируйте `ThemeExamples` в любую страницу, чтобы увидеть все примеры:

```tsx
import { ThemeExamples } from '../components/ThemeExamples';

<ThemeExamples />
```

## Что уже адаптировано ✅

- ✅ Sidebar
- ✅ DashboardPage
- ✅ StatCards
- ✅ Переключатель темы

## Следующие шаги

1. Откройте `THEME_MIGRATION.md` для списка компонентов к миграции
2. Используйте `THEME_GUIDE.md` для подробной документации
3. Смотрите примеры в `src/components/ThemeExamples.tsx`

## Тестирование

1. Запустите `npm run dev`
2. Откройте http://localhost:5174
3. Нажмите кнопку переключения темы в Sidebar
4. Проверьте, что все элементы корректно меняют цвет

## Сохранение темы

Выбранная тема автоматически сохраняется в `localStorage` и восстанавливается при следующем посещении.
