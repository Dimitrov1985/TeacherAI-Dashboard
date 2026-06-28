export type Lesson = {
  id: string;
  day: number; // 0 = Mon ... 6 = Sun
  title: string;
  class?: string; // class name (e.g., "10A")
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  color: string;
  bg: string;
  border: string;
};

export type ColorPreset = {
  name: string;
  color: string;
  bg: string;
  border: string;
};

export const COLOR_PRESETS: ColorPreset[] = [
  { name: "Red", color: "#FF4974", bg: "#FFBABE", border: "#FF3C6A" },
  { name: "Orange", color: "#D78D03", bg: "#FFE7BA", border: "#D78D03" },
  { name: "Blue", color: "#5272E9", bg: "#E9EFFF", border: "#5272E9" },
  { name: "Teal", color: "#24B0C9", bg: "#E6FEFF", border: "#24B0C9" },
  { name: "Amber", color: "#FF6500", bg: "#FFC9BE", border: "#FF6500" },
  { name: "Green", color: "#3ECD88", bg: "#D9F9E9", border: "#3ECD88" },
];

export const INITIAL_LESSONS: Lesson[] = [
  { id: "l-1", day: 2, title: "Applied Science", start: "09:30", end: "11:20", ...presetByName("Red") },
  { id: "l-2", day: 4, title: "UX Design", start: "12:00", end: "13:40", ...presetByName("Orange") },
  { id: "l-3", day: 3, title: "Technology", start: "11:30", end: "12:30", ...presetByName("Blue") },
  { id: "l-4", day: 3, title: "Artificial Intelligence", start: "14:00", end: "15:40", ...presetByName("Teal") },
  { id: "l-5", day: 5, title: "Business Management", start: "15:00", end: "16:00", ...presetByName("Amber") },
];

function presetByName(name: string) {
  const preset = COLOR_PRESETS.find((p) => p.name === name)!;
  return { color: preset.color, bg: preset.bg, border: preset.border };
}
