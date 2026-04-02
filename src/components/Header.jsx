export default function Header({ theme, onCycleTheme, isOnline, user, onSignOut }) {
  const isPink = theme === 'pink'
  const isDark = theme === 'dark'

  // Icon shows what you'll switch TO next
  const NextIcon = () => {
    if (isDark) {
      // Next: light — show sun
      return (
        <svg className="w-[18px] h-[18px] text-slate-600 dark:text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
    if (isPink) {
      // Next: dark — show moon
      return (
        <svg className="w-[18px] h-[18px] text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    }
    // Next: pink — show strawberry
    return <span className="text-lg leading-none">🍓</span>
  }

  const emailLabel = user?.email?.split('@')[0] ?? ''

  return (
    <header className="flex items-center justify-between pt-safe px-4 pb-3">
      {/* Left: logo + title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${
          isPink
            ? 'bg-pink-400 shadow-pink-900/20'
            : 'bg-teal-600 shadow-teal-900/30'
        }`}>
          <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-8 4 4 4-6 4 10" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className={`font-bold text-base leading-tight ${
            isPink ? 'text-rose-900' : 'text-slate-900 dark:text-white'
          }`}>
            Weight Tracker
          </h1>
          {!isOnline && (
            <p className="text-yellow-600 dark:text-yellow-400/70 text-[10px] leading-none mt-0.5">Local mode</p>
          )}
          {isOnline && user && (
            <p className={`text-[10px] leading-none mt-0.5 truncate max-w-[140px] ${
              isPink ? 'text-pink-400' : 'text-slate-400 dark:text-white/35'
            }`}>
              {emailLabel}
            </p>
          )}
        </div>
      </div>

      {/* Right: sign out + theme cycle */}
      <div className="flex items-center gap-2">
        {user && onSignOut && (
          <button
            onClick={onSignOut}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              isPink
                ? 'bg-pink-100 hover:bg-pink-200'
                : 'bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15'
            }`}
            aria-label="Sign out"
            title="Sign out"
          >
            <svg className={`w-[17px] h-[17px] ${isPink ? 'text-rose-400' : 'text-slate-500 dark:text-white/60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}

        <button
          onClick={onCycleTheme}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
            isPink
              ? 'bg-pink-100 hover:bg-pink-200'
              : 'bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15'
          }`}
          aria-label="Switch theme"
        >
          <NextIcon />
        </button>
      </div>
    </header>
  )
}
