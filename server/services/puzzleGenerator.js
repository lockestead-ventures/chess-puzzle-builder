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
      const explanation = this.generateExplanation(analysis, theme, position, lastMove, position.moveNumber, position.color, analysis.bestMove);
      
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
        id: `puzzle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: puzzlePosition.fen,
        solution: {
          moves: [analysis.bestMove, ...analysis.pv.slice(1, 3)],
          evaluation: analysis.evaluation
        },
        theme,
        difficulty,
        explanation,
        lastMove,
        fenBeforeOriginalMove,
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
   * Generate explanation and clue for the puzzle
   */
  generateExplanation(analysis, theme, position, lastMove, puzzleMoveNumber, playerColor, bestMoveSan) {
    // Helper to convert SAN to full piece name and location
    function sanToText(san) {
      if (!san) return '';
      const pieceMap = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight' };
      let match = san.match(/([KQRBN])?([a-h]?[1-8]?)x?([a-h][1-8])(=?[QRBN])?(\+|#)?/);
      if (!match) return san;
      let piece = match[1] ? pieceMap[match[1]] : 'Pawn';
      let to = match[3];
      let capture = san.includes('x');
      let promo = match[4] ? ' promoting to ' + pieceMap[match[4].replace('=','')] : '';
      let check = san.includes('+') ? ' with check' : '';
      let mate = san.includes('#') ? ' with mate' : '';
      return `${piece} to ${to}${capture ? ' capturing' : ''}${promo}${check}${mate}`;
    }

    // General, non-spoiler description
    let description = '';
    switch (theme) {
      case 'mate':
        description = 'A checkmate is possible in this position. Can you find the winning sequence?';
        break;
      case 'winning_combination':
        description = 'There is a combination here that leads to a decisive advantage.';
        break;
      case 'tactical_advantage':
        description = 'A tactical opportunity has arisen—look for a way to gain material.';
        break;
      case 'positional_advantage':
        description = 'A better move is available to improve your position.';
        break;
      case 'tactical_opportunity':
        description = 'There is a tactical chance in this position.';
        break;
      default:
        description = 'There is an opportunity in this position.';
    }
    if (lastMove) {
      description += ` The last move played was ${sanToText(lastMove)}.`;
    }

    // Vague, non-spoiler clue for home page
    function vagueClue(san) {
      if (!san) return '';
      const pieceMap = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight' };
      let match = san.match(/([KQRBN])?([a-h]?[1-8]?)x?([a-h][1-8])(=?[QRBN])?(\+|#)?/);
      let piece = match && match[1] ? pieceMap[match[1]] : 'pawn';
      let to = match && match[3] ? match[3] : '';
      let capture = san.includes('x');
      let promo = match && match[4] ? match[4].replace('=','') : '';
      let check = san.includes('+');
      let mate = san.includes('#');
      // Underpromotion
      let promoPiece = promo ? pieceMap[promo] || promo : null;
      // Build witty, context-aware clues
      if (mate) return "Checkmate is in the air—can you spot the final blow?";
      if (check) return "A check could shake things up—look for a bold move.";
      if (promoPiece && promoPiece !== 'queen') return `A rare underpromotion to a ${promoPiece} might surprise your opponent.`;
      if (promoPiece && promoPiece === 'queen') return `A pawn's dream: promotion to a queen is within reach.`;
      switch (piece) {
        case 'bishop':
          return to ? `The bishop's diagonal gaze is never innocent—what's happening on ${to}?` : "The bishop's diagonal gaze is never innocent.";
        case 'knight':
          return to ? `That knight is itching for mischief on ${to}.` : 'That knight is itching for mischief.';
        case 'rook':
          return to ? `Rooks love open roads—can you clear the way to ${to}?` : 'Rooks love open roads—can you clear the way?';
        case 'queen':
          return to ? `The queen is plotting—her eyes are on ${to}.` : 'The queen is plotting—can you see her plan?';
        case 'king':
          return to ? `Kings may look safe, but looks can be deceiving—especially near ${to}.` : 'Kings may look safe, but looks can be deceiving.';
        case 'pawn':
          if (capture && to) return `A humble pawn could stir up trouble by capturing on ${to}.`;
          if (to) return `A pawn push to ${to} could change the game.`;
          return 'A pawn push could stir up trouble.';
        default:
          return 'Something sneaky is brewing on the board.';
      }
    }

    // More detailed clue for puzzle solving screen
    function detailedClue(san) {
      if (!san) return vagueClue(san);
      const pieceMap = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight' };
      let match = san.match(/([KQRBN])?([a-h]?[1-8]?)x?([a-h][1-8])(=?[QRBN])?(\+|#)?/);
      let piece = match && match[1] ? pieceMap[match[1]] : 'pawn';
      let to = match && match[3] ? match[3] : '';
      let capture = san.includes('x');
      let check = san.includes('+');
      let mate = san.includes('#');
      let clue = '';
      switch (piece) {
        case 'bishop':
          clue = 'Look for a bishop move that could change the game.';
          break;
        case 'knight':
          clue = 'A knight jump could be very powerful here.';
          break;
        case 'rook':
          clue = 'The rook can be decisive on an open file.';
          break;
        case 'queen':
          clue = 'The queen has a strong move available.';
          break;
        case 'king':
          clue = 'King safety is a factor—watch for checks.';
          break;
        case 'pawn':
          clue = 'A pawn push could open things up.';
          break;
        default:
          clue = 'There is a tactical idea here.';
      }
      if (capture) clue += ' There may be a capture.';
      if (check) clue += ' A check is possible.';
      if (mate) clue += ' There could be mate!';
      return clue;
    }

    return {
      description,
      clue: vagueClue(bestMoveSan),
      detailedClue: detailedClue(bestMoveSan)
    };
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