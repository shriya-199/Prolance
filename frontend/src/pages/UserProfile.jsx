import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import {
    HiOutlineUser,
    HiOutlineLocationMarker,
    HiOutlineClock,
    HiOutlineStar,
    HiOutlineBriefcase,
    HiOutlineCurrencyRupee,
    HiOutlineCheckCircle
} from 'react-icons/hi';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function UserProfile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserProfile();
    }, [username]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching profile for username:', username);
            console.log('API URL:', `${API_URL}/api/users/username/${username}`);
            const response = await axios.get(`${API_URL}/api/users/username/${username}`);
            console.log('Profile response:', response.data);
            setUser(response.data.user);
        } catch (err) {
            console.error('Error fetching profile:', err);
            console.error('Error response:', err.response);
            if (err.response?.status === 404) {
                setError('User not found');
            } else {
                setError('Failed to load profile');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-theme flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-light">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-theme flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiOutlineUser size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-light text-gray-700 mb-2">{error}</h2>
                    <p className="text-sm text-gray-500 font-light mb-6">
                        The user you're looking for doesn't exist
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-light"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-5xl mx-auto px-8 py-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-50 to-white border border-gray-100 rounded-xl p-8 mb-6"
                >
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center shadow-lg">
                                    <HiOutlineUser size={40} className="text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-light text-gray-800">{user?.name}</h1>
                                {user?.isVerified && (
                                    <HiOutlineCheckCircle size={24} className="text-green-600" title="Verified" />
                                )}
                            </div>
                            <p className="text-sm text-left text-gray-500 font-light mb-3">@{user?.username}</p>

                            {user?.bio && (
                                <p className="text-sm text-left text-gray-600 font-light mb-4 max-w-2xl">{user.bio}</p>
                            )}

                            {/* Meta Information */}
                            <div className="flex flex-wrap gap-4 text-sm">
                                {user?.location && (
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <HiOutlineLocationMarker size={16} />
                                        <span className="font-light">{user.location}</span>
                                    </div>
                                )}
                                {user?.timezone && (
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <HiOutlineClock size={16} />
                                        <span className="font-light">{user.timezone}</span>
                                    </div>
                                )}
                                {user?.role && (
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <HiOutlineBriefcase size={16} />
                                        <span className="font-light capitalize">{user.role}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex-shrink-0">
                            <div className="bg-white rounded-lg border border-gray-200 px-6 py-4 text-center min-w-[120px]">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <HiOutlineStar className="text-yellow-500" size={20} />
                                    <span className="text-2xl font-light text-gray-800">
                                        {user?.rating ? user.rating.toFixed(1) : '0.0'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 font-light">
                                    {user?.totalReviews || 0} reviews
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Skills */}
                        {(user?.primarySkills?.length > 0 || user?.secondarySkills?.length > 0 || user?.skills?.length > 0) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white border border-gray-100 rounded-xl p-6"
                            >
                                <h2 className="text-lg font-light text-gray-700 mb-4">Skills</h2>

                                {user?.primarySkills?.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 font-light mb-2">Primary Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {user.primarySkills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-100 font-light"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user?.secondarySkills?.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 font-light mb-2">Secondary Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {user.secondarySkills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-100 font-light"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user?.skills?.length > 0 && !user?.primarySkills?.length && !user?.secondarySkills?.length && (
                                    <div className="flex flex-wrap gap-2">
                                        {user.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-100 font-light"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Portfolio */}
                        {user?.portfolio?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white border border-gray-100 rounded-xl p-6"
                            >
                                <h2 className="text-lg font-light text-gray-700 mb-4">Portfolio</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {user.portfolio.map((item, index) => (
                                        <div
                                            key={item._id || index}
                                            className="p-4 bg-gray-50 border border-gray-100 rounded-lg hover:border-green-200 transition"
                                        >
                                            {item.imageUrl && (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    className="w-full h-40 object-cover rounded-lg mb-3"
                                                />
                                            )}
                                            <h3 className="text-sm font-medium text-gray-700 mb-1">{item.title}</h3>
                                            {item.description && (
                                                <p className="text-xs text-gray-500 font-light mb-2">{item.description}</p>
                                            )}
                                            {item.link && (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-green-600 hover:text-green-700 font-light"
                                                >
                                                    View Project →
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Portfolio Links */}
                        {user?.portfolioLinks?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-white border border-gray-100 rounded-xl p-6"
                            >
                                <h2 className="text-lg font-light text-gray-700 mb-4">Links</h2>
                                <div className="space-y-2">
                                    {user.portfolioLinks.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-sm text-green-600 hover:text-green-700 font-light truncate"
                                        >
                                            {link}
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Stats & Info */}
                    <div className="space-y-6">
                        {/* Professional Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white border border-gray-100 rounded-xl p-6"
                        >
                            <h2 className="text-lg font-light text-gray-700 mb-4">Professional Info</h2>
                            <div className="space-y-4">
                                {user?.hourlyRate > 0 && (
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                        <span className="text-sm text-gray-600 font-light">Hourly Rate</span>
                                        <div className="flex items-center gap-1 text-green-600">
                                            <HiOutlineCurrencyRupee size={18} />
                                            <span className="text-lg font-light">{user.hourlyRate}</span>
                                        </div>
                                    </div>
                                )}
                                {user?.experienceLevel && (
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                        <span className="text-sm text-gray-600 font-light">Experience</span>
                                        <span className="text-sm text-gray-700 font-light capitalize">{user.experienceLevel}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                    <span className="text-sm text-gray-600 font-light">Completed Projects</span>
                                    <span className="text-sm text-gray-700 font-light">{user?.completedProjects || 0}</span>
                                </div>
                                {user?.totalEarnings > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 font-light">Total Earnings</span>
                                        <div className="flex items-center gap-1 text-gray-700">
                                            <HiOutlineCurrencyRupee size={16} />
                                            <span className="text-sm font-light">{user.totalEarnings.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Account Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white border border-gray-100 rounded-xl p-6"
                        >
                            <h2 className="text-lg font-light text-gray-700 mb-4">Account</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 font-light">Member Since</span>
                                    <span className="text-gray-700 font-light">
                                        {new Date(user?.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
