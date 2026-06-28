# Платформа для учителей - AI Генератор планов уроков

Приложение для генерации планов уроков на основе фотографий учебника с использованием Claude AI.

## Основные возможности

- 📸 Загрузка фотографий страниц учебника
- 🤖 Автоматическая генерация планов уроков с помощью Claude AI
- 📅 Управление расписанием и уроками
- 📥 **Экспорт планов уроков в формат Word (.docx)**
- 📚 Хранение материалов и планов для каждого урока
- ✅ Управление домашними заданиями
- 📝 **Система заметок для календаря** ⭐ НОВОЕ!
- 📆 **Управление событиями** (создание, редактирование, удаление) ⭐ НОВОЕ!

## Новое: Экспорт в Word!

Теперь вы можете скачивать сгенерированные планы уроков в формате Microsoft Word! 

- Нажмите кнопку "Скачать Word" в просмотре плана
- Или используйте иконку скачивания прямо из списка материалов
- Документ содержит все секции: цели, активности, материалы и карточки

Подробнее см. [EXPORT_GUIDE.md](./EXPORT_GUIDE.md)

## Новое: Заметки для календаря! 📝

Теперь вы можете создавать заметки для любой даты в календаре!

- Кликните на дату в календаре
- Добавьте заметку с заголовком и описанием
- Выберите цвет для визуального выделения (7 цветов)
- Редактируйте и удаляйте заметки
- Жёлтая точка в календаре показывает дни с заметками

Подробнее см. [NOTES_GUIDE.md](./NOTES_GUIDE.md)

## Новое: Управление событиями! 📆

Теперь вы можете полностью управлять событиями календаря!

- Создавайте новые события с названием, датой и временем
- Редактируйте существующие события (кликните на событие)
- Удаляйте ненужные события
- Выбирайте цвет для визуального выделения (7 цветов)
- Синяя точка в календаре показывает дни с событиями
- Автоматическое сохранение в localStorage

Подробнее см. [EVENTS_GUIDE.md](./EVENTS_GUIDE.md)

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
