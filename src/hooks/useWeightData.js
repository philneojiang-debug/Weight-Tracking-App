import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const LOCAL_STORAGE_KEY = 'weight_entries'

function getLocalEntries() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalEntries(entries) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries))
}

function normalizeEntry(row) {
  return {
    id: row.id,
    date: row.date,
    weight_lbs: parseFloat(row.weight_lbs),
  }
}

export function useWeightData(userId) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const isOnline = supabase !== null

  const loadEntries = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (isOnline && userId) {
      const { data, error: err } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })

      if (err) {
        setError(err.message)
        setEntries(getLocalEntries())
      } else {
        const normalized = data.map(normalizeEntry)
        setEntries(normalized)
        saveLocalEntries(normalized)
      }
    } else if (!isOnline) {
      setEntries(getLocalEntries())
    } else {
      // Online but no user yet — show nothing
      setEntries([])
    }

    setLoading(false)
  }, [isOnline, userId])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  // Add or update entry for a given date
  const addEntry = useCallback(async ({ date, weight_lbs }) => {
    const existing = entries.find(e => e.date === date)

    if (isOnline && userId) {
      if (existing) {
        const { data, error: err } = await supabase
          .from('weight_entries')
          .update({ weight_lbs: parseFloat(weight_lbs), updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (err) { setError(err.message); return false }

        setEntries(prev => {
          const updated = prev.map(e => e.id === existing.id ? normalizeEntry(data) : e)
            .sort((a, b) => a.date.localeCompare(b.date))
          saveLocalEntries(updated)
          return updated
        })
      } else {
        const { data, error: err } = await supabase
          .from('weight_entries')
          .insert({ date, weight_lbs: parseFloat(weight_lbs), user_id: userId })
          .select()
          .single()

        if (err) { setError(err.message); return false }

        setEntries(prev => {
          const updated = [...prev, normalizeEntry(data)]
            .sort((a, b) => a.date.localeCompare(b.date))
          saveLocalEntries(updated)
          return updated
        })
      }
    } else {
      // Local-only fallback
      const optimistic = { id: `local-${Date.now()}`, date, weight_lbs: parseFloat(weight_lbs) }
      if (existing) {
        setEntries(prev => {
          const updated = prev.map(e =>
            e.id === existing.id ? { ...e, weight_lbs: parseFloat(weight_lbs) } : e
          ).sort((a, b) => a.date.localeCompare(b.date))
          saveLocalEntries(updated)
          return updated
        })
      } else {
        setEntries(prev => {
          const updated = [...prev, optimistic].sort((a, b) => a.date.localeCompare(b.date))
          saveLocalEntries(updated)
          return updated
        })
      }
    }

    return true
  }, [entries, isOnline, userId])

  // Edit an existing entry
  const updateEntry = useCallback(async (id, { date, weight_lbs }) => {
    if (isOnline && userId) {
      const { data, error: err } = await supabase
        .from('weight_entries')
        .update({ date, weight_lbs: parseFloat(weight_lbs), updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (err) { setError(err.message); return false }

      setEntries(prev => {
        const updated = prev.map(e => e.id === id ? normalizeEntry(data) : e)
          .sort((a, b) => a.date.localeCompare(b.date))
        saveLocalEntries(updated)
        return updated
      })
    } else {
      setEntries(prev => {
        const updated = prev.map(e =>
          e.id === id ? { ...e, date, weight_lbs: parseFloat(weight_lbs) } : e
        ).sort((a, b) => a.date.localeCompare(b.date))
        saveLocalEntries(updated)
        return updated
      })
    }

    return true
  }, [isOnline, userId])

  // Delete an entry
  const deleteEntry = useCallback(async (id) => {
    if (isOnline && userId) {
      const { error: err } = await supabase
        .from('weight_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (err) { setError(err.message); return false }
    }

    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id)
      saveLocalEntries(updated)
      return updated
    })

    return true
  }, [isOnline, userId])

  return { entries, loading, error, isOnline, addEntry, updateEntry, deleteEntry, reload: loadEntries }
}
