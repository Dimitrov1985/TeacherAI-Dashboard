// Utility to dispatch custom storage events
export function emitMaterialsChange() {
  window.dispatchEvent(new Event('materials-changed'))
}

export function emitLessonsChange() {
  window.dispatchEvent(new Event('lessons-changed'))
}

export function emitLessonPlansChange() {
  window.dispatchEvent(new Event('lesson-plans-changed'))
}

export function emitHomeworkChange() {
  window.dispatchEvent(new Event('homework-changed'))
}
