import { useState, useEffect } from 'react'
import PomodoroTimer from './components/PomodoroTimer'
import Casino from './components/Casino'
import './App.css'

function App() {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('casinoCoins')
    return saved ? parseInt(saved, 10) : 0
  })
  const [currentView, setCurrentView] = useState('timer')

  useEffect(() => {
    localStorage.setItem('casinoCoins', coins.toString())
  }, [coins])

  const handleSessionComplete = () => {
    setCoins(prev => prev + 1000)
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>🎰 Gambling Pomodoro</h1>
        </div>
        <div className="nav-links">
          <button
            className={`nav-btn ${currentView === 'timer' ? 'active' : ''}`}
            onClick={() => setCurrentView('timer')}
          >
            ⏱️ Timer
          </button>
          <button
            className={`nav-btn ${currentView === 'casino' ? 'active' : ''}`}
            onClick={() => setCurrentView('casino')}
          >
            🎰 Casino
          </button>
        </div>
        <div className="coin-display">
          💰 {coins.toLocaleString()} coins
        </div>
      </nav>

      <main className="main-content">
        {currentView === 'timer' ? (
          <PomodoroTimer onSessionComplete={handleSessionComplete} />
        ) : (
          <Casino coins={coins} setCoins={setCoins} />
        )}
      </main>
    </div>
  )
}

export default App

