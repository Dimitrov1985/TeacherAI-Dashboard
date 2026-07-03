import type { Student } from '../data/students'

export interface PrintData {
  className: string
  subjectName: string
  periodName: string
  students: Student[]
  dates: Array<{ m: string; d: number; title?: string; type?: string }>
  grades: string[][]
  finalOverride: Record<number, number>
  showAllGrades: boolean
  showAttendance: boolean
  attendance?: string[][]
  selectedStudentId?: string
}

export function calculateAverage(grades: string[]): string | null {
  const nums = grades.filter((v) => v && !isNaN(+v) && +v > 0).map(Number)
  if (!nums.length) return null
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)
}

export function calculateFinalGrade(avg: string | null, override?: number): number | null {
  if (override !== undefined) return override
  if (avg === null) return null
  const v = parseFloat(avg)
  if (v >= 4.5) return 5
  if (v >= 3.5) return 4
  if (v >= 2.5) return 3
  return 2
}

export function openPrintWindow(data: PrintData): void {
  const printWindow = window.open('', '_blank', 'width=1200,height=800')
  if (!printWindow) {
    alert('Please allow popups for this site to enable printing')
    return
  }

  const html = generatePrintHTML(data)
  printWindow.document.write(html)
  printWindow.document.close()

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

function generatePrintHTML(data: PrintData): string {
  const {
    className,
    subjectName,
    periodName,
    students,
    dates,
    grades,
    finalOverride,
    showAllGrades,
    showAttendance,
    attendance,
    selectedStudentId,
  } = data

  // Filter students if needed
  const filteredStudents = selectedStudentId
    ? students.filter((s) => s.id === selectedStudentId)
    : students

  const filteredGrades = selectedStudentId
    ? grades.filter((_, si) => students[si]?.id === selectedStudentId)
    : grades

  const filteredAttendance =
    showAttendance && attendance && selectedStudentId
      ? attendance.filter((_, si) => students[si]?.id === selectedStudentId)
      : attendance

  const today = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Determine orientation based on column count
  const columnCount = showAllGrades ? dates.length : 0
  const isLandscape = columnCount > 10

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Печать - ${className} - ${subjectName}</title>
  <style>
    @page {
      size: ${isLandscape ? 'landscape' : 'portrait'};
      margin: 15mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11pt;
      color: #000;
      background: #fff;
      padding: 10px;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #000;
    }

    .header h1 {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .header p {
      font-size: 12pt;
      margin-bottom: 4px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    th, td {
      border: 1px solid #000;
      padding: 6px 8px;
      text-align: center;
      vertical-align: middle;
    }

    th {
      background-color: #f0f0f0;
      font-weight: bold;
      font-size: 10pt;
    }

    td {
      font-size: 10pt;
    }

    .td-number {
      width: 40px;
      text-align: center;
    }

    .td-name {
      text-align: left;
      min-width: 150px;
    }

    .td-grade {
      min-width: 30px;
    }

    .td-avg {
      font-weight: bold;
      min-width: 60px;
    }

    .td-final {
      font-weight: bold;
      font-size: 11pt;
      min-width: 60px;
    }

    .grade-5 { color: #1a7a2a; }
    .grade-4 { color: #185fa5; }
    .grade-3 { color: #854f0b; }
    .grade-2 { color: #a32d2d; }

    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #000;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer .date {
      font-size: 10pt;
    }

    .footer .signature {
      font-size: 10pt;
    }

    .signature-line {
      display: inline-block;
      border-bottom: 1px solid #000;
      width: 200px;
      margin-left: 10px;
    }

    tr {
      page-break-inside: avoid;
    }

    @media print {
      body {
        padding: 0;
      }

      .no-print {
        display: none !important;
      }
    }

    .att-status {
      font-size: 9pt;
    }

    .att-present { color: #1a7a2a; }
    .att-absent { color: #a32d2d; background-color: #fcebeb; }
    .att-late { color: #854f0b; }
    .att-excused { color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${className} — ${subjectName}</h1>
    <p>${periodName}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th class="td-number">№</th>
        <th class="td-name">ФИО студента</th>
        ${
          showAllGrades
            ? dates
                .map(
                  (d) =>
                    `<th class="td-grade" title="${d.m} ${d.d}">${d.title ? `${d.title}<br>${d.d}` : d.d}</th>`
                )
                .join('')
            : ''
        }
        <th class="td-avg">Средний балл</th>
        <th class="td-final">Итоговая оценка</th>
        ${showAttendance ? '<th class="td-avg">Посещаемость</th>' : ''}
      </tr>
    </thead>
    <tbody>
      ${filteredStudents
        .map((student, si) => {
          const studentGrades = filteredGrades[si] || []
          const avg = calculateAverage(studentGrades)
          const fin = calculateFinalGrade(avg, finalOverride[selectedStudentId ? students.findIndex(s => s.id === student.id) : si])

          const gradeClass = fin ? `grade-${fin}` : ''

          let attendanceData = ''
          if (showAttendance && filteredAttendance) {
            const attRow = filteredAttendance[si] || []
            const total = attRow.length
            const present = attRow.filter((v) => v === 'present').length
            const attPercent = total > 0 ? Math.round((present / total) * 100) : 0
            attendanceData = `<td class="td-avg">${attPercent}%</td>`
          }

          return `
          <tr>
            <td class="td-number">${student.studentId || si + 1}</td>
            <td class="td-name">${student.firstName} ${student.lastName}</td>
            ${
              showAllGrades
                ? studentGrades
                    .map((grade) => {
                      const grClass = grade === '5' ? 'grade-5' : grade === '4' ? 'grade-4' : grade === '3' ? 'grade-3' : grade === '2' ? 'grade-2' : ''
                      return `<td class="td-grade ${grClass}">${grade || '—'}</td>`
                    })
                    .join('')
                : ''
            }
            <td class="td-avg">${avg || '—'}</td>
            <td class="td-final ${gradeClass}">${fin || '—'}</td>
            ${attendanceData}
          </tr>
        `
        })
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <div class="date">Дата печати: ${today}</div>
    <div class="signature">
      Учитель: <span class="signature-line"></span> (подпись)
    </div>
  </div>
</body>
</html>
  `
}
