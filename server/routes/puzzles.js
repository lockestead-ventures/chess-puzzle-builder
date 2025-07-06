const express = require('express');
const router = express.Router();
const PuzzleGenerator = require('../services/puzzleGenerator');
const puzzleModel = require('../models/Puzzle');

const puzzleGenerator = new PuzzleGenerator();

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
 * GET /api/puzzles/random
 * Get a random puzzle (auto-generates if none exist)
 */
router.get('/random', async (req, res) => {
  try {
    const { username, platform } = req.query;
    
    // First, try to get a random puzzle from existing puzzles
    const allPuzzles = puzzleModel.getAllPuzzles();
    
    if (allPuzzles.length > 0) {
      // Get a random puzzle
      const randomIndex = Math.floor(Math.random() * allPuzzles.length);
      const randomPuzzle = allPuzzles[randomIndex];
      
      res.json({
        success: true,
        puzzle: randomPuzzle
      });
      return;
    }
    
    // If no puzzles exist, generate some sample puzzles
    console.log('No puzzles found, generating sample puzzles...');
    
    // Generate a sample puzzle using the puzzle generator
    const sampleGameData = {
      id: 'sample-game',
      white: 'SamplePlayer',
      black: 'SampleOpponent',
      result: '1-0',
      type: 'rapid',
      pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O dxc3 8. Qb3 Qf6 9. e5 Qg6 10. Re1 Nge7 11. Ba3 b5 12. Qxb5 Rb8 13. Qa4 Bb6 14. Nbd2 Bb7 15. Ne4 Qf5 16. Bxd3 Qh5 17. Nf6+ gxf6 18. exf6 Rg8 19. Rad1 Qxf3 20. Rxe7+ Nxe7 21. Qxd7+ Kxd7 22. Bf5+ Ke8 23. Bd7+ Kf8 24. Bxe7#',
      platform: 'sample'
    };
    
    const result = await puzzleGenerator.generatePuzzlesFromGameData(sampleGameData);
    
    if (result.puzzles && result.puzzles.length > 0) {
      // Save the first puzzle to the database
      const savedPuzzle = puzzleModel.createPuzzle({
        ...result.puzzles[0],
        userId: 'sample-user',
        gameId: 'sample-game'
      });
      
      res.json({
        success: true,
        puzzle: savedPuzzle
      });
    } else {
      res.status(404).json({
        error: 'No puzzles available',
        message: 'Failed to generate sample puzzles'
      });
    }
    
  } catch (error) {
    console.error('Error getting random puzzle:', error);
    res.status(500).json({
      error: 'Failed to get random puzzle',
      message: error.message
    });
  }
});

/**
 * GET /api/puzzles/others
 * Get other puzzles (excluding a specific one)
 */
router.get('/others', async (req, res) => {
  try {
    const { exclude } = req.query;
    
    // Get all puzzles except the excluded one
    const allPuzzles = puzzleModel.getAllPuzzles();
    const otherPuzzles = exclude ? allPuzzles.filter(p => p.id !== exclude) : allPuzzles;
    
    // Limit to 10 puzzles to avoid overwhelming the frontend
    const limitedPuzzles = otherPuzzles.slice(0, 10);
    
    res.json({
      success: true,
      puzzles: limitedPuzzles
    });
    
  } catch (error) {
    console.error('Error getting other puzzles:', error);
    res.status(500).json({
      error: 'Failed to get other puzzles',
      message: error.message
    });
  }
});

/**
 * GET /api/puzzles/generate-more
 * Generate more puzzles for a user
 */
router.get('/generate-more', async (req, res) => {
  try {
    const { username, platform, usedFens } = req.query;
    
    // Parse used FEN positions from query parameter
    let usedFenPositions = [];
    if (usedFens) {
      try {
        usedFenPositions = JSON.parse(decodeURIComponent(usedFens));
      } catch (error) {
        console.warn('Failed to parse used FEN positions:', error);
      }
    }
    
    // Generate sample puzzles for the user
    const sampleGameData = {
      id: 'sample-game-2',
      white: 'SamplePlayer2',
      black: 'SampleOpponent2',
      result: '1-0',
      type: 'rapid',
      pgn: '1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 O-O 5. Bd3 d5 6. Nf3 c5 7. O-O Nc6 8. a3 Bxc3 9. bxc3 dxc4 10. Bxc4 Qc7 11. Bd3 e5 12. dxe5 Nxe5 13. Nxe5 Qxe5 14. f4 Qe7 15. e4 Bg4 16. Qe1 Bxf3 17. gxf3 Qh4 18. f4 Qg4+ 19. Kh1 Qh3+ 20. Kg1 Qg4+ 21. Kh1 Qh3+ 22. Kg1 Qg4+',
      platform: 'sample'
    };
    
    const result = await puzzleGenerator.generatePuzzlesFromGameData(sampleGameData);
    
    if (result.puzzles && result.puzzles.length > 0) {
      // Filter out puzzles that use already-seen FEN positions
      const uniquePuzzles = result.puzzles.filter(puzzle => {
        return !usedFenPositions.includes(puzzle.position);
      });
      
      console.log(`[DEBUG] Generated ${result.puzzles.length} puzzles, filtered to ${uniquePuzzles.length} unique puzzles`);
      
      // Save unique puzzles to the database
      const savedPuzzles = [];
      for (const puzzle of uniquePuzzles.slice(0, 3)) { // Limit to 3 puzzles
        const savedPuzzle = puzzleModel.createPuzzle({
          ...puzzle,
          userId: username || 'sample-user',
          gameId: sampleGameData.id
        });
        savedPuzzles.push(savedPuzzle);
      }
      
      res.json({
        success: true,
        puzzles: savedPuzzles,
        message: `Generated ${savedPuzzles.length} new unique puzzles`,
        totalGenerated: result.puzzles.length,
        uniqueGenerated: uniquePuzzles.length
      });
    } else {
      res.status(404).json({
        error: 'Failed to generate puzzles',
        message: 'No puzzles were generated'
      });
    }
    
  } catch (error) {
    console.error('Error generating more puzzles:', error);
    res.status(500).json({
      error: 'Failed to generate more puzzles',
      message: error.message
    });
  }
});

module.exports = router; 