# Руководство для разработчиков

## Структура проекта

```
├── api/                          # Serverless API функции (Vercel)
│   └── generate-plan.ts         # Endpoint для генерации плана через Claude AI
├── src/
│   ├── components/
│   │   └── Dashboard/           # Компоненты дашборда
│   │       ├── LessonPlanViewer.tsx       # Просмотр плана + экспорт
│   │       ├── LessonDetailModal.tsx      # Детали урока + материалы
│   │       ├── GeneratePlanModal.tsx      # Генерация плана из фото
│   │       ├── CalendarNotes.tsx          # 📝 Список заметок (НОВОЕ!)
│   │       ├── NoteModal.tsx              # 📝 Создание/редактирование заметки (НОВОЕ!)
│   │       ├── MiniCalendar.tsx           # Календарь с индикаторами
│   │       └── RightPanel.tsx             # Правая панель с календарём
│   ├── data/                    # Типы данных и начальные данные
│   │   ├── lessonDetails.ts     # Типы для планов, студентов, материалов
│   │   ├── lessons.ts           # Типы для уроков
│   │   ├── events.ts            # Календарные события
│   │   └── notes.ts             # 📝 Типы для заметок (НОВОЕ!)
│   ├── lib/                     # Утилиты
│   │   ├── exportToWord.ts      # 📥 Экспорт в Word
│   │   ├── materialsStore.ts    # localStorage для материалов
│   │   ├── notesStore.ts        # 📝 localStorage для заметок (НОВОЕ!)
│   │   ├── date.ts              # Утилиты для работы с датами
│   │   └── testExport.ts        # Тест экспорта
│   └── App.tsx                  # Главный компонент
├── .env.example                 # Шаблон переменных окружения
├── EXPORT_GUIDE.md             # Руководство пользователя по экспорту
└── CHANGELOG.md                # История изменений
```

## Установка и запуск

### Требования
- Node.js 24+ (LTS)
- npm или yarn
- Ключ API от Anthropic (Claude)

### Установка зависимостей

```bash
npm install
```

### Настройка переменных окружения

1. Скопируйте `.env.example` в `.env.local`:
```bash
cp .env.example .env.local
```

2. Добавьте ваш API ключ Anthropic:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

### Сборка для продакшена

```bash
npm run build
```

### Предпросмотр сборки

```bash
npm run preview
```

## Основные технологии

- **Frontend**: React 19 + TypeScript 6
- **Сборка**: Vite 8
- **Стили**: TailwindCSS 4
- **AI**: Anthropic Claude API (Sonnet 4.6)
- **Backend**: Vercel Serverless Functions
- **Word Export**: docx + file-saver

## Работа с экспортом в Word

### Как это работает

1. Компонент вызывает `exportLessonPlanToWord(plan)`
2. Функция создаёт документ Word используя библиотеку `docx`
3. Документ конвертируется в Blob
4. `file-saver` инициирует скачивание файла

### Структура документа

Документ создаётся с помощью класса `Document` из библиотеки `docx`:

```typescript
const doc = new Document({
  sections: [{
    children: [
      // Заголовок
      new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
      
      // Секции с маркированными списками
      new Paragraph({ text: 'Цели урока', heading: HeadingLevel.HEADING_2 }),
      ...objectives.map(obj => new Paragraph({ text: obj, bullet: true })),
      
      // Таблица с карточками
      new Table({ rows: [...] }),
    ]
  }]
})
```

### Расширение функциональности экспорта

#### Добавление нового раздела

В файле `src/lib/exportToWord.ts`:

```typescript
// После существующих разделов добавьте:
new Paragraph({
  text: 'Новый раздел',
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 300, after: 200 },
}),
...plan.newSection.map(item => 
  new Paragraph({
    text: item,
    bullet: { level: 0 },
  })
),
```

#### Изменение стилей

```typescript
new Paragraph({
  text: 'Текст',
  alignment: AlignmentType.CENTER,  // Выравнивание
  spacing: { before: 200, after: 100 },  // Отступы (twips)
  border: { /* ... */ },  // Границы
})
```

#### Добавление изображений

```typescript
new Paragraph({
  children: [
    new ImageRun({
      data: imageBuffer,
      transformation: {
        width: 400,
        height: 300,
      },
    }),
  ],
}),
```

## API Endpoints

### POST /api/generate-plan

Генерирует план урока из фото учебника.

**Request:**
```json
{
  "imageDataUrl": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "plan": {
    "title": "Название урока",
    "objectives": ["Цель 1", "Цель 2"],
    "flashcards": [
      { "front": "Вопрос", "back": "Ответ" }
    ],
    "activities": ["Активность 1"],
    "materialsNeeded": ["Материал 1"]
  }
}
```

## Типы данных

### GeneratedLessonPlan

```typescript
type GeneratedLessonPlan = {
  title: string
  objectives: string[]
  flashcards: Flashcard[]
  activities: string[]
  materialsNeeded: string[]
}

type Flashcard = {
  front: string
  back: string
}
```

## Тестирование экспорта

### В браузерной консоли:

```javascript
// Импортируйте тестовую функцию
import { runTest } from './lib/testExport'

// Запустите тест
runTest()
```

### Ручное тестирование:

1. Откройте приложение
2. Создайте урок
3. Сгенерируйте план урока
4. Откройте план
5. Нажмите "Скачать Word"
6. Проверьте скачанный файл

## Отладка

### Проблемы с экспортом

Включите логирование в `exportToWord.ts`:

```typescript
export async function exportLessonPlanToWord(plan: LessonPlan) {
  console.log('Starting export for plan:', plan.title)
  
  const doc = new Document({ /* ... */ })
  console.log('Document created')
  
  const blob = await Packer.toBlob(doc)
  console.log('Blob size:', blob.size)
  
  saveAs(blob, fileName)
  console.log('Download initiated:', fileName)
}
```

### Проблемы с API

Проверьте переменные окружения:

```typescript
// В api/generate-plan.ts
console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY)
```

## Деплой на Vercel

1. Подключите репозиторий к Vercel
2. Добавьте переменную окружения `ANTHROPIC_API_KEY` в настройках проекта
3. Деплой произойдёт автоматически

## Вклад в проект

1. Создайте ветку для вашей функции: `git checkout -b feature/amazing-feature`
2. Сделайте коммит: `git commit -m 'Add amazing feature'`
3. Запушьте ветку: `git push origin feature/amazing-feature`
4. Создайте Pull Request

## Лицензия

Проект создан для образовательных целей.
