const axios = require('axios');

class LichessService {
  constructor() {
    this.baseUrl = 'https://lichess.org/api';
  }

  /**
   * Fetch user's games from lichess.org
   * @param {string} username - Lichess username
   * @param {number} maxGames - Maximum number of games to fetch (default: 50)
   * @returns {Promise<Array>} Array of games
   */
  async getUserGames(username, maxGames = 50) {
    try {
      const response = await axios.get(`${this.baseUrl}/games/user/${username}`, {
        params: {
          max: maxGames,
          analysed: true, // Only get analyzed games
          perfs: 'blitz,rapid,classical', // Include different time controls
          pgnInJson: true, // Get PGN in JSON format
          opening: true, // Include opening information
          moves: true, // Include all moves
          clocks: true, // Include clock information
          evals: true, // Include engine evaluations
          accuracy: true // Include accuracy data
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Chess-Puzzle-Builder/1.0'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching lichess games:', error.message);
      throw new Error(`Failed to fetch games for ${username}: ${error.message}`);
    }
  }

  /**
   * Fetch a specific game by ID
   * @param {string} gameId - Lichess game ID
   * @returns {Promise<Object>} Game data
   */
  async getGame(gameId) {
    try {
      const response = await axios.get(`${this.baseUrl}/game/${gameId}`, {
        params: {
          pgnInJson: true,
          opening: true,
          moves: true,
          clocks: true,
          evals: true,
          accuracy: true
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Chess-Puzzle-Builder/1.0'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching lichess game:', error.message);
      throw new Error(`Failed to fetch game ${gameId}: ${error.message}`);
    }
  }

  /**
   * Get user profile information
   * @param {string} username - Lichess username
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(username) {
    try {
      const response = await axios.get(`${this.baseUrl}/user/${username}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Chess-Puzzle-Builder/1.0'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching lichess user profile:', error.message);
      throw new Error(`Failed to fetch profile for ${username}: ${error.message}`);
    }
  }

  /**
   * Parse lichess game data into our standard format
   * @param {Object} lichessGame - Raw lichess game data
   * @returns {Object} Standardized game data
   */
  parseGameData(lichessGame) {
    const moves = lichessGame.moves ? lichessGame.moves.split(' ') : [];
    const clocks = lichessGame.clocks || [];
    const evals = lichessGame.evals || [];
    const accuracy = lichessGame.accuracy || {};

    return {
      id: lichessGame.id,
      platform: 'lichess',
      white: lichessGame.players.white,
      black: lichessGame.players.black,
      result: lichessGame.winner || 'draw',
      timeControl: lichessGame.speed,
      rated: lichessGame.rated,
      date: lichessGame.createdAt,
      opening: lichessGame.opening,
      moves: moves,
      clocks: clocks,
      evaluations: evals,
      accuracy: accuracy,
      pgn: lichessGame.pgn,
      analysis: {
        hasAnalysis: evals.length > 0,
        evaluationCount: evals.length,
        accuracyData: accuracy
      }
    };
  }

  /**
   * Extract critical positions from a lichess game
   * @param {Object} gameData - Parsed game data
   * @returns {Array} Array of critical positions
   */
  extractCriticalPositions(gameData) {
    const criticalPositions = [];
    const moves = gameData.moves;
    const evals = gameData.evaluations || [];
    const accuracy = gameData.accuracy || {};

    // Look for positions with significant evaluation changes
    for (let i = 0; i < evals.length - 1; i++) {
      const currentEval = evals[i];
      const nextEval = evals[i + 1];
      
      if (currentEval && nextEval) {
        const evalChange = Math.abs(nextEval - currentEval);
        
        // Consider position critical if evaluation changes by more than 1.5 pawns
        if (evalChange > 1.5) {
          criticalPositions.push({
            moveNumber: Math.floor(i / 2) + 1,
            moveIndex: i,
            position: this.getPositionAtMove(moves, i),
            evaluation: currentEval,
            nextEvaluation: nextEval,
            evalChange: evalChange,
            isBlunder: evalChange > 3.0,
            isMistake: evalChange > 1.5 && evalChange <= 3.0,
            accuracy: accuracy[i] || null
          });
        }
      }
    }

    return criticalPositions;
  }

  /**
   * Get FEN position at a specific move
   * @param {Array} moves - Array of moves
   * @param {number} moveIndex - Index of the move
   * @returns {string} FEN position
   */
  getPositionAtMove(moves, moveIndex) {
    // This is a simplified version - in a real implementation,
    // you'd use chess.js to calculate the position
    // For now, we'll return a placeholder
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  /**
   * Validate lichess username
   * @param {string} username - Username to validate
   * @returns {boolean} True if valid
   */
  validateUsername(username) {
    // Lichess usernames are 2-20 characters, alphanumeric and hyphens only
    const lichessUsernameRegex = /^[a-zA-Z0-9-]{2,20}$/;
    return lichessUsernameRegex.test(username);
  }
}

module.exports = new LichessService(); 