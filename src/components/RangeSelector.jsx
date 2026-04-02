export const RANGES = [
  { key: '7D',  label: '7D',  days: 7    },
  { key: '1M',  label: '1M',  months: 1  },
  { key: '3M',  label: '3M',  months: 3  },
  { key: '6M',  label: '6M',  months: 6  },
  { key: '1Y',  label: '1Y',  months: 12 },
  { key: '3Y',  label: '3Y',  months: 36 },
  { key: 'ALL', label: 'All', months: null },
]

export function filterEntriesByRange(entries, rangeKey) {
  if (rangeKey === 'ALL' || !entries.length) return entries
  const range = RANGES.find(r => r.key === rangeKey)
  if (!range) return entries

  const now = new Date()
  let cutoff

  if (range.days) {
    cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - range.days)
  } else {
    cutoff = new Date(now.getFullYear(), now.getMonth() - range.months, now.getDate())
    if (cutoff.getDate() !== now.getDate()) cutoff.setDate(0)
  }

  const cutoffStr = cutoff.toLocaleDateString('en-CA')
  return entries.filter(e => e.date >= cutoffStr)
}

export default function RangeSelector({ value, onChange, entries, theme = 'dark' }) {
  const isPink = theme === 'pink'

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
      {RANGES.map(range => {
        const filtered = filterEntriesByRange(entries, range.key)
        const disabled = filtered.length === 0
        const active   = value === range.key

        return (
          <button
            key={range.key}
            onClick={() => !disabled && onChange(range.key)}
            disabled={disabled}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              active
                ? isPink
                  ? 'bg-pink-400 text-white shadow-sm'
                  : 'bg-teal-600 text-white shadow-sm'
                : disabled
                ? isPink
                  ? 'text-pink-200 cursor-not-allowed'
                  : 'text-slate-300 dark:text-white/20 cursor-not-allowed'
                : isPink
                ? 'text-pink-400 hover:text-pink-600 hover:bg-pink-100'
                : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10'
            }`}
          >
            {range.label}
          </button>
        )
      })}
    </div>
  )
}
