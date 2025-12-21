const ProjectModel = require('../Models/Project');
const UserModel = require('../Models/User');

// Create new project (Client only)
const createProject = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            title,
            description,
            category,
            budget,
            duration,
            skillsRequired,
            deadline,
            tags,
            visibility,
            thumbnail,
            images
        } = req.body;

        // Validate required fields
        if (!title || !description || !category || !budget || !duration) {
            return res.status(400).json({
                message: 'Please provide all required fields',
                success: false
            });
        }

        // Check user role
        const user = await UserModel.findById(userId);
        if (user.role !== 'client' && user.role !== 'both') {
            return res.status(403).json({
                message: 'Only clients can post projects',
                success: false
            });
        }

        const project = new ProjectModel({
            title,
            description,
            category,
            budget,
            duration,
            skillsRequired: skillsRequired || [],
            clientId: userId,
            deadline: deadline || null,
            tags: tags || [],
            visibility: visibility || 'public',
            thumbnail: thumbnail || '',
            images: images || []
        });

        await project.save();

        res.status(201).json({
            message: 'Project created successfully',
            success: true,
            project
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: err.message
        });
    }
};

// Get all projects (with filters)
const getAllProjects = async (req, res) => {
    try {
        const {
            category,
            minBudget,
            maxBudget,
            skills,
            search,
            status = 'open',
            page = 1,
            limit = 20
        } = req.query;

        let query = { status, visibility: 'public' };

        // Category filter
        if (category) {
            query.category = category;
        }

        // Budget filter
        if (minBudget || maxBudget) {
            query['budget.min'] = {};
            if (minBudget) query['budget.min'].$gte = Number(minBudget);
            if (maxBudget) query['budget.max'] = { $lte: Number(maxBudget) };
        }

        // Skills filter
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            query.skillsRequired = { $in: skillsArray };
        }

        // Search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const projects = await ProjectModel.find(query)
            .populate('clientId', 'name avatar rating totalReviews location')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await ProjectModel.countDocuments(query);

        res.status(200).json({
            success: true,
            projects,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: err.message
        });
    }
};

// Get project by ID
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id; // May be undefined for non-authenticated users

        const project = await ProjectModel.findById(id)
            .populate('clientId', 'name avatar rating totalReviews location email');

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
                success: false
            });
        }

        // Only increment view count if user is authenticated and hasn't viewed before
        if (userId) {
            const hasViewed = project.viewedBy.some(
                viewerId => viewerId.toString() === userId.toString()
            );

            if (!hasViewed) {
                // Add user to viewedBy array and increment count
                project.viewedBy.push(userId);
                project.viewCount += 1;
                await project.save();
            }
        } else {
            // For non-authenticated users, increment count on every view
            // (or you could skip incrementing for anonymous users)
            project.viewCount += 1;
            await project.save();
        }

        res.status(200).json({
            success: true,
            project
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: err.message
        });
    }
};

// Get user's posted projects (Client)
const getMyProjects = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status } = req.query;

        let query = { clientId: userId };
        if (status) {
            query.status = status;
        }

        const projects = await ProjectModel.find(query)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            projects
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: err.message
        });
    }
};

// Update project
const updateProject = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const project = await ProjectModel.findById(id);

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
                success: false
            });
        }

        // Check ownership
        if (project.clientId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to update this project',
                success: false
            });
        }

        const updateData = req.body;
        // Prevent updating certain fields
        delete updateData.clientId;
        delete updateData.proposalCount;

        const updatedProject = await ProjectModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Project updated successfully',
            success: true,
            project: updatedProject
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: err.message
        });
    }
};

// Delete project
const deleteProject = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const project = await ProjectModel.findById(id);

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
                success: false
            });
        }

        // Check ownership
        if (project.clientId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to delete this project',
                success: false
            });
        }

        await ProjectModel.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Project deleted successfully',
            success: true
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: err.message
        });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    getMyProjects,
    updateProject,
    deleteProject
};
