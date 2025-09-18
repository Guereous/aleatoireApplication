
type RandomResultsProps = {
  values: number[]
}

export default function RandomResults({ values }: RandomResultsProps) {
  if (!values.length) return null
  return (
    <div className="results">
      <h2>Résultats</h2>
      <ul className="results-list">
        {values.map((v, i) => (
          <li key={`${v}-${i}`}>{v}</li>
        ))}
      </ul>
    </div>
  )
}


