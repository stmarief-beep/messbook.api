import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileData(res.data);
        } catch (error) {
            console.error('Failed to fetch profile', error);
            // Optional: redirect to login if unauthorized
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Failed to load profile.</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 text-teal-700 hover:underline">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { user, mess, stats } = profileData;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-xl mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-200 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold">My Profile</h1>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-3xl font-bold mb-4">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-gray-500">{user.email}</p>
                        <span className="mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold uppercase rounded-full">
                            {user.role}
                        </span>
                    </div>
                </div>

                {/* Mess Info & Stats */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                    {mess ? (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Mess Details</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50 Last:border-0">
                                    <span className="text-gray-600">Mess Name</span>

                                    <span className="font-medium text-gray-900">{mess.messName}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50 Last:border-0">
                                    <span className="text-gray-600">Member Since</span>
                                    <span className="font-medium text-gray-900">{new Date(mess.joinedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Role</span>
                                    <span className="font-medium text-gray-900 capitalize">{mess.role}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                            <p className="text-gray-500">You are not part of any mess.</p>
                        </div>
                    )}

                    {/* Stats Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Current Month Activity</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-gray-600">Total Paid</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                {stats?.currentMonthPaid || 0} SAR
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-50 text-red-600 font-medium py-3 rounded-xl hover:bg-red-100 transition-colors"
                    >
                        Logout
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Version 1.1.0 • Mess Management
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
