import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Download, ChessKnight, ExternalLink, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const BulkImport = () => {
  const { user } = useAuth();
  const [importData, setImportData] = useState({
    platform: 'lichess',
    username: '',
    maxGames: 50
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setImportData({
      ...importData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/games/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(importData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'chesscom':
        return '♔';
      case 'lichess':
        return '♕';
      default:
        return '♖';
    }
  };

  const getPlatformName = (platform) => {
    switch (platform) {
      case 'chesscom':
        return 'Chess.com';
      case 'lichess':
        return 'Lichess.org';
      default:
        return platform;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'chesscom':
        return 'text-blue-600';
      case 'lichess':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Download className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bulk Game Import</h2>
            <p className="text-sm text-gray-600">Import your games from chess platforms to generate personalized puzzles</p>
          </div>
        </div>

        {/* Import Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Platform
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['lichess', 'chesscom'].map((platform) => (
                <label
                  key={platform}
                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    importData.platform === platform
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value={platform}
                    checked={importData.platform === platform}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`text-2xl mr-3 ${getPlatformColor(platform)}`}>
                    {getPlatformIcon(platform)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {getPlatformName(platform)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {platform === 'lichess' ? 'Free chess server' : 'Popular chess platform'}
                    </div>
                  </div>
                  {importData.platform === platform && (
                    <CheckCircle className="h-5 w-5 text-blue-500 absolute top-3 right-3" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <ChessKnight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="username"
                name="username"
                value={importData.username}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter your ${getPlatformName(importData.platform)} username`}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Make sure your games are public on {getPlatformName(importData.platform)}
            </p>
          </div>

          {/* Number of Games */}
          <div>
            <label htmlFor="maxGames" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Games to Import
            </label>
            <select
              id="maxGames"
              name="maxGames"
              value={importData.maxGames}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 games</option>
              <option value={25}>25 games</option>
              <option value={50}>50 games</option>
              <option value={100}>100 games</option>
              <option value={200}>200 games</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              More games = more puzzle opportunities, but longer import time
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !importData.username}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
              loading || !importData.username
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Importing Games...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Import Games
              </>
            )}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Import Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Import Successful!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Successfully imported {result.count} games from {getPlatformName(result.platform)}
                </p>
              </div>
            </div>
            
            {/* Game Preview */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">Recent Games Preview:</h4>
              <div className="space-y-2">
                {result.games && typeof result.games === 'string' && (
                  <div className="text-sm text-green-700">
                    <p>✓ Games data received successfully</p>
                    <p>✓ Analysis data included</p>
                    <p>✓ Ready for puzzle generation</p>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-4 pt-4 border-t border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-2">Next Steps:</h4>
              <div className="flex items-center space-x-4">
                <button className="text-sm text-green-700 hover:text-green-800 font-medium">
                  Generate Puzzles
                </button>
                <button className="text-sm text-green-700 hover:text-green-800 font-medium">
                  View Game Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="text-sm font-medium text-gray-900">Import Games</h4>
              <p className="text-xs text-gray-600 mt-1">
                Fetch your recent games from chess platforms
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="text-sm font-medium text-gray-900">Analyze Positions</h4>
              <p className="text-xs text-gray-600 mt-1">
                Identify critical moments and tactical opportunities
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="text-sm font-medium text-gray-900">Create Puzzles</h4>
              <p className="text-xs text-gray-600 mt-1">
                Generate personalized puzzles from your games
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImport; 