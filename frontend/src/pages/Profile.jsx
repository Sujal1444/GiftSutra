import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const FALLBACK_AVATAR = 'https://via.placeholder.com/150';
const MAX_AVATAR_SIZE_BYTES = 3 * 1024 * 1024;

const Profile = () => {
  const { user, setUser, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setAvatar(user?.avatar || '');
  }, [user]);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      alert('Profile image must be 3 MB or smaller.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result?.toString() || '');
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setAvatar(user?.avatar || '');
    setPassword('');
    setConfirmPassword('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Name is required.');
      return;
    }

    if (!email.trim()) {
      alert('Email is required.');
      return;
    }

    if (password && password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        avatar,
      };

      if (password) {
        payload.password = password;
      }

      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`,
        payload,
        { withCredentials: true }
      );

      setUser(data);
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to update profile', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('This will permanently delete your account. Do you want to continue?');

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      await deleteAccount();
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account', error);
      alert(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-xl border border-purple-100 shadow-lg p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex flex-col items-center w-full md:w-auto">
          <img
            src={isEditing ? avatar || FALLBACK_AVATAR : user?.avatar || FALLBACK_AVATAR}
            alt="Profile Avatar"
            className="w-32 h-32 rounded-full border-4 border-purple-200 shadow-md object-cover mb-4"
          />
          {isEditing && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors"
              >
                Change profile image
              </button>
              <p className="mt-2 text-center text-sm text-gray-500">
                Upload an image up to 3 MB or paste an image URL below.
              </p>
            </>
          )}
        </div>

        <div className="flex-1 w-full text-center md:text-left">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Avatar URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Paste an image URL or use the upload button"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep your current password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-black text-purple-900 mb-2">{user?.name}</h1>
                <p className="text-xl text-gray-500">{user?.email}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-8 py-3 rounded-lg font-bold transition-colors w-full md:w-auto text-lg"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-red-50 hover:bg-red-100 text-red-700 px-8 py-3 rounded-lg font-bold transition-colors border border-red-200 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
