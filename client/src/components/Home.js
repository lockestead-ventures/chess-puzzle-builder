import React, { useState } from 'react';
import UnifiedGameInput from './UnifiedGameInput';
import PuzzleList from './PuzzleList';

const Home = () => {
  const [puzzles, setPuzzles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameData, setGameData] = useState(null);

  const handlePuzzleGeneration = async (inputData) => {
    setLoading(true);
    setError(null);
    setPuzzles(null);
    setGameData(null);

    try {
      // Bulk import only
      const response = await fetch('/api/games/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: inputData.platform,
          username: inputData.username,
          maxGames: inputData.maxGames,
          maxPuzzles: inputData.maxPuzzles
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate puzzles');
      }

      setPuzzles(data.puzzles || []);
      setGameData(data.summary || { type: 'bulk', gamesImported: data.gamesImported });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* ASCII Art Header */}
      <pre style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
{`
╔══════════════════════════════════════════════════════════════╗
║                    CHESS PUZZLE BUILDER                     ║
║              Personalized Puzzles from Your Games            ║
╚══════════════════════════════════════════════════════════════╝
`}
      </pre>

      {/* Features */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>How It Works:</h2>
        <ol style={{ paddingLeft: '20px' }}>
          <li><strong>Enter your username</strong> from chess.com or lichess.org</li>
          <li><strong>We analyze your last 10 games</strong> to find tactical opportunities</li>
          <li><strong>Get 5 personalized puzzles</strong> based on your playing style</li>
          <li><strong>Improve your game</strong> by learning from your own mistakes</li>
        </ol>
      </div>

      {/* Input Section */}
      <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0 }}>Create Your Personalized Puzzles</h3>
        <p>Enter your username and we'll analyze your recent games to create custom puzzles just for you.</p>
        <UnifiedGameInput onGenerate={handlePuzzleGeneration} />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ccc' }}>
          <div style={{ fontSize: '20px' }}>⏳</div>
          <h3>Analyzing Your Games...</h3>
          <p>This may take 1-2 minutes.</p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            We're finding the best tactical positions from your last 10 games
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ 
          border: '1px solid #f00', 
          backgroundColor: '#fff0f0', 
          padding: '15px', 
          marginBottom: '20px',
          color: '#c00'
        }}>
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Results */}
      {puzzles && gameData && (
        <div>
          {/* Game Summary */}
          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0 }}>Analysis Complete</h3>
            <div>
              <p><strong>Username:</strong> {gameData.username}</p>
              <p><strong>Platform:</strong> {gameData.platform}</p>
              <p><strong>Games Analyzed:</strong> {gameData.gamesImported}</p>
              <p><strong>Puzzles Generated:</strong> {puzzles.length}</p>
              <p><strong>Processing Time:</strong> {gameData.processingTime || '~2 minutes'}</p>
            </div>
          </div>

          {/* Puzzles List */}
          <div>
            <h3>Your Personalized Puzzles ({puzzles.length})</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              These puzzles are based on positions from your actual games where you missed tactical opportunities.
            </p>
            <PuzzleList puzzles={puzzles} />
          </div>
        </div>
      )}

      {/* Why This Works */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        border: '1px solid #ccc',
        backgroundColor: '#f9f9f9'
      }}>
        <h3 style={{ marginTop: 0 }}>Why Personalized Puzzles Work Better</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px' }}>
          <div>
            <strong>🎯 Targeted Learning</strong>
            <p>Puzzles from your games focus on your specific weaknesses</p>
          </div>
          <div>
            <strong>📈 Real Improvement</strong>
            <p>Learn from positions you actually encounter in your games</p>
          </div>
          <div>
            <strong>⚡ Fast & Focused</strong>
            <p>5 high-quality puzzles from your last 10 games</p>
          </div>
          <div>
            <strong>🔄 Continuous Updates</strong>
            <p>New puzzles as you play more games</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 