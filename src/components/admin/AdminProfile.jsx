import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, Edit3, Save, X } from 'lucide-react';
import { api } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    photoURL: ''
  });
  const { user, updateUser } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/admin/profile');
      setProfile(response.data.data);
      setFormData({
        name: response.data.data.name || '',
        phone: response.data.data.phone || '',
        photoURL: response.data.data.photoURL || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put('/admin/profile', formData);
      setProfile(response.data.data);
      
      // Update auth context if name or photo changed
      if (user) {
        updateUser({
          ...user,
          name: response.data.data.name,
          photoURL: response.data.data.photoURL
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      photoURL: profile?.photoURL || ''
    });
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-background-secondary text-danger';
      case 'vendor':
        return 'bg-background-secondary text-primary';
      default:
        return 'bg-background-secondary text-text-secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-surface overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-20 w-20 rounded-full border-4 border-surface shadow-lg"
                  src={profile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Admin')}&background=6366f1&color=fff&size=80`}
                  alt={profile?.name || 'Admin'}
                />
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-text-primary">
                  {profile?.name || 'Admin User'}
                </h1>
                <div className="flex items-center mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(profile?.role)}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-text-inverse bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-text-inverse bg-success hover:bg-success-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-text-primary bg-surface hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-surface shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-text-primary mb-4">
            Profile Information
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary">
                Full Name
              </label>
              <div className="mt-1 relative">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md"
                    placeholder="Enter full name"
                  />
                ) : (
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-text-tertiary mr-3" />
                    <span className="text-sm text-text-primary">{profile?.name || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-text-tertiary mr-3" />
                  <span className="text-sm text-text-primary">{profile?.email}</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-text-tertiary">
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text-primary">
                Phone Number
              </label>
              <div className="mt-1 relative">
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="flex items-center">
                    <span className="text-sm text-text-primary">{profile?.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-sm font-medium text-text-primary">
                Profile Photo URL
              </label>
              <div className="mt-1 relative">
                {isEditing ? (
                  <input
                    type="url"
                    name="photoURL"
                    value={formData.photoURL}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md"
                    placeholder="Enter photo URL"
                  />
                ) : (
                  <div className="flex items-center">
                    <span className="text-sm text-text-primary">
                      {profile?.photoURL ? (
                        <a href={profile.photoURL} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                          View Photo
                        </a>
                      ) : (
                        'No photo'
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-surface shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-text-primary mb-4">
            Account Details
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-text-primary">
                User Role
              </label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(profile?.role)}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
                </span>
              </div>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm font-medium text-text-primary">
                Account Created
              </label>
              <div className="mt-1 flex items-center">
                <Calendar className="w-5 h-5 text-text-tertiary mr-3" />
                <span className="text-sm text-text-primary">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>

            {/* Email Verified */}
            <div>
              <label className="block text-sm font-medium text-text-primary">
                Email Verification
              </label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile?.emailVerified ? 'bg-background-secondary text-success' : 'bg-background-secondary text-warning'
                }`}>
                  {profile?.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-sm font-medium text-text-primary">
                Account Status
              </label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile?.isActive ? 'bg-background-secondary text-success' : 'bg-background-secondary text-danger'
                }`}>
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Privileges */}
      <div className="bg-surface shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-text-primary mb-4">
            Admin Privileges
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <h4 className="text-sm font-medium text-text-primary">User Management</h4>
                <p className="text-sm text-text-tertiary">Create, modify, and delete user accounts</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-success">
                Granted
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <h4 className="text-sm font-medium text-text-primary">Ticket Approval</h4>
                <p className="text-sm text-text-tertiary">Approve or reject vendor-submitted tickets</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-success">
                Granted
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <h4 className="text-sm font-medium text-text-primary">Advertisement Management</h4>
                <p className="text-sm text-text-tertiary">Manage ticket advertisements on homepage</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-success">
                Granted
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <h4 className="text-sm font-medium text-text-primary">Fraud Detection</h4>
                <p className="text-sm text-text-tertiary">Mark vendors as fraudulent and take action</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-success">
                Granted
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-sm font-medium text-text-primary">System Analytics</h4>
                <p className="text-sm text-text-tertiary">View comprehensive platform analytics and reports</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-success">
                Granted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;