import { useEffect, useState } from 'react'

type Session = {
  id: string
  name: string
  createdAt: string
  drawnCount: number
}

type SessionListProps = {
  onSelectSession: (sessionId: string) => void
  currentSessionId?: string
  refreshTrigger?: number // Pour forcer le rechargement
}

export default function SessionList({ onSelectSession, currentSessionId, refreshTrigger }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const loadSessions = async () => {
    setLoading(true)
    setError('')
    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001'
      const res = await fetch(`${apiUrl}/api/sessions`)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json() as { sessions: Session[] }
      setSessions(data.sessions)
    } catch (e: any) {
      setError(`Erreur: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [refreshTrigger])

  if (loading) return <div className="session-list-loading">Chargement des sessions...</div>
  if (error) return <div className="session-list-error">{error}</div>
  if (!sessions.length) return <div className="session-list-empty">Aucune session trouvée</div>

  return (
    <div className="session-list">
      <div className="session-list-header">
        <h3>Sessions existantes</h3>
        <button type="button" onClick={loadSessions} className="refresh-btn">
          Actualiser
        </button>
      </div>
      <ul className="session-list-items">
        {sessions.map((session) => (
          <li
            key={session.id}
            className={`session-item ${session.id === currentSessionId ? 'active' : ''}`}
            onClick={() => onSelectSession(session.id)}
          >
            <div className="session-item-name">{session.name}</div>
            <div className="session-item-meta">
              <span>{new Date(session.createdAt).toLocaleString()}</span>
              <span>{session.drawnCount} numéros tirés</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
