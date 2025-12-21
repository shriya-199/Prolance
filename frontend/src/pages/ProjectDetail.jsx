import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import {
    HiOutlineArrowLeft,
    HiOutlineClock,
    HiOutlineLocationMarker,
    HiOutlineStar,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineBriefcase,
    HiOutlineChevronRight
} from 'react-icons/hi';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/projects/${id}`);
            setProject(response.data.project);
            setLoading(false);
        } catch (err) {
            setError('Project not found');
            setLoading(false);
        }
    };

    const getTimeSince = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        return 'Just now';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-theme flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 mt-3 font-light">Loading project...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <HiOutlineBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 font-light mb-4">{error || 'Project not found'}</p>
                    <button
                        onClick={() => navigate('/projects')}
                        className="px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition font-light"
                    >
                        Browse Projects
                    </button>
                </div>
            </div>
        );
    }

    // Check if current user is the project owner
    const currentUser = authService.getCurrentUser();
    const isOwner = currentUser && project.clientId &&
        (currentUser.userId === project.clientId._id || currentUser.userId === project.clientId);

    const allImages = [project.thumbnail, ...project.images].filter(Boolean);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-5xl mx-auto px-8 py-10">
                {/* Breadcrumb */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-light"
                >
                    <Link to="/projects" className="hover:text-green-600 transition">
                        Projects
                    </Link>
                    <HiOutlineChevronRight size={14} />
                    <span className="text-gray-700">{project.title}</span>
                </motion.div>

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition mb-6 font-light"
                >
                    <HiOutlineArrowLeft size={16} />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h1 className="text-3xl font-light text-gray-700 mb-2">
                                        {project.title}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-sm rounded-md font-light">
                                            {project.category}
                                        </span>
                                        {project.visibility === 'private' && (
                                            <span className="flex items-center gap-1 px-2.5 py-0.5 bg-gray-50 text-gray-600 text-sm rounded-md font-light">
                                                <HiOutlineEyeOff size={14} />
                                                Private
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500 font-light">
                                <div className="flex items-center gap-1">
                                    <HiOutlineClock size={14} />
                                    Posted {getTimeSince(project.createdAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <HiOutlineEye size={14} />
                                    {project.viewCount} views
                                </div>
                                <div>
                                    {project.proposalCount} proposal{project.proposalCount !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </motion.div>

                        {/* Images */}
                        {allImages.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <img
                                    src={allImages[selectedImage]}
                                    alt={project.title}
                                    className="w-full h-80 object-cover rounded-lg border border-gray-200 mb-3"
                                />
                                {allImages.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto">
                                        {allImages.map((img, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${selectedImage === index
                                                    ? 'border-green-600'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`${project.title} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="border border-gray-100 rounded-lg p-6"
                        >
                            <h2 className="text-lg font-light text-gray-700 mb-3">Project Description</h2>
                            <p className="text-sm text-gray-600 font-light whitespace-pre-wrap leading-relaxed">
                                {project.description}
                            </p>
                        </motion.div>

                        {/* Project Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="border border-gray-100 rounded-lg p-6"
                        >
                            <h2 className="text-lg font-light text-gray-700 mb-4">Project Details</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 font-light">Budget</span>
                                    <span className="text-sm text-gray-700 font-light">
                                        ₹{project.budget.min.toLocaleString()} - ₹{project.budget.max.toLocaleString()} ({project.budget.type})
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 font-light">Duration</span>
                                    <span className="text-sm text-gray-700 font-light">{project.duration}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 font-light">Status</span>
                                    <span className="text-sm text-gray-700 font-light capitalize">{project.status}</span>
                                </div>
                                {project.deadline && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 font-light">Deadline</span>
                                        <span className="text-sm text-gray-700 font-light">
                                            {new Date(project.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Skills Required */}
                        {project.skillsRequired.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="border border-gray-100 rounded-lg p-6"
                            >
                                <h2 className="text-lg font-light text-gray-700 mb-3">Skills Required</h2>
                                <div className="flex flex-wrap gap-2">
                                    {project.skillsRequired.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm rounded-lg border border-gray-100 font-light"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Apply CTA */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="border border-gray-100 rounded-lg p-6 sticky top-24"
                        >
                            <div className="mb-4">
                                <p className="text-2xl font-light text-gray-700 mb-1">
                                    ₹{project.budget.min.toLocaleString()} - ₹{project.budget.max.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 font-light">{project.budget.type} price</p>
                            </div>

                            <button
                                disabled={isOwner || !isAuthenticated}
                                onClick={(e) => {
                                    if (!isAuthenticated) {
                                        e.preventDefault();
                                        navigate('/login');
                                    } else if (isOwner) {
                                        e.preventDefault();
                                    }
                                }}
                                className={`w-full px-4 py-3 text-sm rounded-lg transition font-light mb-3 ${isOwner || !isAuthenticated
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                title={
                                    !isAuthenticated
                                        ? 'Login to apply for this project'
                                        : isOwner
                                            ? 'You cannot apply to your own project'
                                            : 'Apply for this project'
                                }
                            >
                                {!isAuthenticated ? 'Login to Apply' : isOwner ? 'Your Project' : 'Apply for this Project'}
                            </button>

                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 font-light mb-2">PROJECT TIMELINE</p>
                                <p className="text-sm text-gray-700 font-light">{project.duration}</p>
                            </div>
                        </motion.div>

                        {/* Client Info */}
                        {project.clientId && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="border border-gray-100 rounded-lg p-6"
                            >
                                <p className="text-xs text-gray-500 font-light mb-3">CLIENT</p>
                                <div className="flex items-center gap-3 mb-4">
                                    {project.clientId.avatar ? (
                                        <img
                                            src={project.clientId.avatar}
                                            alt={project.clientId.name}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-light border border-gray-200">
                                            {project.clientId.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-light text-gray-700">{project.clientId.name}</p>
                                        {project.clientId.rating > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <HiOutlineStar className="text-yellow-500" size={12} />
                                                {project.clientId.rating.toFixed(1)} ({project.clientId.totalReviews} reviews)
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {project.clientId.location && (
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-light">
                                        <HiOutlineLocationMarker size={14} />
                                        {project.clientId.location}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
