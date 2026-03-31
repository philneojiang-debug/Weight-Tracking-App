export default function Header({ isDark, onToggleTheme, isOnline }) {
  return (
    <header className="flex items-center justify-between pt-safe px-4 pb-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/30">
          <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-8 4 4 4-6 4 10" />
          </svg>
        </div>
        <div>
          <h1 className="text-slate-900 dark:text-white font-bold text-base leading-tight">Weight Tracker</h1>
          {!isOnline && (
            <p className="text-yellow-600 dark:text-yellow-400/70 text-[10px] leading-none mt-0.5">Local mode</p>
          )}
        </div>
      </div>

      <button
        onClick={onToggleTheme}
        className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 flex items-center justify-center transition-all active:scale-95"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <svg className="w-[18px] h-[18px] text-slate-600 dark:text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-[18px] h-[18px] text-slate-600 dark:text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </header>
  )
}
