import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

// Image upload to imgbb
const uploadImageToImgBB = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload image');
  }
  
  const data = await response.json();
  return data.data.url;
};

const VendorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch vendor profile
  const { data: profile, isLoading, error } = useQuery(
    'vendorProfile',
    async () => {
      const response = await api.get('/vendor/profile');
      return response.data.data;
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (data) => {
      const response = await api.put('/vendor/profile', data);
      return response.data.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vendorProfile');
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    }
  );

  // Set form data when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        photoURL: profile.photoURL || '',
        businessName: profile.businessName || '',
        businessAddress: {
          street: profile.businessAddress?.street || '',
          city: profile.businessAddress?.city || '',
          state: profile.businessAddress?.state || '',
          zipCode: profile.businessAddress?.zipCode || '',
          country: profile.businessAddress?.country || 'Bangladesh'
        },
        businessPhone: profile.businessPhone || '',
        businessEmail: profile.businessEmail || '',
        taxId: profile.taxId || '',
        bankDetails: {
          accountName: profile.bankDetails?.accountName || '',
          accountNumber: profile.bankDetails?.accountNumber || '',
          bankName: profile.bankDetails?.bankName || '',
          branchName: profile.bankDetails?.branchName || '',
          routingNumber: profile.bankDetails?.routingNumber || ''
        }
      });
      setImagePreview(profile.photoURL);
    }
  }, [profile, reset]);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image and get URL
  const uploadImage = async () => {
    if (!imageFile) return null;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Using a simple file reader approach for demo
      // In production, you'd use imgbb API
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(imageFile);
      });
    } catch (error) {
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      let photoURL = data.photoURL;
      
      if (imageFile) {
        photoURL = await uploadImage();
      }
      
      const updateData = {
        ...data,
        photoURL
      };
      
      updateProfileMutation.mutate(updateData);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(profile?.photoURL || null);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">Failed to load profile</span>
        </div>
      </div>
    );
  }

  const getCompletionPercentage = () => {
    if (!profile?.profileCompletion) return 0;
    return profile.profileCompletion;
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Vendor Profile</h1>
            <p className="text-text-secondary mt-1">Manage your business information and profile</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-background-secondary text-text-secondary rounded-lg hover:bg-background-tertiary transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Completion */}
      <div className="bg-surface rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Profile Completion</h2>
          <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
        </div>
        <div className="w-full progress-bar-container rounded-full h-3">
          <div
            className="bg-gradient-primary h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-text-secondary mt-2">
          Complete your profile to build trust with customers and increase visibility
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-surface rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Picture */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-background-secondary border-2 border-border">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-8 w-8 text-text-tertiary" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer hover:bg-primary-hover transition-colors">
                      <Camera className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <p className="text-sm text-text-secondary">
                    Upload a clear profile picture. Recommended size: 400x400px
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="text-danger text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-danger text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                <input
                  {...register('phone')}
                  type="tel"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Account Type
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                <input
                  type="text"
                  value={user?.role === 'admin' ? 'Administrator' : 'Vendor'}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background-secondary text-text-secondary"
                />
              </div>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Member Since
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                <input
                  type="text"
                  value={new Date(profile?.createdAt).toLocaleDateString()}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background-secondary text-text-secondary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-surface rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-6">Business Information</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Name */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Business Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                <input
                  {...register('businessName')}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                  }`}
                  placeholder="Enter your business name"
                />
              </div>
            </div>

            {/* Business Address */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address
              </label>
              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                  <input
                    {...register('businessAddress.street')}
                    type="text"
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                    }`}
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    {...register('businessAddress.city')}
                    type="text"
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                    }`}
                    placeholder="City"
                  />
                  <input
                    {...register('businessAddress.state')}
                    type="text"
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                    }`}
                    placeholder="State"
                  />
                  <input
                    {...register('businessAddress.zipCode')}
                    type="text"
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                    }`}
                    placeholder="Zip Code"
                  />
                </div>
              </div>
            </div>

            {/* Business Phone */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Business Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                <input
                  {...register('businessPhone')}
                  type="tel"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                  }`}
                  placeholder="Business phone number"
                />
              </div>
            </div>

            {/* Business Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Business Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                <input
                  {...register('businessEmail')}
                  type="email"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                  }`}
                  placeholder="Business email address"
                />
              </div>
            </div>

            {/* Tax ID */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tax ID / Business Registration Number
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                <input
                  {...register('taxId')}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                  }`}
                  placeholder="Enter your tax ID or business registration number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-surface rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-6">Bank Details</h2>
            <p className="text-sm text-text-secondary mb-6">
              This information is used for processing payments and refunds
            </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...register('bankDetails.accountName')}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                  }`}
                  placeholder="Account holder name"
                />
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...register('bankDetails.accountNumber')}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                  }`}
                  placeholder="Account number"
                />
              </div>
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...register('bankDetails.bankName')}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                  }`}
                  placeholder="Bank name"
                />
              </div>
            </div>

            {/* Branch Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...register('bankDetails.branchName')}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                  }`}
                  placeholder="Branch name"
                />
              </div>
            </div>

            {/* Routing Number */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Routing Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...register('bankDetails.routingNumber')}
                  type="text"
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !isEditing ? 'bg-background-secondary text-text-secondary' : 'bg-surface'
                  }`}
                  placeholder="Routing number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-border text-text-secondary rounded-lg hover:bg-background-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.isLoading || uploadingImage}
              className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {updateProfileMutation.isLoading || uploadingImage ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {uploadingImage ? 'Uploading...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default VendorProfile;