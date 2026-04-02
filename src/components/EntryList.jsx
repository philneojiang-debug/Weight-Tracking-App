import { useState, useRef, useEffect } from 'react'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function toKg(lbs) { return parseFloat((lbs / 2.20462).toFixed(1)) }
function displayWeight(lbs, unit) { return unit === 'kg' ? toKg(lbs) : lbs }

function EditRow({ entry, onSave, onCancel, unit: globalUnit, theme }) {
  const [date, setDate]         = useState(entry.date)
  const [weightStr, setWeightStr] = useState(String(displayWeight(entry.weight_lbs, globalUnit)))
  const [unit, setUnit]         = useState(globalUnit)
  const inputRef = useRef(null)
  const isPink = theme === 'pink'

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleUnitChange = (u) => {
    if (u === unit) return
    const val = parseFloat(weightStr)
    if (!isNaN(val)) {
      setWeightStr(u === 'kg'
        ? String(parseFloat((val / 2.20462).toFixed(1)))
        : String(parseFloat((val * 2.20462).toFixed(1)))
      )
    }
    setUnit(u)
  }

  const handleSave = () => {
    const raw = parseFloat(weightStr)
    if (isNaN(raw) || raw <= 0) return
    const weight_lbs = unit === 'kg'
      ? parseFloat((raw * 2.20462).toFixed(1))
      : parseFloat(raw.toFixed(1))
    onSave({ date, weight_lbs })
  }

  const inputCls = isPink
    ? 'bg-pink-50 border-pink-200 text-rose-900 focus:border-pink-400'
    : 'bg-white dark:bg-white/10 border-slate-200 dark:border-white/15 text-slate-900 dark:text-white focus:border-teal-500'

  return (
    <div className={`p-3 space-y-3 rounded-xl border ${
      isPink ? 'bg-pink-50 border-pink-300/50' : 'bg-teal-50 dark:bg-white/5 border-teal-500/40'
    }`}>
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          max={new Date().toLocaleDateString('en-CA')}
          onChange={e => setDate(e.target.value)}
          className={`flex-1 border rounded-lg px-2 py-2 text-sm focus:outline-none ${inputCls}`}
        />
        <div className={`flex rounded-lg p-0.5 gap-0.5 ${isPink ? 'bg-pink-100' : 'bg-slate-100 dark:bg-white/10'}`}>
          {['lbs', 'kg'].map(u => (
            <button
              key={u}
              onClick={() => handleUnitChange(u)}
              className={`w-9 py-1.5 rounded-md text-xs font-medium transition-all ${
                unit === u
                  ? isPink ? 'bg-pink-400 text-white' : 'bg-teal-600 text-white'
                  : isPink ? 'text-pink-400' : 'text-slate-500 dark:text-white/50'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <input
        ref={inputRef}
        type="number"
        inputMode="decimal"
        value={weightStr}
        step="0.1"
        min="1"
        onChange={e => setWeightStr(e.target.value)}
        className={`w-full border rounded-lg px-2 py-2 text-base font-semibold focus:outline-none ${inputCls}`}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className={`flex-1 text-white py-2 rounded-lg text-sm font-medium transition-all ${
            isPink ? 'bg-pink-400 hover:bg-pink-300' : 'bg-teal-600 hover:bg-teal-500'
          }`}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            isPink
              ? 'bg-pink-100 hover:bg-pink-200 text-rose-700'
              : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-600 dark:text-white/70'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function EntryRow({ entry, isHighlighted, onDelete, onUpdate, onRef, unit, theme }) {
  const [editing, setEditing]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const rowRef = useRef(null)
  const isPink = theme === 'pink'

  useEffect(() => { if (onRef) onRef(entry.id, rowRef) }, [entry.id, onRef])

  const handleDelete = async () => { setDeleting(true); await onDelete(entry.id) }
  const handleSave = async (updates) => { const ok = await onUpdate(entry.id, updates); if (ok) setEditing(false) }

  const w = displayWeight(entry.weight_lbs, unit)

  return (
    <div
      ref={rowRef}
      className={`transition-all duration-200 rounded-xl overflow-hidden entry-enter ${
        deleting ? 'opacity-0 scale-95' : 'opacity-100'
      } ${
        isHighlighted
          ? isPink
            ? 'ring-2 ring-pink-400 bg-pink-50'
            : 'ring-2 ring-teal-500 bg-teal-50 dark:bg-teal-500/10'
          : isPink
          ? 'bg-white border border-pink-100 hover:bg-pink-50'
          : 'bg-white dark:bg-white/[0.07] hover:bg-slate-50 dark:hover:bg-white/[0.11] shadow-sm dark:shadow-none border border-slate-100 dark:border-transparent'
      }`}
    >
      {editing ? (
        <EditRow entry={entry} onSave={handleSave} onCancel={() => setEditing(false)} unit={unit} theme={theme} />
      ) : (
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className={`font-semibold text-base ${isPink ? 'text-rose-900' : 'text-slate-900 dark:text-white'}`}>
              {w} {unit}
            </p>
            <p className={`text-xs mt-0.5 ${isPink ? 'text-pink-300' : 'text-slate-400 dark:text-white/40'}`}>
              {formatDate(entry.date)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className={`p-2 rounded-lg transition-all ${
                isPink
                  ? 'text-pink-300 hover:text-pink-500 hover:bg-pink-100'
                  : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
              aria-label="Edit entry"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className={`p-2 rounded-lg transition-all ${
                isPink
                  ? 'text-pink-300 hover:text-red-400 hover:bg-red-50'
                  : 'text-slate-400 dark:text-white/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10'
              }`}
              aria-label="Delete entry"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const PREVIEW_COUNT = 5

export default function EntryList({ entries, selectedId, onDelete, onUpdate, onRowRef, unit = 'lbs', theme = 'dark' }) {
  const [showAll, setShowAll] = useState(false)
  const isPink = theme === 'pink'
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  if (!sorted.length) return null

  const visible    = showAll ? sorted : sorted.slice(0, PREVIEW_COUNT)
  const hiddenCount = sorted.length - PREVIEW_COUNT

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className={`text-xs font-semibold uppercase tracking-wider ${
          isPink ? 'text-pink-300' : 'text-slate-400 dark:text-white/50'
        }`}>
          Recent Entries
        </h2>
        {sorted.length > PREVIEW_COUNT && (
          <button
            onClick={() => setShowAll(s => !s)}
            className={`text-xs font-medium transition-colors ${
              isPink ? 'text-pink-400 hover:text-pink-600' : 'text-teal-500 hover:text-teal-400'
            }`}
          >
            {showAll ? 'Show less' : `Show all ${sorted.length}`}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {visible.map(entry => (
          <EntryRow
            key={entry.id}
            entry={entry}
            isHighlighted={entry.id === selectedId}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onRef={onRowRef}
            unit={unit}
            theme={theme}
          />
        ))}
      </div>

      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className={`w-full py-3 rounded-xl text-sm font-medium border transition-all ${
            isPink
              ? 'text-pink-300 bg-white border-pink-100 hover:text-pink-500 hover:border-pink-300'
              : 'text-slate-400 dark:text-white/40 bg-white dark:bg-white/[0.04] border-slate-100 dark:border-white/[0.06] hover:text-teal-500 dark:hover:text-teal-400 hover:border-teal-500/30'
          }`}
        >
          + {hiddenCount} more entries
        </button>
      )}
    </div>
  )
}
