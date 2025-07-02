import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Star, Play, TrendingUp, Crown } from 'lucide-react';

const PuzzleList = ({ puzzles }) => {
  const getDifficultyStars = (difficulty) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < difficulty ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getThemeIcon = (theme) => {
    switch (theme) {
      case 'mate':
        return <Crown className="h-4 w-4 text-purple-600" />;
      case 'winning_combination':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'tactical_advantage':
        return <Target className="h-4 w-4 text-orange-600" />;
      case 'positional_advantage':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <Target className="h-4 w-4 text-green-600" />;
    }
  };

  const getThemeLabel = (theme) => {
    switch (theme) {
      case 'mate':
        return 'Checkmate';
      case 'winning_combination':
        return 'Winning Combination';
      case 'tactical_advantage':
        return 'Tactical Advantage';
      case 'positional_advantage':
        return 'Positional Advantage';
      case 'tactical_opportunity':
        return 'Tactical Opportunity';
      default:
        return theme;
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 1:
        return 'Beginner';
      case 2:
        return 'Easy';
      case 3:
        return 'Medium';
      case 4:
        return 'Hard';
      case 5:
        return 'Expert';
      default:
        return 'Unknown';
    }
  };

  const formatEvaluation = (evaluation) => {
    if (evaluation === Infinity) {
      return 'Mate';
    }
    if (evaluation === -Infinity) {
      return 'Mate';
    }
    return `${evaluation > 0 ? '+' : ''}${evaluation.toFixed(1)}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {puzzles.map((puzzle, index) => (
        <div
          key={puzzle.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 puzzle-card hover:shadow-md transition-all"
        >
          {/* Puzzle Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {getThemeIcon(puzzle.theme)}
              <span className={`text-xs font-medium px-2 py-1 rounded-full theme-${puzzle.theme}`}>
                {getThemeLabel(puzzle.theme)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              #{index + 1}
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Difficulty</span>
              <span className="text-sm text-gray-600">{getDifficultyLabel(puzzle.difficulty)}</span>
            </div>
            <div className="flex items-center space-x-1">
              {getDifficultyStars(puzzle.difficulty)}
            </div>
          </div>

          {/* Evaluation */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Evaluation</span>
              <span className={`text-sm font-semibold ${
                puzzle.solution.evaluation > 0 ? 'text-green-600' : 
                puzzle.solution.evaluation < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {formatEvaluation(puzzle.solution.evaluation)}
              </span>
            </div>
          </div>

          {/* Game Context */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600 space-y-1">
              <div>Move {puzzle.gameContext.moveNumber}</div>
              <div>Original: {puzzle.gameContext.originalMove}</div>
              <div>Player: {puzzle.gameContext.player}</div>
            </div>
          </div>

          {/* Explanation Preview */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {puzzle.explanation}
            </p>
          </div>

          {/* Action Button */}
          <Link
            to={`/puzzle/${puzzle.id}`}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Play className="h-4 w-4 mr-2" />
            Solve Puzzle
          </Link>
        </div>
      ))}
    </div>
  );
};

export default PuzzleList; 