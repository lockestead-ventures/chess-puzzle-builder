const express = require('express');
const router = express.Router();
const User = require('../models/User');

const userModel = new User();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, chessComUsername, lichessUsername } = req.body;
    
    // Basic validation
    if (!username || !email) {
      return res.status(400).json({ 
        error: 'Username and email are required' 
      });
    }
    
    // Check if user already exists
    const existingUser = userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }
    
    // Create new user
    const user = userModel.createUser({
      username,
      email,
      chessComUsername,
      lichessUsername
    });
    
    // Remove sensitive data before sending response
    const { id, username: userName, email: userEmail, stats, preferences } = user;
    
    res.status(201).json({
      success: true,
      user: { id, username: userName, email: userEmail, stats, preferences },
      message: 'User registered successfully'
    });
    
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      error: 'Failed to register user',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Login user (simple email-based login for now)
 */
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }
    
    // Find user by email
    const user = userModel.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    // Update last login
    userModel.updateLastLogin(user.id);
    
    // Remove sensitive data before sending response
    const { id, username, email: userEmail, stats, preferences } = user;
    
    res.json({
      success: true,
      user: { id, username, email: userEmail, stats, preferences },
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      error: 'Failed to login',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/user/:userId
 * Get user profile
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    // Remove sensitive data before sending response
    const { id, username, email, stats, preferences } = user;
    
    res.json({
      success: true,
      user: { id, username, email, stats, preferences }
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

/**
 * PUT /api/auth/user/:userId/preferences
 * Update user preferences
 */
router.put('/user/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;
    
    const user = userModel.updateUserPreferences(userId, preferences);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      preferences: user.preferences,
      message: 'Preferences updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/users
 * Get all users (for admin purposes)
 */
router.get('/users', async (req, res) => {
  try {
    const users = userModel.getAllUsers();
    
    // Remove sensitive data
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      stats: user.stats
    }));
    
    res.json({
      success: true,
      users: sanitizedUsers,
      count: sanitizedUsers.length
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

module.exports = router; 