import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useWeightData } from './hooks/useWeightData'
import { useTheme } from './hooks/useTheme'
import WeightForm from './components/WeightForm'
import WeightChart from './components/WeightChart'
import EntryList from './components/EntryList'
import Header from './components/Header'
import RangeSelector, { filterEntriesByRange } from './components/RangeSelector'

function WeightDelta({ entries, unit }) {
  const delta = useMemo(() => {
    if (entries.length < 2) return null
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
    const first = sorted[0].weight_lbs
    const last  = sorted[sorted.length - 1].weight_lbs
    const diff  = last - first
    const converted = unit === 'kg'
      ? parseFloat((diff / 2.20462).toFixed(1))
      : parseFloat(diff.toFixed(1))
    return converted
  }, [entries, unit])

  if (delta === null) return null

  const gained = delta > 0
  const neutral = delta === 0
  const abs = Math.abs(delta)

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
      neutral
        ? 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/40'
        : gained
        ? 'bg-red-100 dark:bg-red-400/15 text-red-500 dark:text-red-400'
        : 'bg-emerald-100 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400'
    }`}>
      {neutral ? '→' : gained ? '↑' : '↓'}
      {' '}{abs} {unit}
    </span>
  )
}

export default function App() {
  const { isDark, toggleTheme } = useTheme()
  const { entries, loading, error, isOnline, addEntry, updateEntry, deleteEntry } = useWeightData()
  const [showMedian, setShowMedian] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [range, setRange] = useState('ALL')
  const [unit, setUnit] = useState('lbs')
  const rowRefs = useRef({})

  // Apply light mode body bg
  useEffect(() => {
    document.body.className = isDark
      ? 'bg-slate-950 text-white'
      : 'bg-slate-100 text-slate-900'
  }, [isDark])

  const handleSelectEntry = useCallback((payload) => {
    setSelectedId(payload.id)
    setTimeout(() => {
      const el = rowRefs.current[payload.id]?.current
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }, [])

  const handleRowRef = useCallback((id, ref) => {
    rowRefs.current[id] = ref
  }, [])

  const existingDates    = entries.map(e => e.date)
  const visibleEntries   = filterEntriesByRange(entries, range)

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950' : 'bg-slate-100'} transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto px-4 pb-safe pb-8">

        {/* Header */}
        <Header isDark={isDark} onToggleTheme={toggleTheme} isOnline={isOnline} />

        {/* Error banner */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Log form */}
        <div className="mb-5">
          <WeightForm
            onAdd={addEntry}
            existingDates={existingDates}
            unit={unit}
            onUnitChange={setUnit}
          />
        </div>

        {/* Chart section */}
        {entries.length > 0 && (
          <div className="mb-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-3 pt-4 pb-2 shadow-sm dark:shadow-none">

            {/* Chart header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold text-slate-500 dark:text-white/70">
                  {visibleEntries.length}{visibleEntries.length !== entries.length ? ` of ${entries.length}` : ''} {entries.length === 1 ? 'entry' : 'entries'}
                </h2>
                <WeightDelta entries={visibleEntries} unit={unit} />
              </div>
              <button
                onClick={() => setShowMedian(s => !s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                  showMedian
                    ? 'bg-slate-200 dark:bg-white/20 text-slate-700 dark:text-white'
                    : 'bg-slate-100 dark:bg-white/[0.08] text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70'
                }`}
              >
                <span
                  className="inline-block w-4 rounded-full"
                  style={{
                    borderTop: '2px dashed currentColor',
                    height: '0px',
                    marginTop: '1px',
                  }}
                />
                7-day median
              </button>
            </div>

            {/* Range selector */}
            <div className="px-1 mb-3">
              <RangeSelector value={range} onChange={setRange} entries={entries} />
            </div>

            <WeightChart
              entries={visibleEntries}
              showMedian={showMedian}
              selectedId={selectedId}
              onSelectEntry={handleSelectEntry}
              unit={unit}
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-white/30 text-sm">
            Loading…
          </div>
        )}

        {/* Entry list */}
        {!loading && (
          <EntryList
            entries={entries}
            selectedId={selectedId}
            onDelete={deleteEntry}
            onUpdate={updateEntry}
            onRowRef={handleRowRef}
            unit={unit}
          />
        )}

        {/* Empty state */}
        {!loading && entries.length === 0 && (
          <div className="text-center py-16 text-slate-300 dark:text-white/20">
            <div className="text-5xl mb-4">⚖️</div>
            <p className="text-base font-medium">Start tracking your weight</p>
            <p className="text-sm mt-1">Log your first entry above</p>
          </div>
        )}
      </div>
    </div>
  )
}
