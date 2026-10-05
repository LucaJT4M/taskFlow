import { useEffect, useState } from 'react'
import { getHistory } from './historyApi'

export function useHistory() {
  const [entries, setEntries] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getHistory()
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
  }, [])

  return { entries, error }
}
