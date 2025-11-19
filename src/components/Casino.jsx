import { useState } from 'react'
import Plinko from './games/Plinko'
import Blackjack from './games/Blackjack'
import Roulette from './games/Roulette'
import './Casino.css'

function Casino({ coins, setCoins }) {
  const [activeGame, setActiveGame] = useState('plinko')

  const games = [
    { id: 'plinko', name: 'Plinko', icon: '🎯' },
    { id: 'blackjack', name: 'Blackjack', icon: '🃏' },
    { id: 'roulette', name: 'Roulette', icon: '🎲' },
  ]

  const handleBetResult = (winnings) => {
    setCoins(prev => prev + winnings)
  }

  return (
    <div className="casino-container">
      <div className="casino-card">
        <h2 className="casino-title">🎰 Welcome to the Casino 🎰</h2>
        <p className="casino-subtitle">Spend your hard-earned coins!</p>

        <div className="game-selector">
          {games.map(game => (
            <button
              key={game.id}
              className={`game-btn ${activeGame === game.id ? 'active' : ''}`}
              onClick={() => setActiveGame(game.id)}
            >
              <span className="game-icon">{game.icon}</span>
              <span className="game-name">{game.name}</span>
            </button>
          ))}
        </div>

        <div className="game-area">
          {activeGame === 'plinko' && (
            <Plinko coins={coins} onBetResult={handleBetResult} />
          )}
          {activeGame === 'blackjack' && (
            <Blackjack coins={coins} onBetResult={handleBetResult} />
          )}
          {activeGame === 'roulette' && (
            <Roulette coins={coins} onBetResult={handleBetResult} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Casino

