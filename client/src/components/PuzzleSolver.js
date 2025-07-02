import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Eye, EyeOff, Target } from 'lucide-react';

const PuzzleSolver = () => {
  const { puzzleId } = useParams();
  const [puzzle, setPuzzle] = useState(null);
  const [chess, setChess] = useState(new Chess());
  const [userMoves, setUserMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPuzzle();
  }, [puzzleId]);

  const loadPuzzle = async () => {
    try {
      // For now, we'll use a mock puzzle since we don't have a database
      // In a real implementation, this would fetch from the API
      const mockPuzzle = {
        id: puzzleId,
        position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        solution: {
          moves: ['e4', 'e5', 'Nf3'],
          evaluation: 0.5
        },
        theme: 'tactical_opportunity',
        difficulty: 3,
        explanation: 'This is a sample puzzle. Find the best move to gain an advantage.',
        gameContext: {
          moveNumber: 10,
          originalMove: 'Nf3',
          player: 'white'
        }
      };

      setPuzzle(mockPuzzle);
      const newChess = new Chess(mockPuzzle.position);
      setChess(newChess);
      setLoading(false);
    } catch (err) {
      setError('Failed to load puzzle');
      setLoading(false);
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    try {
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (move === null) return false;

      setChess(new Chess(chess.fen()));
      setUserMoves([...userMoves, move.san]);
      
      // Check if this is the correct move
      const correctMove = puzzle.solution.moves[currentMoveIndex];
      if (move.san === correctMove) {
        setIsCorrect(true);
        setCurrentMoveIndex(currentMoveIndex + 1);
        
        // Check if puzzle is complete
        if (currentMoveIndex + 1 >= puzzle.solution.moves.length) {
          // Puzzle solved!
          setTimeout(() => {
            alert('Congratulations! You solved the puzzle!');
          }, 500);
        }
      } else {
        setIsCorrect(false);
        setTimeout(() => {
          setIsCorrect(null);
        }, 2000);
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  const resetPuzzle = () => {
    const newChess = new Chess(puzzle.position);
    setChess(newChess);
    setUserMoves([]);
    setCurrentMoveIndex(0);
    setIsCorrect(null);
    setShowSolution(false);
  };

  const showHint = () => {
    const correctMove = puzzle.solution.moves[currentMoveIndex];
    alert(`Hint: The correct move is ${correctMove}`);
  };

  const getBoardOrientation = () => {
    return puzzle?.gameContext?.player === 'black' ? 'black' : 'white';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Puzzles
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={resetPuzzle}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
          <button
            onClick={showHint}
            className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Target className="h-4 w-4 mr-2" />
            Hint
          </button>
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center px-3 py-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            {showSolution ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showSolution ? 'Hide' : 'Show'} Solution
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Chess Board */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Puzzle Position</h3>
            <div className="chess-board">
              <Chessboard
                position={chess.fen()}
                onPieceDrop={onDrop}
                boardOrientation={getBoardOrientation()}
                customBoardStyle={{
                  borderRadius: '4px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>
          </div>

          {/* Move Feedback */}
          {isCorrect !== null && (
            <div className={`p-4 rounded-lg flex items-center ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className={isCorrect ? 'text-green-800' : 'text-red-800'}>
                {isCorrect ? 'Correct move!' : 'Incorrect move. Try again.'}
              </span>
            </div>
          )}

          {/* User Moves */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Your Moves</h4>
            <div className="flex flex-wrap gap-2">
              {userMoves.map((move, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium"
                >
                  {move}
                </span>
              ))}
              {userMoves.length === 0 && (
                <span className="text-gray-500 text-sm">No moves yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Puzzle Info */}
        <div className="space-y-6">
          {/* Puzzle Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Puzzle #{puzzle.id}</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Theme</span>
                <p className="text-gray-900 font-semibold capitalize">{puzzle.theme.replace('_', ' ')}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Difficulty</span>
                <div className="flex items-center space-x-2 mt-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < puzzle.difficulty ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600">({puzzle.difficulty}/5)</span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Evaluation</span>
                <p className="text-gray-900 font-semibold">
                  {puzzle.solution.evaluation > 0 ? '+' : ''}{puzzle.solution.evaluation.toFixed(1)}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Game Context</span>
                <p className="text-gray-900">Move {puzzle.gameContext.moveNumber} - {puzzle.gameContext.originalMove}</p>
                <p className="text-gray-600 text-sm">{puzzle.gameContext.player} to move</p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Explanation</h4>
            <p className="text-gray-700 leading-relaxed">{puzzle.explanation}</p>
          </div>

          {/* Solution (Hidden by default) */}
          {showSolution && (
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
              <h4 className="font-semibold text-purple-900 mb-3">Solution</h4>
              <div className="space-y-2">
                {puzzle.solution.moves.map((move, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-purple-700">{index + 1}.</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
                      {move}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Progress</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Moves completed</span>
                <span className="font-medium">{currentMoveIndex}/{puzzle.solution.moves.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentMoveIndex / puzzle.solution.moves.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleSolver; 