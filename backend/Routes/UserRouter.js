const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../Middlewares/Auth');
const {
    getProfile,
    getUserById,
    getUserByUsername,
    updateProfile,
    addPortfolioItem,
    removePortfolioItem,
    searchFreelancers
} = require('../Controllers/UserController');

// Get current user profile (protected)
router.get('/me', ensureAuthenticated, getProfile);

// Update profile (protected)
router.put('/profile', ensureAuthenticated, updateProfile);

// Portfolio management (protected)
router.post('/portfolio', ensureAuthenticated, addPortfolioItem);
router.delete('/portfolio/:itemId', ensureAuthenticated, removePortfolioItem);

// Public routes
router.get('/search', searchFreelancers);
router.get('/username/:username', getUserByUsername);
router.get('/:id', getUserById);

module.exports = router;
