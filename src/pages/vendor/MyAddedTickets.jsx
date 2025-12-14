import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  Ticket, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  Upload,
  Plus
} from 'lucide-react'
import { api } from '../../config/api'
import { format } from 'date-fns'

const MyAddedTickets = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm()

  // Fetch vendor tickets
  const { data: ticketsData, isLoading, error } = useQuery(
    ['vendorTickets', { search: searchTerm, status: statusFilter }],
    async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await api.get(`/vendor/tickets?${params}`)
      return response.data
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  const tickets = ticketsData?.data || []

  // Update ticket mutation
  const updateTicketMutation = useMutation(
    async (data) => {
      let imageUrl = data.imageUrl
      
      if (imageFile) {
        // Simulate image upload (replace with actual imgbb integration)
        const formData = new FormData()
        formData.append('image', imageFile)
        
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

        try {
          const response = await fetch('https://api.imgbb.com/1/upload?key=demo_key', {
            method: 'POST',
            body: formData
          })
          
          clearInterval(progressInterval)
          setUploadProgress(100)
          
          if (response.ok) {
            imageUrl = 'https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=Updated+Ticket'
          }
        } catch (error) {
          console.error('Image upload error:', error)
          toast.error('Failed to upload image')
          throw error
        } finally {
          setIsUploading(false)
          setUploadProgress(0)
        }
      }

      const updateData = {
        ...data,
        baseFare: parseFloat(data.baseFare),
        totalSeats: parseInt(data.totalSeats),
        availableQuantity: parseInt(data.availableQuantity),
        imageUrl
      }

      const response = await api.put(`/vendor/tickets/${selectedTicket._id}`, updateData)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Ticket updated successfully!')
        queryClient.invalidateQueries('vendorTickets')
        setIsUpdateModalOpen(false)
        setSelectedTicket(null)
        setImageFile(null)
        setImagePreview('')
        reset()
      },
      onError: (error) => {
        console.error('Update ticket error:', error)
        toast.error(error.response?.data?.message || 'Failed to update ticket')
      }
    }
  )

  // Delete ticket mutation
  const deleteTicketMutation = useMutation(
    async () => {
      const response = await api.delete(`/vendor/tickets/${selectedTicket._id}`)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Ticket deleted successfully!')
        queryClient.invalidateQueries('vendorTickets')
        setIsDeleteModalOpen(false)
        setSelectedTicket(null)
      },
      onError: (error) => {
        console.error('Delete ticket error:', error)
        toast.error(error.response?.data?.message || 'Failed to delete ticket')
      }
    }
  )

  // Handle image selection for update
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      setImageFile(file)
      
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Open update modal with ticket data
  const openUpdateModal = (ticket) => {
    setSelectedTicket(ticket)
    setImagePreview(ticket.imageUrl || '')
    
    // Pre-fill form with ticket data
    setValue('operatorName', ticket.operator.name)
    setValue('operatorCode', ticket.operator.code)
    setValue('fromCity', ticket.from.city)
    setValue('fromState', ticket.from.state)
    setValue('toCity', ticket.to.city)
    setValue('toState', ticket.to.state)
    setValue('type', ticket.type)
    setValue('class', ticket.class)
    setValue('departureTime', ticket.schedule[0]?.departureTime || '')
    setValue('arrivalTime', ticket.schedule[0]?.arrivalTime || '')
    setValue('duration', ticket.schedule[0]?.duration || '')
    setValue('baseFare', ticket.pricing.baseFare)
    setValue('totalSeats', ticket.capacity.totalSeats)
    setValue('availableQuantity', ticket.availableQuantity)
    setValue('description', ticket.description || '')
    setValue('perks', ticket.perks || [])
    setValue('imageUrl', ticket.imageUrl || '')
    
    setIsUpdateModalOpen(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (ticket) => {
    setSelectedTicket(ticket)
    setIsDeleteModalOpen(true)
  }

  // Handle update form submission
  const onUpdateSubmit = (data) => {
    updateTicketMutation.mutate(data)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    deleteTicketMutation.mutate()
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-warning', icon: AlertCircle, text: 'Pending' },
      approved: { color: 'bg-green-100 text-success', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-danger', icon: XCircle, text: 'Rejected' }
    }
    
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    )
  }

  // Get transport type icon
  const getTransportIcon = (type) => {
    const icons = {
      bus: '🚌',
      train: '🚆',
      plane: '✈️',
      launch: '🚢'
    }
    return icons[type] || '🚌'
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2 text-text-secondary">Loading tickets...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12 bg-background-secondary rounded-lg shadow-md">
        <AlertCircle className="mx-auto h-12 w-12 text-danger" />
        <h3 className="mt-2 text-sm font-medium text-text-primary">Error loading tickets</h3>
        <p className="mt-1 text-sm text-text-secondary">
          {error.response?.data?.message || 'Something went wrong. Please try again.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background min-h-screen p-6">
      {/* Header */}
      <div className="bg-surface rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center">
              <Ticket className="mr-3 h-6 w-6 text-primary" />
              My Added Tickets
            </h1>
            <p className="text-text-secondary mt-1">
              Manage your tickets and track their verification status
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => window.location.href = '/vendor/add-ticket'}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-surface rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-5 w-5" />
              <input
                type="text"
                placeholder="Search by operator, from city, or to city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg shadow-md">
          <Ticket className="mx-auto h-12 w-12 text-text-tertiary" />
          <h3 className="mt-2 text-sm font-medium text-text-primary">No tickets found</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first ticket.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/vendor/add-ticket'}
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center mx-auto transition-colors"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Ticket
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="bg-surface rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Ticket Image */}
              <div className="h-48 bg-gradient-primary relative">
                {ticket.imageUrl ? (
                  <img
                    src={ticket.imageUrl}
                    alt={ticket.operator.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                    <Ticket className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(ticket.verificationStatus)}
                </div>
              </div>

              {/* Ticket Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {ticket.operator.name}
                  </h3>
                  <span className="text-2xl">{getTransportIcon(ticket.type)}</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-text-secondary">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    <span>{ticket.from.city} → {ticket.to.city}</span>
                  </div>
                  <div className="flex items-center text-sm text-text-secondary">
                    <DollarSign className="h-4 w-4 mr-2 text-success" />
                    <span>৳{ticket.pricing.baseFare}</span>
                  </div>
                  <div className="flex items-center text-sm text-text-secondary">
                    <Clock className="h-4 w-4 mr-2 text-info" />
                    <span>{ticket.schedule[0]?.departureTime || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-text-secondary">
                    <Package className="h-4 w-4 mr-2 text-warning" />
                    <span>{ticket.availableQuantity} available</span>
                  </div>
                </div>

                {/* Perks */}
                {ticket.perks && ticket.perks.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {ticket.perks.slice(0, 3).map((perk) => (
                        <span
                          key={perk}
                          className="inline-block bg-background-tertiary text-primary text-xs px-2 py-1 rounded"
                        >
                          {perk}
                        </span>
                      ))}
                      {ticket.perks.length > 3 && (
                        <span className="inline-block bg-background-tertiary text-text-tertiary text-xs px-2 py-1 rounded">
                          +{ticket.perks.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="text-xs text-text-tertiary mb-4">
                  Added on {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => openUpdateModal(ticket)}
                    disabled={ticket.verificationStatus === 'rejected'}
                    className="flex-1 bg-primary hover:bg-primary-hover disabled:bg-surface-secondary disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm flex items-center justify-center transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Update
                  </button>
                  <button
                    onClick={() => openDeleteModal(ticket)}
                    disabled={ticket.verificationStatus === 'rejected'}
                    className="flex-1 bg-danger hover:bg-danger-hover disabled:bg-surface-secondary disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>

                {ticket.verificationStatus === 'rejected' && (
                  <div className="mt-2 text-xs text-danger bg-background-secondary p-2 rounded">
                    Cannot modify rejected tickets
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-overlay overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md glass">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-text-primary">Update Ticket</h3>
                <button
                  onClick={() => {
                    setIsUpdateModalOpen(false)
                    setSelectedTicket(null)
                    setImageFile(null)
                    setImagePreview('')
                    reset()
                  }}
                  className="text-text-tertiary hover:text-text-secondary"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4 max-h-96 overflow-y-auto">
                {/* Form fields (same as AddTicket but with pre-filled values) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Operator Name *
                    </label>
                    <input
                      type="text"
                      {...register('operatorName', { required: 'Operator name is required' })}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Transport Type *
                    </label>
                    <select
                      {...register('type', { required: 'Transport type is required' })}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    >
                      <option value="bus">Bus</option>
                      <option value="train">Train</option>
                      <option value="launch">Launch</option>
                      <option value="plane">Plane</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      From City *
                    </label>
                    <input
                      type="text"
                      {...register('fromCity', { required: 'From city is required' })}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      To City *
                    </label>
                    <input
                      type="text"
                      {...register('toCity', { required: 'To city is required' })}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
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
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Available Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('availableQuantity', {
                        required: 'Available quantity is required',
                        min: { value: 0, message: 'Available quantity must be 0 or more' }
                      })}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    />
                  </div>
                </div>

                {/* Image Update Section */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Ticket Image
                  </label>
                  {imagePreview ? (
                    <div className="relative mb-4">
                      <img
                        src={imagePreview}
                        alt="Ticket preview"
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview('')
                        }}
                        className="absolute top-2 right-2 bg-danger text-white rounded-full p-1 hover:bg-danger-hover"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label className="cursor-pointer">
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center bg-background-secondary">
                          <Upload className="mx-auto h-8 w-8 text-text-tertiary" />
                          <span className="mt-1 block text-sm text-text-secondary">
                            Click to upload new image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUpdateModalOpen(false)
                      setSelectedTicket(null)
                      setImageFile(null)
                      setImagePreview('')
                      reset()
                    }}
                    className="px-4 py-2 border border-border rounded-md text-text-secondary hover:bg-background-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateTicketMutation.isLoading || isUploading}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {updateTicketMutation.isLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Updating...
                      </>
                    ) : (
                      'Update Ticket'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-overlay overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md glass">
            <div className="mt-3 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-danger" />
              <h3 className="text-lg font-medium text-text-primary mt-2">Delete Ticket</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-text-secondary">
                  Are you sure you want to delete the ticket for{' '}
                  <span className="font-semibold text-text-primary">{selectedTicket?.operator?.name}</span>{' '}
                  from {selectedTicket?.from?.city} to {selectedTicket?.to?.city}?
                  This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false)
                      setSelectedTicket(null)
                    }}
                    className="px-4 py-2 border border-border rounded-md text-text-secondary hover:bg-background-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleteTicketMutation.isLoading}
                    className="px-4 py-2 bg-danger text-white rounded-md hover:bg-danger-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {deleteTicketMutation.isLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Ticket'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAddedTickets