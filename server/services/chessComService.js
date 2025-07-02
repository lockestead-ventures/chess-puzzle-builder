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
   * - https://www.chess.com/game/archive/username/1234567890
   */
  parseChessComUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Handle different URL patterns
      if (urlObj.pathname.includes('/game/')) {
        const parts = urlObj.pathname.split('/').filter(part => part.length > 0);
        
        // Pattern: /game/live/1234567890 or /game/daily/1234567890
        if (parts.length >= 3 && ['live', 'daily'].includes(parts[1])) {
          const gameType = parts[1];
          const gameId = parts[2];
          return { gameType, gameId };
        }
        
        // Pattern: /game/archive/username/1234567890
        if (parts.length >= 4 && parts[1] === 'archive') {
          const username = parts[2];
          const gameId = parts[3];
          return { username, gameId };
        }
      } else if (urlObj.pathname.includes('/play/online/archive/')) {
        const parts = urlObj.pathname.split('/').filter(part => part.length > 0);
        if (parts.length >= 5) {
          const username = parts[4];
          const gameId = parts[5];
          return { username, gameId };
        }
      }
      
      throw new Error('Unsupported chess.com URL format');
    } catch (error) {
      throw new Error(`Invalid URL: ${error.message}`);
    }
  }

  /**
   * Fetch game data from chess.com
   * (DEPRECATED: No longer used, use PGN from game object instead)
   */
  async fetchGameData(url) {
    throw new Error('fetchGameData is deprecated. Use PGN from the game object.');
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