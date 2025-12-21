const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../Middlewares/Auth');
const {
    createProject,
    getAllProjects,
    getProjectById,
    getMyProjects,
    updateProject,
    deleteProject
} = require('../Controllers/ProjectController');

// Public routes
router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// Protected routes
router.post('/', ensureAuthenticated, createProject);
router.get('/my/projects', ensureAuthenticated, getMyProjects);
router.put('/:id', ensureAuthenticated, updateProject);
router.delete('/:id', ensureAuthenticated, deleteProject);

module.exports = router;
