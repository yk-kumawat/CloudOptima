import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || '');

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Helper to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently added";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const handleLogout = () => {
    // 1. Navigate FIRST, before changing any state
    navigate("/");

    // 2. Wait for the navigation to finish, THEN clear the user state
    setTimeout(() => {
      logout();
      toast.success("Logged out successfully");
    }, 100);
  };

  const handleUpdateProfile = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ fullName: editName }),
      });

      const data = await response.json();

      if (response.ok) {
        updateUser({ fullName: data.fullName });
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password changed successfully");
        setShowPasswordModal(false);
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        toast.success("Account deleted forever");
        logout();
        navigate("/");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }; return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <main className="flex flex-1 justify-center py-8 px-4 lg:px-40">
          <div className="flex flex-col max-w-200 flex-1">

            {/* Top Navigation Row */}
            <div className="flex justify-between items-center my-3 mb-6">
              <div className="flex items-center gap-2">
                <button onClick={() => { navigate('/dashboard') }} className="p-2 h-10 w-10 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors group">
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
                </button>
                <span className="text-slate-600 dark:text-slate-400 font-medium hidden sm:inline">Back to Dashboard</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-all shadow-md group cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Logout
              </button>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-12 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-end">
                {/* Avatar with Add Button */}
                <div className="relative group">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full ring-4 ring-primary/20 size-32 lg:size-40 shadow-xl border-4 border-white dark:border-slate-900"
                    style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}')` }}
                  ></div>
                  <button className="absolute flex justify-center items-center h-8 w-8 bottom-2 right-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white dark:border-slate-900">
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                  </button>
                </div>

                {/* User Info */}
                <div className="flex flex-col items-center lg:items-start flex-1 gap-1">
                  <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-extrabold tracking-tight">
                    {user?.fullName || "User Name"}
                  </h1>
                  <p className="text-primary font-bold text-sm uppercase tracking-wider">
                    CloudOptima Member
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    Member since {formatDate(user?.createdAt)}
                  </p>
                </div>

                {/* Edit Action */}
                <button
                  onClick={handleUpdateProfile}
                  className={`flex min-w-35 cursor-pointer items-center justify-center rounded-lg h-11 px-6 text-white text-sm font-bold shadow-lg transition-all active:scale-95 ${isEditing ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
                >
                  <span className="material-symbols-outlined mr-2 text-[18px]">
                    {isEditing ? 'save' : 'edit'}
                  </span>
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

              {/* Left Column: Personal Info */}
              <div className="flex flex-col gap-4">
                <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold px-1 flex items-center gap-2">
                  Personal Information
                </h2>
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 shadow-2xl dark:border-slate-800 rounded-xl p-6 flex flex-col gap-6 h-full">
                  <label className="flex flex-col gap-2">
                    <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Full Name</span>
                    <input
                      className={`w-full rounded-lg text-slate-900 dark:text-slate-100 border h-12 px-4 outline-none transition-all ${isEditing ? 'border-primary bg-white dark:bg-slate-800 focus:ring-1 focus:ring-primary shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'}`}
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Email Address</span>
                    <div className="flex items-center w-full rounded-lg text-slate-500 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50 h-12 px-4 cursor-not-allowed">
                      <span className="material-symbols-outlined text-[18px] mr-2">lock</span>
                      {user?.email || "user@cloudoptima.io"}
                    </div>
                    <span className="text-[10px] text-slate-400 italic px-1">
                      * Contact support to change your primary email.
                    </span>
                  </label>
                </div>
              </div>

              {/* Right Column: Account Settings */}
              <div className="flex flex-col gap-4">
                <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold px-1">
                  Account Settings
                </h2>
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 shadow-2xl dark:border-slate-800 rounded-xl p-6 flex flex-col gap-4 h-full">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center justify-between w-full p-4 rounded-lg bg-slate-200/70 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">key</span>
                      <span className="font-semibold text-sm">Change Password</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </button>

                  <button className="flex items-center justify-between w-full p-4 rounded-lg bg-slate-200/70 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">notifications_active</span>
                      <span className="font-semibold text-sm">Notification Preferences</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </button>

                  {/* Danger Zone */}
                  <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-4">
                      Danger Zone
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center justify-center w-full h-11 px-6 rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-sm cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined mr-2 text-[18px]">delete_forever</span>
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lock_reset</span>
                Change Password
              </h3>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Password</span>
                  <input
                    type="password"
                    required
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="h-11 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</span>
                  <input
                    type="password"
                    required
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="h-11 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</span>
                  <input
                    type="password"
                    required
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="h-11 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </label>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswords({ current: '', new: '', confirm: '' });
                    }}
                    className="flex-1 h-11 rounded-lg font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-lg font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-red-500/20 animate-in fade-in zoom-in duration-200">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Account?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This action cannot be undone. All your saved optimizations and settings will be permanently removed.
                  </p>
                </div>
                <div className="flex w-full gap-3 mt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 h-11 rounded-lg font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 h-11 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfile;