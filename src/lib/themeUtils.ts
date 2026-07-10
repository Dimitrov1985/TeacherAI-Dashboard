/**
 * Утилиты для работы с темой
 */

export const themeColors = {
  bgPage: 'var(--bg-page)',
  bgSurface: 'var(--bg-surface)',
  bgSurface2: 'var(--bg-surface-2)',
  bgSidebar: 'var(--bg-sidebar)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  border: 'var(--border)',
  borderStrong: 'var(--border-strong)',
  accent: 'var(--accent)',
  accentHover: 'var(--accent-hover)',
  cardShadow: 'var(--card-shadow)',
  cardShadowHover: 'var(--card-shadow-hover)',
  grade5: 'var(--grade-5)',
  grade4: 'var(--grade-4)',
  grade3: 'var(--grade-3)',
  grade2: 'var(--grade-2)',
} as const;

/**
 * Получить цвет оценки
 */
export function getGradeColor(grade: number): string {
  if (grade >= 5) return themeColors.grade5;
  if (grade >= 4) return themeColors.grade4;
  if (grade >= 3) return themeColors.grade3;
  return themeColors.grade2;
}

/**
 * Базовые стили для карточек
 */
export const cardStyles = {
  backgroundColor: themeColors.bgSurface,
  color: themeColors.textPrimary,
  border: `1px solid ${themeColors.border}`,
  boxShadow: themeColors.cardShadow,
} as const;

/**
 * Базовые стили для кнопок
 */
export const buttonStyles = {
  primary: {
    backgroundColor: themeColors.accent,
    color: 'white',
    border: `1px solid ${themeColors.accent}`,
  },
  secondary: {
    backgroundColor: themeColors.bgSurface2,
    color: themeColors.textPrimary,
    border: `1px solid ${themeColors.border}`,
  },
} as const;

/**
 * Базовые стили для инпутов
 */
export const inputStyles = {
  backgroundColor: themeColors.bgSurface,
  color: themeColors.textPrimary,
  border: `1px solid ${themeColors.border}`,
} as const;
