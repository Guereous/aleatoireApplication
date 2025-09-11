import React, { useState } from 'react'

export type RandomFormValues = {
  min: number
  max: number
  count: number
  sort?: 'asc' | 'desc' | 'none'
  noDuplicates?: boolean
  persist?: boolean
}

type RandomNumberFormProps = {
  onSubmit: (values: RandomFormValues) => void
}

export default function RandomNumberForm({ onSubmit }: RandomNumberFormProps) {
  const [min, setMin] = useState<string>('1')
  const [max, setMax] = useState<string>('100')
  const [count, setCount] = useState<string>('5')
  const [sort, setSort] = useState<'asc' | 'desc' | 'none'>('none')
  const [noDuplicates, setNoDuplicates] = useState<boolean>(true)
  const [persist, setPersist] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const minNum = Number(min)
    const maxNum = Number(max)
    const countNum = Number(count)

    if (!Number.isFinite(minNum) || !Number.isFinite(maxNum) || !Number.isFinite(countNum)) {
      setError('Veuillez entrer des nombres valides.')
      return
    }
    if (!Number.isInteger(minNum) || !Number.isInteger(maxNum) || !Number.isInteger(countNum)) {
      setError('Les valeurs doivent être des entiers.')
      return
    }
    if (minNum > maxNum) {
      setError('Le minimum doit être inférieur ou égal au maximum.')
      return
    }
    if (countNum < 1) {
      setError('La quantité doit être au moins 1.')
      return
    }
    const rangeSize = maxNum - minNum + 1
    if (noDuplicates && countNum > rangeSize) {
      setError(`La quantité (${countNum}) dépasse la taille de plage (${rangeSize}).`)
      return
    }

    onSubmit({ min: minNum, max: maxNum, count: countNum, sort, noDuplicates, persist })
  }

  return (
    <form className="random-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label htmlFor="min">Minimum</label>
        <input
          id="min"
          type="number"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="max">Maximum</label>
        <input
          id="max"
          type="number"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="count">Quantité</label>
        <input
          id="count"
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          required
          min={1}
        />
      </div>

      <div className="form-row">
        <label htmlFor="sort">Tri</label>
        <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="none">Aucun</option>
          <option value="asc">Croissant</option>
          <option value="desc">Décroissant</option>
        </select>
      </div>

      <div className="form-row">
        <label>
          <input
            type="checkbox"
            checked={noDuplicates}
            onChange={(e) => setNoDuplicates(e.target.checked)}
          />
          Interdire doublons
        </label>
      </div>

      <div className="form-row">
        <label>
          <input
            type="checkbox"
            checked={persist}
            onChange={(e) => setPersist(e.target.checked)}
          />
          Persister (BDD)
        </label>
      </div>

      {error && <div className="form-error" role="alert">{error}</div>}

      <div className="form-actions">
        <button type="submit">Générer</button>
      </div>
    </form>
  )
}


