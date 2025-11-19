import { useState, useEffect, useRef } from 'react'
import './PomodoroTimer.css'

const WORK_DURATION = 30 * 60 // 30 minutes in seconds
const BREAK_DURATION = 5 * 60 // 5 minutes in seconds

function PomodoroTimer({ onSessionComplete }) {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isActive, timeLeft])

  const handleTimerComplete = () => {
    setIsActive(false)
    clearInterval(intervalRef.current)
    
    if (!isBreak) {
      // Work session completed - reward coins
      setSessionCount(prev => prev + 1)
      onSessionComplete()
      // Start break
      setIsBreak(true)
      setTimeLeft(BREAK_DURATION)
    } else {
      // Break completed - start new work session
      setIsBreak(false)
      setTimeLeft(WORK_DURATION)
    }
  }

  const toggleTimer = () => {
    setIsActive(prev => !prev)
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsBreak(false)
    setTimeLeft(WORK_DURATION)
    clearInterval(intervalRef.current)
  }

  const skipTimer = () => {
    setIsActive(false)
    clearInterval(intervalRef.current)
    
    if (!isBreak) {
      // Skip work session - reward coins
      setSessionCount(prev => prev + 1)
      onSessionComplete()
      // Start break
      setIsBreak(true)
      setTimeLeft(BREAK_DURATION)
    } else {
      // Skip break - start new work session
      setIsBreak(false)
      setTimeLeft(WORK_DURATION)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = isBreak 
    ? ((BREAK_DURATION - timeLeft) / BREAK_DURATION) * 100
    : ((WORK_DURATION - timeLeft) / WORK_DURATION) * 100

  return (
    <div className="timer-container">
      <div className="timer-card">
        <div className="timer-header">
          <h2>{isBreak ? '☕ Break Time' : '📚 Study Time'}</h2>
          <p className="session-count">Sessions completed: {sessionCount}</p>
        </div>

        <div className="timer-display">
          <div className="timer-circle">
            <svg className="timer-svg" viewBox="0 0 200 200">
              <circle
                className="timer-bg"
                cx="100"
                cy="100"
                r="90"
              />
              <circle
                className={`timer-progress ${isBreak ? 'break' : 'work'}`}
                cx="100"
                cy="100"
                r="90"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              />
            </svg>
            <div className="timer-text">
              <div className="time">{formatTime(timeLeft)}</div>
              <div className="mode">{isBreak ? 'Break' : 'Study'}</div>
            </div>
          </div>
        </div>

        <div className="timer-controls">
          <button className="control-btn primary" onClick={toggleTimer}>
            {isActive ? '⏸️ Pause' : '▶️ Start'}
          </button>
          <button className="control-btn secondary" onClick={resetTimer}>
            🔄 Reset
          </button>
          <button className="control-btn dev-skip" onClick={skipTimer} title="Dev: Skip timer instantly">
            ⚡ Skip (Dev)
          </button>
        </div>

        <div className="timer-info">
          {isBreak ? (
            <p>🎉 Great job! Take a 5-minute break before your next session.</p>
          ) : (
            <p>Complete a 30-minute study session to earn 1,000 coins! 🪙</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PomodoroTimer

