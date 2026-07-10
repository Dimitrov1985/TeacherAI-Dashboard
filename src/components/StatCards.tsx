// StatCards.tsx — карточки статистики для Dashboard (стиль Uiverse.io)
// Использование в DashboardPage.tsx:
//   <StatCards
//     totalStudents={students.length}
//     averageGrade={averageGrade}
//     totalClasses={classesCount}
//     studentsTrend="+3"
//     gradeTrend="+0.3"
//   />

interface StatCardData {
  id: number
  value: string | number
  label: string
  trend: string
  trendUp: boolean | null   // true = зелёная ↗, false = красная ↘, null = серый —
  variant: 'blue' | 'green' | 'purple'
  icon: string              // Tabler icon class, напр. 'ti-users'
}

interface StatCardsProps {
  totalStudents: number
  averageGrade: number
  totalClasses: number
  studentsTrend?: string    // напр. "+3"
  gradeTrend?: string       // напр. "+0.3"
}

const CSS = `
.sc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
}
@media (max-width: 768px) {
  .sc-grid { grid-template-columns: 1fr; }
}

.sc-card {
  position: relative;
  overflow: hidden;
  background: var(--bg-surface);
  border-radius: 20px;
  padding: 22px 24px;
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow);
  transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.3s ease, border-color 0.3s ease;
  cursor: default;
}
.sc-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--sc-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}
.sc-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-shadow-hover);
}
.sc-card:hover::before { transform: scaleX(1); }

.sc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.sc-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.sc-trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
}
.sc-trend.up   { color: #1a7a2a; background: rgba(26,122,42,0.1); }
.sc-trend.down { color: #a32d2d; background: rgba(163,45,45,0.1); }
.sc-trend.flat { color: #94a3b8; background: rgba(148,163,184,0.12); }

.sc-num {
  font-size: 38px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 6px;
}
.sc-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.sc-glow {
  position: absolute;
  bottom: -40px;
  right: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.05;
  filter: blur(24px);
  pointer-events: none;
}
`

const VARIANTS = {
  blue:   { accent: 'linear-gradient(135deg,#60a5fa,#185fa5)', iconBg: 'rgba(24,95,165,0.1)',  iconColor: '#185fa5', glow: '#185fa5' },
  green:  { accent: 'linear-gradient(135deg,#4ade80,#1a7a2a)', iconBg: 'rgba(26,122,42,0.1)',  iconColor: '#1a7a2a', glow: '#1a7a2a' },
  purple: { accent: 'linear-gradient(135deg,#c084fc,#7c3aed)', iconBg: 'rgba(124,58,237,0.1)', iconColor: '#7c3aed', glow: '#7c3aed' },
}

function StatCard({ card }: { card: StatCardData }) {
  const v = VARIANTS[card.variant]
  const trendClass = card.trendUp === true ? 'up' : card.trendUp === false ? 'down' : 'flat'
  const trendIcon  = card.trendUp === true ? '↗' : card.trendUp === false ? '↘' : '—'

  return (
    <div className="sc-card" style={{ ['--sc-accent' as string]: v.accent }}>
      <div className="sc-glow" style={{ background: v.glow }} />
      <div className="sc-head">
        <div className="sc-icon" style={{ background: v.iconBg, color: v.iconColor }}>
          <i className={`ti ${card.icon}`} aria-hidden="true" />
        </div>
        <div className={`sc-trend ${trendClass}`}>
          <span>{trendIcon}</span>
          {card.trend && <span>{card.trend}</span>}
        </div>
      </div>
      <div
        className="sc-num"
        style={{
          background: v.accent,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {card.value}
      </div>
      <div className="sc-label">{card.label}</div>
    </div>
  )
}

export default function StatCards({
  totalStudents,
  averageGrade,
  totalClasses,
  studentsTrend,
  gradeTrend,
}: StatCardsProps) {
  const cards: StatCardData[] = [
    {
      id: 1,
      value: totalStudents,
      label: 'Total Students',
      trend: studentsTrend ?? '',
      trendUp: studentsTrend ? true : null,
      variant: 'blue',
      icon: 'ti-users',
    },
    {
      id: 2,
      value: averageGrade > 0 ? averageGrade.toFixed(1) : '0.0',
      label: 'Average Grade',
      trend: gradeTrend ?? '',
      trendUp: gradeTrend ? true : null,
      variant: 'green',
      icon: 'ti-chart-bar',
    },
    {
      id: 3,
      value: totalClasses,
      label: 'My Classes',
      trend: '',
      trendUp: null,
      variant: 'purple',
      icon: 'ti-books',
    },
  ]

  return (
    <>
      <style>{CSS}</style>
      <div className="sc-grid">
        {cards.map((card) => (
          <StatCard key={card.id} card={card} />
        ))}
      </div>
    </>
  )
}
