import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import ImageUpload from '../components/ui/ImageUpload';
import MultiImageUpload from '../components/ui/MultiImageUpload';
import {
    HiOutlineCheckCircle,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineSave,
    HiOutlineX,
    HiRefresh
} from 'react-icons/hi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function PostProject() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        budgetMin: '',
        budgetMax: '',
        budgetType: 'fixed',
        duration: '',
        skillsRequired: '',
        visibility: 'public',
        thumbnail: '',
        images: []
    });

    // CAPTCHA state
    const [captchaId, setCaptchaId] = useState('');
    const [captchaSvg, setCaptchaSvg] = useState('');
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [captchaError, setCaptchaError] = useState('');
    const [captchaSuccess, setCaptchaSuccess] = useState('');

    const categories = [
        'Programming & Tech',
        'Graphics & Design',
        'Digital Marketing',
        'Writing & Translation',
        'Video & Animation',
        'AI Services',
        'Music & Audio',
        'Business',
        'Consulting',
        'Other'
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    // Load CAPTCHA on component mount
    useEffect(() => {
        loadCaptcha();
    }, []);

    // Load/Refresh CAPTCHA
    const loadCaptcha = async () => {
        try {
            setCaptchaLoading(true);
            setCaptchaError('');
            setCaptchaSuccess('');
            setCaptchaAnswer('');
            setIsCaptchaVerified(false);

            const response = await axios.get(`${API_BASE_URL}/api/captcha/generate`);

            if (response.data.success) {
                setCaptchaId(response.data.captchaId);
                setCaptchaSvg(response.data.captchaSvg);
            }
        } catch (err) {
            setCaptchaError('Failed to load CAPTCHA. Please refresh.');
        } finally {
            setCaptchaLoading(false);
        }
    };

    // Verify CAPTCHA
    const verifyCaptcha = async () => {
        if (!captchaAnswer.trim()) {
            setCaptchaError('Please enter the CAPTCHA text');
            return;
        }

        try {
            setCaptchaLoading(true);
            setCaptchaError('');
            setCaptchaSuccess('');

            const response = await axios.post(`${API_BASE_URL}/api/captcha/verify`, {
                captchaId,
                answer: captchaAnswer
            });

            if (response.data.success) {
                setIsCaptchaVerified(true);
                setCaptchaSuccess('✓ CAPTCHA verified successfully!');
                setCaptchaError('');
            }
        } catch (err) {
            setCaptchaLoading(false);

            // Show user-friendly error message
            if (err.response?.status === 400) {
                setCaptchaError('❌ Wrong CAPTCHA. Please try again.');
            } else {
                setCaptchaError(err.response?.data?.message || 'Verification failed. Please try again.');
            }
            setCaptchaSuccess('');
            setIsCaptchaVerified(false);

            // Wait 2 seconds before loading new CAPTCHA so user can see the error
            setTimeout(() => {
                loadCaptcha();
            }, 3000);

            return; // Exit early to prevent finally block from running
        } finally {
            setCaptchaLoading(false);
        }
    };

    // Refresh CAPTCHA
    const refreshCaptcha = () => {
        loadCaptcha();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.title.trim()) {
            setError('Please enter a project title');
            setLoading(false);
            return;
        }

        if (formData.description.length < 50) {
            setError('Description must be at least 50 characters');
            setLoading(false);
            return;
        }

        if (!formData.category) {
            setError('Please select a category');
            setLoading(false);
            return;
        }

        if (!formData.budgetMin || !formData.budgetMax) {
            setError('Please enter budget range');
            setLoading(false);
            return;
        }
        if(Number(formData.budgetMin) <=0 || Number(formData.budgetMax)<=0) {
            setError('Enter a vaild budget');
            setLoading(false);
            return;
        }

        if (Number(formData.budgetMin) >= Number(formData.budgetMax)) {
            setError('Maximum budget must be greater than minimum budget');
            setLoading(false);
            return;
        }

        if (!formData.duration) {
            setError('Please enter project duration');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');

            // Parse skills from comma-separated string
            const skills = formData.skillsRequired
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const projectData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                budget: {
                    min: Number(formData.budgetMin),
                    max: Number(formData.budgetMax),
                    type: formData.budgetType
                },
                duration: formData.duration,
                skillsRequired: skills,
                visibility: formData.visibility,
                thumbnail: formData.thumbnail,
                images: formData.images
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/projects`,
                projectData,
                {
                    headers: {
                        Authorization: token,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/my-projects');
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-theme flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <HiOutlineCheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-light text-gray-700 mb-2">Project Created!</h2>
                    <p className="text-sm text-gray-500 font-light">Redirecting to your projects...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-theme">
            <div className="max-w-5xl mx-auto px-8 py-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-light text-gray-700">Post a Project</h1>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition"
                        >

                        </button>
                    </div>
                    <p className="text-sm text-left text-gray-500 font-light">
                        Share your project details and connect with talented freelancers
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-0">
                    {/* Main Content - Single Column */}
                    <div className="space-y-0">
                        {/* Project Title */}
                        <div className="py-4 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <label className="text-sm text-left text-gray-600 font-light w-[180px] pt-3">
                                    Project Title *
                                </label>
                                <span className="text-sm text-gray-600 font-light pt-3">:</span>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        placeholder="e.g., Build a responsive e-commerce website"
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="py-4 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <label className="text-sm text-left text-gray-600 font-light w-[180px] pt-3">
                                    Description *
                                </label>
                                <span className="text-sm text-gray-600 font-light pt-3">:</span>
                                <div className="flex-1">
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Describe your project in detail. What are you trying to achieve? What skills are needed?"
                                        rows={6}
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light resize-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1 font-light">
                                        {formData.description.length} characters (minimum 50)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-left text-gray-600 font-light w-[180px]">
                                    Category *
                                </label>
                                <span className="text-sm text-gray-600 font-light">:</span>
                                <div className="flex-1">
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleChange('category', e.target.value)}
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light bg-theme cursor-pointer"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-left text-gray-600 font-light w-[180px]">
                                    Duration *
                                </label>
                                <span className="text-sm text-gray-600 font-light">:</span>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={formData.duration}
                                        onChange={(e) => handleChange('duration', e.target.value)}
                                        placeholder="e.g., 2-3 weeks"
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Budget Range */}
                        <div className="py-4 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <label className="text-sm text-left text-gray-600 font-light w-[180px] pt-3">
                                    Budget Range (₹) *
                                </label>
                                <span className="text-sm text-gray-600 font-light pt-3">:</span>
                                <div className="flex-1">
                                    <div className="grid grid-cols-3 gap-3">
                                        <input
                                            type="number"
                                            value={formData.budgetMin}
                                            onChange={(e) => handleChange('budgetMin', e.target.value)}
                                            placeholder="Min"
                                            className="px-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light"
                                        />
                                        <input
                                            type="number"
                                            value={formData.budgetMax}
                                            onChange={(e) => handleChange('budgetMax', e.target.value)}
                                            placeholder="Max"
                                            className="px-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light"
                                        />
                                        <select
                                            value={formData.budgetType}
                                            onChange={(e) => handleChange('budgetType', e.target.value)}
                                            className="px-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light bg-theme cursor-pointer"
                                        >
                                            <option value="fixed">Fixed</option>
                                            <option value="hourly">Hourly</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills Required */}
                        <div className="py-4 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <label className="text-sm text-left text-gray-600 font-light w-[180px] pt-3">
                                    Skills Required
                                </label>
                                <span className="text-sm text-gray-600 font-light pt-3">:</span>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={formData.skillsRequired}
                                        onChange={(e) => handleChange('skillsRequired', e.target.value)}
                                        placeholder="e.g., React, Node.js, MongoDB (comma separated)"
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light"
                                    />
                                    <p className="text-xs text-gray-400 mt-1 font-light">
                                        Separate skills with commas
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Visibility */}
                        <div className="py-4 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <label className="text-sm text-left text-gray-600 font-light w-[180px] pt-3">
                                    Visibility
                                </label>
                                <span className="text-sm text-gray-600 font-light pt-3">:</span>
                                <div className="flex-1">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleChange('visibility', 'public')}
                                            className={`flex items-center gap-3 p-3 border rounded-lg transition cursor-pointer ${formData.visibility === 'public'
                                                ? 'border-green-600 bg-green-50/30'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <HiOutlineEye className={formData.visibility === 'public' ? 'text-green-600' : 'text-gray-400'} size={18} />
                                            <div className="flex-1 text-left">
                                                <p className={`text-sm font-light ${formData.visibility === 'public' ? 'text-green-700' : 'text-gray-700'}`}>
                                                    Public
                                                </p>
                                                <p className="text-xs text-gray-400 font-light">
                                                    Visible to everyone
                                                </p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleChange('visibility', 'private')}
                                            className={`flex items-center gap-3 p-3 border rounded-lg transition cursor-pointer ${formData.visibility === 'private'
                                                ? 'border-green-600 bg-green-50/30'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <HiOutlineEyeOff className={formData.visibility === 'private' ? 'text-green-600' : 'text-gray-400'} size={18} />
                                            <div className="flex-1 text-left">
                                                <p className={`text-sm font-light ${formData.visibility === 'private' ? 'text-green-700' : 'text-gray-700'}`}>
                                                    Private
                                                </p>
                                                <p className="text-xs text-gray-400 font-light">
                                                    Only you can see
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Thumbnail */}
                        <div className="py-4 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <label className="text-sm text-left text-gray-600 font-light w-[180px] pt-3">
                                    Project Thumbnail
                                </label>
                                <span className="text-sm text-gray-600 font-light pt-3">:</span>
                                <div className="flex-1">
                                    <ImageUpload
                                        value={formData.thumbnail}
                                        onChange={(value) => handleChange('thumbnail', value)}
                                        label="Upload Thumbnail"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Images */}
                        <div className="py-4 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <label className="text-sm text-left text-gray-600 font-light w-[180px] pt-3">
                                    Additional Images
                                </label>
                                <span className="text-sm text-gray-600 font-light pt-3">:</span>
                                <div className="flex-1">
                                    <MultiImageUpload
                                        values={formData.images}
                                        onChange={(value) => handleChange('images', value)}
                                        maxImages={5}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CAPTCHA Verification */}
                        <div className="py-3 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <label className="text-sm text-left text-gray-600 font-light w-[180px] pt-3">
                                    Verification *
                                </label>
                                <span className="text-sm text-gray-600 font-light pt-3">:</span>
                                <div className="flex-1">
                                    {captchaLoading ? (
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                                            Loading CAPTCHA...
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {/* All CAPTCHA elements in one row */}
                                            <div className="flex items-center gap-3">
                                                {/* CAPTCHA SVG */}
                                                <div
                                                    className="border border-gray-200 rounded-lg bg-gray-50 shrink-0"
                                                    dangerouslySetInnerHTML={{ __html: captchaSvg }}
                                                />

                                                {/* Refresh Button */}
                                                <button
                                                    type="button"
                                                    onClick={refreshCaptcha}
                                                    disabled={captchaLoading || isCaptchaVerified}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                                    title="Refresh CAPTCHA"
                                                >
                                                    <HiRefresh size={20} />
                                                </button>

                                                {/* Input Field */}
                                                <input
                                                    type="text"
                                                    value={captchaAnswer}
                                                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                                                    placeholder="Enter the text"
                                                    disabled={isCaptchaVerified}
                                                    className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light disabled:bg-gray-50 disabled:cursor-not-allowed"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && !isCaptchaVerified) {
                                                            e.preventDefault();
                                                            verifyCaptcha();
                                                        }
                                                    }}
                                                />

                                                {/* Verify Button */}
                                                <button
                                                    type="button"
                                                    onClick={verifyCaptcha}
                                                    disabled={captchaLoading || isCaptchaVerified || !captchaAnswer.trim()}
                                                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-light shrink-0"
                                                >
                                                    {isCaptchaVerified ? 'Verified' : 'Verify'}
                                                </button>
                                            </div>

                                            {/* Success/Error Messages */}
                                            {captchaSuccess && (
                                                <p className="text-xs text-green-600 font-light">{captchaSuccess}</p>
                                            )}
                                            {captchaError && (
                                                <p className="text-xs text-red-500 font-light">{captchaError}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 font-light">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-light"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !isCaptchaVerified}
                            className="px-6 py-2.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-light flex items-center gap-2"
                            title={!isCaptchaVerified ? 'Please verify CAPTCHA first' : ''}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <HiOutlineSave size={16} />
                                    Publish Project
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
