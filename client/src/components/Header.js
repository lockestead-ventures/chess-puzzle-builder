import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Header = () => {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div style={{ 
        borderBottom: '2px solid #ccc', 
        padding: '15px 0',
        fontFamily: 'monospace',
        backgroundColor: '#f8f8f8'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo and Brand */}
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: '#333',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            ♔ CHESS PUZZLE BUILDER
          </Link>

          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '30px' }}>
            <Link 
              to="/" 
              style={{ 
                textDecoration: 'none', 
                color: '#666',
                fontSize: '14px'
              }}
            >
              🏠 Home
            </Link>
            <Link 
              to="/analysis" 
              style={{ 
                textDecoration: 'none', 
                color: '#666',
                fontSize: '14px'
              }}
            >
              📊 Analysis
            </Link>
          </nav>

          {/* User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '14px', color: '#333' }}>
                  👤 {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => handleAuthClick('login')}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#0066cc',
                    border: '1px solid #0066cc',
                    padding: '8px 16px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#0066cc';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#0066cc';
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleAuthClick('register')}
                  style={{
                    backgroundColor: '#0066cc',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0052a3'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#0066cc'}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header; 