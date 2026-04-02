import { useState } from 'react'

const today = () => new Date().toLocaleDateString('en-CA')

export default function WeightForm({ onAdd, existingDates = [], unit, onUnitChange, theme = 'dark' }) {
  const [date, setDate]         = useState(today())
  const [weightStr, setWeightStr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]   = useState(false)

  const isPink = theme === 'pink'
  const isDark = theme === 'dark'
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

  const cardCls = isPink
    ? 'bg-white border-pink-200 shadow-sm'
    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm'

  const labelCls = isPink
    ? 'text-pink-400'
    : 'text-slate-500 dark:text-white/50'

  const inputCls = isPink
    ? 'bg-pink-50 border-pink-200 text-rose-900 placeholder-pink-200 focus:border-pink-400 focus:ring-pink-400/30'
    : 'bg-slate-50 dark:bg-white/10 border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 focus:border-teal-500 focus:ring-teal-500/50'

  const toggleBg = isPink ? 'bg-pink-100' : 'bg-slate-100 dark:bg-white/10'

  const unitBtn = (u) => {
    const active = unit === u
    if (isPink) return active
      ? 'bg-pink-400 text-white shadow-sm'
      : 'text-pink-300 hover:text-pink-500'
    return active
      ? 'bg-teal-600 text-white shadow-sm'
      : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80'
  }

  const submitCls = () => {
    if (success)     return 'bg-emerald-600 text-white'
    if (submitting)  return isPink ? 'bg-pink-300/50 text-white/50 cursor-wait' : 'bg-teal-700/50 text-white/50 cursor-wait'
    if (!weightStr)  return isPink ? 'bg-pink-100 text-pink-300 cursor-not-allowed' : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/30 cursor-not-allowed'
    return isPink
      ? 'bg-pink-400 hover:bg-pink-300 text-white shadow-lg shadow-pink-900/20'
      : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/20'
  }

  return (
    <form onSubmit={handleSubmit} className={`border rounded-2xl p-4 space-y-4 ${cardCls}`}>
      <h2 className={`text-base font-semibold ${isPink ? 'text-rose-900' : 'text-slate-800 dark:text-white/90'}`}>
        Log Weight
      </h2>

      {/* Date */}
      <div>
        <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>Date</label>
        <div className="w-full overflow-hidden rounded-xl">
          <input
            type="date"
            value={date}
            max={today()}
            onChange={e => setDate(e.target.value)}
            className={`w-full border rounded-xl px-3 py-3 text-sm text-center focus:outline-none focus:ring-1 transition-all ${inputCls}`}
          />
        </div>
      </div>

      {/* Weight + unit toggle */}
      <div>
        <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>Weight ({unit})</label>
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
            className={`flex-1 min-w-0 border rounded-xl px-3 py-3 text-xl font-semibold focus:outline-none focus:ring-1 transition-all ${inputCls}`}
            required
            autoComplete="off"
          />
          <div className={`flex-shrink-0 flex rounded-xl p-1 gap-1 ${toggleBg}`}>
            {['lbs', 'kg'].map(u => (
              <button
                key={u}
                type="button"
                onClick={() => onUnitChange(u)}
                className={`w-10 rounded-lg text-sm font-medium transition-all ${unitBtn(u)}`}
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
        className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] ${submitCls()}`}
      >
        {success ? '✓ Saved' : submitting ? 'Saving…' : isExistingDate ? 'Update Entry' : 'Log Weight'}
      </button>
    </form>
  )
}
