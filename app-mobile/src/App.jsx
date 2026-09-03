import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>MotoFast — App Nativo</h1>
      <p>Base do projeto (React + Vite + Capacitor) funcionando.</p>
      <button type="button" onClick={() => setCount((count) => count + 1)}>
        Cliques: {count}
      </button>
    </div>
  )
}

export default App
