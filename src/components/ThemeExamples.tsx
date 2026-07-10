/**
 * Примеры использования системы тематизации
 * Используйте этот файл как справочник при создании новых компонентов
 */

import { themeColors, cardStyles, buttonStyles, inputStyles, getGradeColor } from '../lib/themeUtils';
import { useTheme } from '../hooks/useTheme';

export function ThemeExamples() {
  const theme = useTheme();

  return (
    <div style={{ padding: '2rem', backgroundColor: themeColors.bgPage }}>
      <h1 style={{ color: themeColors.textPrimary, marginBottom: '2rem' }}>
        Примеры компонентов с темой (текущая: {theme})
      </h1>

      {/* Карточка */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: themeColors.textSecondary, marginBottom: '1rem' }}>Карточка</h2>
        <div style={{ ...cardStyles, borderRadius: '1rem', padding: '1.5rem' }}>
          <h3 style={{ color: themeColors.textPrimary, marginBottom: '0.5rem' }}>
            Заголовок карточки
          </h3>
          <p style={{ color: themeColors.textSecondary }}>
            Это пример текста в карточке. Он автоматически адаптируется под тему.
          </p>
          <p style={{ color: themeColors.textMuted, fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Дополнительная информация приглушённым текстом
          </p>
        </div>
      </section>

      {/* Кнопки */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: themeColors.textSecondary, marginBottom: '1rem' }}>Кнопки</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            style={{
              ...buttonStyles.primary,
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Основная
          </button>
          <button
            style={{
              ...buttonStyles.secondary,
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Вторичная
          </button>
        </div>
      </section>

      {/* Инпуты */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: themeColors.textSecondary, marginBottom: '1rem' }}>Формы</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Текстовое поле..."
            style={{
              ...inputStyles,
              padding: '0.75rem',
              borderRadius: '0.5rem',
              outline: 'none',
            }}
          />
          <textarea
            placeholder="Многострочное поле..."
            style={{
              ...inputStyles,
              padding: '0.75rem',
              borderRadius: '0.5rem',
              outline: 'none',
              resize: 'vertical',
              minHeight: '100px',
            }}
          />
          <select
            style={{
              ...inputStyles,
              padding: '0.75rem',
              borderRadius: '0.5rem',
              outline: 'none',
            }}
          >
            <option>Вариант 1</option>
            <option>Вариант 2</option>
            <option>Вариант 3</option>
          </select>
        </div>
      </section>

      {/* Оценки */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: themeColors.textSecondary, marginBottom: '1rem' }}>Цвета оценок</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[5, 4, 3, 2].map((grade) => (
            <div
              key={grade}
              style={{
                ...cardStyles,
                padding: '1rem',
                borderRadius: '0.5rem',
                textAlign: 'center',
                minWidth: '80px',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: getGradeColor(grade),
                }}
              >
                {grade}
              </div>
              <div style={{ color: themeColors.textMuted, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {grade === 5 ? 'Отлично' : grade === 4 ? 'Хорошо' : grade === 3 ? 'Удовл.' : 'Неуд.'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Список */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: themeColors.textSecondary, marginBottom: '1rem' }}>Список с hover</h2>
        <div style={{ ...cardStyles, borderRadius: '1rem', overflow: 'hidden' }}>
          {['Элемент 1', 'Элемент 2', 'Элемент 3'].map((item, index) => (
            <div
              key={index}
              style={{
                padding: '1rem',
                borderBottom: index < 2 ? `1px solid ${themeColors.border}` : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.bgSurface2;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ color: themeColors.textPrimary, fontWeight: 500 }}>{item}</div>
              <div style={{ color: themeColors.textMuted, fontSize: '0.875rem' }}>
                Описание элемента
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Таблица */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: themeColors.textSecondary, marginBottom: '1rem' }}>Таблица</h2>
        <div style={{ ...cardStyles, borderRadius: '1rem', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: themeColors.bgSurface2 }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: themeColors.textPrimary }}>
                  Имя
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: themeColors.textPrimary }}>
                  Оценка
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: themeColors.textPrimary }}>
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Иванов И.', grade: 5, status: 'Сдано' },
                { name: 'Петров П.', grade: 4, status: 'Сдано' },
                { name: 'Сидоров С.', grade: 3, status: 'Проверяется' },
              ].map((row, index) => (
                <tr
                  key={index}
                  style={{ borderTop: `1px solid ${themeColors.border}` }}
                >
                  <td style={{ padding: '1rem', color: themeColors.textPrimary }}>
                    {row.name}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        color: getGradeColor(row.grade),
                        fontWeight: 'bold',
                      }}
                    >
                      {row.grade}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: themeColors.textSecondary }}>
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Badge/Tag */}
      <section>
        <h2 style={{ color: themeColors.textSecondary, marginBottom: '1rem' }}>Бейджи</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              backgroundColor: themeColors.accent,
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Активный
          </span>
          <span
            style={{
              backgroundColor: themeColors.bgSurface2,
              color: themeColors.textPrimary,
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 500,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            Нейтральный
          </span>
          <span
            style={{
              backgroundColor: 'transparent',
              color: themeColors.textMuted,
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 500,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            Неактивный
          </span>
        </div>
      </section>
    </div>
  );
}
