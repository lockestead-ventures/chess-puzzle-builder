const { v4: uuidv4 } = require('uuid');

class User {
  constructor() {
    // In-memory storage for now - replace with database later
    this.users = new Map();
  }

  /**
   * Create a new user
   */
  createUser(userData) {
    const userId = uuidv4();
    const user = {
      id: userId,
      username: userData.username,
      email: userData.email,
      chessComUsername: userData.chessComUsername,
      lichessUsername: userData.lichessUsername,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      stats: {
        totalPuzzles: 0,
        solvedPuzzles: 0,
        accuracy: 0,
        averageTime: 0,
        favoriteTheme: null
      },
      preferences: {
        theme: 'light',
        notifications: true,
        autoAnalysis: true
      }
    };

    this.users.set(userId, user);
    return user;
  }

  /**
   * Get user by ID
   */
  getUserById(userId) {
    return this.users.get(userId);
  }

  /**
   * Get user by email
   */
  getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  /**
   * Update user stats
   */
  updateUserStats(userId, stats) {
    const user = this.users.get(userId);
    if (user) {
      user.stats = { ...user.stats, ...stats };
      this.users.set(userId, user);
      return user;
    }
    return null;
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(userId, preferences) {
    const user = this.users.get(userId);
    if (user) {
      user.preferences = { ...user.preferences, ...preferences };
      this.users.set(userId, user);
      return user;
    }
    return null;
  }

  /**
   * Update last login
   */
  updateLastLogin(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.users.set(userId, user);
      return user;
    }
    return null;
  }

  /**
   * Get all users (for admin purposes)
   */
  getAllUsers() {
    return Array.from(this.users.values());
  }

  /**
   * Delete user
   */
  deleteUser(userId) {
    return this.users.delete(userId);
  }
}

module.exports = User; 