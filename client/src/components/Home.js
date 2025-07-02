import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChessKnight, Zap, Target, TrendingUp, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import UrlInput from './UrlInput';
import PuzzleList from './PuzzleList';
import BulkImport from './BulkImport';

const Home = () => {
  const [puzzles, setPuzzles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [activeTab, setActiveTab] = useState('single');

  const handlePuzzleGeneration = async (gameUrl) => {
    setLoading(true);
    setError(null);
    setPuzzles(null);
    setGameData(null);

    try {
      const response = await fetch('/api/puzzles/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate puzzles');
      }

      setPuzzles(data.puzzles);
      setGameData(data.game);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <ChessKnight className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Generate Personalized Chess Puzzles
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Input your chess.com game URL and get custom puzzles based on critical positions from your actual games. 
          Learn from your mistakes and improve your tactical awareness.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analysis</h3>
          <p className="text-gray-600">
            Uses Stockfish engine to analyze every position and identify tactical opportunities.
          </p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Learning</h3>
          <p className="text-gray-600">
            Puzzles are created from your actual games, making them highly relevant to your playing style.
          </p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
          <p className="text-gray-600">
            Monitor your improvement with detailed analysis and difficulty ratings for each puzzle.
          </p>
        </div>
      </div>

      {/* Import Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Import Your Games</h2>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'single'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Single Game
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'bulk'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Download className="h-4 w-4 inline mr-1" />
              Bulk Import
            </button>
          </div>
        </div>

        {activeTab === 'single' ? (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Analyze a Single Game</h3>
            <UrlInput onGenerate={handlePuzzleGeneration} />
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Import Multiple Games</h3>
            <BulkImport />
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Analyzing your game...
          </h3>
          <p className="text-gray-600">
            This may take 30-60 seconds depending on the game length and complexity.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-900">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {puzzles && gameData && (
        <div className="space-y-8">
          {/* Game Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Game Summary</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Players</p>
                <p className="font-semibold">{gameData.white} vs {gameData.black}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Result</p>
                <p className="font-semibold">{gameData.result}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Game Type</p>
                <p className="font-semibold capitalize">{gameData.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Puzzles Generated</p>
                <p className="font-semibold text-blue-600">{puzzles.length}</p>
              </div>
            </div>
          </div>

          {/* Puzzles List */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Generated Puzzles</h3>
            <PuzzleList puzzles={puzzles} />
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="mt-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 font-bold">
              1
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Paste Game URL</h4>
            <p className="text-sm text-gray-600">
              Copy a chess.com game URL and paste it into the input field above.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 font-bold">
              2
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Engine Analysis</h4>
            <p className="text-sm text-gray-600">
              Our Stockfish engine analyzes every position to find tactical opportunities.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 font-bold">
              3
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Puzzle Generation</h4>
            <p className="text-sm text-gray-600">
              Critical positions are converted into interactive puzzles with solutions.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 font-bold">
              4
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Practice & Learn</h4>
            <p className="text-sm text-gray-600">
              Solve puzzles, review solutions, and improve your tactical skills.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 