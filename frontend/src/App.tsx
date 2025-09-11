import { useEffect, useState } from 'react'
import './App.css'
import ServerInfo from './components/ServerInfo'

function App() {
  const [message, setMessage] = useState<string>('')
  const [timeIso, setTimeIso] = useState<string>('')

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
    </div>
  )
}

export default App

