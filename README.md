# Chess Puzzle Builder

A comprehensive chess puzzle platform that generates personalized puzzles from chess.com and lichess games using Stockfish engine analysis. Learn from your mistakes and improve your tactical awareness with puzzles based on your actual games, curated puzzle packs from top players, and a thriving community of chess enthusiasts.

## 🎯 Features

### Core Puzzle Experience
- **Smart Analysis**: Uses Stockfish engine to analyze every position and identify tactical opportunities
- **Personalized Learning**: Puzzles are created from your actual games, making them highly relevant to your playing style
- **Interactive Solving**: Solve puzzles with immediate feedback, hints, and dynamic explanations
- **Progress Tracking**: Monitor your improvement with detailed analysis and difficulty ratings
- **Multiple Themes**: Categorizes puzzles by tactical themes (mate, winning combination, tactical advantage, etc.)
- **Difficulty Ratings**: 1-5 scale difficulty based on engine evaluation and complexity
- **Seamless Navigation**: Pass entire puzzle collections between pages for instant loading and smooth transitions
- **Enhanced Puzzle Flow**: Next/previous navigation with random selection, progress indicators, and "See More Puzzles" modal

### Community & Social Features
- **Puzzle Packs**: Curated sets from Grandmasters, IMs, and popular streamers
- **Points System**: Earn points for completed puzzles and compete on global leaderboards
- **Achievement System**: Unlock badges and milestones as you improve
- **User-Generated Content**: Create and share your own educational puzzle packs

### Analytics & Progress
- **ELO Tracking**: Import and track your chess.com and lichess ratings
- **Performance Insights**: Detailed breakdown of your strengths and weaknesses
- **Progress Visualization**: Charts and graphs showing your improvement over time
- **Personalized Recommendations**: Get puzzle suggestions based on your performance patterns

## 💰 Pricing Tiers

### Free Tier
- **5 puzzles per day** - Perfect for casual practice
- Basic puzzle solving with hints and explanations
- Access to community leaderboards
- Limited analytics and progress tracking

### Pro Tier ($X/month)
- **Unlimited daily puzzles** - Practice as much as you want
- **1 tracked profile** - Link your chess.com or lichess account
- Full puzzle history and performance analytics
- Access to curated puzzle packs from top players
- Basic ELO tracking and correlation analysis

### Super Pro Tier ($Y/month)
- Everything in Pro, plus:
- **Multiple profile tracking** - Track multiple chess accounts
- **Advanced analytics** - Detailed performance insights and recommendations
- **Puzzle pack creation tools** - Create and share your own educational puzzle sets
- **Priority support** - Get help when you need it
- **Early access** - Try new features before anyone else

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/chess-puzzle-builder.git
   cd chess-puzzle-builder
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 📁 Project Structure

```
chess-puzzle-builder/
├── server/                 # Backend API
│   ├── services/          # Core services
│   │   ├── chessComService.js    # Chess.com API integration
│   │   ├── lichessService.js     # Lichess API integration
│   │   ├── stockfishService.js   # Stockfish engine service
│   │   └── puzzleGenerator.js    # Puzzle generation logic
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication endpoints
│   │   ├── games.js       # Game analysis endpoints
│   │   └── puzzles.js     # Puzzle generation endpoints
│   └── index.js           # Express server
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Home.js           # Main landing page with username/platform input
│   │   │   ├── PuzzleList.js     # Puzzle display and collection management
│   │   │   ├── PuzzleSolver.js   # Interactive puzzle solver with navigation
│   │   │   ├── GameAnalysis.js   # Progress tracking
│   │   │   ├── Header.js         # Navigation header
│   │   │   └── AuthModal.js      # Authentication modal
│   │   ├── contexts/      # React contexts
│   │   │   └── AuthContext.js    # Authentication state management
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
└── README.md
```

## 🔧 How It Works

### 1. Game Analysis Pipeline
- **Username/Platform Input**: Users enter their chess.com or lichess username and platform
- **Data Fetching**: Uses chess-web-api and lichess API to fetch recent games
- **Position Extraction**: Extracts all positions from games using chess.js
- **Engine Analysis**: Stockfish analyzes each position for tactical opportunities
- **Puzzle Generation**: Creates puzzles from critical positions with solutions

### 2. Puzzle Generation Algorithm
```javascript
// Core puzzle generation process
async function generatePuzzlesFromGames(username, platform) {
  // 1. Fetch recent games using platform-specific API
  const games = await fetchRecentGames(username, platform);
  
  // 2. Extract all positions from each game
  const positions = extractPositionsFromGames(games);
  
  // 3. Analyze each position with Stockfish
  const tacticalPositions = await findTacticalPositions(positions);
  
  // 4. Create puzzles from tactical positions
  const puzzles = await createPuzzles(tacticalPositions, games);
  
  return { games, puzzles };
}
```

### 3. Frontend Features
- **Interactive Chess Board**: Built with react-chessboard
- **Real-time Validation**: Immediate feedback on moves
- **Progress Tracking**: Visual progress indicators and statistics
- **Responsive Design**: Works on desktop and mobile devices
- **Puzzle Collection Management**: Seamless navigation between puzzles without backend calls
- **Enhanced UX**: Progress indicators, modals, and intuitive navigation

## 🛠️ Technology Stack

### Backend
- **Node.js & Express**: Server framework
- **chess.js**: Chess logic and PGN parsing
- **stockfish.js**: Chess engine for position analysis
- **@andyruwruw/chess-web-api**: Chess.com API integration
- **lichess API**: Lichess.org API integration
- **PostgreSQL**: Database (planned for future)

### Frontend
- **React**: UI framework
- **react-chessboard**: Interactive chess board component
- **Tailwind CSS**: Styling framework
- **Lucide React**: Icon library
- **Axios**: HTTP client

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Games
- `POST /api/games/analyze` - Analyze games from username/platform
- `GET /api/games/player/:username` - Get player's recent games

### Puzzles
- `POST /api/puzzles/generate` - Generate puzzles from username/platform
- `GET /api/puzzles/random` - Get a random puzzle (auto-generates if none exist)
- `GET /api/puzzles/generate-more` - Generate additional puzzles
- `GET /api/puzzles/:puzzleId` - Get specific puzzle
- `GET /api/puzzles/health` - Health check

## 🎮 Usage

### 1. Generate Puzzles
1. Go to the home page
2. Enter your chess.com or lichess username
3. Select your platform (chess.com or lichess)
4. Click "Generate Puzzles"
5. Wait for analysis (30-60 seconds depending on game count)
6. Review generated puzzles with difficulty ratings and themes

### 2. Solve Puzzles
1. Click on any puzzle to start solving
2. Use the interactive chess board to make moves
3. Get immediate feedback on correct/incorrect moves
4. Use hints if needed (available after first failed attempt)
5. View the solution and explanation after 5 failed attempts
6. Navigate between puzzles using next/previous buttons or random selection

### 3. Enhanced Navigation
1. **Next Puzzle**: Automatically loads the next puzzle in sequence
2. **Previous Puzzle**: Go back to the previous puzzle
3. **Random Puzzle**: Select a random puzzle from your collection
4. **See More Puzzles**: View remaining puzzles in a modal
5. **Progress Tracking**: See current puzzle number and total count
6. **Back to Home**: Return to home page and clear stored puzzles

### 4. Track Progress
1. Visit the Analysis page to see your statistics
2. Monitor solving accuracy and speed
3. Review puzzle themes and difficulty distribution
4. Get personalized improvement tips

## 🔍 Supported Platforms

- **Chess.com**: Live games, daily games, archive games
- **Lichess.org**: Rated games, casual games, tournament games

## 🎯 Puzzle Themes

- **Checkmate**: Forced checkmate sequences
- **Winning Combination**: Decisive tactical advantages
- **Tactical Advantage**: Material or positional gains
- **Defensive Play**: Finding the best defensive moves
- **Endgame Technique**: Endgame-specific tactical opportunities

## 🚀 Recent Updates (v0.4.0)

### Enhanced Puzzle Navigation
- **Puzzle Collection Passing**: Entire puzzle collections are passed between pages for instant loading
- **Seamless Transitions**: No backend calls needed when navigating between puzzles
- **Progress Indicators**: Visual feedback showing current puzzle number and total count
- **Random Selection**: Smart random puzzle selection that excludes the current puzzle

### Improved User Experience
- **"See More Puzzles" Modal**: Browse remaining puzzles without leaving the current puzzle
- **"Back to Home" Button**: Easy navigation back to the home page
- **Robust State Management**: localStorage fallback for puzzle collections and user preferences
- **Auto-Generation**: Backend automatically generates puzzles when none exist for a user

### Technical Improvements
- **Route Optimization**: Fixed route ordering to prevent parameterized routes from overriding specific endpoints
- **Error Handling**: Better error handling for API failures and edge cases
- **Performance**: Faster puzzle loading and navigation experience

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Current Version: v0.4.0 - Enhanced puzzle navigation and collection management* # Auto-push setup complete
