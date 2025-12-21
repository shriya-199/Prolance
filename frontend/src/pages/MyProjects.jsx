import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import {
    HiOutlineBriefcase,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineClock,
    HiOutlineChat,
    HiOutlinePlus
} from 'react-icons/hi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function MyProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, [filter]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            let url = `${API_BASE_URL}/api/projects/my/projects`;

            if (filter !== 'all') {
                url += `?status=${filter}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: token }
            });

            setProjects(response.data.projects || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`${API_BASE_URL}/api/projects/${projectId}`, {
                headers: { Authorization: token }
            });

            setProjects(projects.filter(p => p._id !== projectId));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'text-green-700 bg-green-50 border-green-200';
            case 'in-progress': return 'text-blue-700 bg-blue-50 border-blue-200';
            case 'completed': return 'text-gray-700 bg-gray-50 border-gray-200';
            case 'cancelled': return 'text-red-700 bg-red-50 border-red-200';
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    const stats = {
        total: projects.length,
        open: projects.filter(p => p.status === 'open').length,
        inProgress: projects.filter(p => p.status === 'in-progress').length,
        completed: projects.filter(p => p.status === 'completed').length,
        totalProposals: projects.reduce((acc, p) => acc + p.proposalCount, 0),
        totalViews: projects.reduce((acc, p) => acc + p.viewCount, 0)
    };

    return (
        <div className="min-h-screen bg-theme">
            <div className="max-w-6xl mx-auto px-8 py-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-light text-gray-700 mb-2">My Projects</h1>
                            <p className="text-sm text-gray-500 font-light">
                                Manage and track your posted projects
                            </p>
                        </div>
                        <Link
                            to="/post-project"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition font-light"
                        >
                            <HiOutlinePlus size={16} />
                            New Project
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="border border-gray-100 rounded-lg p-4">
                            <p className="text-2xl font-light text-gray-700">{stats.total}</p>
                            <p className="text-xs text-gray-500 font-light">Total Projects</p>
                        </div>
                        <div className="border border-gray-100 rounded-lg p-4">
                            <p className="text-2xl font-light text-green-600">{stats.open}</p>
                            <p className="text-xs text-gray-500 font-light">Open</p>
                        </div>
                        <div className="border border-gray-100 rounded-lg p-4">
                            <p className="text-2xl font-light text-gray-700">{stats.totalProposals}</p>
                            <p className="text-xs text-gray-500 font-light">Total Proposals</p>
                        </div>
                        <div className="border border-gray-100 rounded-lg p-4">
                            <p className="text-2xl font-light text-gray-700">{stats.totalViews}</p>
                            <p className="text-xs text-gray-500 font-light">Total Views</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'open', label: 'Open' },
                            { key: 'in-progress', label: 'In Progress' },
                            { key: 'completed', label: 'Completed' },
                            { key: 'cancelled', label: 'Cancelled' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-4 py-2 text-sm rounded-lg transition whitespace-nowrap font-light ${filter === tab.key
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Projects List */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500 mt-3 font-light">Loading projects...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 border border-gray-100 rounded-lg"
                    >
                        <HiOutlineBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 font-light mb-1">No projects found</p>
                        <p className="text-xs text-gray-400 font-light mb-4">
                            {filter === 'all' ? 'Get started by creating your first project' : `No ${filter} projects`}
                        </p>
                        {filter === 'all' && (
                            <Link
                                to="/post-project"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition font-light"
                            >
                                <HiOutlinePlus size={16} />
                                Create Project
                            </Link>
                        )}
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border border-gray-100 rounded-lg p-5 hover:border-gray-200 hover:bg-gray-50/30 transition-all group"
                            >
                                <div className="flex gap-4">
                                    {/* Thumbnail */}
                                    {project.thumbnail ? (
                                        <img
                                            src={project.thumbnail}
                                            alt={project.title}
                                            className="w-24 h-24 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
                                            <HiOutlineBriefcase className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <Link
                                                    to={`/projects/${project._id}`}
                                                    className="text-lg font-light text-gray-700 hover:text-green-600 transition line-clamp-1"
                                                >
                                                    {project.title}
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 text-xs rounded border font-light ${getStatusColor(project.status)}`}>
                                                        {project.status}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-md font-light">
                                                        {project.category}
                                                    </span>
                                                    {project.visibility === 'private' && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-md font-light">
                                                            <HiOutlineEyeOff size={12} />
                                                            Private
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                                <Link
                                                    to={`/projects/${project._id}`}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                                    title="View"
                                                >
                                                    <HiOutlineEye size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteConfirm(project._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <HiOutlineTrash size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 font-light line-clamp-2 mb-3">
                                            {project.description}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-400 font-light">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <HiOutlineClock size={14} />
                                                    {new Date(project.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <HiOutlineChat size={14} />
                                                    {project.proposalCount} proposals
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <HiOutlineEye size={14} />
                                                    {project.viewCount} views
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-700 font-light">
                                                ₹{project.budget.min.toLocaleString()} - ₹{project.budget.max.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-100"
                        >
                            <h3 className="text-lg font-light text-gray-700 mb-2">Delete Project?</h3>
                            <p className="text-sm text-gray-600 font-light mb-6">
                                This action cannot be undone. All proposals and data will be permanently deleted.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-light"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 px-4 py-2.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition font-light"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
