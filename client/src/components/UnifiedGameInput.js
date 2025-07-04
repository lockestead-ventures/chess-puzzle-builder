import React, { useState } from 'react';

const UnifiedGameInput = ({ onGenerate }) => {
  const [platform, setPlatform] = useState('chess.com');
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }
    
    // Store username and platform in localStorage for use in PuzzleSolver
    localStorage.setItem('username', username.trim());
    localStorage.setItem('platform', platform);
    
    onGenerate({ 
      type: 'bulk', 
      platform, 
      username: username.trim(), 
      maxGames: 10,
      maxPuzzles: 5
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ fontFamily: 'monospace' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <strong>Platform:</strong>
        </label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          style={{
            padding: '8px',
            border: '1px solid #ccc',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}
        >
          <option value="chess.com">chess.com</option>
          <option value="lichess.org">lichess.org</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <strong>Username:</strong>
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}
        />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          It will only take a minute (or less)!
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        style={{
          backgroundColor: '#0066cc',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          fontFamily: 'monospace',
          fontSize: '14px',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#0052a3'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#0066cc'}
      >
        Generate My Puzzles
      </button>
    </form>
  );
};

export default UnifiedGameInput; 