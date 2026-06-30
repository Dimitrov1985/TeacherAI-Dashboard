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
- 👥 **База данных учеников** с оценками и посещаемостью ⭐ НОВОЕ!
- 🚀 **Массовый импорт учеников** через фото или текст с AI ⭐ НОВОЕ!

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

## Новое: База данных учеников! 👥

Полноценная система управления учениками с оценками и посещаемостью!

### Основные функции:
- 📋 **База учеников** - карточки с полной информацией
- 📊 **Журнал оценок** - оценки по предметам, средний балл
- ✅ **Посещаемость** - отметки присутствия, статистика
- 🔍 **Поиск и фильтры** - по имени и классам
- 📈 **Статистика** - процент посещаемости, успеваемость
- 💼 **Контакты родителей** - телефоны, email
- 📝 **Заметки учителя** - личные записи о каждом ученике

### Массовый импорт:
- 📸 **Фото списка класса** - AI распознает все имена автоматически
- 📄 **Вставка текста** - скопируйте список из документа
- ⚡ **Быстрое добавление** - весь класс за 30 секунд
- ✏️ **Редактирование перед импортом** - проверьте и исправьте
- 🌏 **Мультиязычность** - поддержка тайского, русского, английского

### Поддерживаемые форматы:
- 🇹🇭 **Тайский**: `ลำดับ ID No. ชื่อ สกุล หมายเหตุ`
- 🇷🇺 **Русский**: `№ Фамилия Имя Отчество`
- 🇬🇧 **Английский**: `# ID First Last`

Подробнее см.:
- [BULK_IMPORT_GUIDE.md](./BULK_IMPORT_GUIDE.md) - общая инструкция
- [THAI_FORMAT_EXAMPLE.md](./THAI_FORMAT_EXAMPLE.md) - примеры тайского формата 🇹🇭

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
