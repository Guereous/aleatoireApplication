import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000'
    fetch(`${apiUrl}/`)
      .then((res) => res.text())
      .then((txt) => setMessage(txt))
      .catch((e) => setMessage(`Erreur: ${e.message}`))
  }, [])

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Frontend React</h1>
      <p>Backend dit: {message || '...'}</p>
    </div>
  )
}

export default App

