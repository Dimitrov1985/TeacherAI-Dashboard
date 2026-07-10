import styles from './Journal.module.css'

type GradeValue = string

interface FinalGradesTableProps {
  students: Array<{ id: string; firstName: string; lastName: string; studentId?: string }>
  grades: GradeValue[][]
  finalOverride: Record<number, number>
  onFin: (si: number, v: number) => void
}

function calcAvg(row: GradeValue[]): string | null {
  const nums = row.filter((v) => v && !isNaN(+v) && +v > 0).map(Number)
  if (!nums.length) return null
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)
}

function autoFin(avg: string | null): number | null {
  if (avg === null) return null
  const v = parseFloat(avg)
  if (v >= 4.5) return 5
  if (v >= 3.5) return 4
  if (v >= 2.5) return 3
  return 2
}

function gColorClass(v: number | null): string {
  if (v === 5) return styles.g5
  if (v === 4) return styles.g4
  if (v === 3) return styles.g3
  if (v === 2) return styles.g2
  return ''
}

export default function FinalGradesTable({ students, grades, finalOverride, onFin }: FinalGradesTableProps) {
  const stats = { 5: 0, 4: 0, 3: 0, 2: 0 }

  students.forEach((_, si) => {
    const avg = calcAvg(grades[si])
    const fin = finalOverride[si] !== undefined ? finalOverride[si] : autoFin(avg)
    if (fin && fin >= 2 && fin <= 5) {
      stats[fin as 2 | 3 | 4 | 5]++
    }
  })

  const total = stats[5] + stats[4] + stats[3] + stats[2]
  const pct5 = total > 0 ? Math.round((stats[5] / total) * 100) : 0
  const pct4 = total > 0 ? Math.round((stats[4] / total) * 100) : 0
  const pct3 = total > 0 ? Math.round((stats[3] / total) * 100) : 0
  const pct2 = total > 0 ? Math.round((stats[2] / total) * 100) : 0

  function handleFin(si: number, cur: number | null) {
    const v = prompt('Final Grade (2–5):', String(cur ?? ''))
    if (v && ['2', '3', '4', '5'].includes(v.trim())) onFin(si, +v.trim())
  }

  return (
    <div className={styles.finSection}>
      {/* Stats cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statG} ${styles.g5}`}>
            5
          </div>
          <div className={styles.statN}>{stats[5]}</div>
          <div className={styles.statP}>{pct5}%</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statG} ${styles.g4}`}>
            4
          </div>
          <div className={styles.statN}>{stats[4]}</div>
          <div className={styles.statP}>{pct4}%</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statG} ${styles.g3}`}>
            3
          </div>
          <div className={styles.statN}>{stats[3]}</div>
          <div className={styles.statP}>{pct3}%</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statG} ${styles.g2}`}>
            2
          </div>
          <div className={styles.statN}>{stats[2]}</div>
          <div className={styles.statP}>{pct2}%</div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.finTblWrap}>
        <table className={styles.finTbl}>
          <thead>
            <tr>
              <th className={styles.finThN}>#</th>
              <th className={styles.finThName}>Student</th>
              <th className={styles.finThV}>Average</th>
              <th className={styles.finThV}>Final</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, si) => {
              const avg = calcAvg(grades[si])
              const fin = finalOverride[si] !== undefined ? finalOverride[si] : autoFin(avg)
              return (
                <tr key={student.id} className={si % 2 === 1 ? styles.rowAlt : ''}>
                  <td className={styles.finNum}>{student.studentId || si + 1}</td>
                  <td className={styles.finName}>
                    {student.firstName} {student.lastName}
                  </td>
                  <td className={styles.finAvg}>{avg ?? '—'}</td>
                  <td
                    className={`${styles.finFin} ${gColorClass(fin)}`}
                    onClick={() => handleFin(si, fin)}
                  >
                    {fin ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
