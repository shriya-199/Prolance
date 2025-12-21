import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProjectNotifications } from "../../hooks/useProjectNotifications";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import {
  HiOutlineHome,
  HiOutlineSearch,
  HiOutlinePlusCircle,
  HiOutlineFolderOpen,
  HiOutlineChatAlt2,
  HiOutlineQuestionMarkCircle,
  HiOutlineLogin,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineClock,
  HiOutlineBriefcase
} from "react-icons/hi";

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { notificationCount, recentProjects, newProjectIds, markAsSeen } = useProjectNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const { theme, toggleTheme } = useTheme();


  // Helper function to check if a path is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.get(`${API_URL}/api/settings`, {
            headers: { Authorization: token }
          });
          setUserProfile(response.data.settings);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    if (isDropdownOpen || isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isNotificationOpen]);

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen && notificationCount > 0) {
      // Mark as seen when opening notifications
      setTimeout(() => markAsSeen(), 500);
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
    <nav className="sticky top-0 w-full px-8 py-3 flex items-center justify-between bg-theme border border-theme z-50 rounded-full outline-1 outline-gray-100 ">

      {/* LEFT: LOGO */}
      <Link to="/" className="flex items-center gap-2 cursor-pointer">
        <h1 className="text-xl font-light tracking-wide flex items-center">
          <span className="text-green-600">Pro</span>
          <span className="text-gray-700">&lt;lance&gt;</span>
        </h1>
      </Link>

      {/* CENTER MENU */}
      <div className="flex items-center gap-8 text-gray-600 text-sm font-light">

        {/* HOME */}
        <Link
          to="/"
          className={`flex items-center gap-1.5 hover:text-green-600 transition cursor-pointer ${isActive('/') ? 'text-green-600' : ''
            }`}
        >
          <HiOutlineHome size={16} />
          <span>Home</span>
        </Link>

        {/* EXPLORE PROJECTS - Only show for freelancers and both roles */}
        {(!isAuthenticated || user?.role === 'freelancer' || user?.role === 'both') && (
          <Link
            to="/projects"
            className={`flex items-center gap-1.5 hover:text-green-600 transition cursor-pointer ${isActive('/projects') ? 'text-green-600' : ''
              }`}
          >
            <HiOutlineSearch size={16} />
            <span>Explore</span>
          </Link>
        )}

        {/* FIND FREELANCERS - Only show for clients and both roles */}
        {isAuthenticated && (user?.role === 'client' || user?.role === 'both') && (
          <Link
            to="/freelancers"
            className={`flex items-center gap-1.5 hover:text-green-600 transition cursor-pointer ${isActive('/freelancers') ? 'text-green-600' : ''
              }`}
          >
            <HiOutlineUser size={16} />
            <span>Freelancers</span>
          </Link>
        )}

        {/* POST PROJECT - Only show for clients and both roles */}
        {isAuthenticated && (user?.role === 'client' || user?.role === 'both') && (
          <Link
            to="/post-project"
            className={`flex items-center gap-1.5 hover:text-green-600 transition cursor-pointer ${isActive('/post-project') ? 'text-green-600' : ''
              }`}
          >
            <HiOutlinePlusCircle size={16} />
            <span>Project</span>
          </Link>
        )}

        {/* MY PROJECTS - Only show for clients and both roles */}
        {isAuthenticated && (user?.role === 'client' || user?.role === 'both') && (
          <Link
            to="/my-projects"
            className={`flex items-center gap-1.5 hover:text-green-600 transition cursor-pointer ${isActive('/my-projects') ? 'text-green-600' : ''
              }`}
          >
            <HiOutlineFolderOpen size={16} />
            <span>My Projects</span>
          </Link>
        )}

        {/* MESSAGES - Only show when authenticated */}
        {isAuthenticated && (
          <Link
            to="/messages"
            className={`flex items-center gap-1.5 hover:text-green-600 transition cursor-pointer ${isActive('/messages') ? 'text-green-600' : ''
              }`}
          >
            <HiOutlineChatAlt2 size={16} />
            <span>Messages</span>
          </Link>
        )}

        {/* SUPPORT */}
        <Link
          to="/support"
          className={`flex items-center gap-1.5 hover:text-green-600 transition cursor-pointer ${isActive('/support') ? 'text-green-600' : ''
            }`}
        >
          <HiOutlineQuestionMarkCircle size={16} />
          <span>Support</span>
        </Link>

      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleNotificationClick}
                className="relative text-gray-600 hover:text-green-600 transition cursor-pointer"
                title="Notifications"
              >
                <HiOutlineBell size={18} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700">
                      Recent Projects {notificationCount > 0 && `(${notificationCount} new)`}
                    </h3>
                  </div>

                  {recentProjects.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <HiOutlineBell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-light">No projects available</p>
                    </div>
                  ) : (
                    <div className="py-1">
                      {recentProjects.map((project) => {
                        const isNew = newProjectIds.includes(project._id);
                        return (
                          <Link
                            key={project._id}
                            to={`/projects/${project._id}`}
                            onClick={() => setIsNotificationOpen(false)}
                            className={`block px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${isNew ? 'bg-green-50/30' : ''
                              }`}
                          >
                            <div className="flex gap-3">
                              <div className="relative">
                                {project.thumbnail ? (
                                  <img
                                    src={project.thumbnail}
                                    alt={project.title}
                                    className="w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-gray-50 rounded flex items-center justify-center flex-shrink-0">
                                    <HiOutlineBriefcase size={20} className="text-gray-400" />
                                  </div>
                                )}
                                {isNew && (
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-light line-clamp-1 mb-1 ${isNew ? 'text-gray-900 font-normal' : 'text-gray-700'
                                  }`}>
                                  {project.title}
                                </h4>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-green-600 font-light">
                                    ₹{project.budget.min.toLocaleString()}+
                                  </span>
                                  <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <HiOutlineClock size={12} />
                                    {getTimeSince(project.createdAt)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition cursor-pointer"
              >
                {userProfile?.profile?.avatar ? (
                  <img
                    src={userProfile.profile.avatar}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border border-gray-200">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-light">{user?.name?.split(' ')[0]}</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-sm py-2 z-50">
                  <Link
                    to={user?.username ? `/user/${user.username}` : '/settings'}
                    onClick={() => {
                      console.log('User object:', user);
                      console.log('Username:', user?.username);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-green-600 transition"
                  >
                    <HiOutlineUser size={16} />
                    <span>{user?.username ? 'My Profile' : 'Set Username'}</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-green-600 transition"
                  >
                    <HiOutlineBriefcase size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-green-600 transition"
                  >
                    <HiOutlineCog size={16} />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-green-600 transition"
                  >
                    <HiOutlineLogout size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition cursor-pointer"
          >
            <HiOutlineLogin size={16} />
            <span>Login</span>
          </Link>
        )}
        <button onClick={toggleTheme}>
      {theme === "light" ? "🌙" : "☀️"}
    </button>
      </div>

    </nav>
  );
}
