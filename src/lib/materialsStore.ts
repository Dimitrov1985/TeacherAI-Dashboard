import type { Material } from "../data/lessonDetails";

const STORAGE_PREFIX = "teacher-dashboard:materials:";

function storageKey(lessonId: string): string {
  return `${STORAGE_PREFIX}${lessonId}`;
}

export function loadMaterials(lessonId: string, defaults: Material[]): Material[] {
  const raw = localStorage.getItem(storageKey(lessonId));
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Material[];
  } catch {
    // ignore malformed storage and fall back to defaults
  }
  return defaults;
}

export function saveMaterials(lessonId: string, materials: Material[]): void {
  localStorage.setItem(storageKey(lessonId), JSON.stringify(materials));
}
