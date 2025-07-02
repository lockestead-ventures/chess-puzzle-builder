import React, { useState, useEffect } from 'react';
import UnifiedGameInput from './UnifiedGameInput';
import PuzzleList from './PuzzleList';

const Home = () => {
  const [puzzles, setPuzzles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [progress, setProgress] = useState({
    stage: '',
    message: '',
    percentage: 0,
    details: ''
  });
  const [backendDone, setBackendDone] = useState(false);

  // Simulate progress updates during loading
  useEffect(() => {
    if (!loading) return;

    // Main progress stages (messages and their target percentages)
    const progressStages = [
      { stage: 'init', message: '🚀 Initializing analysis system...', percentage: 8, details: 'Setting up chess engines and databases' },
      { stage: 'fetch', message: '📥 Fetching your games...', percentage: 18, details: 'Retrieving recent games from chess.com' },
      { stage: 'load', message: '🔍 Loading game positions...', percentage: 28, details: 'Extracting tactical positions from your games' },
      { stage: 'analyze', message: '🧠 Loading tactical evaluation models...', percentage: 38, details: 'Initializing advanced chess analysis algorithms' },
      { stage: 'process', message: '⚡ Analyzing positions for tactical opportunities...', percentage: 55, details: 'Scanning through game positions for puzzles' },
      { stage: 'create', message: '🎯 Creating puzzle challenges...', percentage: 75, details: 'Generating tactical puzzles from your games' },
      { stage: 'validate', message: '✅ Validating puzzle quality...', percentage: 88, details: 'Ensuring puzzles meet quality standards' },
      { stage: 'finalize', message: '🎉 Finalizing your puzzle collection...', percentage: 95, details: 'Preparing puzzles for display' },
      { stage: 'complete', message: '✨ Analysis complete!', percentage: 100, details: 'Your puzzles are ready' }
    ];

    let currentStage = 0;
    let currentPercent = 0;
    let intervalId = null;

    // Helper to get the current stage based on percent
    const getStageForPercent = (percent) => {
      for (let i = progressStages.length - 1; i >= 0; i--) {
        if (percent >= progressStages[i].percentage) {
          return progressStages[i];
        }
      }
      return progressStages[0];
    };

    // Calculate how many ms per percent step for each stage
    const getStepDuration = (from, to) => {
      // Longer for early stages, faster for later
      if (to <= 38) return 60; // slowest
      if (to <= 75) return 40; // medium
      if (to < 100) return 25; // fast
      return 10; // finish very fast
    };

    // Animate from 0 to 100%
    const animate = () => {
      if (currentPercent >= 100) {
        setProgress(progressStages[progressStages.length - 1]);
        clearInterval(intervalId);
        return;
      }
      // Find the next stage
      let nextStage = progressStages[currentStage + 1];
      let targetPercent = nextStage ? nextStage.percentage : 100;
      // If we've reached the next stage, advance
      if (currentPercent >= targetPercent) {
        currentStage++;
        nextStage = progressStages[currentStage + 1];
        targetPercent = nextStage ? nextStage.percentage : 100;
      }
      // Set the progress message for the current stage
      const stage = getStageForPercent(currentPercent);
      setProgress({
        ...stage,
        percentage: currentPercent
      });
      // Increment percent
      currentPercent++;
      // Duration for this step
      const duration = getStepDuration(progressStages[currentStage].percentage, targetPercent);
      intervalId = setTimeout(animate, duration);
    };

    // Start at 0%
    currentPercent = 0;
    currentStage = 0;
    animate();

    // Cleanup
    return () => clearTimeout(intervalId);
  }, [loading]);

  const handlePuzzleGeneration = async (inputData) => {
    setLoading(true);
    setError(null);
    setPuzzles(null);
    setGameData(null);
    setBackendDone(false);
    setProgress({
      stage: 'init',
      message: '🚀 Initializing analysis system...',
      percentage: 8,
      details: 'Setting up chess engines and databases'
    });

    try {
      const response = await fetch('/api/games/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData)
      });
      if (!response.ok) throw new Error('Failed to generate puzzles');
      const data = await response.json();
      setPuzzles(data.puzzles);
      setGameData(data);
      setBackendDone(true);
    } catch (err) {
      setError(err.message || 'Failed to generate puzzles');
      setLoading(false);
    }
  };

  // Sophisticated Progress Component
  const ProgressIndicator = () => {
    // Create ASCII progress bar with smoother transitions
    const barWidth = 40; // Total width of the bar
    const filledWidth = Math.floor((progress.percentage / 100) * barWidth);
    const emptyWidth = barWidth - filledWidth;
    
    const filledBar = '/'.repeat(filledWidth);
    const emptyBar = '·'.repeat(emptyWidth);
    const progressBar = `[${filledBar}${emptyBar}]`;

    // If progress is complete but backend not done, show special message
    if (progress.percentage >= 100 && !backendDone) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '25px',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.4s ease'
        }}>
          <div style={{ fontSize: '18px', color: '#0066cc', marginBottom: '10px' }}>⏳</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
            We've found your games and analyzed them.
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            Generating your puzzles now...
          </div>
          <div style={{ fontSize: '12px', color: '#999', fontFamily: 'monospace' }}>
            This usually takes just a few more seconds.
          </div>
        </div>
      );
    }

    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '25px', 
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.4s ease'
      }}>
        {/* ASCII Progress Bar */}
        <div style={{ 
          fontFamily: 'monospace',
          fontSize: '14px',
          marginBottom: '18px',
          lineHeight: '1.2',
          color: '#333',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ marginBottom: '8px' }}>
            {progressBar}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#666',
            fontFamily: 'monospace',
            transition: 'all 0.3s ease'
          }}>
            {progress.percentage.toString().padStart(3, ' ')}% complete
          </div>
        </div>

        {/* Status Message */}
        <div style={{ 
          fontSize: '16px', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: '#333',
          transition: 'all 0.4s ease',
          opacity: 1,
          transform: 'translateY(0)'
        }}>
          {progress.message}
        </div>

        {/* Details */}
        <div style={{ 
          fontSize: '13px', 
          color: '#666', 
          marginBottom: '16px',
          lineHeight: '1.4',
          transition: 'all 0.4s ease',
          opacity: 0.9
        }}>
          {progress.details}
        </div>

        {/* Animated Icon */}
        <div style={{ 
          fontSize: '18px', 
          color: '#0066cc',
          transition: 'all 0.3s ease',
          animation: progress.stage !== 'complete' ? 'pulse 2s ease-in-out infinite' : 'none',
          transform: progress.stage !== 'complete' ? 'scale(1)' : 'scale(1.1)'
        }}>
          {progress.stage !== 'complete' ? '⏳' : '✅'}
        </div>

        {/* Estimated Time */}
        {progress.stage !== 'complete' && (
          <div style={{ 
            fontSize: '11px', 
            color: '#999', 
            marginTop: '8px',
            transition: 'all 0.3s ease',
            fontFamily: 'monospace',
            opacity: 0.8
          }}>
            ETA: {Math.max(1, Math.ceil((100 - progress.percentage) / 12))} min
          </div>
        )}

        <style jsx>{`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
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

      {/* Sophisticated Loading State */}
      {loading && <ProgressIndicator />}

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