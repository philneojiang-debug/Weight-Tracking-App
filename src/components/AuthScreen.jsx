import { useState } from 'react'

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [tab, setTab]           = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(null)

  const switchTab = (t) => {
    setTab(t)
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (tab === 'signin') {
      const { error: err } = await onSignIn(email, password)
      if (err) setError(err.message)
    } else {
      const { error: err } = await onSignUp(email, password)
      if (err) {
        setError(err.message)
      } else {
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setTab('signin')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-100 dark:bg-slate-950 transition-colors">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/40">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-8 4 4 4-6 4 10" />
          </svg>
        </div>
        <div>
          <h1 className="text-slate-900 dark:text-white font-bold text-xl leading-tight">Weight Tracker</h1>
          <p className="text-slate-400 dark:text-white/40 text-xs">Track your progress</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-white/10 rounded-xl p-1 mb-6 gap-1">
          {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/15 rounded-xl px-3 py-3 text-slate-900 dark:text-white text-sm placeholder-slate-300 dark:placeholder-white/20 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">
              Password {tab === 'signup' && <span className="text-slate-400 dark:text-white/30 font-normal">(min 6 characters)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              className="w-full bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/15 rounded-xl px-3 py-3 text-slate-900 dark:text-white text-sm placeholder-slate-300 dark:placeholder-white/20 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all"
            />
          </div>

          {/* Error / Success */}
          {error && (
            <div className="text-red-500 dark:text-red-400 text-xs bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 rounded-xl px-3 py-2.5">
              {error}
            </div>
          )}
          {success && (
            <div className="text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/20 rounded-xl px-3 py-2.5">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-base bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait mt-2"
          >
            {loading
              ? 'Please wait…'
              : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-slate-400 dark:text-white/30 text-xs text-center">
        Your weight data is private — only visible to you.
      </p>
    </div>
  )
}
