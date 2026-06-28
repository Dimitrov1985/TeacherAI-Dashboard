export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7; // Monday = 0
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addMonths(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
}

export type CalendarDay = {
  date: Date;
  iso: string;
  day: number;
  inCurrentMonth: boolean;
};

export function buildMonthGrid(monthDate: Date): CalendarDay[] {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const gridStart = startOfWeek(firstOfMonth);

  const lastOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const gridEnd = startOfWeek(addDays(lastOfMonth, 6 - ((lastOfMonth.getDay() + 6) % 7)));

  const days: CalendarDay[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    days.push({
      date: cursor,
      iso: toISODate(cursor),
      day: cursor.getDate(),
      inCurrentMonth: cursor.getMonth() === monthDate.getMonth(),
    });
    cursor = addDays(cursor, 1);
  }
  return days;
}
