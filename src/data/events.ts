import { toISODate } from "../lib/date";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  time: string;
  color: string;
};

function relativeISODate(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return toISODate(date);
}

function formatLongDate(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
  const day = date.getDate();
  const month = date.toLocaleDateString(undefined, { month: "long" });
  return `${day} ${month} - ${weekday}`;
}

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "ev-1", title: "Applied Science Homework", date: relativeISODate(0), time: "11:30 - 12:30", color: "#CE1821" },
  { id: "ev-2", title: "Technology Exam", date: relativeISODate(1), time: "11:30 - 12:30", color: "#F99132" },
  { id: "ev-3", title: "Artificial Intelligence Workshop", date: relativeISODate(3), time: "11:30 - 12:30", color: "#F9CB32" },
  { id: "ev-4", title: "UX Design Conference", date: relativeISODate(6), time: "11:30 - 12:30", color: "#3ECD88" },
];

export { formatLongDate };
