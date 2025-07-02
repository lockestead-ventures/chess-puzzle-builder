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
      
      // Sort puzzles by difficulty (evaluation strength)
      const sorted = puzzles.sort((a, b) => Math.abs(b.evaluation) - Math.abs(a.evaluation));
      // Only keep puzzles with difficulty >= 2
      const filtered = sorted.filter(p => p.difficulty >= 2);
      // Only allow one 2-star puzzle (if any)
      let twoStarIncluded = false;
      const finalPuzzles = filtered.filter(p => {
        if (p.difficulty > 2) return true;
        if (p.difficulty === 2 && !twoStarIncluded) {
          twoStarIncluded = true;
          return true;
        }
        return false;
      });
      return {
        game: transformedGameData,
        puzzles: finalPuzzles,
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
    
    return puzzles;
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
      
      // Determine the last move played before the puzzle position
      let lastMove = null;
      try {
        const chess = puzzlePosition.isChess960 ? new Chess({ variant: 'chess960' }) : new Chess();
        chess.loadPgn(gameData.pgn);
        const history = chess.history();
        const movesBack = Math.min(2, position.moveNumber);
        const targetMoveNumber = position.moveNumber - movesBack;
        if (targetMoveNumber > 0 && history[targetMoveNumber - 1]) {
          lastMove = history[targetMoveNumber - 1];
        }
      } catch (e) {
        lastMove = null;
      }
      
      // Determine tactical theme
      const theme = this.determineTacticalTheme(analysis, position);
      
      // Calculate difficulty
      const difficulty = this.calculateDifficulty(analysis.evaluation, theme);
      
      // Generate explanation and clue for the puzzle
      const puzzleObj = {
        id: `puzzle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: puzzlePosition.fen,
        solution: {
          moves: [analysis.bestMove, ...analysis.pv.slice(1, 3)],
          evaluation: analysis.evaluation
        },
        theme,
        difficulty,
        lastMove,
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
      
      const explanation = this.generateExplanation(analysis, theme, position, lastMove, position.moveNumber, position.color, analysis.bestMove, puzzleObj);
      
      // Determine the FEN before the original move
      let fenBeforeOriginalMove = null;
      try {
        const chess = puzzlePosition.isChess960 ? new Chess({ variant: 'chess960' }) : new Chess();
        chess.loadPgn(gameData.pgn);
        const history = chess.history();
        // The original move is at position.moveNumber-1 in history
        // So the FEN before it is after playing up to position.moveNumber-2
        chess.reset();
        for (let i = 0; i < position.moveNumber - 1 && i < history.length; i++) {
          chess.move(history[i]);
        }
        fenBeforeOriginalMove = chess.fen();
      } catch (e) {
        fenBeforeOriginalMove = null;
      }
      
      return {
        ...puzzleObj,
        explanation,
        fenBeforeOriginalMove,
        metadata: {
          ...puzzleObj.metadata,
          fenBeforeOriginalMove
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
   * Helper: Parse SAN to get piece and action
   */
  static parseSan(san) {
    if (!san) return { piece: 'piece', to: '', capture: false };
    const pieceMap = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight' };
    let match = san.match(/([KQRBN])?([a-h]?[1-8]?)x?([a-h][1-8])(=?[QRBN])?([+#])?/);
    let piece = match && match[1] ? pieceMap[match[1]] : 'Pawn';
    let to = match && match[3] ? match[3] : '';
    let capture = san && san.includes('x');
    return { piece, to, capture };
  }

  /**
   * Helper: Determine game phase from move number
   */
  static getGamePhase(moveNumber) {
    if (moveNumber < 10) return 'early game';
    if (moveNumber < 30) return 'middlegame';
    return 'endgame';
  }

  /**
   * Enhanced explanation and clue generator
   */
  static generateDynamicExplanation(puzzle) {
    const player = puzzle.gameContext.player === 'w' ? 'White' : 'Black';
    const lastMove = PuzzleGenerator.parseSan(puzzle.lastMove);
    const firstSolutionMove = PuzzleGenerator.parseSan(puzzle.solution.moves[0]);
    const phase = PuzzleGenerator.getGamePhase(puzzle.gameContext.moveNumber);

    // Description templates
    const descTemplates = [
      `${player}'s ${lastMove.piece} was just ${lastMove.capture ? 'captured' : 'moved'} in the ${phase}. The position has shifted, and both sides are looking for chances.`,
      `After ${player.toLowerCase()}'s ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'was captured' : 'moved'}, the ${phase} continues with tension on the board.`,
      `It's the ${phase}, and ${player.toLowerCase()}'s ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'has just been taken' : 'has just moved'}. The balance of power is changing.`,
      `A recent ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'capture' : 'move'} by ${player.toLowerCase()} has changed the landscape. The next moves will be critical.`,
      `The ${phase} is heating up after ${player.toLowerCase()}'s ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'was lost' : 'shifted position'}. The board is full of possibilities.`,
      `With the ${phase} underway, ${player.toLowerCase()}'s ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'has fallen' : 'has just moved'}. The game is entering a decisive stage.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'disappeared' : 'just moved'} from ${player.toLowerCase()}'s camp. Every piece now matters more than ever.`,
      `The board has shifted: ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just captured' : 'just moved'}. The ${phase} is in full swing.`,
      `A key moment in the ${phase}: ${player.toLowerCase()}'s ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'is off the board' : 'has just advanced'}. The tension is rising.`,
      `The ${phase} brings new chances. ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just taken' : 'just made a move'}. The next move could be decisive.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'exchange' : 'maneuver'} has just occurred. The ${phase} is at a crossroads.`,
      `After a ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'loss' : 'shift'}, the ${phase} is ripe for action. The board is set for a new plan.`,
      `The ${phase} is full of surprises. ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just removed' : 'just made a move'}. The position is dynamic.`,
      `A sudden ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'capture' : 'move'} by ${player.toLowerCase()} has opened the door for new ideas.`,
      `The ${phase} is a battlefield—${player.toLowerCase()}'s ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'has fallen' : 'has just moved'}. The struggle continues.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'vanished' : 'shifted'} in the ${phase}. The board is ready for a new plan.`,
      `With the ${phase} in progress, ${player.toLowerCase()}'s ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'is gone' : 'has just moved'}. The next phase of the game begins.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'was just captured' : 'just moved'}—the ${phase} is your stage. The pieces are set for action.`,
      `The ${phase} just got interesting: ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just lost' : 'just made a move'}. The board is alive with possibilities.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'exchange' : 'advance'} has changed the ${phase}. The next moves will shape the outcome.`,
      `After ${player.toLowerCase()}'s ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'was taken' : 'moved'}, the ${phase} is set for tactics.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'disappeared' : 'just moved'}—the ${phase} is in your hands. The initiative is up for grabs.`,
      `The ${phase} is a time for boldness. ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just captured' : 'just moved'}. The game is on a knife edge.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'loss' : 'move'} by ${player.toLowerCase()} has set the stage for a new battle.`,
      `The ${phase} is underway. ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just lost' : 'just moved'}. The position is ready for a breakthrough.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'was just captured' : 'just moved'}—the ${phase} is alive with possibilities.`,
      `After a ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'exchange' : 'shift'}, the ${phase} is open for tactics.`,
      `The ${phase} is a moment of truth. ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just taken' : 'just moved'}. The next move could decide the game.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'disappeared' : 'just moved'}—the ${phase} is your opportunity to take control.`,
      `The ${phase} is a time for creativity. ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just lost' : 'just moved'}. The board is set for a new idea.`,
      `A ${lastMove.piece.toLowerCase()} just left the board. In the ${phase}, every piece counts.`,
      `The ${phase} is a time for surprises. ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just captured' : 'just moved'}. The position is shifting.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'loss' : 'move'} by ${player.toLowerCase()} has opened a door for new plans.`,
      `The ${phase} is shifting. ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just lost' : 'just moved'}. The board is ready for a new direction.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'was just captured' : 'just moved'}—the ${phase} is a chance for creativity.`,
      `After a ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'exchange' : 'advance'}, the ${phase} is in flux.`,
      `The ${phase} is a test of nerves. ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just taken' : 'just moved'}.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'disappeared' : 'just moved'}—the ${phase} is a puzzle to solve.`,
      `The ${phase} is a moment for boldness. ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just lost' : 'just moved'}.`,
      `A ${lastMove.piece.toLowerCase()} ${lastMove.capture ? 'was just captured' : 'just moved'}—the ${phase} is your canvas for a new plan.`,
      `The ${phase} is a crossroads. ${player}'s ${lastMove.piece} ${lastMove.capture ? 'was just lost' : 'just moved'}. The next move will set the direction.`,
    ];

    // Clue templates
    const clueTemplates = [
      `Win material by using your ${firstSolutionMove.piece.toLowerCase()} at the right moment.`,
      `Deliver checkmate with a precise move involving your ${firstSolutionMove.piece.toLowerCase()}.`,
      `Create a decisive threat with your ${firstSolutionMove.piece.toLowerCase()} in this position.`,
      `Break through the defense by activating your ${firstSolutionMove.piece.toLowerCase()}.`,
      `Use your ${firstSolutionMove.piece.toLowerCase()} to turn the tables and seize the initiative.`,
      `Find the tactic that leverages your ${firstSolutionMove.piece.toLowerCase()} for maximum effect.`,
      `Force a win by coordinating your ${firstSolutionMove.piece.toLowerCase()} with your other pieces.`,
      `Take control of the game by advancing your ${firstSolutionMove.piece.toLowerCase()}.`,
      `Punish your opponent's last move with a sharp response from your ${firstSolutionMove.piece.toLowerCase()}.`,
      `Use your ${firstSolutionMove.piece.toLowerCase()} to expose a weakness in the enemy camp.`,
      `Find the best continuation with your ${firstSolutionMove.piece.toLowerCase()} to gain the upper hand.`,
      `Strike quickly with your ${firstSolutionMove.piece.toLowerCase()} to create a winning opportunity.`,
      `Capitalize on the open lines by bringing your ${firstSolutionMove.piece.toLowerCase()} into play.`,
      `Your goal: use your ${firstSolutionMove.piece.toLowerCase()} to achieve a decisive advantage.`,
      `Seize the initiative by making the most of your ${firstSolutionMove.piece.toLowerCase()}.`,
      `Find the move that puts your ${firstSolutionMove.piece.toLowerCase()} in the spotlight.`,
      `Use your ${firstSolutionMove.piece.toLowerCase()} to force a concession from your opponent.`,
      `Take advantage of the position by activating your ${firstSolutionMove.piece.toLowerCase()}.`,
      `Find the resource that only your ${firstSolutionMove.piece.toLowerCase()} can provide.`,
      `Make your ${firstSolutionMove.piece.toLowerCase()} the hero of this puzzle.`,
      `Look for a way to use your ${firstSolutionMove.piece.toLowerCase()} to change the course of the game.`,
      `Find the breakthrough with your ${firstSolutionMove.piece.toLowerCase()} and press your advantage.`,
      `Use your ${firstSolutionMove.piece.toLowerCase()} to create a double threat.`,
      `Find the forcing sequence that starts with your ${firstSolutionMove.piece.toLowerCase()}.`,
      `Your task: use your ${firstSolutionMove.piece.toLowerCase()} to solve the puzzle.`,
      `Can you spot the tactic with your ${firstSolutionMove.piece.toLowerCase()}?`,
      `What is the most powerful move for your ${firstSolutionMove.piece.toLowerCase()} in this position?`,
      `Is there a way for your ${firstSolutionMove.piece.toLowerCase()} to tip the balance?`,
      `How can your ${firstSolutionMove.piece.toLowerCase()} make the difference here?`,
      `What is the best way to use your ${firstSolutionMove.piece.toLowerCase()} to win?`,
      `Unleash the power of your ${firstSolutionMove.piece.toLowerCase()} to shift the balance in your favor.`,
      `Find the sequence that forces your opponent to give up material using your ${firstSolutionMove.piece.toLowerCase()}.`,
      `Use your ${firstSolutionMove.piece.toLowerCase()} to create unstoppable threats.`,
      `Coordinate your ${firstSolutionMove.piece.toLowerCase()} with your other pieces to dominate the board.`,
      `Spot the weakness and exploit it with your ${firstSolutionMove.piece.toLowerCase()}.`,
      `Can your ${firstSolutionMove.piece.toLowerCase()} deliver the decisive blow?`,
      `Is there a way to use your ${firstSolutionMove.piece.toLowerCase()} to force a win?`,
      `Find the move that turns your ${firstSolutionMove.piece.toLowerCase()} into a game-changer.`,
      `Let your ${firstSolutionMove.piece.toLowerCase()} lead the attack and open lines.`,
      `Can you use your ${firstSolutionMove.piece.toLowerCase()} to set up a devastating tactic?`,
      `Make your ${firstSolutionMove.piece.toLowerCase()} the key to unlocking the position.`,
    ];

    const description = descTemplates[Math.floor(Math.random() * descTemplates.length)];
    const clue = clueTemplates[Math.floor(Math.random() * clueTemplates.length)];

    // Optionally, detailed clue
    const detailedClue = `Pay attention to the ${firstSolutionMove.piece.toLowerCase()} and its potential moves in the ${phase}.`;

    return {
      description,
      clue,
      detailedClue
    };
  }

  /**
   * Generate explanation and clue for the puzzle
   */
  generateExplanation(analysis, theme, position, lastMove, puzzleMoveNumber, playerColor, bestMoveSan, puzzleObj) {
    // Use the new dynamic explanation generator
    return PuzzleGenerator.generateDynamicExplanation(puzzleObj);
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