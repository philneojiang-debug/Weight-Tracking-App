import { useState, useRef, useEffect } from 'react'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function EditRow({ entry, onSave, onCancel }) {
  const [date, setDate] = useState(entry.date)
  const [weightStr, setWeightStr] = useState(String(entry.weight_lbs))
  const [unit, setUnit] = useState('lbs')
  const inputRef = useRef(null)

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
    const weight_lbs = unit === 'kg' ? parseFloat((raw * 2.20462).toFixed(1)) : parseFloat(raw.toFixed(1))
    onSave({ date, weight_lbs })
  }

  return (
    <div className="p-3 space-y-3 bg-teal-50 dark:bg-white/5 rounded-xl border border-teal-500/40">
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          max={new Date().toLocaleDateString('en-CA')}
          onChange={e => setDate(e.target.value)}
          className="flex-1 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 rounded-lg px-2 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500"
        />
        <div className="flex bg-slate-100 dark:bg-white/10 rounded-lg p-0.5 gap-0.5">
          {['lbs', 'kg'].map(u => (
            <button
              key={u}
              onClick={() => handleUnitChange(u)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                unit === u ? 'bg-teal-600 text-white' : 'text-slate-500 dark:text-white/50'
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
        min="50"
        onChange={e => setWeightStr(e.target.value)}
        className="w-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 rounded-lg px-2 py-2 text-slate-900 dark:text-white text-base font-semibold focus:outline-none focus:border-teal-500"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-lg text-sm font-medium transition-all"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-600 dark:text-white/70 py-2 rounded-lg text-sm font-medium transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function EntryRow({ entry, isHighlighted, onDelete, onUpdate, onRef }) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const rowRef = useRef(null)

  useEffect(() => {
    if (onRef) onRef(entry.id, rowRef)
  }, [entry.id, onRef])

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(entry.id)
  }

  const handleSave = async (updates) => {
    const ok = await onUpdate(entry.id, updates)
    if (ok) setEditing(false)
  }

  return (
    <div
      ref={rowRef}
      className={`transition-all duration-200 rounded-xl overflow-hidden entry-enter ${
        deleting ? 'opacity-0 scale-95' : 'opacity-100'
      } ${
        isHighlighted
          ? 'ring-2 ring-teal-500 bg-teal-50 dark:bg-teal-500/10'
          : 'bg-white dark:bg-white/[0.07] hover:bg-slate-50 dark:hover:bg-white/[0.11] shadow-sm dark:shadow-none border border-slate-100 dark:border-transparent'
      }`}
    >
      {editing ? (
        <EditRow
          entry={entry}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-slate-900 dark:text-white font-semibold text-base">{entry.weight_lbs} lbs</p>
            <p className="text-slate-400 dark:text-white/40 text-xs mt-0.5">{formatDate(entry.date)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="p-2 rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              aria-label="Edit entry"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-slate-400 dark:text-white/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all"
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

export default function EntryList({ entries, selectedId, onDelete, onUpdate, onRowRef }) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))

  if (!sorted.length) return null

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold text-slate-400 dark:text-white/50 uppercase tracking-wider px-1">
        All Entries
      </h2>
      <div className="space-y-2">
        {sorted.map(entry => (
          <EntryRow
            key={entry.id}
            entry={entry}
            isHighlighted={entry.id === selectedId}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onRef={onRowRef}
          />
        ))}
      </div>
    </div>
  )
}
