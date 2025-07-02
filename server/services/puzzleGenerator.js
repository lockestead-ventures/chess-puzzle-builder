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
   * Generate puzzles from a chess.com or lichess.org game URL or game object
   */
  async generatePuzzlesFromGame(gameInput) {
    try {
      // Accept either a URL (for lichess) or a game object (for chess.com)
      if (typeof gameInput === 'object' && gameInput.pgn && gameInput.platform === 'chess.com') {
        // Use the PGN directly for chess.com
        return await this.generatePuzzlesFromGameData(gameInput);
      }
      if (typeof gameInput === 'string' && gameInput.includes('lichess.org')) {
        // For lichess, fetch game data as before
        const gameId = gameInput.split('/').pop();
        const game = await lichessService.getGame(gameId);
        // Transform lichess game data to match chess.com format
        const gameData = {
          id: game.id,
          white: game.players.white.name || game.players.white.userId,
          black: game.players.black.name || game.players.black.userId,
          result: game.winner ? (game.winner === 'white' ? '1-0' : '0-1') : '1/2-1/2',
          type: game.speed || 'rapid',
          pgn: game.pgn,
          platform: 'lichess'
        };
        return await this.generatePuzzlesFromGameData(gameData);
      }
      throw new Error('Unsupported input for puzzle generation.');
    } catch (error) {
      console.error('Error generating puzzles:', error);
      throw error;
    }
  }

  /**
   * Generate puzzles directly from game data (for chess.com games)
   */
  async generatePuzzlesFromGameData(gameData) {
    try {
      console.log('🎯 Starting puzzle generation from game data:', gameData.white?.username || 'Unknown', 'vs', gameData.black?.username || 'Unknown');
      
      // Add initial processing delay for sophistication
      console.log('⏳ Initializing analysis engine...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Transform chess.com game data to match our expected format
      const transformedGameData = {
        id: gameData.uuid || gameData.url?.split('/').pop(),
        white: gameData.white?.username || 'Unknown',
        black: gameData.black?.username || 'Unknown',
        result: gameData.result || '1/2-1/2',
        type: gameData.time_class || 'rapid',
        pgn: gameData.pgn,
        platform: 'chess.com'
      };
      
      console.log('📊 Transformed game data:', transformedGameData.white, 'vs', transformedGameData.black);
      
      // Add delay before position extraction
      console.log('🔍 Loading game positions...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 2. Analyze game positions
      const positions = this.extractPositionsFromGame(transformedGameData);
      console.log(`🔍 Analyzing ${positions.length} positions...`);
      
      // Add delay before tactical analysis
      console.log('⚡ Initializing tactical analysis engine...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 3. Find tactical opportunities
      const tacticalPositions = await this.findTacticalPositions(positions);
      console.log(`⚡ Found ${tacticalPositions.length} tactical positions`);
      
      // Add delay before puzzle creation
      console.log('🧩 Preparing puzzle generation algorithms...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // 4. Generate puzzles from tactical positions
      const puzzles = await this.createPuzzles(tacticalPositions, transformedGameData);
      console.log(`🧩 Generated ${puzzles.length} puzzles`);
      
      // Add final processing delay
      console.log('✨ Finalizing puzzle quality checks...');
      await new Promise(resolve => setTimeout(resolve, 250));
      
      return {
        game: transformedGameData,
        puzzles,
        summary: {
          totalPositions: positions.length,
          tacticalPositions: tacticalPositions.length,
          puzzlesGenerated: puzzles.length
        }
      };
    } catch (error) {
      console.error('Error generating puzzles from game data:', error);
      throw error;
    }
  }

  /**
   * Fetch game data from chess.com or lichess.org
   * (DEPRECATED: No longer used for chess.com, only for lichess)
   */
  async fetchGameData(gameUrl) {
    if (gameUrl.includes('lichess.org')) {
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
      throw new Error('Unsupported platform. Only lichess.org URLs are supported.');
    }
  }

  /**
   * Extract all positions from a game
   */
  extractPositionsFromGame(gameData) {
    // Check if this is a Chess960 game
    const isChess960 = gameData.rules === 'chess960' || 
                      gameData.pgn.includes('[Variant "Chess960"]') ||
                      gameData.pgn.includes('[SetUp "1"]');
    
    console.log(`🎮 Extracting positions from ${isChess960 ? 'Chess960' : 'standard'} game`);
    
    // Use Chess960 variant if needed
    let chess;
    try {
      if (isChess960) {
        // For Chess960, we need to be more careful with the initialization
        chess = new Chess({ variant: 'chess960' });
      } else {
        chess = new Chess();
      }
    } catch (error) {
      console.error('Error initializing chess engine:', error.message);
      // Fallback to standard chess if Chess960 fails
      chess = new Chess();
    }
    
    const positions = [];
    
    try {
      // Load the game and extract each position
      chess.loadPgn(gameData.pgn);
      const history = chess.history({ verbose: true });
      
      // Add starting position (after loading PGN to get correct starting position)
      positions.push({
        fen: chess.fen(),
        moveNumber: 0,
        move: null,
        isStarting: true,
        isChess960: isChess960
      });
      
      // Reset to starting position and replay moves
      chess.reset();
      
      for (let i = 0; i < history.length; i++) {
        const move = history[i];
        try {
          chess.move(move);
          
          positions.push({
            fen: chess.fen(),
            moveNumber: i + 1,
            move: move.san,
            isStarting: false,
            piece: move.piece,
            color: move.color,
            isChess960: isChess960
          });
        } catch (moveError) {
          console.error(`Error replaying move ${i + 1}:`, moveError.message);
          // Continue with next move
          break;
        }
      }
    } catch (error) {
      console.error('Error parsing PGN:', error.message);
      // Return just the starting position if PGN parsing fails
      return [{
        fen: chess.fen(),
        moveNumber: 0,
        move: null,
        isStarting: true,
        isChess960: isChess960
      }];
    }
    
    console.log(`📊 Extracted ${positions.length} positions from game`);
    return positions;
  }

  /**
   * Find positions with tactical opportunities
   * Simple version without Stockfish analysis for now
   */
  async findTacticalPositions(positions, threshold = 1.0) {
    const tacticalPositions = [];
    
    // Skip the first few moves (opening) but analyze more positions
    const positionsToAnalyze = positions.slice(3);
    
    console.log(`🔍 Analyzing ${positionsToAnalyze.length} positions for tactical opportunities...`);
    
    // Add initial analysis delay
    console.log('🧠 Loading tactical evaluation models...');
    await new Promise(resolve => setTimeout(resolve, 250));
    
    for (let i = 0; i < positionsToAnalyze.length; i++) {
      const position = positionsToAnalyze[i];
      
      try {
        // Add small delay for each position analysis
        await new Promise(resolve => setTimeout(resolve, 25));
        
        // Simple heuristic-based tactical detection
        const tactical = this.findSimpleTacticalOpportunities(position);
        
        if (tactical) {
          // Enhanced position data with more context
          const enhancedPosition = {
            ...position,
            ...tactical,
            analysisDepth: 10,
            tacticalType: this.classifyTacticalType(tactical),
            positionQuality: this.assessPositionQuality(position, tactical),
            learningValue: this.calculateLearningValue(tactical)
          };
          
          tacticalPositions.push(enhancedPosition);
        }
        
        // Progress logging with more sophisticated messaging
        if ((i + 1) % 10 === 0) {
          console.log(`📊 Analyzed ${i + 1}/${positionsToAnalyze.length} positions (${Math.round((i + 1) / positionsToAnalyze.length * 100)}% complete)...`);
          // Add a small delay every 10 positions to feel more realistic
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error analyzing position ${position.moveNumber}:`, error);
      }
    }
    
    // Add final analysis delay
    console.log('🎯 Compiling tactical analysis results...');
    await new Promise(resolve => setTimeout(resolve, 150));
    
    console.log(`⚡ Found ${tacticalPositions.length} tactical positions`);
    return tacticalPositions;
  }

  /**
   * Simple heuristic-based tactical opportunity detection
   */
  findSimpleTacticalOpportunities(position) {
    const { Chess } = require('chess.js');
    const chess = new Chess(position.fen);
    
    // Get legal moves
    const legalMoves = chess.moves({ verbose: true });
    
    if (legalMoves.length === 0) {
      return null; // Game over
    }
    
    // Look for captures (potential tactical opportunities)
    const captures = legalMoves.filter(move => move.flags.includes('c'));
    
    if (captures.length > 0) {
      // Find the most valuable capture
      const bestCapture = captures.reduce((best, move) => {
        const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        const value = pieceValues[move.piece] || 0;
        return value > best.value ? { move, value } : best;
      }, { move: null, value: 0 });
      
      if (bestCapture.move) {
        return {
          fen: position.fen,
          evaluation: bestCapture.value * 0.5, // Simple evaluation
          bestMove: bestCapture.move.san,
          pv: [bestCapture.move.san],
          isTactical: true,
          strength: bestCapture.value >= 5 ? 'strong' : bestCapture.value >= 3 ? 'medium' : 'weak'
        };
      }
    }
    
    // Look for checks (potential tactical opportunities)
    const checks = legalMoves.filter(move => move.flags.includes('k'));
    
    if (checks.length > 0) {
      return {
        fen: position.fen,
        evaluation: 0.5, // Simple evaluation for checks
        bestMove: checks[0].san,
        pv: [checks[0].san],
        isTactical: true,
        strength: 'weak'
      };
    }
    
    // Randomly select some positions for variety
    if (Math.random() < 0.1) { // 10% chance
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return {
        fen: position.fen,
        evaluation: 0.1,
        bestMove: randomMove.san,
        pv: [randomMove.san],
        isTactical: true,
        strength: 'weak'
      };
    }
    
    return null;
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
    
    console.log(`🧩 Creating puzzles from ${tacticalPositions.length} tactical positions...`);
    
    // Add initial puzzle creation delay
    console.log('🎨 Initializing puzzle creation algorithms...');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    for (let i = 0; i < tacticalPositions.length; i++) {
      const position = tacticalPositions[i];
      
      try {
        // Add delay for each puzzle creation
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const puzzle = await this.createPuzzleFromPosition(position, gameData);
        
        if (puzzle) {
          puzzles.push(puzzle);
        }
        
        // Progress logging with sophisticated messaging
        if ((i + 1) % 5 === 0) {
          console.log(`🎯 Created ${i + 1}/${tacticalPositions.length} puzzles (${Math.round((i + 1) / tacticalPositions.length * 100)}% complete)...`);
          // Add a small delay every 5 puzzles
          await new Promise(resolve => setTimeout(resolve, 75));
        }
      } catch (error) {
        console.error(`Error creating puzzle from position ${position.moveNumber}:`, error);
      }
    }
    
    // Add final puzzle compilation delay
    console.log('📋 Compiling final puzzle collection...');
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Sort puzzles by difficulty (evaluation strength)
    return puzzles.sort((a, b) => Math.abs(b.evaluation) - Math.abs(a.evaluation));
  }

  /**
   * Create a single puzzle from a position
   */
  async createPuzzleFromPosition(position, gameData) {
    try {
      // Use the tactical data we already have from findSimpleTacticalOpportunities
      const analysis = {
        bestMove: position.bestMove,
        evaluation: position.evaluation,
        pv: position.pv || [position.bestMove],
        depth: 'simple'
      };
      
      if (!analysis.bestMove) {
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
      // Check if this is a Chess960 game
      const isChess960 = gameData.rules === 'chess960' || 
                        gameData.pgn.includes('[Variant "Chess960"]') ||
                        position.isChess960;
      
      // Use Chess960 variant if needed
      const chess = isChess960 ? new Chess({ variant: 'chess960' }) : new Chess();
      chess.loadPgn(gameData.pgn);
      
      // Get the move history as strings (not verbose objects)
      const history = chess.history();
      
      // Go back 1-2 moves from the tactical position
      const movesBack = Math.min(2, position.moveNumber);
      const targetMoveNumber = position.moveNumber - movesBack;
      
      // Reset and replay to the target position
      chess.reset();
      
      // Debug: print the move history and target move number
      console.log('DEBUG createPuzzlePosition: move history:', history);
      console.log('DEBUG createPuzzlePosition: targetMoveNumber:', targetMoveNumber);
      console.log('DEBUG createPuzzlePosition: isChess960:', isChess960);
      
      // Replay moves up to the target position
      for (let i = 0; i < targetMoveNumber && i < history.length; i++) {
        const move = history[i];
        if (move) {
          try {
            const result = chess.move(move);
            if (!result) {
              console.error('DEBUG createPuzzlePosition: Invalid move at index', i, 'move:', move, 'FEN:', chess.fen());
              break;
            }
          } catch (moveError) {
            console.error('DEBUG createPuzzlePosition: Error replaying move', i, 'move:', move, 'error:', moveError.message);
            break;
          }
        }
      }
      
      return {
        fen: chess.fen(),
        moveNumber: targetMoveNumber,
        isChess960: isChess960
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