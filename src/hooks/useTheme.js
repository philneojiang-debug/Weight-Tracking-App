import { useState, useEffect } from 'react'

const THEMES = ['dark', 'light', 'pink']

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme')
    return THEMES.includes(stored) ? stored : 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    // Remove all theme classes then apply current
    root.classList.remove('dark', 'light', 'pink')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const cycleTheme = () =>
    setTheme(t => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length])

  return { theme, isDark: theme === 'dark', cycleTheme }
}
