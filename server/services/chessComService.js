const axios = require('axios');
const { Chess } = require('chess.js');

class ChessComService {
  constructor() {
    this.baseUrl = 'https://api.chess.com/pub';
  }

  /**
   * Extract username and game ID from chess.com URL
   * Supports various URL formats:
   * - https://www.chess.com/game/live/1234567890
   * - https://www.chess.com/game/daily/1234567890
   * - https://www.chess.com/play/online/archive/username/1234567890
   */
  parseChessComUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Handle different URL patterns
      if (urlObj.pathname.includes('/game/')) {
        const parts = urlObj.pathname.split('/');
        const gameType = parts[2]; // 'live' or 'daily'
        const gameId = parts[3];
        return { gameType, gameId };
      } else if (urlObj.pathname.includes('/play/online/archive/')) {
        const parts = urlObj.pathname.split('/');
        const username = parts[4];
        const gameId = parts[5];
        return { username, gameId };
      }
      
      throw new Error('Unsupported chess.com URL format');
    } catch (error) {
      throw new Error(`Invalid URL: ${error.message}`);
    }
  }

  /**
   * Fetch game data from chess.com
   */
  async fetchGameData(url) {
    try {
      const { gameType, gameId } = this.parseChessComUrl(url);
      
      // Fetch game data using chess.com API
      const response = await axios.get(`${this.baseUrl}/game/${gameId}`);
      const gameData = response.data;
      
      if (!gameData || !gameData.pgn) {
        throw new Error('Game not found or no PGN data available');
      }

      // Parse PGN to get additional game information
      const chess = new Chess();
      chess.loadPgn(gameData.pgn);

      return {
        id: gameId,
        type: gameType,
        pgn: gameData.pgn,
        white: gameData.white || chess.header('White'),
        black: gameData.black || chess.header('Black'),
        result: chess.header('Result'),
        date: chess.header('Date'),
        timeControl: gameData.time_class,
        moves: chess.history(),
        fen: chess.fen()
      };
    } catch (error) {
      console.error('Error fetching game data:', error);
      throw new Error(`Failed to fetch game data: ${error.message}`);
    }
  }

  /**
   * Validate if a URL is a valid chess.com game URL
   */
  isValidChessComUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('chess.com') && 
             (urlObj.pathname.includes('/game/') || urlObj.pathname.includes('/play/online/archive/'));
    } catch {
      return false;
    }
  }

  /**
   * Get player's recent games (for future enhancement)
   */
  async getPlayerGames(username, limit = 10) {
    try {
      // Get player's monthly archives
      const archivesResponse = await axios.get(`${this.baseUrl}/player/${username}/games/archives`);
      const archives = archivesResponse.data.archives;
      const games = [];
      
      // Get recent archives (last 3 months)
      const recentArchives = archives.slice(-3);
      
      for (const archive of recentArchives) {
        const archiveUrl = archive.replace('https://api.chess.com/pub', '');
        const monthlyGamesResponse = await axios.get(`${this.baseUrl}${archiveUrl}`);
        const monthlyGames = monthlyGamesResponse.data.games;
        games.push(...monthlyGames);
        
        if (games.length >= limit) break;
      }
      
      return games.slice(0, limit);
    } catch (error) {
      console.error('Error fetching player games:', error);
      throw new Error(`Failed to fetch player games: ${error.message}`);
    }
  }
}

module.exports = ChessComService; 