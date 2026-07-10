// Re-export useTheme from ThemeContext for backwards compatibility
export { useTheme } from '../context/ThemeContext';

export function getCSSVariable(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}
