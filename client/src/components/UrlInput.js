import React, { useState } from 'react';
import { Link, Send, CheckCircle, AlertCircle } from 'lucide-react';

const UrlInput = ({ onGenerate }) => {
  const [gameUrl, setGameUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState('');

  const validateUrl = async (url) => {
    if (!url.trim()) {
      setIsValid(null);
      setError('');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await fetch('/api/games/validate-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameUrl: url }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsValid(data.isValid);
        if (!data.isValid) {
          setError('Please enter a valid chess.com game URL');
        }
      } else {
        setIsValid(false);
        setError(data.message || 'Failed to validate URL');
      }
    } catch (err) {
      setIsValid(false);
      setError('Network error. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setGameUrl(url);
    
    // Debounce validation
    clearTimeout(window.validationTimeout);
    window.validationTimeout = setTimeout(() => {
      validateUrl(url);
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!gameUrl.trim()) {
      setError('Please enter a chess.com game URL');
      return;
    }

    if (!isValid) {
      setError('Please enter a valid chess.com game URL');
      return;
    }

    onGenerate(gameUrl.trim());
  };

  const getUrlStatusIcon = () => {
    if (isValidating) {
      return <div className="loading-spinner w-5 h-5" />;
    }
    
    if (isValid === true) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    if (isValid === false) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gameUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Chess.com Game URL
          </label>
          <div className="relative">
            <input
              type="url"
              id="gameUrl"
              value={gameUrl}
              onChange={handleUrlChange}
              placeholder="https://www.chess.com/game/live/1234567890"
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isValid === true ? 'border-green-300 bg-green-50' :
                isValid === false ? 'border-red-300 bg-red-50' :
                'border-gray-300'
              }`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {getUrlStatusIcon()}
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </p>
          )}
          {isValid === true && (
            <p className="mt-2 text-sm text-green-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Valid chess.com URL
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!gameUrl.trim() || !isValid || isValidating}
          className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
            gameUrl.trim() && isValid && !isValidating
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isValidating ? (
            <>
              <div className="loading-spinner w-4 h-4 mr-2" />
              Validating...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Generate Puzzles
            </>
          )}
        </button>
      </form>

      {/* Example URLs */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Example URLs:</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p>• Live game: <code className="bg-gray-200 px-1 rounded">https://www.chess.com/game/live/1234567890</code></p>
          <p>• Daily game: <code className="bg-gray-200 px-1 rounded">https://www.chess.com/game/daily/1234567890</code></p>
          <p>• Archive game: <code className="bg-gray-200 px-1 rounded">https://www.chess.com/play/online/archive/username/1234567890</code></p>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          💡 <strong>Tip:</strong> Make sure the game is public and has been completed. 
          The analysis works best with games that have tactical positions.
        </p>
      </div>
    </div>
  );
};

export default UrlInput; 