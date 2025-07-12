import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/SupabaseAuthContext';
import supabaseAuthService from '../services/supabase-auth.service';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await supabaseAuthService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
      });
      updateUser(updatedUser);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setError('');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Here you would typically upload the file to your server
    // For now, we'll just show a placeholder message
    setSuccess('Avatar upload functionality coming soon!');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-electric-purple to-electric-pink bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="text-text-secondary mt-2">
          Manage your account information and preferences
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neural-card"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg mb-6 ${
                error
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-green-500/10 border border-green-500/20 text-green-400'
              } text-sm`}
            >
              {error || success}
            </motion.div>
          )}

          <div className="flex items-start gap-8">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-electric-purple to-electric-pink p-1">
                  <div className="w-full h-full rounded-full bg-neural-dark flex items-center justify-center text-3xl font-bold">
                    {(user.firstName || user.username || user.email).charAt(0).toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={handleAvatarClick}
                  className="absolute inset-0 w-full h-full rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-text-muted mt-2 text-center">Click to upload</p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-purple focus:outline-none focus:ring-2 focus:ring-electric-purple/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-purple focus:outline-none focus:ring-2 focus:ring-electric-purple/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-purple focus:outline-none focus:ring-2 focus:ring-electric-purple/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-neural-light border border-neural-accent/20 opacity-50 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-text-muted">
                  Email cannot be changed for security reasons
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <div className="px-4 py-3 rounded-lg bg-neural-light border border-neural-accent/20">
                  <span className="capitalize">{user.role.replace('_', ' ')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Member Since</label>
                <div className="px-4 py-3 rounded-lg bg-neural-light border border-neural-accent/20">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                {isEditing ? (
                  <>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="neural-button px-6 py-2 disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 rounded-lg border border-neural-accent/20 hover:bg-neural-light transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="neural-button px-6 py-2"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="neural-card"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
          
          <div className="space-y-4">
            <button className="w-full text-left p-4 rounded-lg bg-neural-light hover:bg-neural-accent/20 transition-colors flex items-center justify-between">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-text-muted">Update your password regularly for security</p>
              </div>
              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full text-left p-4 rounded-lg bg-neural-light hover:bg-neural-accent/20 transition-colors flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-text-muted">Add an extra layer of security to your account</p>
              </div>
              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full text-left p-4 rounded-lg bg-neural-light hover:bg-neural-accent/20 transition-colors flex items-center justify-between">
              <div>
                <p className="font-medium">Connected Accounts</p>
                <p className="text-sm text-text-muted">Manage your linked social accounts</p>
              </div>
              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="neural-card border-red-500/20"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-red-400">Danger Zone</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="font-medium mb-2">Delete Account</p>
              <p className="text-sm text-text-muted mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;