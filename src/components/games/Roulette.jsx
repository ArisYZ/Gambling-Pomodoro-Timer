import { useState, useEffect } from 'react'
import './Roulette.css'

const NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

function Roulette({ coins, onBetResult }) {
  const [betAmount, setBetAmount] = useState(100)
  const [betType, setBetType] = useState('red') // red, black, green, number
  const [selectedNumber, setSelectedNumber] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [winningNumber, setWinningNumber] = useState(null)
  const [rotation, setRotation] = useState(0)

  const placeBet = () => {
    if (coins < betAmount || isSpinning) return

    setIsSpinning(true)
    const spinDuration = 3000
    const finalRotation = rotation + 1800 + Math.random() * 360
    const winningNum = NUMBERS[Math.floor(Math.random() * NUMBERS.length)]

    // Animate spin
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / spinDuration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentRotation = rotation + (finalRotation - rotation) * easeProgress

      setRotation(currentRotation)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setRotation(finalRotation)
        setWinningNumber(winningNum)
        setIsSpinning(false)

        // Calculate winnings
        let multiplier = 0
        if (betType === 'red' && RED_NUMBERS.includes(winningNum)) {
          multiplier = 2
        } else if (betType === 'black' && !RED_NUMBERS.includes(winningNum) && winningNum !== 0) {
          multiplier = 2
        } else if (betType === 'green' && winningNum === 0) {
          multiplier = 36
        } else if (betType === 'number' && winningNum === selectedNumber) {
          multiplier = 36
        }

        const winnings = Math.floor(betAmount * multiplier) - betAmount
        setLastResult({
          number: winningNum,
          won: multiplier > 0,
          winnings
        })

        setTimeout(() => {
          onBetResult(winnings)
        }, 500)
      }
    }

    animate()
  }

  const getNumberColor = (num) => {
    if (num === 0) return 'green'
    return RED_NUMBERS.includes(num) ? 'red' : 'black'
  }

  const wheelRotation = rotation % 360

  return (
    <div className="roulette-container">
      <div className="roulette-wheel-container">
        <div
          className="roulette-wheel"
          style={{ transform: `rotate(${wheelRotation}deg)` }}
        >
          {NUMBERS.map((num, index) => {
            const baseAngle = (360 / NUMBERS.length) * index
            const angleRad = (baseAngle * Math.PI) / 180
            const radius = 160
            const centerX = 200
            const centerY = 200
            const x = centerX + radius * Math.cos(angleRad)
            const y = centerY + radius * Math.sin(angleRad)
            const color = getNumberColor(num)
            return (
              <div
                key={`${num}-${index}`}
                className={`wheel-number ${color} ${winningNumber === num && !isSpinning ? 'winning' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -50%) rotate(${baseAngle + 90}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                {num}
              </div>
            )
          })}
        </div>
        <div className="wheel-pointer"></div>
      </div>

      {lastResult && (
        <div className={`result-message ${lastResult.won ? 'win' : 'lose'}`}>
          {lastResult.won ? '🎉' : '💀'} 
          Landed on: {lastResult.number} ({getNumberColor(lastResult.number)})
          {lastResult.won && ` - Won ${lastResult.winnings} coins!`}
          {!lastResult.won && ' - Better luck next time!'}
        </div>
      )}

      <div className="betting-controls">
        <div className="bet-type-selector">
          <button
            className={`bet-type-btn ${betType === 'red' ? 'active' : ''}`}
            onClick={() => setBetType('red')}
            disabled={isSpinning}
          >
            🔴 Red (2x)
          </button>
          <button
            className={`bet-type-btn ${betType === 'black' ? 'active' : ''}`}
            onClick={() => setBetType('black')}
            disabled={isSpinning}
          >
            ⚫ Black (2x)
          </button>
          <button
            className={`bet-type-btn ${betType === 'green' ? 'active' : ''}`}
            onClick={() => setBetType('green')}
            disabled={isSpinning}
          >
            🟢 Green (36x)
          </button>
          <button
            className={`bet-type-btn ${betType === 'number' ? 'active' : ''}`}
            onClick={() => setBetType('number')}
            disabled={isSpinning}
          >
            🎯 Number (36x)
          </button>
        </div>

        {betType === 'number' && (
          <div className="number-selector">
            <label>Select Number:</label>
            <select
              value={selectedNumber}
              onChange={(e) => setSelectedNumber(parseInt(e.target.value))}
              disabled={isSpinning}
              className="number-select"
            >
              {NUMBERS.map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        )}

        <div className="bet-amount-control">
          <label>Bet Amount:</label>
          <input
            type="number"
            min="1"
            max={coins}
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, Math.min(coins, parseInt(e.target.value) || 1)))}
            disabled={isSpinning}
            className="bet-input"
          />
        </div>

        <button
          className="spin-btn"
          onClick={placeBet}
          disabled={coins < betAmount || isSpinning}
        >
          {isSpinning ? '⏳ Spinning...' : '🎰 Spin the Wheel!'}
        </button>
      </div>
    </div>
  )
}

export default Roulette

