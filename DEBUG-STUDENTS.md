# 🔍 Отладка проблемы со студентами

## Проблема:
При входе под новым пользователем на Dashboard показывается **5 студентов**, хотя должно быть **0**.

---

## ✅ Код проверен - всё правильно!

### **loadStudents()** использует userId:
```typescript
export function loadStudents(): Student[] {
  const userId = getCurrentUserId()
  if (!userId) return []
  
  const raw = localStorage.getItem(`teacher-dashboard:${userId}:students`)
  return raw ? JSON.parse(raw) : []
}
```

### **StatCards** использует loadStudents():
```typescript
setStudents(loadStudents())
```

---

## 🐛 Возможные причины:

### **1. Старые данные БЕЗ userId в localStorage**

Проверьте в консоли браузера (F12):

```javascript
// Проверить старые ключи
console.log('Старые студенты:', localStorage.getItem('teacher-dashboard:students'))

// Если есть - удалить
localStorage.removeItem('teacher-dashboard:students')
localStorage.removeItem('teacher-dashboard:grades')
localStorage.removeItem('teacher-dashboard:attendance')
```

### **2. Данные от предыдущего пользователя**

Если вы использовали другого пользователя на том же компьютере:

```javascript
// Показать все ключи с userId
Object.keys(localStorage).filter(key => key.includes('teacher-dashboard'))
```

### **3. Кэш браузера**

Hard refresh:
- **Chrome/Edge:** Ctrl + Shift + R
- **Firefox:** Ctrl + F5

---

## 🧹 Решение: Полная очистка

### **Вариант 1: В консоли (F12)**

```javascript
// Удалить ВСЕ данные приложения
Object.keys(localStorage)
  .filter(key => key.startsWith('teacher-dashboard'))
  .forEach(key => localStorage.removeItem(key))

// Перезагрузить
location.reload()
```

### **Вариант 2: DevTools**

1. F12 → **Application** (Chrome) / **Storage** (Firefox)
2. **Local Storage** → `http://localhost:3001`
3. **Правый клик** → Clear
4. Перезагрузить страницу

---

## ✅ Проверка после очистки:

### **Шаг 1: Выйти из аккаунта**
```
Logout → Login page
```

### **Шаг 2: Создать НОВОГО пользователя**
```
Sign Up → test2@test.com / password123
```

### **Шаг 3: Проверить Dashboard**
```
Total Students должно показывать: 0 ✅
```

### **Шаг 4: Проверить localStorage**

В консоли (F12):
```javascript
const userId = JSON.parse(localStorage.getItem('auth-user')).id
const key = `teacher-dashboard:${userId}:students`
const students = JSON.parse(localStorage.getItem(key) || '[]')

console.log('User ID:', userId)
console.log('Students key:', key)
console.log('Students count:', students.length) // Должно быть 0
```

---

## 🎯 Ожидаемое поведение:

| Действие | Ожидаемый результат |
|----------|-------------------|
| Новый пользователь создан | Total Students = 0 |
| Добавлен 1 студент | Total Students = 1 |
| Выход → Вход другим пользователем | Total Students = 0 (у нового) |
| Вход обратно первым пользователем | Total Students = 1 (свой студент) |

---

## 🔑 Если проблема сохраняется:

### **Проверьте getCurrentUserId()**

```javascript
// В консоли
console.log('Current User ID:', getCurrentUserId())
```

Должно вернуть строку типа `"user-1234567890"`.

Если возвращает `null` или `undefined` - проблема в аутентификации.

---

## 🚀 Финальный тест:

1. **Очистите localStorage** (см. выше)
2. **Перезагрузите** страницу
3. **Создайте 2 разных пользователя:**
   - user1@test.com
   - user2@test.com
4. **Под user1:** добавьте 3 студента
5. **Выйдите**
6. **Войдите как user2**
7. ✅ **Должно показывать 0 студентов**
8. **Войдите обратно как user1**
9. ✅ **Должно показывать 3 студента**

---

**Если всё работает правильно - проблема была в старых данных!** ✅
