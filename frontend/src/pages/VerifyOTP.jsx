import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import Particles from '../components/ui/background';

export default function VerifyOTP() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [isInCooldown, setIsInCooldown] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const inputRefs = useRef([]);

    const identifier = location.state?.identifier;
    const maskedEmail = location.state?.email;
    const initialCooldown = location.state?.cooldownSeconds;

    useEffect(() => {
        if (!identifier) {
            navigate('/forgot-password');
        }

        // Set initial cooldown if provided
        if (initialCooldown && initialCooldown > 0) {
            setCooldownSeconds(initialCooldown);
            setIsInCooldown(true);
        }
    }, [identifier, navigate, initialCooldown]);

    // Countdown timer
    useEffect(() => {
        if (cooldownSeconds > 0) {
            const timer = setTimeout(() => {
                setCooldownSeconds(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (isInCooldown && cooldownSeconds === 0) {
            setIsInCooldown(false);
        }
    }, [cooldownSeconds, isInCooldown]);

    // Format seconds to display time
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter complete 6-digit OTP');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier, otp: otpValue }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('OTP verified successfully!');
                setTimeout(() => {
                    navigate('/reset-password', { state: { identifier, otp: otpValue } });
                }, 1500);
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }

        setIsLoading(false);
    };

    const handleResendOTP = async () => {
        if (isInCooldown) return; // Prevent resend during cooldown

        setIsResending(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('New OTP sent to your email!');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();

                // Set cooldown from server response
                if (data.cooldownSeconds && data.cooldownSeconds > 0) {
                    setCooldownSeconds(data.cooldownSeconds);
                    setIsInCooldown(true);
                }
            } else {
                setError(data.message || 'Failed to resend OTP');

                // If rate limited, set cooldown from server
                if (data.remainingTime) {
                    setCooldownSeconds(data.remainingTime);
                    setIsInCooldown(true);
                }
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }

        setIsResending(false);
    };

    return (
        <div className="min-h-screen w-full flex bg-theme">
            {/* Left Side - Illustration with Particles */}
            <div className="hidden rounded-3xl lg:flex lg:w-1/2 relative bg-gradient-to-br from-green-50 to-white items-center justify-center p-12 overflow-hidden">
                <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                    <Particles
                        particleColors={['#b2ffc8', '#b2ffc8']}
                        particleCount={300}
                        particleSpread={10}
                        speed={0.1}
                        particleBaseSize={100}
                        moveParticlesOnHover={true}
                        alphaParticles={false}
                        disableRotation={false}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 text-center"
                >
                    <div className="mb-8">
                        <svg className="w-32 h-32 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-light text-gray-700 mb-2">Check Your Email</h2>
                    <p className="text-sm text-gray-500 font-light max-w-md">
                        We've sent a verification code to {maskedEmail}
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-6">
                        <h1 className="text-2xl font-light text-gray-700 mb-2">Verify OTP</h1>
                        <p className="text-sm text-gray-500 font-light">
                            Enter the 6-digit code sent to your email
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-light"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 p-3 bg-green-50 border border-green-100 rounded-lg text-green-600 text-sm font-light"
                        >
                            {success}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* OTP Input */}
                        <div className="flex justify-center gap-2" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-light border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none transition-all"
                                    disabled={isLoading || success}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || success}
                            className="w-full bg-green-600 text-white font-light py-2.5 text-sm rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Verifying...' : success ? 'Redirecting...' : 'Verify OTP'}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={isResending || isInCooldown}
                            className="text-sm text-gray-500 hover:text-green-600 transition font-light disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isResending ? 'Resending...' : isInCooldown ? `Resend OTP in ${formatTime(cooldownSeconds)}` : 'Resend OTP'}
                        </button>
                        <div>
                            <Link
                                to="/login"
                                className="text-sm text-gray-500 hover:text-green-600 transition font-light"
                            >
                                ← Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
