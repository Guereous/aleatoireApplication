import React from 'react'

export type HistoryEntry = {
  id: string
  params: { min: number; max: number; count: number; sort?: 'asc' | 'desc' | 'none' }
  results: number[]
  timestampIso: string
}

type RandomHistoryProps = {
  items: HistoryEntry[]
  onClear: () => void
}

export default function RandomHistory({ items, onClear }: RandomHistoryProps) {
  if (!items.length) return null
  return (
    <section className="history card">
      <div className="history-header">
        <h2>Historique des tirages</h2>
        <button type="button" onClick={onClear} aria-label="Vider l'historique">
          Vider
        </button>
      </div>
      <ul className="history-list">
        {items.map((h) => (
          <li key={h.id} className="history-item">
            <div className="history-meta">
              <span>{new Date(h.timestampIso).toLocaleString()}</span>
              <span>
                min={h.params.min}, max={h.params.max}, count={h.params.count}
                {h.params.sort && h.params.sort !== 'none' ? `, tri=${h.params.sort}` : ''}
              </span>
            </div>
            <div className="history-values">{h.results.join(', ')}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}


