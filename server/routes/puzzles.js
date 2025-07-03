const express = require('express');
const router = express.Router();
const PuzzleGenerator = require('../services/puzzleGenerator');
const puzzleModel = require('../models/Puzzle');

const puzzleGenerator = new PuzzleGenerator();

/**
 * POST /api/puzzles/generate
 * Generate puzzles from a chess.com game URL
 */
router.post('/generate', async (req, res) => {
  try {
    const { gameUrl, userId } = req.body;
    
    if (!gameUrl) {
      return res.status(400).json({ 
        error: 'Game URL is required' 
      });
    }
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }
    
    console.log('🧩 Generating puzzles for:', gameUrl, 'User:', userId);
    
    // Generate puzzles (this can take 30+ seconds for complex games)
    const result = await puzzleGenerator.generatePuzzlesFromGame(gameUrl);
    
    // Save puzzles to user's collection
    const savedPuzzles = [];
    for (const puzzle of result.puzzles) {
      const savedPuzzle = puzzleModel.createPuzzle({
        ...puzzle,
        userId,
        gameId: result.game.id
      });
      savedPuzzles.push(savedPuzzle);
    }
    
    res.json({
      success: true,
      game: result.game,
      puzzles: savedPuzzles,
      summary: {
        ...result.summary,
        savedPuzzles: savedPuzzles.length
      }
    });
    
  } catch (error) {
    console.error('Error generating puzzles:', error);
    res.status(500).json({
      error: 'Failed to generate puzzles',
      message: error.message
    });
  }
});

/**
 * POST /api/puzzles/validate
 * Validate a puzzle solution
 */
router.post('/validate', async (req, res) => {
  try {
    const { puzzleId, moves } = req.body;
    
    if (!puzzleId || !moves) {
      return res.status(400).json({ 
        error: 'Puzzle ID and moves are required' 
      });
    }
    
    console.log('✅ Validating puzzle solution:', puzzleId);
    
    const validation = await puzzleGenerator.validatePuzzleSolution(puzzleId, moves);
    
    res.json({
      success: true,
      ...validation
    });
    
  } catch (error) {
    console.error('Error validating puzzle:', error);
    res.status(500).json({
      error: 'Failed to validate puzzle',
      message: error.message
    });
  }
});

/**
 * GET /api/puzzles/:puzzleId
 * Get a specific puzzle by ID
 */
router.get('/:puzzleId', async (req, res) => {
  try {
    const { puzzleId } = req.params;
    
    if (!puzzleId) {
      return res.status(400).json({ 
        error: 'Puzzle ID is required' 
      });
    }
    
    const puzzle = puzzleModel.getPuzzleById(puzzleId);
    if (!puzzle) {
      return res.status(404).json({ 
        error: 'Puzzle not found' 
      });
    }
    
    res.json({
      success: true,
      puzzle
    });
    
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    res.status(500).json({
      error: 'Failed to fetch puzzle',
      message: error.message
    });
  }
});

/**
 * GET /api/puzzles/user/:userId
 * Get all puzzles for a user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { theme, difficulty, isSolved, isBookmarked } = req.query;
    
    const filters = {};
    if (theme) filters.theme = theme;
    if (difficulty) filters.difficulty = parseInt(difficulty);
    if (isSolved !== undefined) filters.isSolved = isSolved === 'true';
    if (isBookmarked !== undefined) filters.isBookmarked = isBookmarked === 'true';
    
    const puzzles = puzzleModel.getUserPuzzles(userId, filters);
    
    res.json({
      success: true,
      puzzles,
      count: puzzles.length
    });
    
  } catch (error) {
    console.error('Error fetching user puzzles:', error);
    res.status(500).json({
      error: 'Failed to fetch user puzzles',
      message: error.message
    });
  }
});

/**
 * GET /api/puzzles/user/:userId/bookmarks
 * Get user's bookmarked puzzles
 */
router.get('/user/:userId/bookmarks', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const puzzles = puzzleModel.getBookmarkedPuzzles(userId);
    
    res.json({
      success: true,
      puzzles,
      count: puzzles.length
    });
    
  } catch (error) {
    console.error('Error fetching bookmarked puzzles:', error);
    res.status(500).json({
      error: 'Failed to fetch bookmarked puzzles',
      message: error.message
    });
  }
});

/**
 * GET /api/puzzles/user/:userId/stats
 * Get user's puzzle statistics
 */
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const stats = puzzleModel.getUserPuzzleStats(userId);
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      error: 'Failed to fetch user stats',
      message: error.message
    });
  }
});

/**
 * PUT /api/puzzles/:puzzleId/progress
 * Update puzzle progress
 */
router.put('/:puzzleId/progress', async (req, res) => {
  try {
    const { puzzleId } = req.params;
    const progress = req.body;
    
    const puzzle = puzzleModel.updatePuzzleProgress(puzzleId, progress);
    if (!puzzle) {
      return res.status(404).json({ 
        error: 'Puzzle not found' 
      });
    }
    
    res.json({
      success: true,
      puzzle
    });
    
  } catch (error) {
    console.error('Error updating puzzle progress:', error);
    res.status(500).json({
      error: 'Failed to update puzzle progress',
      message: error.message
    });
  }
});

/**
 * POST /api/puzzles/:puzzleId/solve
 * Mark puzzle as solved
 */
router.post('/:puzzleId/solve', async (req, res) => {
  try {
    const { puzzleId } = req.params;
    const { timeSpent } = req.body;
    
    const puzzle = puzzleModel.markPuzzleSolved(puzzleId, timeSpent);
    if (!puzzle) {
      return res.status(404).json({ 
        error: 'Puzzle not found' 
      });
    }
    
    res.json({
      success: true,
      puzzle
    });
    
  } catch (error) {
    console.error('Error marking puzzle as solved:', error);
    res.status(500).json({
      error: 'Failed to mark puzzle as solved',
      message: error.message
    });
  }
});

/**
 * POST /api/puzzles/:puzzleId/bookmark
 * Toggle bookmark status
 */
router.post('/:puzzleId/bookmark', async (req, res) => {
  try {
    const { puzzleId } = req.params;
    
    const puzzle = puzzleModel.toggleBookmark(puzzleId);
    if (!puzzle) {
      return res.status(404).json({ 
        error: 'Puzzle not found' 
      });
    }
    
    res.json({
      success: true,
      puzzle,
      isBookmarked: puzzle.userProgress.isBookmarked
    });
    
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({
      error: 'Failed to toggle bookmark',
      message: error.message
    });
  }
});

/**
 * GET /api/puzzles/health
 * Health check for puzzle generation service
 */
router.get('/health', async (req, res) => {
  try {
    res.json({
      success: true,
      status: 'healthy',
      message: 'Puzzle generation service is running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Service unhealthy',
      message: error.message
    });
  }
});

/**
 * GET /api/puzzles/others?exclude=...
 * Get a list of puzzles excluding the specified puzzle
 */
router.get('/others', async (req, res) => {
  try {
    const { exclude } = req.query;
    let puzzles = puzzleModel.getAllPuzzles();
    if (exclude) {
      puzzles = puzzles.filter(p => p.id !== exclude);
    }
    // Shuffle and return up to 10 puzzles for variety
    puzzles = puzzles.sort(() => 0.5 - Math.random()).slice(0, 10);
    res.json({
      success: true,
      puzzles
    });
  } catch (error) {
    console.error('Error fetching other puzzles:', error);
    res.status(500).json({
      error: 'Failed to fetch other puzzles',
      message: error.message
    });
  }
});

/**
 * GET /api/puzzles/generate-more
 * Generate a new batch of puzzles and add them to the in-memory store
 * (For demo: just re-run the import/generation logic for a random user or source)
 */
router.get('/generate-more', async (req, res) => {
  try {
    console.log('[DEBUG] /api/puzzles/generate-more endpoint hit');
    // Accept username and platform as query parameters
    const username = req.query.username || 'T-SQL';
    const platform = req.query.platform || 'chess.com';
    const maxGames = 10;
    const maxPuzzles = 5;
    console.log(`[DEBUG] Using username: ${username}, platform: ${platform}, maxGames: ${maxGames}, maxPuzzles: ${maxPuzzles}`);
    // Use the same logic as /api/games/import
    const chessComService = require('../services/chessComService');
    const lichessService = require('../services/lichessService');
    const PuzzleGenerator = require('../services/puzzleGenerator');
    const puzzleGenerator = new PuzzleGenerator();
    let games = [];
    if (platform === 'chess.com' || platform === 'chesscom') {
      games = await chessComService.getPlayerGames(username, maxGames);
    } else if (platform === 'lichess.org' || platform === 'lichess') {
      if (!lichessService.validateUsername(username)) {
        return res.status(400).json({ success: false, error: 'Invalid lichess username format' });
      }
      games = await lichessService.getUserGames(username, maxGames);
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported platform. Use "chess.com" or "lichess.org"' });
    }
    console.log(`[DEBUG] Fetched ${games.length} games for user ${username}`);
    if (!games || games.length === 0) {
      console.log('[DEBUG] No games found for this user');
      return res.status(400).json({ success: false, error: 'No games found for this user.' });
    }
    // Pick a random game
    const randomIndex = Math.floor(Math.random() * games.length);
    const game = games[randomIndex];
    console.log(`[DEBUG] Selected game index: ${randomIndex}, game ID: ${game.id || 'N/A'}`);
    if (!game.pgn) {
      console.log('[DEBUG] Selected game has no PGN');
      return res.status(400).json({ success: false, error: 'Selected game has no PGN.' });
    }
    game.platform = platform;
    const puzzleResult = await puzzleGenerator.generatePuzzlesFromGame(game);
    console.log(`[DEBUG] Generated ${puzzleResult.puzzles ? puzzleResult.puzzles.length : 0} puzzles from game`);
    // Save puzzles to the in-memory store and collect the saved versions
    const allPuzzles = [];
    if (puzzleResult.puzzles && puzzleResult.puzzles.length > 0) {
      for (const puzzle of puzzleResult.puzzles) {
        const savedPuzzle = puzzleModel.createPuzzle({
          ...puzzle,
          userId: null, // No userId for now
          gameId: game.id
        });
        allPuzzles.push(savedPuzzle);
        console.log(`[DEBUG] Saved puzzle with ID: ${savedPuzzle.id}`);
      }
    } else {
      console.log('[DEBUG] No puzzles generated to save');
    }
    res.json({ success: true, puzzles: allPuzzles });
  } catch (error) {
    console.error('[DEBUG] Error generating more puzzles:', error);
    res.status(500).json({ success: false, error: 'Failed to generate more puzzles', message: error.message });
  }
});

module.exports = router; 