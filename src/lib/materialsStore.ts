import type { Material } from "../data/lessonDetails";
import { getCurrentUserId } from './auth'

function storageKey(lessonId: string): string {
  const userId = getCurrentUserId()
  if (!userId) return `teacher-dashboard:materials:${lessonId}`
  return `teacher-dashboard:${userId}:materials:${lessonId}`;
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
