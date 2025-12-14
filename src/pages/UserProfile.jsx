import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: userData, isLoading, error } = useQuery(
    'userProfile',
    async () => {
      const response = await api.get('/users/profile');
      return response.data.data;
    }
  );

  const updateProfileMutation = useMutation(
    async (profileData) => {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData('userProfile', data.data);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    }
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (userData && !isEditing) {
      reset({
        name: userData.name || '',
        phone: userData.phone || '',
        photoURL: userData.photoURL || ''
      });
    }
  }, [userData, isEditing, reset]);

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userData) {
      reset({
        name: userData.name || '',
        phone: userData.phone || '',
        photoURL: userData.photoURL || ''
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProfileCompletionColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfileCompletionBg = (percentage) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-background-secondary rounded w-1/4"></div>
          <div className="bg-surface p-6 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-background-secondary rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-background-secondary rounded w-32"></div>
                <div className="h-4 bg-background-secondary rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-danger mr-2" />
            <p className="text-danger">Failed to load profile data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">User Profile</h1>
        <p className="text-text-secondary mt-2">Manage your personal information and account settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile Completion Card */}
        <div className="lg:w-1/4 flex-shrink-0">
          <div className="bg-surface rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Profile Completion</h3>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getProfileCompletionBg(userData?.profileCompletion || 0)} mb-4`}>
                <span className={`text-2xl font-bold ${getProfileCompletionColor(userData?.profileCompletion || 0)}`}>
                  {userData?.profileCompletion || 0}%
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Complete your profile to get the best experience
              </p>
              <div className="w-full progress-bar-container rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (userData?.profileCompletion || 0) >= 80 ? 'bg-success' :
                    (userData?.profileCompletion || 0) >= 60 ? 'bg-warning' : 'bg-danger'
                  }`}
                  style={{ width: `${userData?.profileCompletion || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="flex-1">
          <div className="bg-surface rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-primary hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-3 py-2 text-sm font-medium text-text-secondary hover:bg-background-secondary rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={updateProfileMutation.isLoading}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {updateProfileMutation.isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Profile Picture Section */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  {userData?.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt={userData.name}
                      className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-200">
                      <User className="h-12 w-12 text-gray-600" />
                    </div>
                  )}
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-text-primary">{userData?.name || 'User Name'}</h4>
                  <p className="text-text-secondary">{userData?.role || 'User'}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-success mr-1" />
                    <span className="text-sm text-success">Account Verified</span>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                      <input
                        type="text"
                        {...register('name', {
                          required: 'Name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters'
                          }
                        })}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          isEditing ? 'bg-surface' : 'bg-background-secondary'
                        } ${errors.name ? 'border-danger' : 'border-border'}`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email Field (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                      <input
                        type="email"
                        value={userData?.email || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background-secondary text-text-tertiary"
                        placeholder="your@email.com"
                      />
                    </div>
                    <p className="mt-1 text-xs text-text-tertiary">Email cannot be changed</p>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                      <input
                        type="tel"
                        {...register('phone', {
                          pattern: {
                            value: /^[+]?[0-9]{10,15}$/,
                            message: 'Please enter a valid phone number'
                          }
                        })}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          isEditing ? 'bg-surface' : 'bg-background-secondary'
                        } ${errors.phone ? 'border-danger' : 'border-border'}`}
                        placeholder="+8801234567890"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-danger">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Role Field (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Account Type
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                      <input
                        type="text"
                        value={userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'User'}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background-secondary text-text-tertiary"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="pt-6 border-t border-border">
                  <h4 className="text-lg font-medium text-text-primary mb-4">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Member Since
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                        <input
                          type="text"
                          value={userData?.createdAt ? formatDate(userData.createdAt) : ''}
                          disabled
                          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background-secondary text-text-tertiary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Last Updated
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                        <input
                          type="text"
                          value={userData?.updatedAt ? formatDate(userData.updatedAt) : ''}
                          disabled
                          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background-secondary text-text-tertiary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;