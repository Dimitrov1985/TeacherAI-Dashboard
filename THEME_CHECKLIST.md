# ✅ Чек-лист интеграции тематизации

## 🎉 Что уже готово

### Инфраструктура
- [x] CSS-переменные в `src/index.css`
- [x] Компонент `ThemeToggle.tsx`
- [x] Хук `useTheme.ts`
- [x] Утилиты `themeUtils.ts`
- [x] Примеры `ThemeExamples.tsx`

### Документация
- [x] `THEME_README.md` — краткое руководство
- [x] `THEME_GUIDE.md` — полная документация
- [x] `THEME_MIGRATION.md` — план миграции
- [x] `THEME_CHECKLIST.md` — этот файл

### Адаптированные компоненты
- [x] `Sidebar.tsx` — полностью
- [x] `DashboardPage.tsx` — фон страницы
- [x] `StatCards.tsx` — карточки статистики
- [x] `SearchBar.tsx` — поле поиска
- [x] `WeeklySchedule.tsx` — основные элементы

## 🚀 Как протестировать

1. **Запустите приложение:**
   ```bash
   npm run dev
   ```

2. **Откройте в браузере:**
   - URL: http://localhost:5174

3. **Переключите тему:**
   - Найдите кнопку луны/солнца в Sidebar (левая панель)
   - Нажмите для переключения между светлой и тёмной темой

4. **Проверьте элементы:**
   - [ ] Sidebar меняет цвет фона
   - [ ] Текст "TeacherHub" меняет цвет
   - [ ] Навигационные ссылки меняют цвет
   - [ ] StatCards меняют фон и тени
   - [ ] SearchBar меняет фон и цвет иконки
   - [ ] WeeklySchedule меняет фон и текст

5. **Проверьте сохранение:**
   - Переключите тему
   - Обновите страницу (F5)
   - Тема должна остаться той же

## 📋 Следующие шаги (опционально)

### Высокий приоритет
- [ ] `MiniCalendar.tsx`
- [ ] `UpcomingEvents.tsx`
- [ ] `RightPanel.tsx`
- [ ] `TopIcons.tsx`

### Средний приоритет
- [ ] `StudentsPage.tsx`
- [ ] `StudentCard.tsx`
- [ ] `LessonsPage.tsx`
- [ ] `HomeworkPage.tsx`
- [ ] `AttendancePage.tsx`

### Модальные окна
- [ ] `EventModal.tsx`
- [ ] `NoteModal.tsx`
- [ ] `LessonModal.tsx`
- [ ] `StudentModal.tsx`
- [ ] `AddHomeworkModal.tsx`

### Таблицы
- [ ] `JournalTable.tsx`
- [ ] `AttendanceTable.tsx`
- [ ] `FinalGradesTable.tsx`

## 🎨 Палитра темы

### Светлая тема
```
Фон страницы:  #f4f7fb
Фон карточек:  #ffffff
Фон sidebar:   #DCE8F5
Основной текст: #1D3557
Акцент:        #457B9D
```

### Тёмная тема
```
Фон страницы:  #0f172a
Фон карточек:  #1e293b
Фон sidebar:   #1a2942
Основной текст: #e2e8f0
Акцент:        #60a5fa
```

## 💡 Советы

1. **Используйте утилиты:**
   ```tsx
   import { themeColors, cardStyles } from '../lib/themeUtils';
   ```

2. **Для оценок:**
   ```tsx
   import { getGradeColor } from '../lib/themeUtils';
   <span style={{ color: getGradeColor(5) }}>5</span>
   ```

3. **Для hover-эффектов:**
   ```tsx
   onMouseEnter={(e) => {
     e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)';
   }}
   onMouseLeave={(e) => {
     e.currentTarget.style.backgroundColor = 'transparent';
   }}
   ```

4. **Смотрите примеры в:**
   - `src/components/ThemeExamples.tsx`
   - Обновлённые компоненты (Sidebar, StatCards и т.д.)

## 🐛 Возможные проблемы

### Тормоза при переключении темы
- **Причина:** Слишком много элементов с `transition`
- **Решение:** Уберите transitions из `src/index.css` для больших таблиц

### Цвета не меняются
- **Причина:** Используются hardcoded значения вместо переменных
- **Решение:** Замените на `var(--переменная)`

### Тема не сохраняется
- **Причина:** Проблема с localStorage
- **Решение:** Проверьте консоль браузера на ошибки

## 📞 Помощь

- Читайте `THEME_GUIDE.md` для детальной документации
- Смотрите `ThemeExamples.tsx` для примеров кода
- Используйте `themeUtils.ts` для готовых стилей
