# План миграции компонентов на систему тематизации

## Что уже сделано ✅

1. **CSS-переменные темы** — определены в `src/index.css`
2. **Компонент переключения** — `src/components/ThemeToggle.tsx`
3. **Утилиты** — `src/lib/themeUtils.ts` и `src/hooks/useTheme.ts`
4. **Sidebar** — полностью адаптирован под темы
5. **DashboardPage** — использует `var(--bg-page)`
6. **StatCards** — использует переменные для фона, границ и теней

## Компоненты для миграции

### Высокий приоритет (видимые сразу)

- [ ] `src/components/Dashboard/SearchBar.tsx`
- [ ] `src/components/Dashboard/WeeklySchedule.tsx`
- [ ] `src/components/Dashboard/MiniCalendar.tsx`
- [ ] `src/components/Dashboard/UpcomingEvents.tsx`
- [ ] `src/components/Dashboard/RightPanel.tsx`

### Средний приоритет (основные страницы)

- [ ] `src/pages/StudentsPage.tsx`
- [ ] `src/pages/LessonsPage.tsx`
- [ ] `src/pages/HomeworkPage.tsx`
- [ ] `src/pages/AttendancePage.tsx`
- [ ] `src/components/Students/StudentCard.tsx`
- [ ] `src/components/Students/StudentDetailView.tsx`

### Низкий приоритет (модальные окна)

- [ ] `src/components/Dashboard/EventModal.tsx`
- [ ] `src/components/Dashboard/NoteModal.tsx`
- [ ] `src/components/Dashboard/LessonModal.tsx`
- [ ] `src/components/Students/StudentModal.tsx`
- [ ] `src/components/Homework/AddHomeworkModal.tsx`

## Шаблон миграции

### До:
```tsx
<div className="bg-white text-gray-900 border border-gray-200">
  Контент
</div>
```

### После:
```tsx
<div
  style={{
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)'
  }}
>
  Контент
</div>
```

## Частые замены

| Старое значение | Новая переменная |
|----------------|------------------|
| `bg-white` | `var(--bg-surface)` |
| `bg-gray-50` | `var(--bg-surface-2)` |
| `text-gray-900` | `var(--text-primary)` |
| `text-gray-600` | `var(--text-secondary)` |
| `text-gray-400` | `var(--text-muted)` |
| `border-gray-200` | `var(--border)` |
| `#457B9D` | `var(--accent)` |

## Проверка после миграции

1. Переключите тему через кнопку в Sidebar
2. Убедитесь, что все элементы корректно меняют цвет
3. Проверьте hover-эффекты
4. Проверьте модальные окна
5. Проверьте формы и инпуты

## Советы

- Используйте `themeColors` из `src/lib/themeUtils.ts` для консистентности
- Для динамических элементов предпочитайте inline styles
- Добавляйте `transition` для плавной смены цветов
- Тестируйте на обеих темах перед коммитом
