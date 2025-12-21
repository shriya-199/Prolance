import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import axios from 'axios';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import TimezoneSelect from 'react-timezone-select';
import {
    HiOutlineUser,
    HiOutlineBriefcase,
    HiOutlineLockClosed,
    HiOutlineBell,
    HiOutlineCreditCard,
    HiOutlineEye,
    HiPencil,
    HiCheck,
    HiX
} from 'react-icons/hi';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Custom styles for react-select
const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: 'white',
        borderColor: state.isFocused ? 'rgb(22, 163, 74)' : 'rgb(229, 231, 235)',
        borderWidth: '1px',
        borderRadius: '0.5rem',
        padding: '0.375rem 0.5rem',
        fontSize: '0.875rem',
        fontWeight: '300',
        boxShadow: 'none',
        minHeight: 'auto',
        transition: 'all 200ms',
        '&:hover': {
            borderColor: state.isFocused ? 'rgb(22, 163, 74)' : 'rgb(229, 231, 235)',
        }
    }),
    valueContainer: (provided) => ({ ...provided, padding: '0' }),
    input: (provided) => ({ ...provided, margin: '0', padding: '0', fontSize: '0.875rem', fontWeight: '300' }),
    placeholder: (provided) => ({ ...provided, fontSize: '0.875rem', fontWeight: '300', color: 'rgb(156, 163, 175)' }),
    singleValue: (provided) => ({ ...provided, fontSize: '0.875rem', fontWeight: '300' }),
    menu: (provided) => ({ ...provided, borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }),
    menuList: (provided) => ({ ...provided, padding: '0' }),
    option: (provided, state) => ({
        ...provided,
        fontSize: '0.875rem',
        fontWeight: '300',
        backgroundColor: state.isSelected ? 'rgb(220, 252, 231)' : state.isFocused ? 'rgb(243, 244, 246)' : 'white',
        color: state.isSelected ? 'rgb(21, 128, 61)' : 'rgb(31, 41, 55)',
        cursor: 'pointer'
    }),
    dropdownIndicator: (provided) => ({ ...provided, padding: '0 4px', color: 'rgb(156, 163, 175)' }),
    indicatorSeparator: () => ({ display: 'none' }),
};

export default function Settings() {
    const [activeSection, setActiveSection] = useState('profile');
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    const sections = [
        { id: 'profile', name: 'Profile Information', icon: HiOutlineUser },
        { id: 'skills', name: 'Skills & Professional', icon: HiOutlineBriefcase },
        { id: 'security', name: 'Account Security', icon: HiOutlineLockClosed },
        { id: 'notifications', name: 'Notifications', icon: HiOutlineBell },
        { id: 'privacy', name: 'Privacy & Visibility', icon: HiOutlineEye }
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/api/settings`, {
                headers: { Authorization: token }
            });
            setSettings(response.data.settings);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-theme flex items-center justify-center">
                <p className="text-gray-500 font-light">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-theme">
            <div className="max-w-7xl mx-auto px-8 py-10">
                <div className="flex gap-8">
                    {/* Left Sidebar */}
                    <div className="w-64 flex-shrink-0">
                        <nav className="space-y-1">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all cursor-pointer ${activeSection === section.id
                                            ? 'bg-green-50 text-green-700 border border-green-100'
                                            : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span className="font-light">{section.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1">
                        {activeSection === 'profile' && <ProfileSection settings={settings} onUpdate={fetchSettings} />}
                        {activeSection === 'skills' && <SkillsSection settings={settings} onUpdate={fetchSettings} />}
                        {activeSection === 'security' && <SecuritySection />}
                        {activeSection === 'notifications' && <NotificationsSection settings={settings} onUpdate={fetchSettings} />}
                        {activeSection === 'privacy' && <PrivacySection settings={settings} onUpdate={fetchSettings} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable EditableField component
function EditableField({ label, value, onSave, type = 'text', placeholder, isEditing, onEditToggle, disabled = false }) {
    const [editValue, setEditValue] = useState(value || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setEditValue(value || '');
    }, [value]);

    const handleSave = async () => {
        setSaving(true);
        await onSave(editValue);
        setSaving(false);
        onEditToggle(false);
    };

    const handleCancel = () => {
        setEditValue(value || '');
        onEditToggle(false);
    };

    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 gap-3">
                    <p className="text-sm text-left text-gray-600 font-light w-[140px]">{label}</p>
                    <span className="text-sm text-gray-600 font-light">:</span>
                    {!isEditing ? (
                        <p className="text-sm text-left text-gray-700 font-light">{value || <span className="text-gray-400">Not set</span>}</p>
                    ) : (
                        <input
                            type={type}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-green-600 focus:outline-none transition-all font-light"
                            autoFocus
                        />
                    )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                    {!isEditing ? (
                        !disabled && (
                            <button
                                onClick={() => onEditToggle(true)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                            >
                                <HiPencil size={16} />
                            </button>
                        )
                    ) : (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                            >
                                <HiCheck size={16} />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                <HiX size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Profile Section
function ProfileSection({ settings, onUpdate }) {
    const [editingField, setEditingField] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoOperation, setPhotoOperation] = useState(null); // 'uploading', 'removing', or null
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const countryOptions = useMemo(() => countryList().getData(), []);

    useEffect(() => {
        if (settings?.profile?.avatar) {
            setPhotoPreview(settings.profile.avatar);
        }
    }, [settings]);

    const updateField = async (field, value) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`${API_URL}/api/settings/profile`, { [field]: value }, {
                headers: { Authorization: token }
            });
            setMessage('Updated successfully!');
            setIsSuccess(true);
            setTimeout(() => setMessage(''), 2000);
            onUpdate();
        } catch (error) {
            setMessage('Failed to update');
            setIsSuccess(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setMessage('File size must be less than 5MB');
            return;
        }

        setPhotoOperation('uploading');
        try {
            const token = localStorage.getItem('authToken');
            const formData = new FormData();
            formData.append('photo', file);

            await axios.post(`${API_URL}/api/upload/upload`, formData, {
                headers: { Authorization: token, 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Photo uploaded successfully!');
            setIsSuccess(true);
            onUpdate();
        } catch (error) {
            setMessage('Failed to upload photo');
            setIsSuccess(false);
        } finally {
            setPhotoOperation(null);
        }
    };

    const handlePhotoRemove = async () => {
        if (!window.confirm('Are you sure you want to remove your profile photo?')) {
            return;
        }

        setPhotoOperation('removing');
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`${API_URL}/api/upload/photo`, {
                headers: { Authorization: token }
            });

            setPhotoPreview(null);
            setMessage('Photo removed successfully!');
            setIsSuccess(true);
            onUpdate();
        } catch (error) {
            setMessage('Failed to remove photo');
            setIsSuccess(false);
        } finally {
            setPhotoOperation(null);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {message && (
                <div className={`p-3 rounded-lg text-sm font-light ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            {/* Profile Photo Card */}
            <div className="p-4 bg-theme border border-gray-100 rounded-lg">
                <div className="flex items-center gap-4">
                    {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-theme border-2 border-gray-200 flex items-center justify-center">
                            <HiOutlineUser size={24} className="text-gray-400" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-700">{settings?.profile?.name || 'User'}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">@{settings?.profile?.username || 'username'}</p>
                    </div>
                    <div className="flex gap-2">
                        <input type="file" id="photo-upload" onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                        <label htmlFor="photo-upload" className={`px-3 py-1.5 text-xs border border-gray-200 bg-theme rounded-lg hover:bg-gray-50 transition font-light cursor-pointer inline-block ${photoOperation ? 'opacity-50 pointer-events-none' : ''}`}>
                            {photoOperation === 'uploading' ? 'Uploading...' : 'Change'}
                        </label>
                        {photoPreview && (
                            <button
                                onClick={handlePhotoRemove}
                                disabled={photoOperation !== null}
                                className="px-3 py-1.5 text-xs border border-red-200 bg-theme text-red-600 rounded-lg hover:bg-red-50 transition font-light cursor-pointer disabled:opacity-50"
                            >
                                {photoOperation === 'removing' ? 'Removing...' : 'Remove'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Basic Info - 2 Column Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Name Card */}
                <div className="p-3 bg-theme border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 gap-3 min-w-0">
                            <p className="text-sm text-left text-gray-600 font-light w-[140px]">Full Name</p>
                            <span className="text-sm text-gray-600 font-light">:</span>
                            {editingField !== 'name' ? (
                                <p className="text-sm text-gray-700 font-light truncate">{settings?.profile?.name || <span className="text-gray-400">Not set</span>}</p>
                            ) : (
                                <input
                                    type="text"
                                    defaultValue={settings?.profile?.name}
                                    id="name-input"
                                    className="flex-1 px-2 py-1 text-sm rounded border border-gray-200 focus:border-green-600 focus:outline-none font-light"
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                            {editingField !== 'name' ? (
                                <button onClick={() => setEditingField('name')} className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition cursor-pointer">
                                    <HiPencil size={14} />
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            updateField('name', document.getElementById('name-input').value);
                                            setEditingField(null);
                                        }}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded transition cursor-pointer"
                                    >
                                        <HiCheck size={14} />
                                    </button>
                                    <button
                                        onClick={() => setEditingField(null)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                    >
                                        <HiX size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Username Card */}
                <div className="p-3 bg-theme border border-gray-100 rounded-lg">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-left text-gray-600 font-light w-[140px]">Username {!settings?.profile?.username && <span className="text-red-500">*</span>}</p>
                                <span className="text-sm text-gray-600 font-light">:</span>
                                {editingField !== 'username' ? (
                                    <p className="text-sm text-gray-700 font-light truncate">{settings?.profile?.username || <span className="text-red-400">Not set - Required!</span>}</p>
                                ) : (
                                    <input
                                        type="text"
                                        defaultValue={settings?.profile?.username}
                                        id="username-input"
                                        placeholder="username123"
                                        className="flex-1 px-2 py-1 text-sm rounded border border-gray-200 focus:border-green-600 focus:outline-none font-light lowercase"
                                        autoFocus
                                        onChange={(e) => {
                                            // Convert to lowercase automatically
                                            e.target.value = e.target.value.toLowerCase();
                                        }}
                                    />
                                )}
                            </div>
                            {editingField === 'username' && (
                                <p className="text-xs text-gray-400 font-light mt-1 ml-[152px]">3-20 characters, lowercase letters, numbers, - and _ only</p>
                            )}
                            {!settings?.profile?.username && editingField !== 'username' && (
                                <p className="text-xs text-red-500 font-light mt-1 ml-[152px]">Please set a username to complete your profile</p>
                            )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                            {editingField !== 'username' ? (
                                <button onClick={() => setEditingField('username')} className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition cursor-pointer">
                                    <HiPencil size={14} />
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            const value = document.getElementById('username-input').value;
                                            // Validate before saving
                                            if (!value) {
                                                setMessage('Username is required');
                                                setIsSuccess(false);
                                                return;
                                            }
                                            if (!/^[a-z0-9_-]+$/.test(value)) {
                                                setMessage('Invalid username format');
                                                setIsSuccess(false);
                                                return;
                                            }
                                            if (value.length < 3 || value.length > 20) {
                                                setMessage('Username must be 3-20 characters');
                                                setIsSuccess(false);
                                                return;
                                            }
                                            updateField('username', value);
                                            setEditingField(null);
                                        }}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded transition cursor-pointer"
                                    >
                                        <HiCheck size={14} />
                                    </button>
                                    <button
                                        onClick={() => setEditingField(null)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                    >
                                        <HiX size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Email Card - Read Only */}
                <div className="p-3 bg-theme border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 gap-3 min-w-0">
                            <p className="text-sm text-left text-gray-600 font-light w-[140px]">Email</p>
                            <span className="text-sm text-gray-600 font-light">:</span>
                            <p className="text-sm text-gray-700 font-light truncate">{settings?.profile?.email || <span className="text-gray-400">Not set</span>}</p>
                        </div>
                        <div className="p-1 text-gray-300 ml-2">
                            <HiOutlineLockClosed size={14} />
                        </div>
                    </div>
                </div>

                {/* Role Card */}
                <div className="p-3 bg-theme border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 gap-3 min-w-0">
                            <p className="text-sm text-left text-gray-600 font-light w-[140px]">Account Role</p>
                            <span className="text-sm text-gray-600 font-light">:</span>
                            {editingField !== 'role' ? (
                                <p className="text-sm text-gray-700 font-light capitalize truncate">{settings?.profile?.role || <span className="text-gray-400">Not set</span>}</p>
                            ) : (
                                <select
                                    defaultValue={settings?.profile?.role}
                                    id="role-input"
                                    className="flex-1 px-2 py-1 text-sm rounded border border-gray-200 focus:border-green-600 focus:outline-none font-light bg-theme cursor-pointer"
                                    autoFocus
                                >
                                    <option value="freelancer">Freelancer</option>
                                    <option value="client">Client</option>
                                    <option value="both">Both</option>
                                </select>
                            )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                            {editingField !== 'role' ? (
                                <button onClick={() => setEditingField('role')} className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition cursor-pointer">
                                    <HiPencil size={14} />
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            updateField('role', document.getElementById('role-input').value);
                                            setEditingField(null);
                                        }}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded transition cursor-pointer"
                                    >
                                        <HiCheck size={14} />
                                    </button>
                                    <button
                                        onClick={() => setEditingField(null)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                    >
                                        <HiX size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Location Card */}
                <div className="p-3 bg-theme border border-gray-100 rounded-lg">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-left text-gray-600 font-light w-[140px]">Location</p>
                                <span className="text-sm text-gray-600 font-light">:</span>
                                {editingField !== 'location' ? (
                                    <p className="text-sm text-gray-700 font-light truncate">{settings?.profile?.location || <span className="text-gray-400">Not set</span>}</p>
                                ) : (
                                    <div className="flex-1">
                                        <Select
                                            options={countryOptions}
                                            value={countryOptions.find(c => c.label === settings?.profile?.location)}
                                            onChange={(selectedOption) => {
                                                // Store the selected country in a temporary state
                                                document.getElementById('location-select-value').value = selectedOption?.label || '';
                                            }}
                                            styles={customSelectStyles}
                                            placeholder="Select country..."
                                            isClearable
                                            isSearchable
                                            className="text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                            <input type="hidden" id="location-select-value" defaultValue={settings?.profile?.location} />
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                            {editingField !== 'location' ? (
                                <button onClick={() => setEditingField('location')} className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition cursor-pointer">
                                    <HiPencil size={14} />
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            const value = document.getElementById('location-select-value').value;
                                            updateField('location', value);
                                            setEditingField(null);
                                        }}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded transition cursor-pointer"
                                    >
                                        <HiCheck size={14} />
                                    </button>
                                    <button
                                        onClick={() => setEditingField(null)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                    >
                                        <HiX size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio - Full Width */}
            <div className="p-3 bg-theme border border-gray-100 rounded-lg">
                <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1 gap-3">
                        <p className="text-sm text-left text-gray-600 font-light w-[140px]">Bio</p>
                        <span className="text-sm text-gray-600 font-light">:</span>
                        {editingField !== 'bio' ? (
                            <p className="text-sm text-gray-700 font-light flex-1">{settings?.profile?.bio || <span className="text-gray-400">Not set</span>}</p>
                        ) : (
                            <textarea
                                defaultValue={settings?.profile?.bio}
                                id="bio-input"
                                rows="2"
                                className="flex-1 px-2 py-1 text-sm rounded border border-gray-200 focus:border-green-600 focus:outline-none font-light resize-none"
                                autoFocus
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                        {editingField !== 'bio' ? (
                            <button onClick={() => setEditingField('bio')} className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition cursor-pointer">
                                <HiPencil size={14} />
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        updateField('bio', document.getElementById('bio-input').value);
                                        setEditingField(null);
                                    }}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition cursor-pointer"
                                >
                                    <HiCheck size={14} />
                                </button>
                                <button
                                    onClick={() => setEditingField(null)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                >
                                    <HiX size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Timezone - Single Card */}
            <div className="p-3 bg-theme border border-gray-100 rounded-lg">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-left text-gray-600 font-light w-[140px]">Timezone</p>
                            <span className="text-sm text-gray-600 font-light">:</span>
                            {editingField !== 'timezone' ? (
                                <p className="text-sm text-gray-700 font-light">{settings?.profile?.timezone || <span className="text-gray-400">Not set</span>}</p>
                            ) : (
                                <div className="flex-1">
                                    <TimezoneSelect
                                        value={settings?.profile?.timezone || ''}
                                        onChange={(tz) => {
                                            // Store the timezone value (e.g., "America/New_York")
                                            document.getElementById('timezone-select-value').value = typeof tz === 'string' ? tz : tz.value;
                                        }}
                                        styles={customSelectStyles}
                                        placeholder="Select timezone..."
                                    />
                                </div>
                            )}
                        </div>
                        <input type="hidden" id="timezone-select-value" defaultValue={settings?.profile?.timezone} />
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                        {editingField !== 'timezone' ? (
                            <button onClick={() => setEditingField('timezone')} className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition cursor-pointer">
                                <HiPencil size={14} />
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        const value = document.getElementById('timezone-select-value').value;
                                        updateField('timezone', value);
                                        setEditingField(null);
                                    }}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition cursor-pointer"
                                >
                                    <HiCheck size={14} />
                                </button>
                                <button
                                    onClick={() => setEditingField(null)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                >
                                    <HiX size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Skills Section
function SkillsSection({ settings, onUpdate }) {
    const [editingField, setEditingField] = useState(null);
    const [message, setMessage] = useState('');

    const updateField = async (field, value) => {
        try {
            const token = localStorage.getItem('authToken');
            const payload = field === 'primarySkills' || field === 'secondarySkills'
                ? { [field]: value.split(',').map(s => s.trim()).filter(Boolean) }
                : { [field]: field === 'hourlyRate' ? Number(value) : value };

            await axios.put(`${API_URL}/api/settings/skills`, payload, {
                headers: { Authorization: token }
            });
            setMessage('Updated successfully!');
            setTimeout(() => setMessage(''), 2000);
            onUpdate();
        } catch (error) {
            setMessage('Failed to update');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {message && <div className="p-3 rounded-lg text-sm font-light bg-green-50 text-green-700">{message}</div>}

            <div className="space-y-0">
                <EditableField
                    label="Primary Skills"
                    value={settings?.skills?.primarySkills?.join(', ')}
                    onSave={(value) => updateField('primarySkills', value)}
                    isEditing={editingField === 'primarySkills'}
                    onEditToggle={(editing) => setEditingField(editing ? 'primarySkills' : null)}
                    placeholder="React, Node.js, TypeScript"
                />
                <EditableField
                    label="Secondary Skills"
                    value={settings?.skills?.secondarySkills?.join(', ')}
                    onSave={(value) => updateField('secondarySkills', value)}
                    isEditing={editingField === 'secondarySkills'}
                    onEditToggle={(editing) => setEditingField(editing ? 'secondarySkills' : null)}
                    placeholder="Python, AWS, Docker"
                />
                <EditableField
                    label="Experience Level"
                    value={settings?.skills?.experienceLevel}
                    onSave={(value) => updateField('experienceLevel', value)}
                    isEditing={editingField === 'experienceLevel'}
                    onEditToggle={(editing) => setEditingField(editing ? 'experienceLevel' : null)}
                    placeholder="beginner, intermediate, expert"
                />
                <EditableField
                    label="Hourly Rate (₹)"
                    value={settings?.skills?.hourlyRate}
                    type="number"
                    onSave={(value) => updateField('hourlyRate', value)}
                    isEditing={editingField === 'hourlyRate'}
                    onEditToggle={(editing) => setEditingField(editing ? 'hourlyRate' : null)}
                    placeholder="1500"
                />
            </div>
        </motion.div>
    );
}

// Security Section
function SecuritySection() {
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`${API_URL}/api/settings/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, { headers: { Authorization: token } });

            setMessage('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {message && <div className="p-3 rounded-lg text-sm font-light bg-red-50 text-red-700">{message}</div>}

            <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="text-sm font-light text-gray-700 mb-4">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                    <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Current password"
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-green-600 focus:outline-none font-light"
                        required
                    />
                    <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="New password"
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-green-600 focus:outline-none font-light"
                        required
                    />
                    <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-green-600 focus:outline-none font-light"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-light disabled:opacity-50"
                    >
                        {loading ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}

// Notifications Section
function NotificationsSection({ settings, onUpdate }) {
    const [message, setMessage] = useState('');

    const handleToggle = async (field, value) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`${API_URL}/api/settings/notifications`, { [field]: !value }, {
                headers: { Authorization: token }
            });
            setMessage('Updated successfully!');
            setTimeout(() => setMessage(''), 2000);
            onUpdate();
        } catch (error) {
            setMessage('Failed to update');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {message && <div className="p-3 rounded-lg text-sm font-light bg-green-50 text-green-700">{message}</div>}

            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div>
                    <h3 className="text-sm font-light text-gray-700">In-App Notifications</h3>
                    <p className="text-xs text-gray-400 mt-1 font-light">Receive notifications within the platform</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings?.notifications?.inApp}
                        onChange={() => handleToggle('inApp', settings?.notifications?.inApp)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-theme after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div>
                    <h3 className="text-sm font-light text-gray-700">Project Updates</h3>
                    <p className="text-xs text-gray-400 mt-1 font-light">Get notified about project status changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings?.notifications?.projectUpdates}
                        onChange={() => handleToggle('projectUpdates', settings?.notifications?.projectUpdates)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
            </div>
        </motion.div>
    );
}

// Privacy Section
function PrivacySection({ settings, onUpdate }) {
    const [message, setMessage] = useState('');

    const handleToggle = async (field, value) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`${API_URL}/api/settings/privacy`, { [field]: !value }, {
                headers: { Authorization: token }
            });
            setMessage('Updated successfully!');
            setTimeout(() => setMessage(''), 2000);
            onUpdate();
        } catch (error) {
            setMessage('Failed to update');
        }
    };

    const handleSelectChange = async (value) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`${API_URL}/api/settings/privacy`, { whoCanMessage: value }, {
                headers: { Authorization: token }
            });
            setMessage('Updated successfully!');
            setTimeout(() => setMessage(''), 2000);
            onUpdate();
        } catch (error) {
            setMessage('Failed to update');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {message && <div className="p-3 rounded-lg text-sm font-light bg-green-50 text-green-700">{message}</div>}

            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div>
                    <h3 className="text-sm font-light text-gray-700">Public Profile</h3>
                    <p className="text-xs text-gray-400 mt-1 font-light">Make your profile visible to everyone</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings?.privacy?.isPublic}
                        onChange={() => handleToggle('isPublic', settings?.privacy?.isPublic)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
            </div>

            <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="text-sm font-light text-gray-700 mb-3">Who Can Message Me</h3>
                <select
                    value={settings?.privacy?.whoCanMessage || 'everyone'}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-green-600 focus:outline-none font-light bg-theme cursor-pointer"
                >
                    <option value="everyone">Everyone</option>
                    <option value="connections">Only connections</option>
                    <option value="none">No one</option>
                </select>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div>
                    <h3 className="text-sm font-light text-gray-700">Show Work History</h3>
                    <p className="text-xs text-gray-400 mt-1 font-light">Display your completed projects</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings?.privacy?.showWorkHistory}
                        onChange={() => handleToggle('showWorkHistory', settings?.privacy?.showWorkHistory)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
            </div>
        </motion.div>
    );
}
