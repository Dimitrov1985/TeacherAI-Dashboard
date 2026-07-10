import { useEffect, useRef, useState } from 'react'
import type { SavedLessonPlan } from '../lib/lessonsStore'

function shadeColor(hex: string, amt: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (n >> 16) + amt))
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt))
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt))
  return `rgb(${r},${g},${b})`
}

function getTotal(values: number[]) {
  return values.reduce((a, b) => a + b, 0)
}

type StatCardProps = {
  label: string
  value: number | string
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 14,
        padding: '1rem 1.25rem',
        border: '1px solid var(--border)',
        flex: 1,
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}

type ChartData = {
  labels: string[]
  values: number[]
  colors: string[]
}

type DetailCardProps = {
  data: ChartData
  index: number | null
  onClose: () => void
}

function DetailCard({ data, index, onClose }: DetailCardProps) {
  if (index === null) return null
  const total = getTotal(data.values)
  const pct = Math.round((data.values[index] / total) * 100)
  const rank = [...data.values].sort((a, b) => b - a).indexOf(data.values[index]) + 1

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '14px 18px',
        minWidth: 150,
        boxShadow: 'var(--card-shadow)',
        animation: 'popIn 0.2s ease',
        zIndex: 10,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 8,
          right: 10,
          background: 'none',
          border: 'none',
          fontSize: 16,
          color: '#ccc',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{data.labels[index]}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>
        {data.values[index]} plans
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
        {pct}% of total · rank #{rank}
      </div>
    </div>
  )
}

type Chart3DProps = {
  data: ChartData
  selected: number | null
  onSelect: (index: number | null) => void
}

function Chart3D({ data, selected, onSelect }: Chart3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef({ t: 0, animating: true, lastTS: 0, raf: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      const w = canvas.offsetWidth
      const h = 320
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx?.scale(dpr, dpr)
    }

    function draw(t: number, sel: number | null) {
      if (!ctx || !canvas) return
      const W = canvas.offsetWidth
      const H = 320
      const n = data.values.length
      const maxV = Math.max(...data.values)

      ctx.clearRect(0, 0, W, H)

      const padL = 36,
        padR = 24,
        padT = 36,
        padB = 44
      const chartW = W - padL - padR
      const chartH = H - padT - padB
      const gap = chartW / n
      const barW = Math.min(gap * 0.52, 54)
      const depth = barW * 0.32
      const angle = 0.44
      const ease = t < 1 ? t * t * (3 - 2 * t) : 1

      // Grid
      for (let g = 0; g <= 4; g++) {
        const gy = padT + chartH - (chartH * g) / 4
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(0,0,0,0.06)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.moveTo(padL, gy)
        ctx.lineTo(W - padR, gy)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        ctx.font = '10px Inter,sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(Math.round((maxV * g) / 4).toString(), padL - 6, gy + 3)
      }

      // Bars
      data.values.forEach((val, i) => {
        const bh = (val / maxV) * chartH * ease
        const cx = padL + gap * i + gap / 2
        const bx = cx - barW / 2
        const by = padT + chartH - bh
        const col = data.colors[i]
        const isSelected = sel === i
        const alpha = sel === null ? 1 : isSelected ? 1 : 0.35

        ctx.globalAlpha = alpha

        // Side face
        ctx.beginPath()
        ctx.moveTo(bx + barW, by)
        ctx.lineTo(bx + barW + depth * angle, by - depth)
        ctx.lineTo(bx + barW + depth * angle, by + bh - depth)
        ctx.lineTo(bx + barW, by + bh)
        ctx.closePath()
        ctx.fillStyle = shadeColor(col, -40)
        ctx.fill()

        // Top face
        ctx.beginPath()
        ctx.moveTo(bx, by)
        ctx.lineTo(bx + barW, by)
        ctx.lineTo(bx + barW + depth * angle, by - depth)
        ctx.lineTo(bx + depth * angle, by - depth)
        ctx.closePath()
        ctx.fillStyle = shadeColor(col, 40)
        ctx.fill()

        // Front face
        ctx.beginPath()
        ctx.moveTo(bx, by)
        ctx.lineTo(bx + barW, by)
        ctx.lineTo(bx + barW, by + bh)
        ctx.lineTo(bx, by + bh)
        ctx.closePath()
        ctx.fillStyle = col
        ctx.fill()

        // Selected outline
        if (isSelected) {
          ctx.strokeStyle = col
          ctx.lineWidth = 2.5
          ctx.strokeRect(bx - 2, by - 2, barW + 4, bh + 4)
        }

        // Value label
        if (ease > 0.6) {
          ctx.fillStyle = isSelected ? '#333' : 'rgba(80,80,80,0.85)'
          ctx.font = `${isSelected ? '600' : '400'} 11px Inter,sans-serif`
          ctx.textAlign = 'center'
          ctx.fillText(val.toString(), cx, by - 7)
        }

        // X label
        ctx.fillStyle = '#aaa'
        ctx.font = '11px Inter,sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(data.labels[i], cx, H - padB + 16)

        ctx.globalAlpha = 1
      })
    }

    const state = animRef.current
    state.t = 0
    state.animating = true
    state.lastTS = 0

    function loop(ts: number) {
      if (!state.lastTS) state.lastTS = ts
      const dt = (ts - state.lastTS) / 1000
      state.lastTS = ts
      if (state.animating) {
        state.t += dt * 1.5
        if (state.t >= 1) {
          state.t = 1
          state.animating = false
        }
      }
      draw(state.t, selected)
      state.raf = requestAnimationFrame(loop)
    }

    resize()
    state.raf = requestAnimationFrame(loop)

    const handleResize = () => resize()
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(state.raf)
      window.removeEventListener('resize', handleResize)
    }
  }, [data])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || animRef.current.animating) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.offsetWidth
    const H = 320
    const n = data.values.length
    const maxV = Math.max(...data.values)
    ctx.clearRect(0, 0, W, H)
    const padL = 36,
      padR = 24,
      padT = 36,
      padB = 44
    const chartW = W - padL - padR
    const chartH = H - padT - padB
    const gap = chartW / n
    const barW = Math.min(gap * 0.52, 54)
    const depth = barW * 0.32
    const angle = 0.44

    for (let g = 0; g <= 4; g++) {
      const gy = padT + chartH - (chartH * g) / 4
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.moveTo(padL, gy)
      ctx.lineTo(W - padR, gy)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.font = '10px Inter,sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(Math.round((maxV * g) / 4).toString(), padL - 6, gy + 3)
    }

    data.values.forEach((val, i) => {
      const bh = (val / maxV) * chartH
      const cx = padL + gap * i + gap / 2
      const bx = cx - barW / 2
      const by = padT + chartH - bh
      const col = data.colors[i]
      const isSelected = selected === i
      const alpha = selected === null ? 1 : isSelected ? 1 : 0.35
      ctx.globalAlpha = alpha

      ctx.beginPath()
      ctx.moveTo(bx + barW, by)
      ctx.lineTo(bx + barW + depth * angle, by - depth)
      ctx.lineTo(bx + barW + depth * angle, by + bh - depth)
      ctx.lineTo(bx + barW, by + bh)
      ctx.closePath()
      ctx.fillStyle = shadeColor(col, -40)
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(bx, by)
      ctx.lineTo(bx + barW, by)
      ctx.lineTo(bx + barW + depth * angle, by - depth)
      ctx.lineTo(bx + depth * angle, by - depth)
      ctx.closePath()
      ctx.fillStyle = shadeColor(col, 40)
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(bx, by)
      ctx.lineTo(bx + barW, by)
      ctx.lineTo(bx + barW, by + bh)
      ctx.lineTo(bx, by + bh)
      ctx.closePath()
      ctx.fillStyle = col
      ctx.fill()

      if (isSelected) {
        ctx.strokeStyle = col
        ctx.lineWidth = 2.5
        ctx.strokeRect(bx - 2, by - 2, barW + 4, bh + 4)
      }

      ctx.fillStyle = isSelected ? '#333' : 'rgba(80,80,80,0.85)'
      ctx.font = `${isSelected ? '600' : '400'} 11px Inter,sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(val.toString(), cx, by - 7)

      ctx.fillStyle = '#aaa'
      ctx.font = '11px Inter,sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(data.labels[i], cx, H - padB + 16)

      ctx.globalAlpha = 1
    })
  }, [selected])

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const n = data.values.length
    const W = canvas.offsetWidth
    const padL = 36,
      padR = 24
    const chartW = W - padL - padR
    const gap = chartW / n
    const barW = Math.min(gap * 0.52, 54)

    for (let i = 0; i < n; i++) {
      const cx = padL + gap * i + gap / 2
      if (mx >= cx - barW / 2 && mx <= cx + barW / 2) {
        onSelect(selected === i ? null : i)
        return
      }
    }
    onSelect(null)
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{ width: '100%', height: 320, display: 'block', cursor: 'pointer' }}
      role="img"
      aria-label="3D bar chart of lesson plans"
    />
  )
}

type LessonsStatisticsProps = {
  lessonPlans: SavedLessonPlan[]
}

const COLORS = [
  '#7F77DD',
  '#534AB7',
  '#1D9E75',
  '#0F6E56',
  '#D85A30',
  '#993C1D',
  '#BA7517',
  '#378ADD',
  '#D4537E',
  '#888780',
]

export default function LessonsStatistics({ lessonPlans }: LessonsStatisticsProps) {
  const [view, setView] = useState<'grade' | 'subject'>('grade')
  const [selected, setSelected] = useState<number | null>(null)

  if (lessonPlans.length === 0) {
    return null
  }

  // Статистика по классам
  const byGrade = lessonPlans.reduce((acc, plan) => {
    acc[plan.grade] = (acc[plan.grade] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Статистика по предметам (из названия плана)
  const bySubject = lessonPlans.reduce((acc, plan) => {
    const subject = plan.plan.title.split(':')[0].split('-')[0].trim() || 'Other'
    acc[subject] = (acc[subject] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const gradeData: ChartData = {
    labels: Object.keys(byGrade),
    values: Object.values(byGrade),
    colors: Object.keys(byGrade).map((_, i) => COLORS[i % COLORS.length]),
  }

  const subjectData: ChartData = {
    labels: Object.keys(bySubject),
    values: Object.values(bySubject),
    colors: Object.keys(bySubject).map((_, i) => COLORS[i % COLORS.length]),
  }

  const data = view === 'grade' ? gradeData : subjectData
  const total = getTotal(data.values)
  const maxI = data.values.indexOf(Math.max(...data.values))
  const avg = Math.round(total / data.values.length)

  function switchView(v: 'grade' | 'subject') {
    setView(v)
    setSelected(null)
  }

  return (
    <div className="mb-6">
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: '1.5rem' }}>
        <StatCard label="Total plans" value={total} />
        <StatCard label="Top group" value={data.labels[maxI]} />
        <StatCard label="Avg per group" value={avg} />
        <StatCard label="Groups" value={data.values.length} />
      </div>

      {/* Chart card */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 16,
          padding: '1.5rem',
          border: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Plans overview</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Click a bar for details
            </div>
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['grade', 'subject'] as const).map((v) => (
              <button
                key={v}
                onClick={() => switchView(v)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Inter,sans-serif',
                  transition: 'all 0.2s',
                  background: view === v ? 'var(--accent)' : 'transparent',
                  color: view === v ? '#fff' : 'var(--text-muted)',
                  border: `1.5px solid ${view === v ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {v === 'grade' ? 'By grade' : 'By subject'}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas + detail card */}
        <div style={{ position: 'relative' }}>
          <Chart3D data={data} selected={selected} onSelect={setSelected} />
          <DetailCard data={data} index={selected} onClose={() => setSelected(null)} />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: '1.25rem' }}>
          {data.labels.map((l, i) => (
            <div
              key={l}
              onClick={() => setSelected(selected === i ? null : i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                opacity: selected === null || selected === i ? 1 : 0.45,
                transition: 'opacity 0.2s',
              }}
            >
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  background: data.colors[i],
                  flexShrink: 0,
                }}
              />
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
