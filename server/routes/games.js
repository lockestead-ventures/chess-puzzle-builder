const express = require('express');
const router = express.Router();
const ChessComService = require('../services/chessComService');
const lichessService = require('../services/lichessService');
const PuzzleGenerator = require('../services/puzzleGenerator');

const chessComService = new ChessComService();
const puzzleGenerator = new PuzzleGenerator();

/**
 * POST /api/games/analyze
 * Analyze a chess.com game URL and return game data
 */
router.post('/analyze', async (req, res) => {
  try {
    const { gameUrl } = req.body;
    
    if (!gameUrl) {
      return res.status(400).json({ 
        error: 'Game URL is required' 
      });
    }
    
    if (!chessComService.isValidChessComUrl(gameUrl)) {
      return res.status(400).json({ 
        error: 'Invalid chess.com URL format' 
      });
    }
    
    console.log('🔍 Analyzing game URL:', gameUrl);
    
    // For chess.com URLs, we can't fetch individual games anymore
    // This route is deprecated for chess.com
    if (gameUrl.includes('chess.com')) {
      return res.status(400).json({
        error: 'Individual chess.com game analysis is not supported. Use the import route instead.'
      });
    }
    
    // For lichess, we can still fetch individual games
    if (gameUrl.includes('lichess.org')) {
      const gameId = gameUrl.split('/').pop();
      const gameData = await lichessService.getGame(gameId);
      res.json({
        success: true,
        game: gameData
      });
      return;
    }
    
    return res.status(400).json({
      error: 'Unsupported platform. Only lichess.org URLs are supported for individual game analysis.'
    });
    
    res.json({
      success: true,
      game: gameData
    });
    
  } catch (error) {
    console.error('Error analyzing game:', error);
    res.status(500).json({
      error: 'Failed to analyze game',
      message: error.message
    });
  }
});

/**
 * POST /api/games/validate-url
 * Validate if a URL is a valid chess.com or lichess.org game URL
 */
router.post('/validate-url', async (req, res) => {
  try {
    const { gameUrl } = req.body;
    
    if (!gameUrl) {
      return res.status(400).json({ 
        error: 'Game URL is required' 
      });
    }
    
    // Check if it's a chess.com URL
    const isChessCom = chessComService.isValidChessComUrl(gameUrl);
    
    // Check if it's a lichess.org URL
    const isLichess = gameUrl.includes('lichess.org') && gameUrl.match(/lichess\.org\/[a-zA-Z0-9]{8,}/) !== null;
    
    const isValid = isChessCom || isLichess;
    const platform = isChessCom ? 'chess.com' : isLichess ? 'lichess.org' : 'unknown';
    
    res.json({
      success: true,
      isValid,
      platform,
      message: isValid ? `Valid ${platform} URL` : 'Invalid URL format. Please use chess.com or lichess.org URLs'
    });
    
  } catch (error) {
    console.error('Error validating URL:', error);
    res.status(500).json({
      error: 'Failed to validate URL',
      message: error.message
    });
  }
});

/**
 * GET /api/games/player/:username
 * Get recent games for a player (for future enhancement)
 */
router.get('/player/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 10 } = req.query;
    
    if (!username) {
      return res.status(400).json({ 
        error: 'Username is required' 
      });
    }
    
    console.log('👤 Fetching games for player:', username);
    
    const games = await chessComService.getPlayerGames(username, parseInt(limit));
    
    res.json({
      success: true,
      player: username,
      games,
      count: games.length
    });
    
  } catch (error) {
    console.error('Error fetching player games:', error);
    res.status(500).json({
      error: 'Failed to fetch player games',
      message: error.message
    });
  }
});

/**
 * GET /api/games/lichess/:username
 * Get recent games for a lichess player
 */
router.get('/lichess/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { maxGames = 50 } = req.query;
    
    if (!username) {
      return res.status(400).json({ 
        error: 'Username is required' 
      });
    }
    
    if (!lichessService.validateUsername(username)) {
      return res.status(400).json({ 
        error: 'Invalid lichess username format' 
      });
    }
    
    console.log('👤 Fetching lichess games for player:', username);
    
    const games = await lichessService.getUserGames(username, parseInt(maxGames));
    
    res.json({
      success: true,
      player: username,
      platform: 'lichess',
      games,
      count: games.length
    });
    
  } catch (error) {
    console.error('Error fetching lichess games:', error);
    res.status(500).json({
      error: 'Failed to fetch lichess games',
      message: error.message
    });
  }
});

/**
 * GET /api/games/lichess/game/:gameId
 * Get specific game from lichess.org
 */
router.get('/lichess/game/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    console.log('🎮 Fetching lichess game:', gameId);
    
    const game = await lichessService.getGame(gameId);
    
    res.json({
      success: true,
      game
    });
    
  } catch (error) {
    console.error('Error fetching lichess game:', error);
    res.status(500).json({
      error: 'Failed to fetch lichess game',
      message: error.message
    });
  }
});

/**
 * POST /api/games/import
 * Bulk import games from multiple platforms and generate puzzles
 */
router.post('/import', async (req, res) => {
  try {
    const { platform, username, maxGames = 10, maxPuzzles = 5 } = req.body;
    
    if (!platform || !username) {
      return res.status(400).json({ 
        error: 'Platform and username are required' 
      });
    }
    
    console.log('DEBUG platform value:', platform);
    console.log('📥 Importing games for:', username, 'from', platform, `(max: ${maxGames} games, ${maxPuzzles} puzzles)`);
    
    // Add initial processing delay for sophistication
    console.log('🚀 Initializing game import system...');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let games = [];
    
    switch (platform.toLowerCase()) {
      case 'chess.com':
      case 'chesscom':
        games = await chessComService.getPlayerGames(username, parseInt(maxGames));
        break;
      case 'lichess.org':
      case 'lichess':
        if (!lichessService.validateUsername(username)) {
          return res.status(400).json({ 
            error: 'Invalid lichess username format' 
          });
        }
        games = await lichessService.getUserGames(username, parseInt(maxGames));
        break;
      default:
        return res.status(400).json({ 
          error: 'Unsupported platform. Use "chess.com" or "lichess.org"' 
        });
    }
    
    console.log(`📊 Found ${games.length} games, generating puzzles...`);
    
    // Generate puzzles from the imported games
    const allPuzzles = [];
    let processedGames = 0;
    const startTime = Date.now();
    
    // Process games until we have enough puzzles or run out of games
    for (let gameIndex = 0; gameIndex < games.length; gameIndex++) {
      const game = games[gameIndex];
      if (allPuzzles.length >= maxPuzzles) {
        console.log(`✅ Reached target of ${maxPuzzles} puzzles`);
        break;
      }
      try {
        // Debug: print the game object and its properties
        console.log('DEBUG game object:', game);
        console.log('DEBUG game properties:', Object.keys(game));
        console.log('DEBUG game.url:', game.url);
        console.log('DEBUG game.id:', game.id);

        // Check if this is a Chess960 game
        const isChess960 = game.rules === 'chess960' || game.pgn.includes('[Variant "Chess960"]');
        if (isChess960) {
          console.log('♟️ Processing Chess960 game:', game.white?.username || 'Unknown', 'vs', game.black?.username || 'Unknown');
          // Skip Chess960 games for now as they can cause parsing issues
          console.log('⚠️ Skipping Chess960 game due to parsing complexity');
          continue;
        }

        let puzzleResult;
        if (platform === 'chess.com' || platform === 'chesscom') {
          // Pass the full game object (with PGN) directly
          if (!game.pgn) {
            console.log('⚠️ Skipping game without PGN:', game);
            continue;
          }
          // Add platform property for downstream logic
          game.platform = 'chess.com';
          puzzleResult = await puzzleGenerator.generatePuzzlesFromGame(game);
        } else {
          // For lichess, pass the game URL
          puzzleResult = await puzzleGenerator.generatePuzzlesFromGame(`https://lichess.org/${game.id}`);
        }
        if (puzzleResult.puzzles && puzzleResult.puzzles.length > 0) {
          // Add puzzles but respect the max limit
          const remainingSlots = maxPuzzles - allPuzzles.length;
          const puzzlesToAdd = puzzleResult.puzzles.slice(0, remainingSlots);
          allPuzzles.push(...puzzlesToAdd);
        }
        processedGames++;
      } catch (error) {
        console.error(`Error generating puzzles for game ${game.id}:`, error);
      }
    }
    
    const processingTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`🧩 Generated ${allPuzzles.length} puzzles from ${processedGames} games in ${processingTime}s`);
    
    res.json({ 
      success: true, 
      gamesImported: games.length,
      gamesProcessed: processedGames,
      puzzles: allPuzzles,
      summary: {
        type: 'bulk',
        platform,
        username,
        gamesImported: games.length,
        puzzlesGenerated: allPuzzles.length,
        processingTime: `${processingTime}s`
      }
    });
    
  } catch (error) {
    console.error('Error importing games:', error);
    res.status(500).json({
      error: 'Failed to import games',
      message: error.message
    });
  }
});

module.exports = router; 