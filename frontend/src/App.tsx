import { useEffect, useState } from 'react'
import './App.css'
import ServerInfo from './components/ServerInfo'
import RandomNumberForm, { type RandomFormValues } from './components/RandomNumberForm'
import RandomResults from './components/RandomResults'
import RandomHistory, { type HistoryEntry } from './components/RandomHistory'
import SessionList from './components/SessionList'

function App() {
  const [message, setMessage] = useState<string>('')
  const [timeIso, setTimeIso] = useState<string>('')
  const [results, setResults] = useState<number[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  useEffect(() => {
    const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001'
    fetch(`${apiUrl}/`)
      .then((res) => res.text())
      .then((txt) => setMessage(txt))
      .catch((e) => setMessage(`Erreur: ${e.message}`))

    fetch(`${apiUrl}/api/time`)
      .then((res) => res.json())
      .then((data) => setTimeIso(data.nowIso))
      .catch((e) => setTimeIso(`Erreur: ${e.message}`))
  }, [])

  return (
    <div className="app-container">
      <ServerInfo title="Frontend React" message={message} timeIso={timeIso} />
      <section className="card">
        <h2>Génération de nombres aléatoires</h2>
        <RandomNumberForm
          sessionId={sessionId}
          onNewSession={() => setSessionId(undefined)}
          onSubmit={async (vals: RandomFormValues) => {
            const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001'
            try {
              const res = await fetch(`${apiUrl}/api/random`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vals),
              })
              if (!res.ok) {
                const text = await res.text()
                throw new Error(text || `HTTP ${res.status}`)
              }
              const data = (await res.json()) as { numbers: number[]; persistedId?: string; sessionId: string }
              setResults(data.numbers)
              setSessionId(data.sessionId)
              setRefreshTrigger(prev => prev + 1) // Force le rechargement de la liste des sessions
              const entry: HistoryEntry = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                params: vals,
                results: data.numbers,
                timestampIso: new Date().toISOString(),
              }
              setHistory((prev) => [entry, ...prev])
            } catch (e: any) {
              setResults([])
              alert(`Erreur backend: ${e.message}`)
            }
          }}
        />
        <RandomResults values={results} />
        <RandomHistory items={history} onClear={() => setHistory([])} />
      </section>
      
      <section className="card">
        <SessionList 
          onSelectSession={(sessionId) => setSessionId(sessionId)}
          currentSessionId={sessionId}
          refreshTrigger={refreshTrigger}
        />
      </section>
    </div>
  )
}

export default App

