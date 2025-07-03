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
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
chess-puzzle-builder/
├── server/                 # Backend API
│   ├── services/          # Core services
│   │   ├── chessComService.js    # Chess.com API integration
│   │   ├── stockfishService.js   # Stockfish engine service
│   │   └── puzzleGenerator.js    # Puzzle generation logic
│   ├── routes/            # API routes
│   │   ├── games.js       # Game analysis endpoints
│   │   └── puzzles.js     # Puzzle generation endpoints
│   └── index.js           # Express server
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Home.js           # Main landing page
│   │   │   ├── UrlInput.js       # URL input form
│   │   │   ├── PuzzleList.js     # Puzzle display
│   │   │   ├── PuzzleSolver.js   # Interactive puzzle solver
│   │   │   └── GameAnalysis.js   # Progress tracking
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
└── README.md
```

## 🔧 How It Works

### 1. Game Analysis Pipeline
- **URL Input**: Users paste chess.com game URLs
- **Data Fetching**: Uses chess-web-api to fetch game data and PGN
- **Position Extraction**: Extracts all positions from the game using chess.js
- **Engine Analysis**: Stockfish analyzes each position for tactical opportunities
- **Puzzle Generation**: Creates puzzles from critical positions with solutions

### 2. Puzzle Generation Algorithm
```javascript
// Core puzzle generation process
async function generatePuzzlesFromGame(gameUrl) {
  // 1. Fetch game using chess-web-api
  const gameData = await chessComService.fetchGameData(gameUrl);
  
  // 2. Extract all positions from the game
  const positions = extractPositionsFromGame(gameData);
  
  // 3. Analyze each position with Stockfish
  const tacticalPositions = await findTacticalPositions(positions);
  
  // 4. Create puzzles from tactical positions
  const puzzles = await createPuzzles(tacticalPositions, gameData);
  
  return { game: gameData, puzzles };
}
```

### 3. Frontend Features
- **Interactive Chess Board**: Built with react-chessboard
- **Real-time Validation**: Immediate feedback on moves
- **Progress Tracking**: Visual progress indicators and statistics
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Technology Stack

### Backend
- **Node.js & Express**: Server framework
- **chess.js**: Chess logic and PGN parsing
- **stockfish.js**: Chess engine for position analysis
- **@andyruwruw/chess-web-api**: Chess.com API integration
- **PostgreSQL**: Database (planned for future)

### Frontend
- **React**: UI framework
- **react-chessboard**: Interactive chess board component
- **Tailwind CSS**: Styling framework
- **Lucide React**: Icon library
- **Axios**: HTTP client

## 📊 API Endpoints

### Games
- `POST /api/games/analyze` - Analyze a chess.com game URL
- `POST /api/games/validate-url` - Validate chess.com URL format
- `GET /api/games/player/:username` - Get player's recent games

### Puzzles
- `POST /api/puzzles/generate` - Generate puzzles from game URL
- `POST /api/puzzles/validate` - Validate puzzle solution
- `GET /api/puzzles/:puzzleId` - Get specific puzzle
- `GET /api/puzzles/health` - Health check

## 🎮 Usage

### 1. Generate Puzzles
1. Go to the home page
2. Paste a chess.com game URL (live, daily, or archive games)
3. Click "Generate Puzzles"
4. Wait for analysis (30-60 seconds depending on game length)
5. Review generated puzzles with difficulty ratings and themes

### 2. Solve Puzzles
1. Click on any puzzle to start solving
2. Use the interactive chess board to make moves
3. Get immediate feedback on correct/incorrect moves
4. Use hints if needed
5. View the solution and explanation

### 3. Track Progress
1. Visit the Analysis page to see your statistics
2. Monitor solving accuracy and speed
3. Review puzzle themes and difficulty distribution
4. Get personalized improvement tips

## 🔍 Supported URL Formats

- Live games: `https://www.chess.com/game/live/1234567890`
- Daily games: `https://www.chess.com/game/daily/1234567890`
- Archive games: `https://www.chess.com/play/online/archive/username/1234567890`

## 🎯 Puzzle Themes

- **Checkmate**: Forced checkmate sequences
- **Winning Combination**: Decisive tactical advantages
- **Tactical Advantage**: Strong tactical opportunities
- **Positional Advantage**: Positional improvements
- **Tactical Opportunity**: General tactical chances

## 🚧 Development

### Running Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test
```

### Building for Production
```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && npm start
```

### Environment Variables
Create a `.env` file in the server directory:
```env
PORT=5000
NODE_ENV=development
# Add database credentials when implementing PostgreSQL
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [chess-web-api](https://github.com/andyruwruw/chess-web-api) - Chess.com API integration
- [stockfish.js](https://github.com/lichess-org/stockfish.js) - Chess engine
- [react-chessboard](https://github.com/Clariity/react-chessboard) - Chess board component
- [chess.js](https://github.com/jhlywa/chess.js) - Chess logic library

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact us at support@chesspuzzlebuilder.com.

## 📋 Versioning

This project uses **Semantic Versioning (SemVer)** with the format `vX.Y.Z`:

- **v0.X.Y** - Pre-MVP development versions
- **v1.0.0** - MVP launch (first production release with freemium tiers)

### Version Breakdown
- **Major (X)**: Breaking changes, major releases (0 = pre-MVP, 1 = MVP+)
- **Minor (Y)**: New features added (increments with each feature)
- **Patch (Z)**: Bug fixes and small improvements

### Current Version: `v0.3.0`

**Version History:**
- `v0.0.1` - Initial setup: Multi-platform chess puzzle builder with authentication
- `v0.1.0` - UI transformation: Username-focused puzzle builder with text-based UI
- `v0.2.0` - Puzzle solving system: Hint/solution gating, star rating, roadmap tracking
- `v0.3.0` - Dynamic puzzle clues: Context-rich, varied descriptions and hints

**Upcoming Milestones:**
- `v0.4.0` - Enhanced puzzle solving experience
- `v0.7.0` - User onboarding and freemium foundation
- `v1.0.0` - MVP launch with puzzle packs and community features

**Examples:**
- `v0.0.1` - Initial project setup
- `v0.1.0` - Added user authentication feature
- `v0.1.1` - Fixed login bug
- `v0.2.0` - Added puzzle solver
- `v0.2.1` - Improved error handling
- `v1.0.0` - MVP launch with freemium tiers

---

**Happy puzzling! 🧩♟️** 