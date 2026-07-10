/**
 * Универсальные стили для модальных окон с поддержкой темы
 */

export const modalOverlayStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
};

export const modalContainerStyle = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  boxShadow: 'var(--card-shadow-hover)',
};

export const modalHeaderStyle = {
  color: 'var(--text-primary)',
};

export const modalSubtitleStyle = {
  color: 'var(--text-secondary)',
};

export const modalLabelStyle = {
  color: 'var(--text-primary)',
};

export const modalInputStyle = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
};

export const modalTextareaStyle = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
};

export const modalSelectStyle = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
};

export const modalButtonPrimaryStyle = {
  backgroundColor: 'var(--accent)',
  color: 'white',
};

export const modalButtonSecondaryStyle = {
  color: 'var(--text-secondary)',
};

export const modalButtonDangerStyle = {
  color: '#FF4974',
};

export const modalCloseButtonStyle = {
  color: 'var(--text-muted)',
};

/**
 * Обработчики hover для input/textarea/select
 */
export const inputFocusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'var(--accent)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'var(--border)';
  },
};

/**
 * Обработчики hover для кнопки закрытия
 */
export const closeButtonHandlers = {
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = 'var(--text-primary)';
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = 'var(--text-muted)';
  },
};

/**
 * Обработчики hover для primary button
 */
export const primaryButtonHandlers = {
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--accent)';
  },
};

/**
 * Обработчики hover для secondary button
 */
export const secondaryButtonHandlers = {
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)';
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  },
};

/**
 * Обработчики hover для danger button
 */
export const dangerButtonHandlers = {
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#FF497420';
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  },
};
