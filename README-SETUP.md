# 📚 Teacher Dashboard - Полная инструкция по установке

## ✅ Что включено в архив:

- ✨ Полный исходный код проекта
- 📦 Все зависимости (package.json)
- 🎨 Компоненты и стили
- 🔧 Конфигурация Vite + TypeScript
- 📊 База данных (localStorage)
- 🤖 AI интеграция для генерации планов уроков

---

## 🚀 Быстрый старт:

### 1. Установка зависимостей:

```bash
npm install
```

### 2. Запуск проекта:

```bash
npm run dev
```

Откроется браузер на **http://localhost:5174**

---

## 📁 Структура проекта:

```
новай проэкт для учителя/
├── src/
│   ├── components/          # Все компоненты
│   │   ├── Dashboard/       # Dashboard компоненты
│   │   │   ├── WeeklySchedule.tsx     # Расписание уроков
│   │   │   ├── LessonModal.tsx        # Добавление/редактирование урока
│   │   │   ├── LessonDetailModal.tsx  # Детали урока + материалы
│   │   │   ├── Sidebar.tsx            # Боковая панель
│   │   │   └── RightPanel.tsx         # Правая панель с календарём
│   │   ├── StatCards.tsx              # Статистика (4 карточки)
│   │   ├── GenerateLessonModal.tsx    # Генерация плана урока AI
│   │   └── Students/                  # Компоненты студентов
│   ├── pages/
│   │   ├── DashboardPage.tsx          # Главная страница
│   │   ├── LessonsPage.tsx            # Страница "Мои уроки"
│   │   ├── StudentsPage.tsx           # Страница студентов
│   │   ├── LoginPage.tsx              # Вход
│   │   └── SignUpPage.tsx             # Регистрация
│   ├── lib/                           # Библиотеки и утилиты
│   │   ├── auth.ts                    # Аутентификация
│   │   ├── studentsStore.ts           # Управление студентами
│   │   ├── lessonsStore.ts            # Управление уроками
│   │   ├── teacherStore.ts            # Профиль учителя
│   │   ├── exportToWord.ts            # Экспорт в Word
│   │   └── migrateData.ts             # Миграция данных
│   ├── data/                          # Данные и типы
│   │   ├── lessons.ts                 # Типы уроков + цветовые пресеты
│   │   ├── initialStudents.ts         # Начальные данные студентов
│   │   └── references.ts              # Справочники (классы, предметы)
│   └── App.tsx                        # Корневой компонент
├── public/                            # Статические файлы
├── index.html                         # Точка входа
├── package.json                       # Зависимости
├── tsconfig.json                      # TypeScript конфигурация
└── vite.config.ts                     # Vite конфигурация
```

---

## 🎯 Основные функции:

### 📊 Dashboard (Главная страница):
- **StatCards** - 4 карточки статистики:
  - 👥 Total Students (26)
  - 📊 Average Grade (4.5)
  - ✅ Attendance (95%)
  - 📚 My Classes (количество уроков в расписании)
- **SearchBar** - поиск по системе
- **WeeklySchedule** - расписание уроков на неделю (7 дней × 12 часов)

### 📅 Weekly Schedule (Расписание):
- **Визуальная сетка:** 7 дней × 12 часов (07:00-18:00)
- **Добавление урока:** клик "+ Add lesson" или на пустое место
- **Детали урока:** клик на урок → модальное окно с материалами/ДЗ
- **Редактирование:** Edit → изменить предмет, время, класс, цвет
- **6 цветовых пресетов:** Red, Orange, Blue, Teal, Amber, Green
- **Генерация плана урока:** AI создаёт детальный план урока
- **Экспорт в Word:** скачать план урока в формате .docx

### 📚 My Lessons (Мои уроки):
- **Генерация планов:** AI создаёт планы уроков по теме и классу
- **Статистика с 3D графиками:** интерактивные графики по классам/предметам
- **Фильтрация:** по классу и теме
- **Два режима:** Grid (карточки) и List (список)
- **Привязка к расписанию:** связать план с уроком в Weekly Schedule
- **Экспорт в Word:** скачать любой план

### 👥 Students (Студенты):
- **Управление студентами:** добавление, редактирование, удаление
- **Импорт из файла:** массовый импорт студентов
- **Привязка к классам:** каждый студент привязан к классу
- **Оценки и посещаемость:** журнал с оценками

### 👤 Профиль учителя:
- **Аватар:** загрузка фото или инициалы
- **Данные:** имя, предмет
- **Multi-user:** каждый пользователь видит только свои данные

---

## 🔐 Аутентификация:

### Регистрация:
1. Откройте `/signup`
2. Заполните: Email, Password, Full Name, Subject
3. Sign Up → автоматический вход

### Вход:
1. Откройте `/login`
2. Email + Password
3. Sign In → Dashboard с анимацией конфетти ✨

### Выход:
- Кнопка в профиле → Sign Out
- Все данные сохраняются в localStorage с userId

---

## 💾 Хранение данных:

**Все данные хранятся в localStorage с userId:**

```typescript
teacher-dashboard:${userId}:students       // Студенты
teacher-dashboard:${userId}:grades         // Оценки
teacher-dashboard:${userId}:attendance     // Посещаемость
teacher-dashboard:${userId}:lessons        // Расписание уроков
teacher-dashboard:${userId}:lesson-plans   // Планы уроков
teacher-dashboard:${userId}:classes        // Классы
teacher-dashboard:${userId}:teacher        // Профиль учителя
teacher-dashboard:${userId}:avatar         // Аватар
```

---

## 🎨 Технологии:

- ⚛️ **React 19** - UI библиотека
- 📘 **TypeScript** - типизация
- ⚡ **Vite** - сборщик
- 🎨 **Tailwind CSS** - стили
- 🎉 **canvas-confetti** - анимация конфетти
- 📄 **docx** - экспорт в Word
- 🤖 **AI API** - генерация планов уроков

---

## 📝 Команды npm:

```bash
npm run dev        # Запуск dev сервера
npm run build      # Сборка для продакшена
npm run preview    # Просмотр production сборки
npm run lint       # Проверка кода
```

---

## 🐛 Отладка:

### Консоль браузера (F12):

```javascript
// Посмотреть данные текущего пользователя
const authData = localStorage.getItem('teacher-dashboard:auth')
const userId = JSON.parse(authData).id
console.log('User ID:', userId)

// Посмотреть количество уроков
const lessons = localStorage.getItem(`teacher-dashboard:${userId}:lessons`)
console.log('Lessons:', JSON.parse(lessons))

// Посмотреть количество студентов
const students = localStorage.getItem(`teacher-dashboard:${userId}:students`)
console.log('Students:', JSON.parse(students))
```

---

## 🌟 Особенности:

✅ **Multi-user** - каждый пользователь видит только свои данные  
✅ **Реактивность** - все счётчики обновляются автоматически  
✅ **Адаптивность** - работает на мобильных и десктопах  
✅ **AI генерация** - создание планов уроков через API  
✅ **Экспорт Word** - скачивание планов в .docx формате  
✅ **Анимации** - конфетти при входе, плавные переходы  
✅ **Валидация** - проверка всех форм  
✅ **TypeScript** - полная типизация  

---

## 📞 Поддержка:

Если возникли вопросы или ошибки, проверьте:

1. **Node.js установлен?** (версия 18+)
2. **Зависимости установлены?** (`npm install`)
3. **Порт 5174 свободен?** (или используется другой)
4. **Браузер современный?** (Chrome, Firefox, Edge последней версии)

---

## 🎉 Готово!

Откройте **http://localhost:5174** и начните работу!

**Демо-аккаунты для теста:**
- Email: `teacher@school.com`
- Password: `password123`

Или создайте свой аккаунт через Sign Up! ✨

---

**Создано с ❤️ с помощью Claude Code**
