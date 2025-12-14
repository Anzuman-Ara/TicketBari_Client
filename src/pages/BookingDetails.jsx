import React from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Star } from 'lucide-react'

const BookingDetails = () => {
  const { id } = useParams()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h1>
          
          <div className="border-b pb-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span>Dhaka to Chittagong</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span>December 15, 2024</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>09:00 AM - 02:00 PM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-400" />
                <span>2 Passengers</span>
              </div>
            </div>
          </div>

          <div className="border-b pb-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Passenger Details</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">John Doe</div>
                  <div className="text-sm text-gray-600">Adult - Window Seat</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">৳800</div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>4.2</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Jane Doe</div>
                  <div className="text-sm text-gray-600">Adult - Aisle Seat</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">৳800</div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>4.2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b pb-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Breakdown</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Fare (2 passengers)</span>
                <span>৳1,600</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>৳50</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>৳165</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>৳1,815</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button className="btn-secondary flex-1">
              Back to Search
            </button>
            <button className="btn-primary flex-1">
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails