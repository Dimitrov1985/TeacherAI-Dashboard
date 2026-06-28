// Utility to dispatch custom storage events
export function emitMaterialsChange() {
  window.dispatchEvent(new Event('materials-changed'))
}

export function emitLessonsChange() {
  window.dispatchEvent(new Event('lessons-changed'))
}
