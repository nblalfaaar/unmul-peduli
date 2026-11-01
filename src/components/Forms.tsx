import { KATEGORI } from '../lib/constants'
import { kategoriIcon } from './ui'

export function CategoryPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="cat-grid" role="radiogroup" aria-label="Jenis bantuan">
      {KATEGORI.map((k) => {
        const I = kategoriIcon(k)
        return (
          <button type="button" key={k} role="radio" aria-checked={value === k} className={`cat-opt ${value === k ? 'on' : ''}`} onClick={() => onChange(k)}>
            <I size={22} />
            {k}
          </button>
        )
      })}
    </div>
  )
}
