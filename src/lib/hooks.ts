import { useCallback, useEffect, useRef, useState } from 'react'

/** Ambil data async dengan state loading + reload. */
export function useData<T>(fetcher: () => Promise<T>, deps: unknown[], initial: T) {
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchRef = useRef(fetcher)
  fetchRef.current = fetcher
  const alive = useRef(true)

  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const d = await fetchRef.current()
      if (alive.current) {
        setData(d)
        setError(null)
      }
    } catch (e) {
      if (alive.current) setError((e as Error).message || 'Gagal memuat data')
    } finally {
      if (alive.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    alive.current = true
    reload()
    return () => {
      alive.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, reload, setData }
}

export function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — UNMUL Peduli`
  }, [title])
}
