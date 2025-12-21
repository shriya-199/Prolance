import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FiSearch, FiFilter, FiMapPin, FiStar, FiBriefcase, FiDollarSign, FiUser } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function FindFreelancers() {
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('');
    const [minRate, setMinRate] = useState('');
    const [maxRate, setMaxRate] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const { user } = useAuth();

    const popularSkills = [
        'All Skills',
        'JavaScript',
        'React',
        'Node.js',
        'Python',
        'Java',
        'UI/UX Design',
        'Graphic Design',
        'Content Writing',
        'SEO',
        'Video Editing'
    ];

    useEffect(() => {
        fetchFreelancers();
    }, [selectedSkill, minRate, maxRate]);

    const fetchFreelancers = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/api/users/search?`;

            const params = [];
            if (selectedSkill && selectedSkill !== 'All Skills') {
                params.push(`skills=${encodeURIComponent(selectedSkill)}`);
            }
            if (minRate) {
                params.push(`minRate=${minRate}`);
            }
            if (maxRate) {
                params.push(`maxRate=${maxRate}`);
            }
            if (searchTerm) {
                params.push(`search=${encodeURIComponent(searchTerm)}`);
            }
            // Exclude current user if logged in
            if (user?.userId) {
                params.push(`excludeUserId=${user.userId}`);
            }

            url += params.join('&');

            const response = await axios.get(url);
            setFreelancers(response.data.freelancers || []);
        } catch (error) {
            console.error('Error fetching freelancers:', error);
            setFreelancers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchFreelancers();
    };

    return (
        <div className="min-h-screen bg-theme">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-3xl font-light text-gray-800 mb-1">Find Freelancers</h1>
                    <p className="text-sm text-gray-500 font-light">Discover talented professionals for your projects</p>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-theme rounded-lg border border-gray-100 p-5 mb-6"
                >
                    {/* Search Bar */}
                    <form onSubmit={handleSearch}>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name or skills..."
                                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-200 outline-none font-light"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-2.5 text-sm font-light rounded-lg transition border cursor-pointer ${showFilters
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                title="Toggle Filters"
                            >
                                <FiFilter size={16} />
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-green-600 text-white text-sm font-light rounded-lg hover:bg-green-700 transition cursor-pointer"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Filters - Collapsible */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100"
                        >
                            {/* Skill Filter */}
                            <div>
                                <label className="block text-xs font-light text-gray-600 mb-1.5">
                                    Skill
                                </label>
                                <select
                                    value={selectedSkill}
                                    onChange={(e) => setSelectedSkill(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-200 outline-none font-light"
                                >
                                    {popularSkills.map((skill) => (
                                        <option key={skill} value={skill === 'All Skills' ? '' : skill}>
                                            {skill}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Min Rate */}
                            <div>
                                <label className="block text-xs font-light text-gray-600 mb-1.5">
                                    Min Rate (₹/hr)
                                </label>
                                <input
                                    type="number"
                                    value={minRate}
                                    onChange={(e) => setMinRate(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-200 outline-none font-light"
                                />
                            </div>

                            {/* Max Rate */}
                            <div>
                                <label className="block text-xs font-light text-gray-600 mb-1.5">
                                    Max Rate (₹/hr)
                                </label>
                                <input
                                    type="number"
                                    value={maxRate}
                                    onChange={(e) => setMaxRate(e.target.value)}
                                    placeholder="Any"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-200 outline-none font-light"
                                />
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Freelancers Grid */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 text-sm font-light mt-3">Finding freelancers...</p>
                    </div>
                ) : freelancers.length === 0 ? (
                    <div className="text-center py-16 bg-theme rounded-lg border border-gray-100">
                        <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-700 font-light mb-1">No freelancers found</p>
                        <p className="text-xs text-gray-500 font-light">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {freelancers.map((freelancer, index) => (
                            <motion.div
                                key={freelancer._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.03, y: -5 }}
                                className="group"
                            >
                                <Link
                                    to={`/user/${freelancer.username}`}
                                    className="block bg-theme rounded-lg border border-gray-100 p-4 transition-all duration-300 h-60 flex flex-col relative overflow-hidden cursor-pointer group-hover:shadow-xl group-hover:border-gray-200"
                                >
                                    {/* Hover Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 via-gray-50/0 to-gray-100/0 group-hover:from-gray-50/50 group-hover:via-gray-50/30 group-hover:to-gray-100/50 transition-all duration-500 pointer-events-none" />

                                    {/* Content Container */}
                                    <div className="relative z-10 flex flex-col h-full">
                                        {/* Avatar and Name */}
                                        <motion.div
                                            className="text-center mb-3"
                                            initial={false}
                                            animate={{ y: 0 }}
                                            whileHover={{ y: -3 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {freelancer.avatar ? (
                                                <motion.img
                                                    src={freelancer.avatar}
                                                    alt={freelancer.name}
                                                    className="w-14 h-14 rounded-full mx-auto mb-2 object-cover border-2 border-gray-100 group-hover:border-gray-200 transition-all duration-300"
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                />
                                            ) : (
                                                <motion.div
                                                    className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-lg font-light mx-auto mb-2 border-2 border-gray-200 group-hover:border-gray-200 group-hover:bg-gray-200 transition-all duration-300"
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                >
                                                    {freelancer.name.charAt(0).toUpperCase()}
                                                </motion.div>
                                            )}
                                            <h3 className="text-sm font-light text-gray-800 group-hover:text-gray-600 transition-colors duration-300 truncate">
                                                {freelancer.name}
                                            </h3>
                                            {freelancer.location && (
                                                <motion.div
                                                    className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-1 group-hover:text-gray-600"
                                                    initial={{ opacity: 0.7 }}
                                                    whileHover={{ opacity: 1 }}
                                                >
                                                    <FiMapPin className="w-3 h-3" />
                                                    <span className="truncate font-light">{freelancer.location}</span>
                                                </motion.div>
                                            )}
                                        </motion.div>

                                        {/* Bio */}
                                        <div className="flex-grow">
                                            <motion.p
                                                className="text-gray-500 text-xs mb-3 line-clamp-2 text-center font-light group-hover:text-gray-700 transition-colors duration-300"
                                                initial={{ opacity: 0.8 }}
                                                whileHover={{ opacity: 1 }}
                                            >
                                                {freelancer.bio || 'No bio provided'}
                                            </motion.p>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-1 mb-3 justify-center">
                                                {freelancer.skills.slice(0, 3).map((skill, idx) => (
                                                    <motion.span
                                                        key={idx}
                                                        className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full font-light border border-gray-100 group-hover:bg-green-50 group-hover:text-green-700 group-hover:border-green-200 transition-all duration-300"
                                                        whileHover={{ scale: 1.05 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                    >
                                                        {skill}
                                                    </motion.span>
                                                ))}
                                                {freelancer.skills.length > 3 && (
                                                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full font-light border border-gray-100 group-hover:bg-green-50 group-hover:text-green-700 group-hover:border-green-200 transition-all duration-300">
                                                        +{freelancer.skills.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <motion.div
                                            className="pt-3 border-t border-gray-100 group-hover:border-green-200 transition-colors duration-300"
                                            initial={{ opacity: 1 }}
                                            whileHover={{ opacity: 1 }}
                                        >
                                            <div className="flex items-center justify-around text-center">
                                                {/* Rating */}
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <FiStar className="w-3 h-3 text-yellow-500 fill-current group-hover:scale-110 transition-transform duration-300" />
                                                        <span className="text-xs font-light text-gray-700 group-hover:text-green-700 group-hover:font-normal transition-all duration-300">
                                                            {freelancer.rating > 0 ? freelancer.rating.toFixed(1) : 'New'}
                                                        </span>
                                                    </div>
                                                </motion.div>

                                                {/* Rate */}
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <span className="text-xs font-light text-gray-700 group-hover:text-green-700 group-hover:font-normal transition-all duration-300">
                                                            ₹{freelancer.hourlyRate || 0}/hr
                                                        </span>
                                                    </div>
                                                </motion.div>

                                                {/* Projects */}
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <FiBriefcase className="w-3 h-3 text-gray-400 group-hover:text-green-600 transition-colors duration-300" />
                                                        <span className="text-xs font-light text-gray-700 group-hover:text-green-700 group-hover:font-normal transition-all duration-300">
                                                            {freelancer.completedProjects || 0}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </motion.div>

                                        {/* Hover Detail Overlay - appears on hover */}
                                        <motion.div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 via-white/90 to-transparent backdrop-blur-sm p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                            initial={{ y: 20 }}
                                            whileHover={{ y: 0 }}
                                        >
                                            <div className="text-center">
                                                <p className="text-xs text-green-600 font-light">
                                                    Click to view profile →
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
