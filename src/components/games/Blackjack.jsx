import { useState, useEffect, useRef } from 'react'
import './Blackjack.css'

const suits = ['♠', '♥', '♦', '♣']
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function Blackjack({ coins, onBetResult }) {
  const [deck, setDeck] = useState([])
  const [playerHand, setPlayerHand] = useState([])
  const [dealerHand, setDealerHand] = useState([])
  const [betAmount, setBetAmount] = useState(100)
  const [gameState, setGameState] = useState('betting') // betting, playing, dealer, finished
  const [message, setMessage] = useState('')
  const playerHandRef = useRef([])

  useEffect(() => {
    newDeck()
  }, [])

  const newDeck = () => {
    const newDeck = []
    for (let suit of suits) {
      for (let rank of ranks) {
        newDeck.push({ suit, rank })
      }
    }
    // Shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
    }
    setDeck(newDeck)
  }

  const getCardValue = (card) => {
    if (card.rank === 'A') return 11
    if (['J', 'Q', 'K'].includes(card.rank)) return 10
    return parseInt(card.rank)
  }

  const getHandValue = (hand) => {
    let value = 0
    let aces = 0

    for (let card of hand) {
      if (card.rank === 'A') {
        aces++
        value += 11
      } else {
        value += getCardValue(card)
      }
    }

    while (value > 21 && aces > 0) {
      value -= 10
      aces--
    }

    return value
  }

  const dealCards = () => {
    if (coins < betAmount || deck.length < 4) {
      setMessage('Not enough coins or cards!')
      return
    }

    const newDeck = [...deck]
    const newPlayerHand = [newDeck.pop(), newDeck.pop()]
    const newDealerHand = [newDeck.pop(), newDeck.pop()]

    setPlayerHand(newPlayerHand)
    playerHandRef.current = newPlayerHand
    setDealerHand(newDealerHand)
    setDeck(newDeck)
    setGameState('playing')
    setMessage('')

    // Check for blackjack
    if (getHandValue(newPlayerHand) === 21) {
      setMessage('Blackjack! 🎉')
      setTimeout(() => {
        endGame(2.5) // Blackjack pays 2.5x
      }, 1500)
    }
  }

  const hit = () => {
    if (gameState !== 'playing' || deck.length === 0) return

    const newDeck = [...deck]
    const newCard = newDeck.pop()
    const newPlayerHand = [...playerHand, newCard]

    setPlayerHand(newPlayerHand)
    playerHandRef.current = newPlayerHand
    setDeck(newDeck)

    const playerValue = getHandValue(newPlayerHand)

    if (playerValue > 21) {
      setMessage('Bust! 💥')
      setGameState('finished')
      setTimeout(() => {
        endGame(0)
      }, 1500)
    } else if (playerValue === 21) {
      setMessage('21! Standing...')
      setTimeout(() => {
        dealerPlay()
      }, 1000)
    }
  }

  const stand = () => {
    if (gameState !== 'playing') return
    dealerPlay()
  }

  const dealerPlay = () => {
    setGameState('dealer')
    setMessage('Dealer playing...')

    // Use ref to get the current player hand value
    const currentPlayerValue = getHandValue(playerHandRef.current)

    setTimeout(() => {
      setDealerHand(currentDealerHand => {
        setDeck(currentDeck => {
          let newDealerHand = [...currentDealerHand]
          let newDeck = [...currentDeck]

          while (getHandValue(newDealerHand) < 17 && newDeck.length > 0) {
            newDealerHand.push(newDeck.pop())
          }

          setTimeout(() => {
            const dealerValue = getHandValue(newDealerHand)
            const playerValue = getHandValue(playerHandRef.current) // Use ref to get latest value

            let multiplier = 0
            if (dealerValue > 21) {
              setMessage('Dealer busts! You win! 🎉')
              multiplier = 2
            } else if (dealerValue > playerValue) {
              setMessage('Dealer wins! 💀')
              multiplier = 0
            } else if (dealerValue < playerValue) {
              setMessage('You win! 🎉')
              multiplier = 2
            } else {
              setMessage("It's a tie! Push.")
              multiplier = 1
            }

            setGameState('finished')
            setTimeout(() => {
              endGame(multiplier)
            }, 2000)
          }, 1000)

          setDealerHand(newDealerHand)
          return newDeck
        })
        
        return currentDealerHand
      })
    }, 500)
  }

  const endGame = (multiplier) => {
    const winnings = Math.floor(betAmount * multiplier) - betAmount
    onBetResult(winnings)
    resetGame()
  }

  const resetGame = () => {
    setPlayerHand([])
    playerHandRef.current = []
    setDealerHand([])
    setGameState('betting')
    setMessage('')
    if (deck.length < 20) {
      newDeck()
    }
  }

  const canPlay = gameState === 'betting' && coins >= betAmount

  return (
    <div className="blackjack-container">
      <div className="blackjack-table">
        <div className="dealer-area">
          <h3>Dealer</h3>
          <div className="hand">
            {dealerHand.map((card, index) => (
              <div
                key={index}
                className={`card ${gameState === 'betting' && index === 1 ? 'hidden' : ''}`}
              >
                {gameState === 'betting' && index === 1 ? '?' : `${card.rank}${card.suit}`}
              </div>
            ))}
          </div>
          {gameState !== 'betting' && (
            <div className="hand-value">
              Value: {getHandValue(dealerHand)}
            </div>
          )}
        </div>

        <div className="message-area">
          {message && <div className="message">{message}</div>}
        </div>

        <div className="player-area">
          <h3>You</h3>
          <div className="hand">
            {playerHand.map((card, index) => (
              <div key={index} className="card">
                {card.rank}{card.suit}
              </div>
            ))}
          </div>
          {playerHand.length > 0 && (
            <div className="hand-value">
              Value: {getHandValue(playerHand)}
            </div>
          )}
        </div>

        <div className="controls">
          {gameState === 'betting' ? (
            <>
              <div className="bet-control">
                <label>Bet Amount:</label>
                <input
                  type="number"
                  min="1"
                  max={coins}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(1, Math.min(coins, parseInt(e.target.value) || 1)))}
                  className="bet-input"
                />
              </div>
              <button className="action-btn deal" onClick={dealCards} disabled={!canPlay}>
                Deal Cards 🃏
              </button>
            </>
          ) : gameState === 'playing' ? (
            <>
              <button className="action-btn hit" onClick={hit}>
                Hit ⚡
              </button>
              <button className="action-btn stand" onClick={stand}>
                Stand ✋
              </button>
            </>
          ) : (
            <button className="action-btn new-game" onClick={resetGame}>
              New Game 🔄
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Blackjack

