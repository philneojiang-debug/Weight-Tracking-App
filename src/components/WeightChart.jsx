import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useMemo } from 'react'

function computeMedian(values) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1))
}

function rolling7DayMedian(entries) {
  return entries.map((entry, i) => {
    const windowStart = Math.max(0, i - 6)
    const window = entries.slice(windowStart, i + 1).map(e => e.weight_lbs)
    return { ...entry, median7: computeMedian(window) }
  })
}

function formatXAxis(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function toKg(v)  { return parseFloat((v / 2.20462).toFixed(1)) }
function toLbs(v) { return v }

// Per-theme chart palette
const PALETTE = {
  dark: {
    line:       '#0d9488',
    dotFill:    '#0d9488',
    dotSel:     '#2dd4bf',
    median:     'rgba(255,255,255,0.25)',
    grid:       'rgba(255,255,255,0.06)',
    axis:       'rgba(255,255,255,0.35)',
  },
  light: {
    line:       '#0d9488',
    dotFill:    '#0d9488',
    dotSel:     '#2dd4bf',
    median:     'rgba(0,0,0,0.18)',
    grid:       'rgba(0,0,0,0.06)',
    axis:       'rgba(0,0,0,0.35)',
  },
  pink: {
    line:       '#ec4899',
    dotFill:    '#ec4899',
    dotSel:     '#f9a8d4',
    median:     'rgba(190,24,93,0.35)',
    grid:       'rgba(190,24,93,0.1)',
    axis:       'rgba(190,24,93,0.55)',
  },
}

function CustomDot({ cx, cy, payload, selectedId, onClick, palette }) {
  const isSelected = payload.id === selectedId
  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSelected ? 7 : 4}
      fill={isSelected ? palette.dotSel : palette.dotFill}
      stroke={isSelected ? '#fff' : 'transparent'}
      strokeWidth={isSelected ? 2 : 0}
      style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
      onClick={() => onClick && onClick(payload)}
    />
  )
}

function CustomTooltip({ active, payload, label, unit, theme }) {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload
  const isPink = theme === 'pink'
  const isDark = theme === 'dark'
  return (
    <div className={`border rounded-xl px-3 py-2.5 shadow-2xl backdrop-blur-sm ${
      isPink
        ? 'bg-white border-pink-200'
        : isDark
        ? 'bg-slate-900/95 border-white/15'
        : 'bg-white border-slate-200'
    }`}>
      <p className={`text-xs mb-1 ${isPink ? 'text-pink-300' : isDark ? 'text-white/60' : 'text-slate-400'}`}>
        {formatXAxis(label)}
      </p>
      <p className={`font-semibold text-sm ${isPink ? 'text-pink-500' : isDark ? 'text-teal-400' : 'text-teal-600'}`}>
        {data?.displayWeight} {unit}
      </p>
      {data?.displayMedian != null && (
        <p className={`text-xs mt-0.5 ${isPink ? 'text-pink-300' : isDark ? 'text-white/40' : 'text-slate-400'}`}>
          7-day median: {data.displayMedian} {unit}
        </p>
      )}
    </div>
  )
}

export default function WeightChart({ entries, showMedian, selectedId, onSelectEntry, unit = 'lbs', theme = 'dark' }) {
  const palette = PALETTE[theme] ?? PALETTE.dark
  const convert = unit === 'kg' ? toKg : toLbs

  const chartData = useMemo(() => {
    if (!entries.length) return []
    const withMedian = rolling7DayMedian([...entries].sort((a, b) => a.date.localeCompare(b.date)))
    return withMedian.map(d => ({
      ...d,
      displayWeight: convert(d.weight_lbs),
      displayMedian: d.median7 != null ? convert(d.median7) : null,
    }))
  }, [entries, unit])

  const weights = chartData.map(d => d.displayWeight)
  const pad = unit === 'kg' ? 1.5 : 3
  const minW = weights.length ? parseFloat((Math.min(...weights) - pad).toFixed(1)) : (unit === 'kg' ? 45 : 100)
  const maxW = weights.length ? parseFloat((Math.max(...weights) + pad).toFixed(1)) : (unit === 'kg' ? 100 : 200)

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-300 dark:text-white/30 text-sm">
        No data yet — log your first weight above
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fill: palette.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            domain={[minW, maxW]}
            tick={{ fill: palette.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}`}
            width={48}
          />
          <Tooltip content={<CustomTooltip unit={unit} theme={theme} />} />

          <Line
            type="monotone"
            dataKey="displayWeight"
            stroke={palette.line}
            strokeWidth={2.5}
            dot={<CustomDot selectedId={selectedId} onClick={onSelectEntry} palette={palette} />}
            activeDot={{ r: 0 }}
            connectNulls
          />

          {showMedian && (
            <Line
              type="monotone"
              dataKey="displayMedian"
              stroke={palette.median}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              activeDot={false}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
