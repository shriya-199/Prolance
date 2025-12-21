const UserModel = require('../Models/User');
const { sendOTPEmail } = require('../services/emailService');
const bcrypt = require('bcrypt');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request OTP - accepts username or email
const forgotPassword = async (req, res) => {
    try {
        const { identifier } = req.body; // Can be email or username

        if (!identifier) {
            return res.status(400).json({
                message: 'Please provide email or username',
                success: false
            });
        }

        // Find user by email or username
        const user = await UserModel.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() }
            ]
        });

        if (!user) {
            return res.status(404).json({
                message: 'No account found with this email or username',
                success: false
            });
        }

        // Rate limiting (can be disabled in development)
        const rateLimitEnabled = process.env.ENABLE_OTP_RATE_LIMIT !== 'false';

        if (rateLimitEnabled && user.lastOTPRequestTime) {
            const now = Date.now();
            const timeSinceLastRequest = now - new Date(user.lastOTPRequestTime).getTime();

            // Simplified progressive delays: 1min, 10min, 24hr
            const delays = [
                1 * 60 * 1000,      // 1 minute
                10 * 60 * 1000,     // 10 minutes
                24 * 60 * 60 * 1000 // 24 hours
            ];

            const requestCount = user.resetOTPRequestCount || 0;
            const requiredDelay = delays[Math.min(requestCount, delays.length - 1)];

            if (timeSinceLastRequest < requiredDelay) {
                const remainingTime = requiredDelay - timeSinceLastRequest;
                const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
                const remainingHours = Math.floor(remainingMinutes / 60);

                let timeMessage;
                if (remainingHours > 0) {
                    timeMessage = `${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
                } else {
                    timeMessage = `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
                }

                return res.status(429).json({
                    message: `Please wait ${timeMessage} before requesting another OTP`,
                    success: false,
                    remainingTime: Math.ceil(remainingTime / 1000), // in seconds
                    nextRequestAllowed: new Date(now + remainingTime).toISOString()
                });
            }
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user with OTP and rate limiting info
        user.resetOTP = otp;
        user.resetOTPExpires = otpExpires;

        // Calculate next cooldown period
        let nextCooldown = 0;
        if (rateLimitEnabled) {
            user.lastOTPRequestTime = new Date();
            const currentCount = user.resetOTPRequestCount || 0;
            user.resetOTPRequestCount = currentCount + 1;

            // Calculate what the next delay will be
            const delays = [60, 600, 86400]; // in seconds: 1min, 10min, 24hr
            nextCooldown = delays[Math.min(currentCount + 1, delays.length - 1)];
        }

        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(user.email, user.name, otp);

            res.status(200).json({
                message: 'OTP sent to your email successfully',
                success: true,
                email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email for privacy
                cooldownSeconds: nextCooldown // Time until next resend is allowed
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                message: 'Failed to send OTP email. Please try again.',
                success: false
            });
        }
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { identifier, otp } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({
                message: 'Email/username and OTP are required',
                success: false
            });
        }

        // Find user
        const user = await UserModel.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() }
            ]
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        // Check if OTP exists
        if (!user.resetOTP) {
            return res.status(400).json({
                message: 'No OTP request found. Please request a new OTP.',
                success: false
            });
        }

        // Check if OTP is expired
        if (user.resetOTPExpires < Date.now()) {
            return res.status(400).json({
                message: 'OTP has expired. Please request a new one.',
                success: false
            });
        }

        // Verify OTP
        if (user.resetOTP !== otp) {
            return res.status(400).json({
                message: 'Invalid OTP. Please try again.',
                success: false
            });
        }

        // OTP is valid
        res.status(200).json({
            message: 'OTP verified successfully',
            success: true,
            email: user.email
        });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

// Reset password with verified OTP
const resetPassword = async (req, res) => {
    try {
        const { identifier, otp, newPassword } = req.body;

        if (!identifier || !otp || !newPassword) {
            return res.status(400).json({
                message: 'All fields are required',
                success: false
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long',
                success: false
            });
        }

        // Find user
        const user = await UserModel.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() }
            ]
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        // Verify OTP again
        if (!user.resetOTP || user.resetOTP !== otp) {
            return res.status(400).json({
                message: 'Invalid OTP',
                success: false
            });
        }

        if (user.resetOTPExpires < Date.now()) {
            return res.status(400).json({
                message: 'OTP has expired',
                success: false
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear OTP + rate limiting
        user.password = hashedPassword;
        user.resetOTP = '';
        user.resetOTPExpires = null;
        user.resetOTPRequestCount = 0;
        user.lastOTPRequestTime = null;
        await user.save();

        res.status(200).json({
            message: 'Password reset successfully',
            success: true
        });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

module.exports = {
    forgotPassword,
    verifyOTP,
    resetPassword
};
