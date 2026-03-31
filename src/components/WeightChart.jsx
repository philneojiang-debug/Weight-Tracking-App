import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
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

function CustomDot({ cx, cy, payload, selectedId, onClick, index }) {
  const isSelected = payload.id === selectedId
  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSelected ? 7 : 4}
      fill={isSelected ? '#2dd4bf' : '#0d9488'}
      stroke={isSelected ? '#fff' : 'transparent'}
      strokeWidth={isSelected ? 2 : 0}
      style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
      onClick={() => onClick && onClick(payload)}
    />
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload
  return (
    <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2.5 shadow-2xl backdrop-blur-sm">
      <p className="text-slate-400 dark:text-white/60 text-xs mb-1">{formatXAxis(label)}</p>
      <p className="text-teal-600 dark:text-teal-400 font-semibold text-sm">{data?.weight_lbs} lbs</p>
      {data?.median7 && (
        <p className="text-slate-400 dark:text-white/40 text-xs mt-0.5">7-day median: {data.median7} lbs</p>
      )}
    </div>
  )
}

export default function WeightChart({ entries, showMedian, selectedId, onSelectEntry }) {
  const chartData = useMemo(() => {
    if (!entries.length) return []
    return rolling7DayMedian([...entries].sort((a, b) => a.date.localeCompare(b.date)))
  }, [entries])

  const weights = chartData.map(d => d.weight_lbs)
  const minW = weights.length ? Math.floor(Math.min(...weights) - 3) : 100
  const maxW = weights.length ? Math.ceil(Math.max(...weights) + 3) : 200

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30 text-sm">
        No data yet — log your first weight above
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -8, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            domain={[minW, maxW]}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}`}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Main weight line */}
          <Line
            type="monotone"
            dataKey="weight_lbs"
            stroke="#0d9488"
            strokeWidth={2.5}
            dot={<CustomDot selectedId={selectedId} onClick={onSelectEntry} />}
            activeDot={{ r: 0 }}
            connectNulls
          />

          {/* 7-day median overlay */}
          {showMedian && (
            <Line
              type="monotone"
              dataKey="median7"
              stroke="rgba(255,255,255,0.25)"
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
