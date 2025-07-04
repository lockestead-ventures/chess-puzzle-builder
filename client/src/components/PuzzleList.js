import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PuzzleList = ({ puzzles, summary }) => {
  const navigate = useNavigate();

  if (!puzzles || puzzles.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px', 
        border: '1px solid #ccc',
        fontFamily: 'monospace'
      }}>
        <p>No puzzles generated yet.</p>
      </div>
    );
  }

  // Map backend theme to human-friendly label
  const getThemeLabel = (theme) => {
    switch ((theme || '').toLowerCase()) {
      case 'tactical_advantage':
        return 'Tactical Blunder';
      case 'positional_advantage':
        return 'Better Move Available';
      case 'winning_combination':
        return 'Winning Move';
      case 'mate':
        return 'Checkmate Opportunity';
      case 'tactical_opportunity':
        return 'Tactical Chance';
      default:
        // Fallback: prettify the theme string
        return (theme || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const handleSolvePuzzle = (puzzle, index) => {
    // Store puzzles in localStorage for persistence across navigation
    localStorage.setItem('currentPuzzles', JSON.stringify(puzzles));
    localStorage.setItem('currentPuzzleIndex', index.toString());
    
    // Navigate to puzzle solver with state
    navigate(`/puzzle/${puzzle.id || index}`, {
      state: {
        puzzles: puzzles,
        currentPuzzleIndex: index,
        summary: summary
      }
    });
  };

  return (
    <div style={{ fontFamily: 'monospace' }}>
      {puzzles.map((puzzle, index) => (
        <div 
          key={puzzle.id || index}
          style={{ 
            border: '1px solid #ccc', 
            padding: '15px', 
            marginBottom: '10px',
            backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0 }}>
              Puzzle #{index + 1}
            </h4>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Theme:</strong> {getThemeLabel(puzzle.theme)}
          </div>

          {puzzle.explanation && puzzle.explanation.description && (
            <div style={{ marginBottom: '10px', fontSize: '14px' }}>
              <strong>Description:</strong> {puzzle.explanation.description}
            </div>
          )}

          {puzzle.explanation && puzzle.explanation.clue && (
            <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
              <strong>Clue:</strong> {puzzle.explanation.clue}
            </div>
          )}

          {puzzle.evaluation && (
            <div style={{ marginBottom: '10px', fontSize: '12px' }}>
              <strong>Evaluation:</strong> {puzzle.evaluation > 0 ? '+' : ''}{puzzle.evaluation}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={() => handleSolvePuzzle(puzzle, index)}
              style={{
                backgroundColor: '#0066cc',
                color: 'white',
                padding: '8px 16px',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0052a3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0066cc'}
            >
              Solve Puzzle
            </button>
          </div>
        </div>
      ))}

      <div style={{ 
        textAlign: 'center', 
        marginTop: '20px', 
        padding: '15px', 
        border: '1px solid #ccc',
        backgroundColor: '#f0f8ff'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          <strong>Total Puzzles:</strong> {puzzles.length}
        </p>
      </div>
    </div>
  );
};

export default PuzzleList; 