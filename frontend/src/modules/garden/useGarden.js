import { useCallback, useEffect, useState } from 'react'
import { getGarden } from './gardenApi'

export function useGarden() {
  const [garden, setGarden] = useState(null)
  const [error, setError] = useState(null)

  // Lädt den Garten neu und gibt den neuen Stand zurück
  const refresh = useCallback(async () => {
    try {
      const data = await getGarden()
      setGarden(data)
      return data
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { garden, error, refresh }
}
