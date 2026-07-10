// components/ThemeToggle.tsx — переключатель темы (Uiverse by RiccardoRapelli)
// Подключён к ThemeContext: клик переключает light/dark, состояние сохраняется
import { useTheme } from '../context/ThemeContext'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <label className={styles.switch} aria-label="Toggle dark mode">
      <input
        type="checkbox"
        className={styles.input}
        checked={isDark}
        onChange={toggleTheme}
      />
      <div className={`${styles.slider} ${styles.round}`}>
        <div className={styles.sunMoon}>
          <svg className={`${styles.moonDot} ${styles.moonDot1}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className={`${styles.moonDot} ${styles.moonDot2}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className={`${styles.moonDot} ${styles.moonDot3}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className={`${styles.lightRay} ${styles.lightRay1}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className={`${styles.lightRay} ${styles.lightRay2}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className={`${styles.lightRay} ${styles.lightRay3}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className={`${styles.cloudDark} ${styles.cloud1}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className={`${styles.cloudDark} ${styles.cloud2}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className={`${styles.cloudDark} ${styles.cloud3}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className={`${styles.cloudLight} ${styles.cloud4}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className={`${styles.cloudLight} ${styles.cloud5}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className={`${styles.cloudLight} ${styles.cloud6}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
        </div>
        <div className={styles.stars}>
          <svg className={`${styles.star} ${styles.star1}`} viewBox="0 0 20 20"><path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" /></svg>
          <svg className={`${styles.star} ${styles.star2}`} viewBox="0 0 20 20"><path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" /></svg>
          <svg className={`${styles.star} ${styles.star3}`} viewBox="0 0 20 20"><path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" /></svg>
          <svg className={`${styles.star} ${styles.star4}`} viewBox="0 0 20 20"><path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" /></svg>
        </div>
      </div>
    </label>
  )
}
