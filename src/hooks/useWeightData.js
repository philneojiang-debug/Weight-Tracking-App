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

export function useWeightData() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isOnline = supabase !== null

  // Load entries
  const loadEntries = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (isOnline) {
      const { data, error: err } = await supabase
        .from('weight_entries')
        .select('*')
        .order('date', { ascending: true })

      if (err) {
        setError(err.message)
        // Fallback to local
        setEntries(getLocalEntries())
      } else {
        const normalized = data.map(normalizeEntry)
        setEntries(normalized)
        saveLocalEntries(normalized)
      }
    } else {
      setEntries(getLocalEntries())
    }

    setLoading(false)
  }, [isOnline])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  // Add entry
  const addEntry = useCallback(async ({ date, weight_lbs }) => {
    const optimisticEntry = {
      id: `local-${Date.now()}`,
      date,
      weight_lbs: parseFloat(weight_lbs),
    }

    // Check if entry for this date already exists
    const existing = entries.find(e => e.date === date)

    if (isOnline) {
      if (existing) {
        // Update existing
        const { data, error: err } = await supabase
          .from('weight_entries')
          .update({ weight_lbs: parseFloat(weight_lbs), updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single()

        if (err) {
          setError(err.message)
          return false
        }

        setEntries(prev => {
          const updated = prev.map(e => e.id === existing.id ? normalizeEntry(data) : e)
            .sort((a, b) => a.date.localeCompare(b.date))
          saveLocalEntries(updated)
          return updated
        })
      } else {
        const { data, error: err } = await supabase
          .from('weight_entries')
          .insert({ date, weight_lbs: parseFloat(weight_lbs) })
          .select()
          .single()

        if (err) {
          setError(err.message)
          return false
        }

        setEntries(prev => {
          const updated = [...prev, normalizeEntry(data)]
            .sort((a, b) => a.date.localeCompare(b.date))
          saveLocalEntries(updated)
          return updated
        })
      }
    } else {
      // Local only
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
          const updated = [...prev, optimisticEntry]
            .sort((a, b) => a.date.localeCompare(b.date))
          saveLocalEntries(updated)
          return updated
        })
      }
    }
    return true
  }, [entries, isOnline])

  // Update entry
  const updateEntry = useCallback(async (id, { date, weight_lbs }) => {
    if (isOnline) {
      const { data, error: err } = await supabase
        .from('weight_entries')
        .update({ date, weight_lbs: parseFloat(weight_lbs), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (err) {
        setError(err.message)
        return false
      }

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
  }, [isOnline])

  // Delete entry
  const deleteEntry = useCallback(async (id) => {
    if (isOnline) {
      const { error: err } = await supabase
        .from('weight_entries')
        .delete()
        .eq('id', id)

      if (err) {
        setError(err.message)
        return false
      }
    }

    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id)
      saveLocalEntries(updated)
      return updated
    })
    return true
  }, [isOnline])

  return {
    entries,
    loading,
    error,
    isOnline,
    addEntry,
    updateEntry,
    deleteEntry,
    reload: loadEntries,
  }
}

function normalizeEntry(row) {
  return {
    id: row.id,
    date: row.date,
    weight_lbs: parseFloat(row.weight_lbs),
  }
}
