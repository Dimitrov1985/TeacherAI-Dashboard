# Руководство по системе тематизации

## Обзор

Проект поддерживает две темы: **светлую** (по умолчанию) и **тёмную**. Переключение происходит через кнопку в Sidebar.

## CSS-переменные

Все цвета определены через CSS-переменные в `src/index.css`:

### Фоны
- `--bg-page` — основной фон страницы
- `--bg-surface` — фон карточек и панелей
- `--bg-surface-2` — вторичный фон (hover-состояния)
- `--bg-sidebar` — фон боковой панели

### Текст
- `--text-primary` — основной текст
- `--text-secondary` — вторичный текст (ссылки, подписи)
- `--text-muted` — приглушённый текст

### Границы
- `--border` — стандартные границы
- `--border-strong` — усиленные границы

### Акценты
- `--accent` — акцентный цвет (кнопки, активные элементы)
- `--accent-hover` — цвет при наведении

### Тени
- `--card-shadow` — тень карточки
- `--card-shadow-hover` — тень при наведении

### Оценки
- `--grade-5` — цвет оценки 5
- `--grade-4` — цвет оценки 4
- `--grade-3` — цвет оценки 3
- `--grade-2` — цвет оценки 2

## Использование в компонентах

### Способ 1: Inline styles (рекомендуется для динамических элементов)

```tsx
<div style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
  Контент
</div>
```

### Способ 2: Через утилиты

```tsx
import { themeColors, cardStyles } from '../lib/themeUtils';

<div style={cardStyles}>
  Карточка
</div>

<button style={{ backgroundColor: themeColors.accent }}>
  Кнопка
</button>
```

### Способ 3: Получение цвета оценки

```tsx
import { getGradeColor } from '../lib/themeUtils';

<span style={{ color: getGradeColor(5) }}>
  Отлично!
</span>
```

## Компонент переключения темы

```tsx
import ThemeToggle from '../components/ThemeToggle';

<ThemeToggle />
```

## Хук для отслеживания темы

```tsx
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const theme = useTheme();
  
  return <div>Текущая тема: {theme}</div>;
}
```

## Примеры

### Кнопка с темой

```tsx
<button
  style={{
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: '1px solid var(--border)',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--accent)';
  }}
>
  Нажми меня
</button>
```

### Карточка с тенью

```tsx
<div
  style={{
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--card-shadow)',
    borderRadius: '1rem',
    padding: '1.5rem',
  }}
>
  Содержимое карточки
</div>
```

### Инпут

```tsx
<input
  style={{
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    padding: '0.5rem',
    borderRadius: '0.375rem',
  }}
  placeholder="Введите текст..."
/>
```

## Отключение переходов для производительности

Если анимации вызывают тормоза на больших таблицах, можно убрать `transition` в `src/index.css`:

```css
/* Закомментируйте эти строки */
/* body, aside, main, header, input, select, textarea, button, .card {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
} */
```

## Добавление новых цветовых переменных

1. Откройте `src/index.css`
2. Добавьте переменную в `:root` (светлая тема)
3. Добавьте переменную в `[data-theme="dark"]` (тёмная тема)
4. Обновите `src/lib/themeUtils.ts` при необходимости

Пример:

```css
:root {
  --my-new-color: #ff6b6b;
}

[data-theme="dark"] {
  --my-new-color: #ff9999;
}
```

## Сохранение темы

Тема автоматически сохраняется в `localStorage` и восстанавливается при перезагрузке страницы.
