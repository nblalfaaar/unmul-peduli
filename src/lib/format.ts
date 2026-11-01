export function tgl(ms?: number, withTime = false): string {
  if (!ms) return '-'
  return new Date(ms).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function waktuRelatif(ms: number): string {
  const s = Math.max(1, Math.round((Date.now() - ms) / 1000))
  if (s < 60) return 'Baru saja'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} menit lalu`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.round(h / 24)
  if (d < 30) return `${d} hari lalu`
  return tgl(ms)
}

export function inisial(nama?: string): string {
  if (!nama) return '?'
  const p = nama.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : p[0]?.[1] ?? '')).toUpperCase()
}

export function sisaHari(ms?: number): number | null {
  if (!ms) return null
  return Math.ceil((ms - Date.now()) / 86400000)
}

export function bulanTerakhir(n: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('id-ID', { month: 'short' }) })
  }
  return out
}

export function kunciBulan(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${d.getMonth()}`
}

export function unduhCsv(nama: string, rows: (string | number | undefined)[][]) {
  const esc = (v: string | number | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const blob = new Blob(['\ufeff' + rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nama
  a.click()
  URL.revokeObjectURL(url)
}
