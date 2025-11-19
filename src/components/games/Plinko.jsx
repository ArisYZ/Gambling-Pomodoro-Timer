import { useState, useRef, useEffect, useCallback } from 'react'
import './Plinko.css'

const BALL_RADIUS = 8
const PEG_RADIUS = 6
const ROW_OPTIONS = [8, 12, 16]
const RISK_OPTIONS = ['less risky', 'normal', 'more risky']

function Plinko({ coins, onBetResult }) {
  const [betAmount, setBetAmount] = useState(100)
  const [rows, setRows] = useState(12)
  const [riskLevel, setRiskLevel] = useState('normal')
  const [activeBallsCount, setActiveBallsCount] = useState(0)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const ballsRef = useRef([])
  const pegsRef = useRef([])
  const bouncingSlotsRef = useRef({}) // Track bouncing slots: { slotIndex: bounceStartTime }

  // Calculate multipliers based on row count and risk level
  const calculateMultipliers = useCallback((rowCount, risk) => {
    const slotCount = rowCount + 1
    const multipliers = []
    
    // Base multiplier range based on risk
    let minMultiplier, maxMultiplier
    if (risk === 'less risky') {
      minMultiplier = 0.5
      maxMultiplier = 2.0
    } else if (risk === 'more risky') {
      minMultiplier = 0.1
      maxMultiplier = 25.0 // Increased from 10.0 for higher risk/reward
    } else { // normal
      minMultiplier = 0.2
      maxMultiplier = 5.0
    }
    
    // Higher multipliers at edges, lower in middle
    for (let i = 0; i < slotCount; i++) {
      // Distance from center (0 at center, 1 at edge)
      const distanceFromCenter = Math.abs((i - (slotCount - 1) / 2) / ((slotCount - 1) / 2))
      
      // Calculate multiplier: higher at edges
      const multiplier = minMultiplier + (maxMultiplier - minMultiplier) * Math.pow(distanceFromCenter, 1.5)
      multipliers.push(Number(multiplier.toFixed(2)))
    }
    
    return multipliers
  }, [])

  const multipliers = calculateMultipliers(rows, riskLevel)

  // Calculate peg positions
  const calculatePegs = useCallback((rowCount, canvasWidth, canvasHeight) => {
    const pegs = []
    const spacing = canvasWidth / (rowCount + 1)
    const rowSpacing = (canvasHeight - 250) / rowCount // More space for multiplier display

    for (let row = 0; row < rowCount; row++) {
      const yPeg = 100 + row * rowSpacing
      const colsInRow = row + 1
      const startX = (canvasWidth - (colsInRow - 1) * spacing) / 2

      for (let col = 0; col < colsInRow; col++) {
        const xPeg = startX + col * spacing
        pegs.push({ x: xPeg, y: yPeg, row, col })
      }
    }

    return pegs
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = 800
    canvas.height = 650 // Increased height to prevent cut-off

    pegsRef.current = calculatePegs(rows, canvas.width, canvas.height)
    redrawBoard(ctx, canvas.width, canvas.height)
  }, [rows, multipliers, calculatePegs])

  const redrawBoard = (ctx, canvasWidth, canvasHeight, currentTime = Date.now()) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // Draw pegs
    ctx.fillStyle = '#fff'
    pegsRef.current.forEach(peg => {
      ctx.beginPath()
      ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw multiplier slots with more space
    const slotWidth = canvasWidth / multipliers.length
    const slotTop = canvasHeight - 120
    const slotHeight = 60
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    multipliers.forEach((mult, index) => {
      const xSlot = index * slotWidth + slotWidth / 2
      const ySlot = slotTop + slotHeight / 2
      
      // Check if this slot is bouncing
      const bounceStartTime = bouncingSlotsRef.current[index]
      let scale = 1
      let yOffset = 0
      
      if (bounceStartTime) {
        const bounceDuration = 400 // milliseconds
        const elapsed = currentTime - bounceStartTime
        
        if (elapsed < bounceDuration) {
          // Bounce animation using easing
          const progress = elapsed / bounceDuration
          // Use ease-out bounce effect
          const bounceProgress = 1 - Math.pow(1 - progress, 3)
          
          // Calculate bounce height (starts high, bounces down)
          if (progress < 0.3) {
            // Going up
            scale = 1 + bounceProgress * 0.3
            yOffset = -bounceProgress * 15
          } else if (progress < 0.6) {
            // Bouncing down
            const downProgress = (progress - 0.3) / 0.3
            scale = 1.3 - downProgress * 0.15
            yOffset = -15 + downProgress * 15
          } else {
            // Small bounce back up
            const upProgress = (progress - 0.6) / 0.4
            const bounce = Math.sin(upProgress * Math.PI * 2) * 0.1
            scale = 1.15 + bounce * 0.05
            yOffset = bounce * 3
          }
        } else {
          // Animation complete, remove from bouncing slots
          delete bouncingSlotsRef.current[index]
        }
      }
      
      // Calculate scaled dimensions
      const scaledWidth = (slotWidth - 2) * scale
      const scaledHeight = slotHeight * scale
      const scaledX = xSlot - scaledWidth / 2
      const scaledY = slotTop + yOffset + (slotHeight - scaledHeight) / 2
      
      // Draw slot background with bounce effect
      ctx.fillStyle = mult >= 1 ? '#4facfe' : '#ff6b6b'
      if (scale > 1) {
        // Add glow effect when bouncing
        ctx.shadowBlur = 15
        ctx.shadowColor = mult >= 1 ? '#4facfe' : '#ff6b6b'
      } else {
        ctx.shadowBlur = 0
      }
      ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight)
      ctx.shadowBlur = 0
      
      // Draw multiplier text
      ctx.fillStyle = '#fff'
      ctx.fillText(`x${mult}`, xSlot, slotTop + slotHeight / 2 + yOffset)
    })
  }

  const dropBall = () => {
    if (coins < betAmount) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Add one ball to the board
    const ballId = Date.now() + Math.random()
    const newBall = {
      id: ballId,
      x: canvas.width / 2 + (Math.random() - 0.5) * 20,
      y: 30,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 1.5,
      completed: false,
      lastCollisionTime: 0,
      lastCollisionPegId: null
    }

    ballsRef.current.push(newBall)
    setActiveBallsCount(ballsRef.current.filter(ball => !ball.completed).length)

    // Start animation if not already running
    if (!animationRef.current) {
      animate()
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const now = Date.now()
    const spacing = canvas.width / (rows + 1)
    const rowSpacing = (canvas.height - 250) / rows
    const slotWidth = canvas.width / multipliers.length
    const slotTop = canvas.height - 120

    // Update all active balls
    ballsRef.current.forEach(ball => {
      if (ball.completed) return

      // Update physics
      ball.y += ball.vy
      ball.x += ball.vx

      // Add gravity
      ball.vy += 0.2

      // Add small randomness to horizontal movement
      ball.vx += (Math.random() - 0.5) * 0.1

      // Dampen horizontal velocity
      ball.vx *= 0.99

      // Boundary checks with bounce
      if (ball.x < BALL_RADIUS) {
        ball.x = BALL_RADIUS
        ball.vx = Math.abs(ball.vx) * 0.7
      } else if (ball.x > canvas.width - BALL_RADIUS) {
        ball.x = canvas.width - BALL_RADIUS
        ball.vx = -Math.abs(ball.vx) * 0.7
      }

      // Check peg collisions with improved physics
      pegsRef.current.forEach(peg => {
        const dx = ball.x - peg.x
        const dy = ball.y - peg.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = PEG_RADIUS + BALL_RADIUS
        const pegId = `${peg.row}-${peg.col}`

        // Only check collisions if ball is near the peg's row
        if (Math.abs(ball.y - peg.y) > 30) return

        // Check if collision occurred
        if (distance < minDistance) {
          const timeSinceLastCollision = now - ball.lastCollisionTime
          const isSamePeg = ball.lastCollisionPegId === pegId

          // Avoid multiple collisions with same peg too quickly
          if (timeSinceLastCollision > 80 || !isSamePeg) {
            // Calculate collision normal
            const nx = dx / distance
            const ny = dy / distance

            // Calculate relative velocity
            const relativeVelocity = ball.vx * nx + ball.vy * ny

            // Only resolve if moving towards peg
            if (relativeVelocity < 0) {
              // Calculate overlap
              const overlap = minDistance - distance

              // Push ball out first to prevent phasing
              if (overlap > 0) {
                ball.x += nx * overlap * 1.2
                ball.y += ny * overlap * 1.2
              }

              // Reflect velocity with energy loss
              const restitution = 0.65
              const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
              
              // New velocity after bounce
              const bounceSpeed = speed * restitution
              
              // Calculate new direction (reflect off normal)
              const dot = ball.vx * nx + ball.vy * ny
              ball.vx = ball.vx - 2 * dot * nx
              ball.vy = ball.vy - 2 * dot * ny
              
              // Normalize and apply speed with some randomness
              const newSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
              if (newSpeed > 0) {
                const scale = bounceSpeed / newSpeed
                ball.vx *= scale
                ball.vy *= scale
                
                // Add some horizontal randomness
                ball.vx += (Math.random() - 0.5) * 2
              }

              // Ensure ball is moving downward after collision
              if (ball.vy < 1) {
                ball.vy = 1 + Math.random() * 2
              }

              // Record collision
              ball.lastCollisionTime = now
              ball.lastCollisionPegId = pegId
            }
          }
        }
      })

      // Check if ball reached bottom
      if (ball.y >= slotTop - BALL_RADIUS && !ball.completed) {
        ball.completed = true
        ball.completedTime = now
        const slotIndex = Math.floor(ball.x / slotWidth)
        const clampedIndex = Math.max(0, Math.min(slotIndex, multipliers.length - 1))
        const multiplier = multipliers[clampedIndex]
        const winnings = Math.floor(betAmount * multiplier) - betAmount
        
        // Trigger bounce animation for the slot
        bouncingSlotsRef.current[clampedIndex] = now
        
        onBetResult(winnings)
      }
    })

    // Remove completed balls that have been completed for a while
    ballsRef.current = ballsRef.current.filter(ball => {
      if (!ball.completed) return true
      if (ball.completedTime && now - ball.completedTime < 200) return true
      return false
    })

    // Update active balls count for UI
    const currentActiveCount = ballsRef.current.filter(ball => !ball.completed).length
    setActiveBallsCount(currentActiveCount)

    // Redraw everything with current time for animations
    redrawBoard(ctx, canvas.width, canvas.height, now)

    // Draw all active balls
    ballsRef.current.forEach(ball => {
      if (!ball.completed) {
        ctx.fillStyle = '#ffd700'
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffaa00'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // Continue animation if there are active balls
    if (ballsRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      animationRef.current = null
    }
  }

  return (
    <div className="plinko-container">
      <div className="plinko-controls">
        <div className="plinko-settings">
          <div className="setting-group">
            <label>Rows:</label>
            <div className="setting-buttons">
              {ROW_OPTIONS.map(option => (
                <button
                  key={option}
                  className={`setting-btn ${rows === option ? 'active' : ''}`}
                  onClick={() => setRows(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <label>Risk:</label>
            <div className="setting-buttons">
              {RISK_OPTIONS.map(option => (
                <button
                  key={option}
                  className={`setting-btn ${riskLevel === option ? 'active' : ''}`}
                  onClick={() => setRiskLevel(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bet-control">
          <label>Bet Amount:</label>
          <div className="bet-buttons">
            {[50, 100, 250, 500].map(amount => (
              <button
                key={amount}
                className={`bet-btn ${betAmount === amount ? 'active' : ''}`}
                onClick={() => setBetAmount(amount)}
                disabled={coins < amount}
              >
                {amount}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            max={coins}
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, Math.min(coins, parseInt(e.target.value) || 1)))}
            className="bet-input"
          />
        </div>

        {activeBallsCount > 0 && (
          <div className="active-balls-info">
            <p>Active Balls: {activeBallsCount}</p>
          </div>
        )}

        <button
          className="drop-btn"
          onClick={dropBall}
          disabled={coins < betAmount}
        >
          🎯 Drop Ball
        </button>
      </div>
      <canvas ref={canvasRef} className="plinko-canvas"></canvas>
    </div>
  )
}

export default Plinko
