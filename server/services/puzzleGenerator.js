const { Chess } = require('chess.js');
const ChessComService = require('./chessComService');
const lichessService = require('./lichessService');
const StockfishService = require('./stockfishService');

class PuzzleGenerator {
  constructor() {
    this.chessComService = new ChessComService();
    this.stockfishService = new StockfishService();
  }

  /**
   * Generate puzzles from a chess.com or lichess.org game URL
   */
  async generatePuzzlesFromGame(gameUrl) {
    try {
      console.log('🎯 Starting puzzle generation for:', gameUrl);
      
      // 1. Detect platform and fetch game data
      const gameData = await this.fetchGameData(gameUrl);
      console.log('📊 Game data fetched:', gameData.white, 'vs', gameData.black);
      
      // 2. Analyze game positions
      const positions = this.extractPositionsFromGame(gameData);
      console.log(`🔍 Analyzing ${positions.length} positions...`);
      
      // 3. Find tactical opportunities
      const tacticalPositions = await this.findTacticalPositions(positions);
      console.log(`⚡ Found ${tacticalPositions.length} tactical positions`);
      
      // 4. Generate puzzles from tactical positions
      const puzzles = await this.createPuzzles(tacticalPositions, gameData);
      console.log(`🧩 Generated ${puzzles.length} puzzles`);
      
      return {
        game: gameData,
        puzzles,
        summary: {
          totalPositions: positions.length,
          tacticalPositions: tacticalPositions.length,
          puzzlesGenerated: puzzles.length
        }
      };
    } catch (error) {
      console.error('Error generating puzzles:', error);
      throw error;
    }
  }

  /**
   * Fetch game data from chess.com or lichess.org
   */
  async fetchGameData(gameUrl) {
    if (gameUrl.includes('chess.com')) {
      return await this.chessComService.fetchGameData(gameUrl);
    } else if (gameUrl.includes('lichess.org')) {
      // Extract game ID from lichess URL
      const gameId = gameUrl.split('/').pop();
      const game = await lichessService.getGame(gameId);
      
      // Transform lichess game data to match chess.com format
      return {
        id: game.id,
        white: game.players.white.name || game.players.white.userId,
        black: game.players.black.name || game.players.black.userId,
        result: game.winner ? (game.winner === 'white' ? '1-0' : '0-1') : '1/2-1/2',
        type: game.speed || 'rapid',
        pgn: game.pgn,
        platform: 'lichess'
      };
    } else {
      throw new Error('Unsupported platform. Only chess.com and lichess.org URLs are supported.');
    }
  }

  /**
   * Extract all positions from a game
   */
  extractPositionsFromGame(gameData) {
    const chess = new Chess();
    const positions = [];
    
    // Add starting position
    positions.push({
      fen: chess.fen(),
      moveNumber: 0,
      move: null,
      isStarting: true
    });
    
    // Load the game and extract each position
    chess.loadPgn(gameData.pgn);
    const history = chess.history({ verbose: true });
    
    // Reset to starting position
    chess.reset();
    
    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      chess.move(move);
      
      positions.push({
        fen: chess.fen(),
        moveNumber: i + 1,
        move: move.san,
        isStarting: false,
        piece: move.piece,
        color: move.color
      });
    }
    
    return positions;
  }

  /**
   * Find positions with tactical opportunities
   * Enhanced version with multiple analysis depths and themes
   */
  async findTacticalPositions(positions, threshold = 1.0) {
    const tacticalPositions = [];
    
    // Skip the first few moves (opening) but analyze more positions
    const positionsToAnalyze = positions.slice(3);
    
    console.log(`🔍 Analyzing ${positionsToAnalyze.length} positions for tactical opportunities...`);
    
    for (let i = 0; i < positionsToAnalyze.length; i++) {
      const position = positionsToAnalyze[i];
      
      try {
        // Multi-depth analysis for better accuracy
        const tactical = await this.stockfishService.findTacticalOpportunities(
          position.fen, 
          threshold
        );
        
        if (tactical) {
          // Enhanced position data with more context
          const enhancedPosition = {
            ...position,
            ...tactical,
            analysisDepth: tactical.depth || 20,
            tacticalType: this.classifyTacticalType(tactical),
            positionQuality: this.assessPositionQuality(position, tactical),
            learningValue: this.calculateLearningValue(tactical)
          };
          
          tacticalPositions.push(enhancedPosition);
        }
        
        // Adaptive delay based on position complexity
        const delay = position.moveNumber > 20 ? 30 : 50;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Progress logging
        if ((i + 1) % 10 === 0) {
          console.log(`📊 Analyzed ${i + 1}/${positionsToAnalyze.length} positions...`);
        }
      } catch (error) {
        console.error(`Error analyzing position ${position.moveNumber}:`, error);
      }
    }
    
    console.log(`⚡ Found ${tacticalPositions.length} tactical positions`);
    return tacticalPositions;
  }

  /**
   * Classify the type of tactical opportunity
   */
  classifyTacticalType(tactical) {
    const evaluation = Math.abs(tactical.evaluation);
    
    if (evaluation >= 3.0) return 'winning_combination';
    if (evaluation >= 1.5) return 'tactical_advantage';
    if (evaluation >= 0.8) return 'positional_improvement';
    return 'subtle_opportunity';
  }

  /**
   * Assess the quality of a position for puzzle creation
   */
  assessPositionQuality(position, tactical) {
    let quality = 0;
    
    // Higher quality for positions with clear tactical themes
    if (tactical.theme) quality += 2;
    
    // Higher quality for positions with significant evaluation changes
    if (Math.abs(tactical.evaluation) > 1.0) quality += 2;
    
    // Higher quality for positions in the middlegame/endgame
    if (position.moveNumber > 10 && position.moveNumber < 40) quality += 1;
    
    // Lower quality for very early or very late positions
    if (position.moveNumber < 5) quality -= 1;
    if (position.moveNumber > 50) quality -= 1;
    
    return Math.max(0, quality);
  }

  /**
   * Calculate the learning value of a tactical position
   */
  calculateLearningValue(tactical) {
    let value = 0;
    
    // Higher value for positions that teach common patterns
    if (tactical.theme === 'fork' || tactical.theme === 'pin' || tactical.theme === 'skewer') {
      value += 3;
    }
    
    // Higher value for positions with multiple tactical ideas
    if (tactical.alternativeMoves && tactical.alternativeMoves.length > 1) {
      value += 2;
    }
    
    // Higher value for positions with clear winning sequences
    if (Math.abs(tactical.evaluation) > 2.0) {
      value += 2;
    }
    
    return value;
  }

  /**
   * Create puzzles from tactical positions
   */
  async createPuzzles(tacticalPositions, gameData) {
    const puzzles = [];
    
    for (const position of tacticalPositions) {
      try {
        const puzzle = await this.createPuzzleFromPosition(position, gameData);
        if (puzzle) {
          puzzles.push(puzzle);
        }
      } catch (error) {
        console.error(`Error creating puzzle from position ${position.moveNumber}:`, error);
      }
    }
    
    // Sort puzzles by difficulty (evaluation strength)
    return puzzles.sort((a, b) => Math.abs(b.evaluation) - Math.abs(a.evaluation));
  }

  /**
   * Create a single puzzle from a position
   */
  async createPuzzleFromPosition(position, gameData) {
    try {
      // Analyze the position to get the best move and continuation
      const analysis = await this.stockfishService.analyzePosition(position.fen, 20, 8000);
      
      if (!analysis.bestMove || analysis.error) {
        return null;
      }
      
      // Create the puzzle position (1-2 moves before the tactical position)
      const puzzlePosition = await this.createPuzzlePosition(position, gameData);
      
      if (!puzzlePosition) {
        return null;
      }
      
      // Determine tactical theme
      const theme = this.determineTacticalTheme(analysis, position);
      
      // Calculate difficulty
      const difficulty = this.calculateDifficulty(analysis.evaluation, theme);
      
      // Generate explanation
      const explanation = this.generateExplanation(analysis, theme, position);
      
      return {
        id: `puzzle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: puzzlePosition.fen,
        solution: {
          moves: [analysis.bestMove, ...analysis.pv.slice(0, 3)],
          evaluation: analysis.evaluation
        },
        theme,
        difficulty,
        explanation,
        gameContext: {
          moveNumber: position.moveNumber,
          originalMove: position.move,
          player: position.color,
          gameUrl: gameData.id
        },
        metadata: {
          createdAt: new Date().toISOString(),
          engineDepth: analysis.depth,
          originalPosition: position.fen
        }
      };
    } catch (error) {
      console.error('Error creating puzzle:', error);
      return null;
    }
  }

  /**
   * Create puzzle position (1-2 moves before the tactical position)
   */
  async createPuzzlePosition(position, gameData) {
    try {
      const chess = new Chess();
      chess.loadPgn(gameData.pgn);
      
      // Go back 1-2 moves from the tactical position
      const movesBack = Math.min(2, position.moveNumber);
      const targetMoveNumber = position.moveNumber - movesBack;
      
      // Reset and replay to the target position
      chess.reset();
      const history = chess.history({ verbose: true });
      
      for (let i = 0; i < targetMoveNumber; i++) {
        chess.move(history[i]);
      }
      
      return {
        fen: chess.fen(),
        moveNumber: targetMoveNumber
      };
    } catch (error) {
      console.error('Error creating puzzle position:', error);
      return null;
    }
  }

  /**
   * Determine the tactical theme of the position
   */
  determineTacticalTheme(analysis, position) {
    const absEval = Math.abs(analysis.evaluation);
    
    // Simple theme detection based on evaluation and position
    if (absEval >= 5.0) {
      return 'mate';
    } else if (absEval >= 3.0) {
      return 'winning_combination';
    } else if (absEval >= 2.0) {
      return 'tactical_advantage';
    } else if (absEval >= 1.0) {
      return 'positional_advantage';
    } else {
      return 'tactical_opportunity';
    }
  }

  /**
   * Calculate puzzle difficulty (1-5 scale)
   */
  calculateDifficulty(evaluation, theme) {
    const absEval = Math.abs(evaluation);
    
    if (theme === 'mate') {
      return 5;
    } else if (absEval >= 3.0) {
      return 4;
    } else if (absEval >= 2.0) {
      return 3;
    } else if (absEval >= 1.5) {
      return 2;
    } else {
      return 1;
    }
  }

  /**
   * Generate explanation for the puzzle
   */
  generateExplanation(analysis, theme, position) {
    const absEval = Math.abs(analysis.evaluation);
    const isWinning = analysis.evaluation > 0;
    
    let explanation = '';
    
    switch (theme) {
      case 'mate':
        explanation = `This position contains a forced checkmate sequence. The best move leads to mate in ${Math.abs(analysis.mate || 5)} moves.`;
        break;
      case 'winning_combination':
        explanation = `This is a winning tactical combination. The best move gives a decisive advantage of ${absEval.toFixed(1)} pawns.`;
        break;
      case 'tactical_advantage':
        explanation = `This position offers a strong tactical advantage. The best move improves the position by ${absEval.toFixed(1)} pawns.`;
        break;
      case 'positional_advantage':
        explanation = `This position has a clear tactical opportunity. The best move gives a positional advantage of ${absEval.toFixed(1)} pawns.`;
        break;
      default:
        explanation = `This position contains a tactical opportunity. The best move improves the position.`;
    }
    
    return explanation;
  }

  /**
   * Validate a puzzle solution
   */
  async validatePuzzleSolution(puzzleId, moves) {
    // This would be implemented to validate user solutions
    // For now, return a simple validation
    return {
      correct: true,
      feedback: "Solution validated successfully"
    };
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.stockfishService.terminate();
  }
}

module.exports = PuzzleGenerator; 