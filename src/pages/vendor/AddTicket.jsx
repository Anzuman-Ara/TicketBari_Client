import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Upload, 
  X, 
  Loader2, 
  MapPin, 
  Clock, 
  DollarSign,
  Calendar,
  Bus,
  Train,
  Plane,
  Ship,
  Wifi,
  Coffee,
  Usb,
  Snowflake,
  Car
} from 'lucide-react'
import { api } from '../../config/api'
import { useAuth } from '../../contexts/AuthContext'

const AddTicket = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: {
      vendorName: user?.businessName || user?.name || '',
      vendorEmail: user?.email || '',
      operatorName: '',
      operatorCode: '',
      fromCity: '',
      fromState: '',
      toCity: '',
      toState: '',
      type: 'bus',
      class: 'economy',
      departureTime: '',
      arrivalTime: '',
      duration: '',
      baseFare: '',
      totalSeats: '',
      availableQuantity: '',
      description: '',
      perks: []
    }
  })

  const watchedType = watch('type')

  // Available perks
  const availablePerks = [
    { id: 'AC', name: 'AC', icon: Snowflake },
    { id: 'WiFi', name: 'WiFi', icon: Wifi },
    { id: 'Breakfast', name: 'Breakfast', icon: Coffee },
    { id: 'USB Charging', name: 'USB Charging', icon: Usb },
    { id: 'Water Bottle', name: 'Water Bottle', icon: Coffee },
    { id: 'Blanket', name: 'Blanket', icon: Car },
    { id: 'Entertainment', name: 'Entertainment', icon: Wifi }
  ]

  // Transport type icons
  const transportIcons = {
    bus: Bus,
    train: Train,
    plane: Plane,
    launch: Ship
  }

  // Image upload to imgbb
  const uploadToImgbb = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Check if we have a real API key
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY || 'demo_key'
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        // If using demo key, return placeholder image
        if (apiKey === 'demo_key') {
          console.warn('Using demo key - returning placeholder image')
          return 'https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=Ticket+Image'
        }
        
        // For real API key failures, throw error
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Image upload failed')
      }

      const data = await response.json()
      
      // Return the actual uploaded image URL
      if (data.data && data.data.url) {
        return data.data.url
      }
      
      // Fallback to placeholder if no URL returned
      return 'https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=Ticket+Image'
    } catch (error) {
      console.error('Image upload error:', error)
      
      // If using demo key, show info message instead of error
      if (import.meta.env.VITE_IMGBB_API_KEY === 'demo_key') {
        toast('Demo mode: Using placeholder image', {
          icon: 'ℹ️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
        return 'https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=Ticket+Image'
      }
      
      toast.error('Failed to upload image')
      throw error
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Add ticket mutation
  const addTicketMutation = useMutation(
    async (data) => {
      let imageUrl = ''
      
      if (imageFile) {
        imageUrl = await uploadToImgbb(imageFile)
      }

      const ticketData = {
        ...data,
        baseFare: parseFloat(data.baseFare),
        totalSeats: parseInt(data.totalSeats),
        availableQuantity: parseInt(data.availableQuantity),
        imageUrl,
        perks: data.perks || []
      }

      const response = await api.post('/vendor/tickets', ticketData)
      return response.data
    },
    {
      onSuccess: (data) => {
        toast.success('Ticket added successfully!')
        queryClient.invalidateQueries('vendorTickets')
        reset()
        setImageFile(null)
        setImagePreview('')
        navigate('/vendor/tickets')
      },
      onError: (error) => {
        console.error('Add ticket error:', error)
        toast.error(error.response?.data?.message || 'Failed to add ticket')
      }
    }
  )

  const onSubmit = (data) => {
    addTicketMutation.mutate(data)
  }

  // Handle perks selection
  const handlePerkToggle = (perkId) => {
    const currentPerks = watch('perks') || []
    const updatedPerks = currentPerks.includes(perkId)
      ? currentPerks.filter(id => id !== perkId)
      : [...currentPerks, perkId]

    setValue('perks', updatedPerks)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-background-secondary rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-primary px-6 py-4">
          <h1 className="text-2xl font-bold text-text-inverse flex items-center">
            <Plus className="mr-3 h-6 w-6" />
            Add New Ticket
          </h1>
          <p className="text-text-secondary mt-1">Create a new ticket for your transportation service</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Vendor Information (Read-only) */}
          <div className="bg-background-tertiary p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Vendor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  {...register('vendorName')}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background-secondary cursor-not-allowed"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Vendor Email
                </label>
                <input
                  type="email"
                  {...register('vendorEmail')}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background-secondary cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Route Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  From City *
                </label>
                <input
                  type="text"
                  {...register('fromCity', { required: 'From city is required' })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Dhaka"
                />
                {errors.fromCity && (
                  <p className="text-danger text-sm mt-1">{errors.fromCity.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  From State/Region
                </label>
                <input
                  type="text"
                  {...register('fromState')}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Dhaka Division"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  To City *
                </label>
                <input
                  type="text"
                  {...register('toCity', { required: 'To city is required' })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Chittagong"
                />
                {errors.toCity && (
                  <p className="text-danger text-sm mt-1">{errors.toCity.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  To State/Region
                </label>
                <input
                  type="text"
                  {...register('toState')}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Chittagong Division"
                />
              </div>
            </div>
          </div>

          {/* Transport Details */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
              <Bus className="mr-2 h-5 w-5" />
              Transport Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Transport Type *
                </label>
                <select
                  {...register('type', { required: 'Transport type is required' })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                  <option value="launch">Launch</option>
                  <option value="flight">Flight</option>
                </select>
                {errors.type && (
                  <p className="text-danger text-sm mt-1">{errors.type.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Class
                </label>
                <select
                  {...register('class')}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="economy">Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                  <option value="sleeper">Sleeper</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Operator Name *
                </label>
                <input
                  type="text"
                  {...register('operatorName', { required: 'Operator name is required' })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Green Line"
                />
                {errors.operatorName && (
                  <p className="text-danger text-sm mt-1">{errors.operatorName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Operator Code
                </label>
                <input
                  type="text"
                  {...register('operatorCode')}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., GL"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Departure Time *
                </label>
                <input
                  type="time"
                  {...register('departureTime', { required: 'Departure time is required' })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.departureTime && (
                  <p className="text-danger text-sm mt-1">{errors.departureTime.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Arrival Time *
                </label>
                <input
                  type="time"
                  {...register('arrivalTime', { required: 'Arrival time is required' })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.arrivalTime && (
                  <p className="text-danger text-sm mt-1">{errors.arrivalTime.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Duration (e.g., 6h 30m)
                </label>
                <input
                  type="text"
                  {...register('duration')}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., 6h 30m"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Pricing & Capacity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Base Fare (BDT) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('baseFare', {
                    required: 'Base fare is required',
                    min: { value: 0, message: 'Base fare must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., 800"
                />
                {errors.baseFare && (
                  <p className="text-danger text-sm mt-1">{errors.baseFare.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Total Seats *
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('totalSeats', {
                    required: 'Total seats is required',
                    min: { value: 1, message: 'Total seats must be at least 1' }
                  })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., 40"
                />
                {errors.totalSeats && (
                  <p className="text-danger text-sm mt-1">{errors.totalSeats.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Available Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('availableQuantity', {
                    required: 'Available quantity is required',
                    min: { value: 0, message: 'Available quantity must be 0 or more' }
                  })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., 40"
                />
                {errors.availableQuantity && (
                  <p className="text-danger text-sm mt-1">{errors.availableQuantity.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Perks */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Perks & Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availablePerks.map((perk) => {
                const Icon = perk.icon
                const isSelected = watch('perks')?.includes(perk.id)
                return (
                  <label
                    key={perk.id}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      {...register('perks')}
                      value={perk.id}
                      className="sr-only"
                    />
                    <Icon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">{perk.name}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Ticket Image
            </h3>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Ticket preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview('')
                    }}
                    className="absolute top-2 right-2 bg-danger text-text-inverse rounded-full p-1 hover:bg-danger-hover"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-text-tertiary" />
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-text-primary">
                        Upload ticket image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                      <span className="mt-1 block text-sm text-text-tertiary">
                        PNG, JPG, GIF up to 5MB
                      </span>
                    </label>
                  </div>
                </div>
              )}
              
              {isUploading && (
                <div className="mt-4">
                  <div className="progress-bar-container rounded-full h-2">
                    <div
                      className="progress-bar h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-text-secondary mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Additional details about the ticket..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                reset()
                setImageFile(null)
                setImagePreview('')
              }}
              className="px-6 py-2 border border-border rounded-md text-text-primary hover:bg-background-secondary"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={addTicketMutation.isLoading || isUploading}
              className="px-6 py-2 bg-primary text-text-inverse rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {addTicketMutation.isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Adding Ticket...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5 text-text-inverse" />
                  Add Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTicket