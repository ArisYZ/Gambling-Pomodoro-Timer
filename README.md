# Gambling-Pomodoro-Timer

Study incentives through gambling??? Somewhat of a joke but a fun project to work on regardless.

A Pomodoro timer application that rewards successful study sessions with coins to gamble on various casino games.

## Features

- ⏱️ **Pomodoro Timer**: 30-minute study sessions with 5-minute breaks
- 🪙 **Coin Rewards**: Earn 1,000 coins for each completed study session
- 🎰 **Casino Games**: 
  - **Plinko**: Drop a ball and watch it bounce through pegs to win multipliers
  - **Blackjack**: Classic card game with dealer AI
  - **Roulette**: Spin the wheel and bet on red, black, green, or specific numbers

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How It Works

1. Start a study session using the Pomodoro timer
2. Complete a full 30-minute session to earn 1,000 coins
3. Take your 5-minute break
4. Head to the Casino tab to spend your coins on games
5. Win or lose, but remember to get back to studying for more coins!

## Technologies Used

- React 18
- Vite
- HTML5 Canvas (for Plinko)
- CSS3 with modern gradients and animations

## License

This is a fun personal project - feel free to use and modify as you wish!
