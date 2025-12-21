import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineBriefcase,
    HiOutlineCurrencyDollar,
    HiOutlineEye,
    HiOutlineDocumentText,
    HiOutlineUser,
    HiOutlinePlusCircle,
    HiOutlineCog,
    HiOutlineInbox
} from 'react-icons/hi';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-theme">
            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-8 py-10">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl font-light text-gray-700 mb-2">
                        Welcome back, <span className="text-green-600">{user?.name}</span>
                    </h1>
                    <p className="text-sm text-gray-500 font-light">
                        Here's what's happening with your account today
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="bg-theme rounded-lg border border-gray-100 p-6 hover:border-gray-200 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                <HiOutlineBriefcase className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <h3 className="text-xs text-gray-500 font-light">Active Projects</h3>
                                <p className="text-2xl font-light text-gray-700">0</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 font-light">No active projects</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="bg-theme rounded-lg border border-gray-100 p-6 hover:border-gray-200 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <HiOutlineCurrencyDollar className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xs text-gray-500 font-light">Total Earnings</h3>
                                <p className="text-2xl font-light text-gray-700">₹0</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 font-light">Start earning today</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="bg-theme rounded-lg border border-gray-100 p-6 hover:border-gray-200 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                <HiOutlineEye className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <h3 className="text-xs text-gray-500 font-light">Profile Views</h3>
                                <p className="text-2xl font-light text-gray-700">0</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 font-light">Build your profile</p>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-theme rounded-lg border border-gray-100 p-8 mb-8"
                >
                    <h2 className="text-lg font-light text-gray-700 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/projects')}
                            className="p-5 rounded-lg border border-gray-100 hover:border-green-600 hover:bg-green-50/30 transition-all text-left group"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <HiOutlineDocumentText className="w-4 h-4 text-gray-500 group-hover:text-green-600" />
                                <h3 className="text-sm font-medium text-gray-700 group-hover:text-green-600">Browse Projects</h3>
                            </div>
                            <p className="text-xs text-gray-400 font-light">Find your next gig</p>
                        </button>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-5 rounded-lg border border-gray-100 hover:border-green-600 hover:bg-green-50/30 transition-all text-left group"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <HiOutlineUser className="w-4 h-4 text-gray-500 group-hover:text-green-600" />
                                <h3 className="text-sm font-medium text-gray-700 group-hover:text-green-600">Edit Profile</h3>
                            </div>
                            <p className="text-xs text-gray-400 font-light">Update your details</p>
                        </button>

                        <button
                            onClick={() => navigate('/post-project')}
                            className="p-5 rounded-lg border border-gray-100 hover:border-green-600 hover:bg-green-50/30 transition-all text-left group"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <HiOutlinePlusCircle className="w-4 h-4 text-gray-500 group-hover:text-green-600" />
                                <h3 className="text-sm font-medium text-gray-700 group-hover:text-green-600">Post a Job</h3>
                            </div>
                            <p className="text-xs text-gray-400 font-light">Hire talented freelancers</p>
                        </button>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-5 rounded-lg border border-gray-100 hover:border-green-600 hover:bg-green-50/30 transition-all text-left group"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <HiOutlineCog className="w-4 h-4 text-gray-500 group-hover:text-green-600" />
                                <h3 className="text-sm font-medium text-gray-700 group-hover:text-green-600">Settings</h3>
                            </div>
                            <p className="text-xs text-gray-400 font-light">Manage your account</p>
                        </button>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-theme rounded-lg border border-gray-100 p-8"
                >
                    <h2 className="text-lg font-light text-gray-700 mb-6">Recent Activity</h2>
                    <div className="text-center py-12">
                        <div className="w-12 h-12 bg-theme rounded-full flex items-center justify-center mx-auto mb-3">
                            <HiOutlineInbox className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 font-light mb-1">No recent activity</p>
                        <p className="text-xs text-gray-400 font-light">Your activity will appear here</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}