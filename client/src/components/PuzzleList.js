import React from 'react';
import { Link } from 'react-router-dom';

const PuzzleList = ({ puzzles, summary }) => {
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

  const getDifficultyText = (difficulty) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 4) return 'Medium';
    if (difficulty <= 6) return 'Hard';
    return 'Expert';
  };

  const getDifficultyStars = (difficulty) => {
    return '★'.repeat(difficulty) + '☆'.repeat(6 - difficulty);
  };

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
            <div style={{ fontSize: '12px', color: '#666' }}>
              {getDifficultyText(puzzle.difficulty || 3)} ({getDifficultyStars(puzzle.difficulty || 3)})
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Theme:</strong> {getThemeLabel(puzzle.theme)}
          </div>

          {puzzle.explanation && (
            <div style={{ marginBottom: '10px', fontSize: '14px' }}>
              <strong>Description:</strong> {puzzle.explanation}
            </div>
          )}

          {puzzle.clue && (
            <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
              <strong>Clue:</strong> {puzzle.clue}
            </div>
          )}

          {puzzle.evaluation && (
            <div style={{ marginBottom: '10px', fontSize: '12px' }}>
              <strong>Evaluation:</strong> {puzzle.evaluation > 0 ? '+' : ''}{puzzle.evaluation}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <Link
              to={`/puzzle/${puzzle.id || index}`}
              style={{
                backgroundColor: '#0066cc',
                color: 'white',
                padding: '8px 16px',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0052a3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0066cc'}
            >
              Solve Puzzle
            </Link>
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
          <strong>Total Puzzles:</strong> {puzzles.length} | 
          <strong> Average Difficulty:</strong> {
            Math.round(puzzles.reduce((sum, p) => sum + (p.difficulty || 3), 0) / puzzles.length)
          }/6
        </p>
      </div>
    </div>
  );
};

export default PuzzleList; 