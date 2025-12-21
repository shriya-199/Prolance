import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    HiOutlineSearch,
    HiOutlineFilter,
    HiOutlineLocationMarker,
    HiOutlineClock,
    HiOutlineBriefcase,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineStar
} from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function BrowseProjects() {
    const { isAuthenticated, user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [trendingProjects, setTrendingProjects] = useState([]);
    const [bestMatchProjects, setBestMatchProjects] = useState([]);
    const [userSkills, setUserSkills] = useState([]);
    const [hasSkills, setHasSkills] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState('bestMatch'); // 'trending', 'bestMatch', 'all'
    const carouselRef = useRef(null);

    const categories = [
        'All Categories',
        'Programming & Tech',
        'Graphics & Design',
        'Digital Marketing',
        'Writing & Translation',
        'Video & Animation',
        'AI Services',
        'Music & Audio',
        'Business',
        'Consulting'
    ];

    useEffect(() => {
        fetchProjects();
        if (isAuthenticated) {
            fetchUserSettings();
            fetchTrendingProjects();
        }
    }, [selectedCategory, minBudget, maxBudget, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && userSkills.length > 0) {
            fetchBestMatches();
        }
    }, [userSkills, isAuthenticated]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/api/projects?status=open`;

            if (selectedCategory && selectedCategory !== 'All Categories') {
                url += `&category=${encodeURIComponent(selectedCategory)}`;
            }
            if (minBudget) {
                url += `&minBudget=${minBudget}`;
            }
            if (maxBudget) {
                url += `&maxBudget=${maxBudget}`;
            }
            if (searchTerm) {
                url += `&search=${encodeURIComponent(searchTerm)}`;
            }

            const response = await axios.get(url);
            setProjects(response.data.projects || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserSettings = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_BASE_URL}/api/settings`, {
                headers: { Authorization: token }
            });

            const primarySkills = response.data.settings?.skills?.primarySkills || [];
            const secondarySkills = response.data.settings?.skills?.secondarySkills || [];
            const allSkills = [...primarySkills, ...secondarySkills];

            setUserSkills(allSkills);
            setHasSkills(allSkills.length > 0);
        } catch (error) {
            console.error('Error fetching user settings:', error);
            setUserSkills([]);
            setHasSkills(false);
        }
    };

    const fetchTrendingProjects = async () => {
        try {
            const url = `${API_BASE_URL}/api/projects?status=open&limit=6`;
            const response = await axios.get(url);
            setTrendingProjects(response.data.projects || []);
        } catch (error) {
            console.error('Error fetching trending projects:', error);
        }
    };

    const fetchBestMatches = async () => {
        try {
            // Fetch all open projects
            const url = `${API_BASE_URL}/api/projects?status=open`;
            const response = await axios.get(url);
            const allProjects = response.data.projects || [];

            // Filter projects that match user skills
            const matchedProjects = allProjects.filter(project => {
                const projectSkills = project.skillsRequired || [];
                // Check if any project skill matches any user skill (case-insensitive)
                return projectSkills.some(projectSkill =>
                    userSkills.some(userSkill =>
                        projectSkill.toLowerCase().includes(userSkill.toLowerCase()) ||
                        userSkill.toLowerCase().includes(projectSkill.toLowerCase())
                    )
                );
            });

            // Sort by number of matching skills and take top 3
            const sortedMatches = matchedProjects.sort((a, b) => {
                const aMatches = a.skillsRequired.filter(skill =>
                    userSkills.some(userSkill =>
                        skill.toLowerCase().includes(userSkill.toLowerCase()) ||
                        userSkill.toLowerCase().includes(skill.toLowerCase())
                    )
                ).length;

                const bMatches = b.skillsRequired.filter(skill =>
                    userSkills.some(userSkill =>
                        skill.toLowerCase().includes(userSkill.toLowerCase()) ||
                        userSkill.toLowerCase().includes(skill.toLowerCase())
                    )
                ).length;

                return bMatches - aMatches;
            });

            setBestMatchProjects(sortedMatches.slice(0, 3));
        } catch (error) {
            console.error('Error fetching best matches:', error);
            setBestMatchProjects([]);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProjects();
    };

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = 350;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
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

    return (
        <div className="min-h-screen bg-theme">
            <div className="max-w-6xl mx-auto px-8 py-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-3xl font-light text-gray-700 mb-2">Explore Projects</h1>
                    <p className="text-sm text-gray-500 font-light">Discover opportunities that match your skills</p>
                </motion.div>

                {/* Search Bar */}
                <motion.form
                    onSubmit={handleSearch}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-3 mb-6"
                >
                    <div className="flex-1 relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search projects..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2.5 text-sm border rounded-lg transition cursor-pointer ${showFilters ? 'bg-green-50 text-green-700 border-green-200' : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        title="Filters"
                    >
                        <HiOutlineFilter size={18} />
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition cursor-pointer"
                        title="Search"
                    >
                        <HiOutlineSearch size={18} />
                    </button>
                </motion.form>

                {/* Filters Panel */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 pb-6 border-b border-gray-100"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-2 font-light">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-2 font-light">Min Budget (₹)</label>
                                <input
                                    type="number"
                                    value={minBudget}
                                    onChange={(e) => setMinBudget(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-2 font-light">Max Budget (₹)</label>
                                <input
                                    type="number"
                                    value={maxBudget}
                                    onChange={(e) => setMaxBudget(e.target.value)}
                                    placeholder="Any"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none font-light"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="flex gap-2 p-1 rounded-lg w-fit  ">
                        {isAuthenticated && (
                            <button
                                onClick={() => setActiveTab('bestMatch')}
                                className={`px-6 py-1 text-sm font-normal rounded-md transition-all cursor-pointer ${activeTab === 'bestMatch'
                                    ? 'bg-theme text-gray-800 shadow-lg border border-gray-200'
                                    : 'bg-transparent text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Best Match
                            </button>
                        )}
                        {isAuthenticated && (
                            <button
                                onClick={() => setActiveTab('trending')}
                                className={`px-6 py-1 text-sm font-normal rounded-md transition-all cursor-pointer ${activeTab === 'trending'
                                    ? 'bg-theme text-gray-800 shadow-lg border border-gray-200'
                                    : 'bg-transparent text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Trending
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-1 text-sm font-normal rounded-md transition-all cursor-pointer ${activeTab === 'all'
                                ? 'bg-theme text-gray-800 shadow-lg border border-gray-200'
                                : 'bg-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            All Projects
                        </button>
                    </div>
                </motion.div>

                {/* Tab Content */}
                <div>
                    {/* Trending Tab */}
                    {activeTab === 'trending' && isAuthenticated && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {trendingProjects.length === 0 ? (
                                <div className="text-center py-16 border border-gray-100 rounded-lg">
                                    <HiOutlineBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600 font-light">No trending projects available</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Carousel Navigation */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => scrollCarousel('left')}
                                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                                            >
                                                <HiOutlineChevronLeft size={18} className="text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => scrollCarousel('right')}
                                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                                            >
                                                <HiOutlineChevronRight size={18} className="text-gray-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Carousel */}
                                    <div
                                        ref={carouselRef}
                                        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {trendingProjects.map((project, index) => (
                                            <div key={project._id} className="flex-shrink-0 w-80">
                                                <ProjectCard project={project} index={index} getTimeSince={getTimeSince} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Best Match Tab */}
                    {activeTab === 'bestMatch' && isAuthenticated && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {!hasSkills ? (
                                <div className="border border-gray-200 bg-theme rounded-lg p-8 text-center">
                                    <HiOutlineStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-base text-gray-700 font-light mb-4">
                                        Please specify your skills to see personalized project matches
                                    </p>
                                    <Link
                                        to="/settings"
                                        className="inline-flex items-center gap-2 px-4 py-1  text-sm rounded-xl border border-gray-200 hover:bg-gray-100 transition font-light cursor-pointer"
                                    >
                                        <HiOutlineStar size={16} />
                                        Go to Settings
                                    </Link>
                                </div>
                            ) : bestMatchProjects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {bestMatchProjects.map((project, index) => (
                                        <ProjectCard key={project._id} project={project} index={index} getTimeSince={getTimeSince} highlight />
                                    ))}
                                </div>
                            ) : (
                                <div className="border border-gray-200 bg-gray-50 rounded-lg p-8 text-center">
                                    <HiOutlineBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-base text-gray-600 font-light mb-2">
                                        No matching projects found
                                    </p>
                                    <p className="text-sm text-gray-400 font-light">
                                        Try updating your skills in settings to see more relevant projects
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* All Projects Tab */}
                    {activeTab === 'all' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {loading ? (
                                <div className="text-center py-16">
                                    <div className="inline-block w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-gray-500 mt-3 font-light">Loading projects...</p>
                                </div>
                            ) : projects.length === 0 ? (
                                <div className="text-center py-16 border border-gray-100 rounded-lg">
                                    <HiOutlineBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600 font-light mb-1">No projects found</p>
                                    <p className="text-xs text-gray-400 font-light">Try adjusting your filters</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {projects.map((project, index) => (
                                        <motion.div
                                            key={project._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                        >
                                            <Link
                                                to={`/projects/${project._id}`}
                                                className="flex border border-gray-100 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-md transition-all bg-theme group"
                                            >
                                                {/* Thumbnail */}
                                                {project.thumbnail ? (
                                                    <img
                                                        src={project.thumbnail}
                                                        alt={project.title}
                                                        className="w-48 h-36 object-cover bg-gray-100 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-48 h-36 bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center flex-shrink-0">
                                                        <HiOutlineBriefcase size={32} className="text-gray-300" />
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="flex-1 p-4 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex-1">
                                                                <h3 className="text-base font-normal text-gray-800 mb-1.5 line-clamp-1 group-hover:text-green-600 transition">
                                                                    {project.title}
                                                                </h3>
                                                                <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-md font-light">
                                                                    {project.category}
                                                                </span>
                                                            </div>
                                                            <div className="text-right ml-4">
                                                                <div className="text-base font-normal text-gray-800">
                                                                    ₹{project.budget.min.toLocaleString()}+
                                                                </div>
                                                                <div className="text-xs text-gray-400 font-light">{project.budget.type}</div>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 line-clamp-2 font-light mb-3">
                                                            {project.description}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {project.skillsRequired.slice(0, 4).map((skill, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded border border-gray-100 font-light"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {project.skillsRequired.length > 4 && (
                                                                <span className="px-2 py-0.5 text-gray-400 text-xs font-light">
                                                                    +{project.skillsRequired.length - 4}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-gray-400 font-light ml-4">
                                                            <div className="flex items-center gap-1">
                                                                <HiOutlineClock size={14} />
                                                                {getTimeSince(project.createdAt)}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <HiOutlineLocationMarker size={14} />
                                                                {project.proposalCount} proposals
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Reusable Project Card Component
function ProjectCard({ project, index, getTimeSince, highlight = false }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
        >
            <Link
                to={`/projects/${project._id}`}
                className={`block border rounded-lg overflow-hidden hover:shadow-md transition-all h-full ${highlight ? 'border-green-200 bg-green-50/30 hover:border-green-300' : 'border-gray-100 hover:border-gray-200'
                    }`}
            >
                {/* Thumbnail */}
                {project.thumbnail ? (
                    <img
                        src={project.thumbnail}
                        alt={project.title}
                        className={`w-full object-cover bg-gray-100 ${highlight ? 'h-28' : 'h-40'}`}
                    />
                ) : (
                    <div className={`w-full flex items-center justify-center ${highlight
                        ? 'h-28 bg-gradient-to-br from-green-100 to-gray-50'
                        : 'h-40 bg-gradient-to-br from-gray-50 to-green-50'
                        }`}>
                        <HiOutlineBriefcase size={highlight ? 28 : 36} className="text-gray-300" />
                    </div>
                )}

                <div className={highlight ? 'p-3' : 'p-4'}>
                    <div className={highlight ? 'mb-2' : 'mb-3'}>
                        <h3 className={`font-light mb-1.5 line-clamp-2 transition ${highlight
                            ? 'text-sm min-h-[2.5rem] text-gray-800 hover:text-green-700'
                            : 'text-base min-h-[3rem] text-gray-700 hover:text-green-600'
                            }`}>
                            {project.title}
                        </h3>
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-md font-light ${highlight ? 'bg-green-100 text-green-700' : 'bg-green-50 text-green-700'
                            }`}>
                            {project.category}
                        </span>
                    </div>

                    <p className={`text-gray-600 line-clamp-2 font-light ${highlight ? 'text-xs mb-2 min-h-[2rem]' : 'text-sm mb-3 min-h-[2.5rem]'
                        }`}>
                        {project.description}
                    </p>

                    <div className={`flex flex-wrap gap-1.5 min-h-[1.5rem] ${highlight ? 'mb-2' : 'mb-3'}`}>
                        {project.skillsRequired.slice(0, 3).map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded border border-gray-100 font-light"
                            >
                                {skill}
                            </span>
                        ))}
                        {project.skillsRequired.length > 3 && (
                            <span className="px-2 py-0.5 text-gray-400 text-xs font-light">
                                +{project.skillsRequired.length - 3}
                            </span>
                        )}
                    </div>

                    <div className={`border-t border-gray-100 ${highlight ? 'pt-2' : 'pt-3'}`}>
                        <div className={`flex justify-between items-center ${highlight ? 'mb-1.5' : 'mb-2'}`}>
                            <div className={`font-light text-gray-700 ${highlight ? 'text-sm' : 'text-base'}`}>
                                ₹{project.budget.min.toLocaleString()}+
                            </div>
                            <div className="text-xs text-gray-400 font-light">{project.budget.type}</div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400 font-light">
                            <div className="flex items-center gap-1">
                                <HiOutlineClock size={12} />
                                {getTimeSince(project.createdAt)}
                            </div>
                            <div>
                                {project.proposalCount} proposals
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
