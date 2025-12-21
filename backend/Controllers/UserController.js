const UserModel = require('../Models/User');

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user._id; // From auth middleware
        const user = await UserModel.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

// Get public user profile by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id).select('-password -email -phone');

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

// Get public user profile by username
const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await UserModel.findOne({ username: username.toLowerCase() }).select('-password -email -phone');

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            name,
            bio,
            skills,
            hourlyRate,
            location,
            phone,
            avatar,
            role
        } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (skills) updateData.skills = skills;
        if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
        if (location !== undefined) updateData.location = location;
        if (phone !== undefined) updateData.phone = phone;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (role) updateData.role = role;

        const user = await UserModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            success: true,
            user
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

// Add portfolio item
const addPortfolioItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title, description, imageUrl, link } = req.body;

        if (!title) {
            return res.status(400).json({
                message: 'Title is required',
                success: false
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        user.portfolio.push({ title, description, imageUrl, link });
        await user.save();

        res.status(200).json({
            message: 'Portfolio item added successfully',
            success: true,
            portfolio: user.portfolio
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

// Remove portfolio item
const removePortfolioItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        user.portfolio = user.portfolio.filter(
            item => item._id.toString() !== itemId
        );
        await user.save();

        res.status(200).json({
            message: 'Portfolio item removed successfully',
            success: true,
            portfolio: user.portfolio
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

// Search freelancers
const searchFreelancers = async (req, res) => {
    try {
        const { skills, minRate, maxRate, search, excludeUserId } = req.query;

        let query = {
            $or: [
                { role: 'freelancer' },
                { role: 'both' }
            ],
            'privacySettings.isPublic': true  // Only show public profiles
        };

        // Exclude current user from results
        if (excludeUserId) {
            query._id = { $ne: excludeUserId };
        }

        // Add skills filter
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            query.skills = { $in: skillsArray };
        }

        // Add rate range filter
        if (minRate || maxRate) {
            query.hourlyRate = {};
            if (minRate) query.hourlyRate.$gte = Number(minRate);
            if (maxRate) query.hourlyRate.$lte = Number(maxRate);
        }

        // Add text search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } }
            ];
        }

        const freelancers = await UserModel.find(query)
            .select('-password -email -phone')
            .sort({ rating: -1, totalReviews: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            freelancers,
            count: freelancers.length
        });
    } catch (err) {
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

module.exports = {
    getProfile,
    getUserById,
    getUserByUsername,
    updateProfile,
    addPortfolioItem,
    removePortfolioItem,
    searchFreelancers
};
