import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'monospace'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '5px',
        minWidth: '400px',
        maxWidth: '500px',
        border: '2px solid #ccc'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>
            {mode === 'login' ? '🔐 Sign In' : '📝 Sign Up'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fff0f0',
              border: '1px solid #f00',
              color: '#c00',
              padding: '10px',
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#ccc' : '#0066cc',
              color: 'white',
              padding: '12px',
              border: 'none',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'monospace'
            }}
          >
            {loading ? '⏳ Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          paddingTop: '20px', 
          borderTop: '1px solid #ccc' 
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0066cc',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'monospace',
                textDecoration: 'underline'
              }}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 