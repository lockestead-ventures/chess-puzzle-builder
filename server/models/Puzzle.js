const { v4: uuidv4 } = require('uuid');

class Puzzle {
  constructor() {
    // In-memory storage for now - replace with database later
    this.puzzles = new Map();
    this.userPuzzles = new Map(); // userId -> puzzleIds[]
  }

  /**
   * Create a new puzzle
   */
  createPuzzle(puzzleData) {
    const puzzleId = uuidv4();
    const puzzle = {
      id: puzzleId,
      userId: puzzleData.userId,
      gameId: puzzleData.gameId,
      position: puzzleData.position,
      solution: puzzleData.solution,
      theme: puzzleData.theme,
      difficulty: puzzleData.difficulty,
      explanation: puzzleData.explanation,
      gameContext: puzzleData.gameContext,
      metadata: {
        createdAt: new Date().toISOString(),
        engineDepth: puzzleData.metadata?.engineDepth || 15,
        originalPosition: puzzleData.metadata?.originalPosition
      },
      userProgress: {
        isSolved: false,
        attempts: 0,
        timeSpent: 0,
        lastAttempted: null,
        isBookmarked: false
      }
    };

    this.puzzles.set(puzzleId, puzzle);
    
    // Add to user's puzzle list
    if (!this.userPuzzles.has(puzzleData.userId)) {
      this.userPuzzles.set(puzzleData.userId, []);
    }
    this.userPuzzles.get(puzzleData.userId).push(puzzleId);

    return puzzle;
  }

  /**
   * Get puzzle by ID
   */
  getPuzzleById(puzzleId) {
    return this.puzzles.get(puzzleId);
  }

  /**
   * Get all puzzles for a user
   */
  getUserPuzzles(userId, filters = {}) {
    const userPuzzleIds = this.userPuzzles.get(userId) || [];
    let puzzles = userPuzzleIds.map(id => this.puzzles.get(id)).filter(Boolean);

    // Apply filters
    if (filters.theme) {
      puzzles = puzzles.filter(p => p.theme === filters.theme);
    }
    if (filters.difficulty) {
      puzzles = puzzles.filter(p => p.difficulty === filters.difficulty);
    }
    if (filters.isSolved !== undefined) {
      puzzles = puzzles.filter(p => p.userProgress.isSolved === filters.isSolved);
    }
    if (filters.isBookmarked !== undefined) {
      puzzles = puzzles.filter(p => p.userProgress.isBookmarked === filters.isBookmarked);
    }

    return puzzles;
  }

  /**
   * Get user's bookmarked puzzles
   */
  getBookmarkedPuzzles(userId) {
    return this.getUserPuzzles(userId, { isBookmarked: true });
  }

  /**
   * Get user's solved puzzles
   */
  getSolvedPuzzles(userId) {
    return this.getUserPuzzles(userId, { isSolved: true });
  }

  /**
   * Get user's unsolved puzzles
   */
  getUnsolvedPuzzles(userId) {
    return this.getUserPuzzles(userId, { isSolved: false });
  }

  /**
   * Update puzzle progress
   */
  updatePuzzleProgress(puzzleId, progress) {
    const puzzle = this.puzzles.get(puzzleId);
    if (puzzle) {
      puzzle.userProgress = { ...puzzle.userProgress, ...progress };
      this.puzzles.set(puzzleId, puzzle);
      return puzzle;
    }
    return null;
  }

  /**
   * Mark puzzle as solved
   */
  markPuzzleSolved(puzzleId, timeSpent) {
    return this.updatePuzzleProgress(puzzleId, {
      isSolved: true,
      timeSpent,
      lastAttempted: new Date().toISOString()
    });
  }

  /**
   * Toggle bookmark status
   */
  toggleBookmark(puzzleId) {
    const puzzle = this.puzzles.get(puzzleId);
    if (puzzle) {
      puzzle.userProgress.isBookmarked = !puzzle.userProgress.isBookmarked;
      this.puzzles.set(puzzleId, puzzle);
      return puzzle;
    }
    return null;
  }

  /**
   * Get puzzle statistics for a user
   */
  getUserPuzzleStats(userId) {
    const puzzles = this.getUserPuzzles(userId);
    const solved = puzzles.filter(p => p.userProgress.isSolved);
    const bookmarked = puzzles.filter(p => p.userProgress.isBookmarked);

    const themeCounts = {};
    const difficultyCounts = {};
    
    puzzles.forEach(puzzle => {
      themeCounts[puzzle.theme] = (themeCounts[puzzle.theme] || 0) + 1;
      difficultyCounts[puzzle.difficulty] = (difficultyCounts[puzzle.difficulty] || 0) + 1;
    });

    const favoriteTheme = Object.keys(themeCounts).reduce((a, b) => 
      themeCounts[a] > themeCounts[b] ? a : b
    );

    const averageTime = solved.length > 0 
      ? solved.reduce((sum, p) => sum + p.userProgress.timeSpent, 0) / solved.length 
      : 0;

    return {
      totalPuzzles: puzzles.length,
      solvedPuzzles: solved.length,
      bookmarkedPuzzles: bookmarked.length,
      accuracy: puzzles.length > 0 ? (solved.length / puzzles.length) * 100 : 0,
      averageTime,
      favoriteTheme,
      themeDistribution: themeCounts,
      difficultyDistribution: difficultyCounts
    };
  }

  /**
   * Delete puzzle
   */
  deletePuzzle(puzzleId) {
    const puzzle = this.puzzles.get(puzzleId);
    if (puzzle) {
      // Remove from user's puzzle list
      const userPuzzleIds = this.userPuzzles.get(puzzle.userId) || [];
      const updatedUserPuzzles = userPuzzleIds.filter(id => id !== puzzleId);
      this.userPuzzles.set(puzzle.userId, updatedUserPuzzles);
      
      // Remove puzzle
      this.puzzles.delete(puzzleId);
      return true;
    }
    return false;
  }

  /**
   * Get all puzzles (for admin purposes)
   */
  getAllPuzzles() {
    return Array.from(this.puzzles.values());
  }
}

// Export a singleton instance
const puzzleInstance = new Puzzle();
module.exports = puzzleInstance; 