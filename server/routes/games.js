const express = require('express');
const router = express.Router();
const ChessComService = require('../services/chessComService');
const lichessService = require('../services/lichessService');

const chessComService = new ChessComService();

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
    
    const gameData = await chessComService.fetchGameData(gameUrl);
    
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
 * Validate if a URL is a valid chess.com game URL
 */
router.post('/validate-url', async (req, res) => {
  try {
    const { gameUrl } = req.body;
    
    if (!gameUrl) {
      return res.status(400).json({ 
        error: 'Game URL is required' 
      });
    }
    
    const isValid = chessComService.isValidChessComUrl(gameUrl);
    
    res.json({
      success: true,
      isValid,
      message: isValid ? 'Valid chess.com URL' : 'Invalid chess.com URL format'
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
 * Bulk import games from multiple platforms
 */
router.post('/import', async (req, res) => {
  try {
    const { platform, username, maxGames = 50 } = req.body;
    
    if (!platform || !username) {
      return res.status(400).json({ 
        error: 'Platform and username are required' 
      });
    }
    
    console.log('📥 Importing games for:', username, 'from', platform);
    
    let games = [];
    
    switch (platform.toLowerCase()) {
      case 'chesscom':
        games = await chessComService.getPlayerGames(username, parseInt(maxGames));
        break;
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
          error: 'Unsupported platform. Use "chesscom" or "lichess"' 
        });
    }
    
    res.json({ 
      success: true, 
      games,
      count: games.length,
      platform 
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