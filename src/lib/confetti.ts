import confetti from 'canvas-confetti'

/**
 * Запустить анимацию конфетти при успешном входе/регистрации
 */
export function celebrateSuccess(): Promise<void> {
  return new Promise((resolve) => {
    // Конфигурация для красивого салюта
    const duration = 2000 // 2 секунды
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    // Интервал для запуска множественных всплесков
    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        resolve()
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Салют с двух сторон экрана
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)
  })
}

/**
 * Быстрый салют (более короткая анимация)
 */
export function quickCelebration(): Promise<void> {
  return new Promise((resolve) => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    }

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    // Серия салютов разных цветов
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    })

    fire(0.2, {
      spread: 60,
    })

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    })

    // Завершить через 1.5 секунды
    setTimeout(() => resolve(), 1500)
  })
}

/**
 * Простой салют из центра
 */
export function simpleCelebration(): Promise<void> {
  return new Promise((resolve) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 9999,
    })

    setTimeout(() => resolve(), 1000)
  })
}
