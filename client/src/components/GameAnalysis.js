import React, { useState } from 'react';
import { BarChart3, TrendingUp, Target, Clock, Award } from 'lucide-react';

const GameAnalysis = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  // Mock data - in a real app this would come from the backend
  const mockStats = {
    totalPuzzles: 47,
    solvedPuzzles: 32,
    averageDifficulty: 3.2,
    favoriteTheme: 'tactical_advantage',
    solvingTime: '2m 34s',
    accuracy: 68.1
  };

  const mockProgress = [
    { date: '2024-01-01', puzzles: 5, solved: 3 },
    { date: '2024-01-02', puzzles: 8, solved: 6 },
    { date: '2024-01-03', puzzles: 12, solved: 9 },
    { date: '2024-01-04', puzzles: 15, solved: 11 },
    { date: '2024-01-05', puzzles: 20, solved: 14 },
    { date: '2024-01-06', puzzles: 25, solved: 18 },
    { date: '2024-01-07', puzzles: 30, solved: 22 },
  ];

  const mockThemes = [
    { theme: 'tactical_advantage', count: 15, percentage: 31.9 },
    { theme: 'winning_combination', count: 12, percentage: 25.5 },
    { theme: 'positional_advantage', count: 10, percentage: 21.3 },
    { theme: 'mate', count: 6, percentage: 12.8 },
    { theme: 'tactical_opportunity', count: 4, percentage: 8.5 },
  ];

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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
        <p className="text-gray-600">
          Track your improvement and analyze your puzzle-solving performance
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Puzzles</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalPuzzles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Solved</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.solvedPuzzles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.accuracy}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Time</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.solvingTime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Progress Over Time</h3>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {mockProgress.map((day, index) => (
              <div key={day.date} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(day.solved / day.puzzles) * 100}%` }}
                  />
                </div>
                <div className="w-20 text-sm text-gray-600 text-right">
                  {day.solved}/{day.puzzles}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Theme Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Puzzle Themes</h3>
          
          <div className="space-y-4">
            {mockThemes.map((theme) => (
              <div key={theme.theme} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {getThemeLabel(theme.theme)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${theme.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {theme.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        
        <div className="space-y-4">
          {[
            { action: 'Solved puzzle', theme: 'Tactical Advantage', difficulty: 4, time: '2 minutes ago' },
            { action: 'Failed puzzle', theme: 'Checkmate', difficulty: 5, time: '15 minutes ago' },
            { action: 'Solved puzzle', theme: 'Winning Combination', difficulty: 3, time: '1 hour ago' },
            { action: 'Solved puzzle', theme: 'Positional Advantage', difficulty: 2, time: '2 hours ago' },
            { action: 'Failed puzzle', theme: 'Tactical Opportunity', difficulty: 3, time: '3 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.action.includes('Solved') ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action} - {activity.theme}
                  </p>
                  <p className="text-xs text-gray-500">
                    Difficulty: {activity.difficulty}/5 • {activity.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < activity.difficulty ? 'bg-yellow-400' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips for Improvement */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Tips for Improvement</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-2">🎯 Focus on Tactical Themes</p>
            <p>You're strongest in tactical advantages. Practice more checkmate and winning combination puzzles.</p>
          </div>
          <div>
            <p className="font-medium mb-2">⏱️ Improve Speed</p>
            <p>Your average solving time is good. Try to maintain accuracy while increasing speed.</p>
          </div>
          <div>
            <p className="font-medium mb-2">📈 Consistency</p>
            <p>Solve puzzles daily to maintain and improve your tactical awareness.</p>
          </div>
          <div>
            <p className="font-medium mb-2">🎓 Study Patterns</p>
            <p>Review failed puzzles to understand common tactical patterns and motifs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameAnalysis; 