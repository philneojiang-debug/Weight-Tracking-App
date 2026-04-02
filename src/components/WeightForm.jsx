import { useState } from 'react'

const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time

export default function WeightForm({ onAdd, existingDates = [], unit, onUnitChange }) {
  const [date, setDate] = useState(today())
  const [weightStr, setWeightStr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const isExistingDate = existingDates.includes(date)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!weightStr || submitting) return

    const raw = parseFloat(weightStr)
    if (isNaN(raw) || raw <= 0) return

    const weight_lbs = unit === 'kg'
      ? parseFloat((raw * 2.20462).toFixed(1))
      : parseFloat(raw.toFixed(1))

    setSubmitting(true)
    const ok = await onAdd({ date, weight_lbs })
    setSubmitting(false)

    if (ok) {
      setWeightStr('')
      setDate(today())
      setSuccess(true)
      setTimeout(() => setSuccess(false), 1500)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-4 shadow-sm"
    >
      <h2 className="text-base font-semibold text-slate-800 dark:text-white/90">
        Log Weight
      </h2>

      {/* Date row — full width */}
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Date</label>
        <div className="w-full overflow-hidden rounded-xl">
          <input
            type="date"
            value={date}
            max={today()}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/15 rounded-xl px-3 py-3 text-slate-900 dark:text-white text-sm text-center focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all"
          />
        </div>
      </div>

      {/* Weight + Unit toggle */}
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">
          Weight ({unit})
        </label>
        <div className="flex gap-2 items-stretch">
          <input
            type="number"
            inputMode="decimal"
            placeholder={unit === 'lbs' ? '175.0' : '79.4'}
            value={weightStr}
            step="0.1"
            min="1"
            max={unit === 'lbs' ? '700' : '320'}
            onChange={e => setWeightStr(e.target.value)}
            className="flex-1 min-w-0 bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/15 rounded-xl px-3 py-3 text-slate-900 dark:text-white text-xl font-semibold focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder-slate-300 dark:placeholder-white/20"
            required
            autoComplete="off"
          />
          {/* lbs / kg pill toggle */}
          <div className="flex-shrink-0 flex bg-slate-100 dark:bg-white/10 rounded-xl p-1 gap-1">
            {['lbs', 'kg'].map(u => (
              <button
                key={u}
                type="button"
                onClick={() => onUnitChange(u)}
                className={`w-10 rounded-lg text-sm font-medium transition-all ${
                  unit === u
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !weightStr}
        className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] ${
          success
            ? 'bg-emerald-600 text-white'
            : submitting
            ? 'bg-teal-700/50 text-white/50 cursor-wait'
            : !weightStr
            ? 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/30 cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/20'
        }`}
      >
        {success ? '✓ Saved' : submitting ? 'Saving…' : isExistingDate ? 'Update Entry' : 'Log Weight'}
      </button>
    </form>
  )
}
