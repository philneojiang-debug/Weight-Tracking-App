import { useState } from 'react'

export default function AuthScreen({ onSignIn, onSignUp, theme = 'dark' }) {
  const [tab, setTab]           = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(null)
  const isPink = theme === 'pink'
  const isDark = theme === 'dark'

  const switchTab = (t) => { setTab(t); setError(null); setSuccess(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null); setSuccess(null); setLoading(true)
    if (tab === 'signin') {
      const { error: err } = await onSignIn(email, password)
      if (err) setError(err.message)
    } else {
      const { error: err } = await onSignUp(email, password)
      if (err) { setError(err.message) }
      else { setSuccess('Account created! Check your email to confirm, then sign in.'); setTab('signin') }
    }
    setLoading(false)
  }

  const pageBg  = isPink ? 'bg-pink-50'    : isDark ? 'bg-slate-950'  : 'bg-slate-100'
  const cardBg  = isPink ? 'bg-white border-pink-200'  : isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
  const tabBg   = isPink ? 'bg-pink-100'   : isDark ? 'bg-white/10'   : 'bg-slate-100'
  const inputCls = isPink
    ? 'bg-pink-50 border-pink-200 text-rose-900 placeholder-pink-200 focus:border-pink-400 focus:ring-pink-400/30'
    : isDark
    ? 'bg-white/10 border-white/15 text-white placeholder-white/20 focus:border-teal-500 focus:ring-teal-500/50'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-300 focus:border-teal-500 focus:ring-teal-500/50'
  const labelCls = isPink ? 'text-pink-400' : isDark ? 'text-white/50' : 'text-slate-500'
  const titleCls = isPink ? 'text-rose-900' : isDark ? 'text-white'    : 'text-slate-900'
  const subtitleCls = isPink ? 'text-pink-300' : isDark ? 'text-white/40' : 'text-slate-400'
  const footerCls   = isPink ? 'text-pink-300' : isDark ? 'text-white/30' : 'text-slate-400'

  const activeTabCls = isPink ? 'bg-pink-400 text-white' : 'bg-teal-600 text-white'
  const inactiveTabCls = isPink
    ? 'text-pink-400 hover:text-pink-600'
    : isDark ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-700'

  const submitCls = loading
    ? isPink ? 'bg-pink-300/60 text-white cursor-wait' : 'bg-teal-700/50 text-white cursor-wait'
    : isPink ? 'bg-pink-400 hover:bg-pink-300 text-white shadow-lg shadow-pink-900/20'
             : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/20'

  const logoCls = isPink ? 'bg-pink-400 shadow-pink-900/30' : 'bg-teal-600 shadow-teal-900/40'

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 transition-colors ${pageBg}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${logoCls}`}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-8 4 4 4-6 4 10" />
          </svg>
        </div>
        <div>
          <h1 className={`font-bold text-xl leading-tight ${titleCls}`}>Weight Tracker</h1>
          <p className={`text-xs ${subtitleCls}`}>Track your progress</p>
        </div>
      </div>

      {/* Card */}
      <div className={`w-full max-w-sm border rounded-2xl p-6 shadow-sm ${cardBg}`}>
        {/* Tabs */}
        <div className={`flex rounded-xl p-1 mb-6 gap-1 ${tabBg}`}>
          {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key ? activeTabCls : inactiveTabCls
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className={`w-full border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-1 transition-all ${inputCls}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>
              Password {tab === 'signup' && <span className="font-normal opacity-60">(min 6 characters)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              className={`w-full border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-1 transition-all ${inputCls}`}
            />
          </div>

          {error && (
            <div className={`text-xs rounded-xl px-3 py-2.5 border ${
              isPink ? 'text-red-500 bg-red-50 border-red-200' : 'text-red-400 bg-red-400/10 border-red-400/20'
            }`}>{error}</div>
          )}
          {success && (
            <div className={`text-xs rounded-xl px-3 py-2.5 border ${
              isPink ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
            }`}>{success}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] disabled:opacity-60 mt-2 ${submitCls}`}
          >
            {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>

      <p className={`mt-6 text-xs text-center ${footerCls}`}>
        Your weight data is private — only visible to you.
      </p>
    </div>
  )
}
