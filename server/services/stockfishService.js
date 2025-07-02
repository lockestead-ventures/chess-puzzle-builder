const stockfish = require('stockfish');

class StockfishService {
  constructor() {
    this.engine = null;
    this.isReady = false;
    this.analysisQueue = [];
    this.isAnalyzing = false;
  }

  /**
   * Initialize the Stockfish engine
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      try {
        this.engine = stockfish();
        
        this.engine.onmessage = (event) => {
          const message = event.data;
          
          if (message === 'uciok') {
            this.engine.postMessage('isready');
          } else if (message === 'readyok') {
            this.isReady = true;
            console.log('✅ Stockfish engine ready');
            resolve();
          }
        };

        this.engine.postMessage('uci');
        
        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.isReady) {
            reject(new Error('Stockfish initialization timeout'));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Analyze a position with Stockfish
   */
  async analyzePosition(fen, depth = 15, movetime = 5000) {
    if (!this.isReady) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      let bestMove = null;
      let evaluation = null;
      let pv = [];
      let analysisComplete = false;

      const timeout = setTimeout(() => {
        if (!analysisComplete) {
          analysisComplete = true;
          resolve({
            fen,
            bestMove,
            evaluation,
            pv,
            depth: 'timeout',
            error: 'Analysis timeout'
          });
        }
      }, movetime + 1000);

      this.engine.onmessage = (event) => {
        const message = event.data;
        
        if (message.startsWith('bestmove')) {
          clearTimeout(timeout);
          analysisComplete = true;
          
          const parts = message.split(' ');
          bestMove = parts[1];
          
          resolve({
            fen,
            bestMove,
            evaluation,
            pv,
            depth: 'completed'
          });
        } else if (message.startsWith('info')) {
          // Parse evaluation info
          const info = this.parseInfoMessage(message);
          if (info.evaluation !== undefined) {
            evaluation = info.evaluation;
          }
          if (info.pv) {
            pv = info.pv;
          }
        }
      };

      // Send analysis command
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage(`go depth ${depth} movetime ${movetime}`);
    });
  }

  /**
   * Parse Stockfish info message
   */
  parseInfoMessage(message) {
    const parts = message.split(' ');
    const info = {};
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'score' && i + 2 < parts.length) {
        const type = parts[i + 1];
        const value = parseInt(parts[i + 2]);
        
        if (type === 'cp') {
          info.evaluation = value / 100; // Convert centipawns to pawns
        } else if (type === 'mate') {
          info.evaluation = value > 0 ? Infinity : -Infinity;
          info.mate = value;
        }
      } else if (parts[i] === 'pv' && i + 1 < parts.length) {
        info.pv = parts.slice(i + 1);
        break;
      }
    }
    
    return info;
  }

  /**
   * Find tactical opportunities in a position
   */
  async findTacticalOpportunities(fen, threshold = 1.0) {
    const analysis = await this.analyzePosition(fen, 20, 10000);
    
    if (!analysis.evaluation || analysis.error) {
      return null;
    }

    // Check if position has significant tactical advantage
    const absEval = Math.abs(analysis.evaluation);
    
    if (absEval >= threshold) {
      return {
        fen,
        evaluation: analysis.evaluation,
        bestMove: analysis.bestMove,
        pv: analysis.pv,
        isTactical: true,
        strength: absEval >= 3.0 ? 'strong' : absEval >= 2.0 ? 'medium' : 'weak'
      };
    }
    
    return null;
  }

  /**
   * Analyze multiple positions in sequence
   */
  async analyzePositions(fenList, depth = 15) {
    const results = [];
    
    for (const fen of fenList) {
      try {
        const analysis = await this.analyzePosition(fen, depth, 3000);
        results.push(analysis);
        
        // Small delay to prevent overwhelming the engine
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error analyzing position ${fen}:`, error);
        results.push({ fen, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Get engine evaluation for a specific move
   */
  async evaluateMove(fen, move) {
    const analysis = await this.analyzePosition(fen, 15, 3000);
    
    if (analysis.bestMove === move) {
      return {
        move,
        isBest: true,
        evaluation: analysis.evaluation
      };
    }
    
    // Analyze the position after the move
    const { Chess } = require('chess.js');
    const chess = new Chess(fen);
    
    try {
      chess.move(move);
      const newAnalysis = await this.analyzePosition(chess.fen(), 15, 3000);
      
      return {
        move,
        isBest: false,
        evaluation: newAnalysis.evaluation,
        bestMove: analysis.bestMove
      };
    } catch (error) {
      return {
        move,
        isBest: false,
        error: 'Invalid move'
      };
    }
  }

  /**
   * Clean up engine resources
   */
  terminate() {
    if (this.engine) {
      this.engine.postMessage('quit');
      this.engine = null;
      this.isReady = false;
    }
  }
}

module.exports = StockfishService; 