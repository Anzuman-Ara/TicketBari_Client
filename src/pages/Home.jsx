import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Star, Clock, Shield, DollarSign } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../config/api'
import TicketCard from '../components/tickets/TicketCard'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const Home = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [advertisedTickets, setAdvertisedTickets] = useState([])
  const [latestTickets, setLatestTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Fetch advertised tickets
        const advertisedResponse = await api.get('/routes/advertised')
        setAdvertisedTickets(advertisedResponse.data.data)

        // Fetch latest tickets
        const latestResponse = await api.get('/routes?sortBy=createdAt&sortOrder=desc&limit=8')
        setLatestTickets(latestResponse.data.data)

      } catch (err) {
        console.error('Error fetching tickets:', err)
        setError('Failed to load ticket data')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-800">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {isAuthenticated ? `Welcome back, ${user?.name}!` : 'Find Your Perfect Journey'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-text-inverse">
            {isAuthenticated
              ? 'Continue your journey with us. Book tickets for movies, events, transportation, and more with ease.'
              : 'Book tickets for movies, events, transportation, and more with ease. Your one-stop destination for all ticket booking needs.'
            }
          </p>

          {/* Quick Actions for Authenticated Users */}
          {isAuthenticated && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Link
                to="/dashboard"
                className="bg-surface text-primary hover:bg-background-secondary font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <Users className="h-5 w-5" />
                <span>My Bookings</span>
              </Link>
            </div>
          )}

          {/* Featured Slider */}
          <div className="mt-12 max-w-8xl mx-auto">
            <Swiper
              modules={[Pagination, Autoplay, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ clickable: true, bulletClass: 'swiper-pagination-bullet bg-white/50 hover:bg-white', bulletActiveClass: 'swiper-pagination-bullet-active bg-white' }}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              autoplay={{ delay: 6000, disableOnInteraction: false }}
              loop={true}
              speed={1000}
              className="rounded-xl overflow-hidden shadow-2xl"
            >
              <SwiperSlide>
                <div className="relative h-96">
                  <img
                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    alt="Beautiful travel destination"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center">
                    <div className="text-center text-text-inverse p-8 mb-8">
                      <h3 className="text-4xl font-bold mb-4 text-shadow-lg">Explore Bangladesh</h3>
                      <p className="text-xl mb-6 text-shadow-md">Discover amazing destinations at unbeatable prices</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="relative h-96">
                  <img
                    src="https://media.istockphoto.com/id/1142301545/photo/high-way-sign-with-motivation-warning-or-advice-message-about-shopping.webp?a=1&b=1&s=612x612&w=0&k=20&c=jUjnAcC9n_QoEvsFrSyn9JerMOxe-FmQtgEh2aajtxI="
                    alt="Scenic landscape"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center">
                    <div className="text-center text-text-inverse p-8 mb-8">
                      <h3 className="text-4xl font-bold mb-4 text-shadow-lg">Special Offers</h3>
                      <p className="text-xl mb-6 text-shadow-md">Limited time deals on popular routes</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="relative h-96">
                  <img
                    src="https://media.istockphoto.com/id/1187348158/photo/man-downloading-application-for-booking-airline-tickets-online-on-smartphone.webp?a=1&b=1&s=612x612&w=0&k=20&c=Yh4HYx9e75Wb4Tc7hSIm8wKlPrX7KYSletxKPugTRKQ="
                    alt="City skyline"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center">
                    <div className="text-center text-text-inverse p-8 mb-8">
                      <h3 className="text-4xl font-bold mb-4 text-shadow-lg">Easy Booking</h3>
                      <p className="text-xl mb-6 text-shadow-md">Book your tickets in just a few clicks</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              {/* Navigation Arrows */}
              <div className="swiper-button-prev text-text-inverse bg-black/30 hover:bg-black/50 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-lg"></div>
              <div className="swiper-button-next text-text-inverse bg-black/30 hover:bg-black/50 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-lg"></div>
            </Swiper>
          </div>
        </div>
      </section>


      {/* Quick Stats for Authenticated Users */}
      {isAuthenticated && (
        <section className="py-16 bg-surface text-text-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Your TicketBari Experience</h2>
              <p className="text-xl text-text-secondary">
                Track your booking journey with us
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-text-secondary">Destinations Available</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-text-secondary">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-text-secondary">Customer Support</div>
              </div>
            </div>
          </div>
        </section>
      )}

        {/* Advertisement Section */}
        <section className="py-16 bg-white dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Featured Tickets</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">Handpicked by our team for you</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white dark:bg-slate-700 rounded-lg shadow-md h-80 animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-slate-600 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : advertisedTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advertisedTickets.map(ticket => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    onBook={() => navigate(`/tickets/${ticket._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No featured tickets available at the moment.</p>
              </div>
            )}
          </div>
        </section>

      {/* Latest Tickets Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Latest Tickets</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Recently added tickets for your next journey</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-slate-700 rounded-lg shadow-md h-80 animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-slate-600 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : latestTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestTickets.map(ticket => (
                <TicketCard
                  key={ticket._id}
                  ticket={ticket}
                  onBook={() => navigate(`/tickets/${ticket._id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No latest tickets available at the moment.</p>
            </div>
          )}
        </div>
      </section>


      {/* Popular Routes Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Popular Routes</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Most traveled routes by our customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {
              [
                { from: 'Dhaka', to: 'Chittagong', type: 'bus', price: '৳1,200', trips: '15 daily' },
                { from: 'Dhaka', to: 'Sylhet', type: 'train', price: '৳1,000', trips: '8 daily' },
                { from: 'Dhaka', to: 'Cox\'s Bazar', type: 'flight', price: '৳4,500', trips: '6 daily' },
                { from: 'Chittagong', to: 'Sylhet', type: 'bus', price: '৳1,800', trips: '4 daily' }
              ].map((route, index) => (
                <div key={index} className="bg-white dark:bg-slate-700 rounded-lg shadow-md p-6 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{route.from}</span>
                    </div>
                    <span className="text-gray-400 dark:text-gray-500">→</span>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{route.to}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Transport:</span>
                      <span className="font-medium capitalize text-gray-900 dark:text-white">{route.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Price from:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{route.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Trips per day:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{route.trips}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose TicketBari?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">The benefits of booking with us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-600 p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Best Price Guarantee</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We offer the most competitive prices with no hidden fees. Price match guarantee on all bookings.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-600 p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">24/7 Customer Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our dedicated support team is available round the clock to assist you with any issues or questions.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-600 p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Trusted by Thousands</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Join over 50,000 satisfied customers who trust us for their travel booking needs every month.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Special Offers Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Special Offers & Deals</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Exclusive discounts for your next journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {
              [
                {
                  title: 'Early Bird Discount',
                  description: 'Book 7 days in advance and get 15% off on all bus tickets',
                  discount: '15% OFF',
                  code: 'EARLY15',
                  bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-400'
                },
                {
                  title: 'Weekend Getaway',
                  description: 'Special 20% discount on weekend travel packages',
                  discount: '20% OFF',
                  code: 'WEEKEND20',
                  bgColor: 'bg-gradient-to-r from-purple-500 to-pink-400'
                },
                {
                  title: 'Student Special',
                  description: '10% off for students with valid ID on all routes',
                  discount: '10% OFF',
                  code: 'STUDENT10',
                  bgColor: 'bg-gradient-to-r from-green-500 to-emerald-400'
                }
              ].map((offer, index) => (
                <div key={index} className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden card-hover">
                  <div className={`h-32 ${offer.bgColor} flex items-center justify-center`}>
                    <div className="text-white text-center">
                      <div className="text-sm font-medium mb-1">Save</div>
                      <div className="text-3xl font-bold">{offer.discount}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{offer.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{offer.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
                        Use code: {offer.code}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* Customer Testimonials Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Real experiences from satisfied travelers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {
              [
                {
                  name: 'Sarah Ahmed',
                  role: 'Frequent Traveler',
                  rating: 5,
                  testimonial: 'TicketBari has completely changed how I book tickets. The process is so smooth and I always find the best deals. The customer support is excellent too!',
                  avatar: '👩'
                },
                {
                  name: 'Rahim Khan',
                  role: 'Business Traveler',
                  rating: 4,
                  testimonial: 'As someone who travels frequently for work, TicketBari saves me so much time. I can compare all options in one place and the booking is instant.',
                  avatar: '👨'
                },
                {
                  name: 'Ayesha Begum',
                  role: 'Student',
                  rating: 5,
                  testimonial: 'The student discounts are amazing! I can now afford to visit my family more often. The app is very easy to use and I love the notification system.',
                  avatar: '👩'
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white dark:bg-slate-600 p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    {[...Array(5 - testimonial.rating)].map((_, i) => (
                      <Star key={i + testimonial.rating} className="h-4 w-4 text-gray-300 dark:text-gray-500" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.testimonial}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* Call to Action for Non-authenticated Users */}
      {!isAuthenticated && (
        <section className="py-16 bg-primary text-text-inverse">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4 text-text-inverse">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-text-inverse">
              Join thousands of satisfied customers who trust TicketBari for their travel needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-background text-primary hover:bg-background-secondary font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                Sign Up Now
              </Link>
              <Link
                to="/login"
                className="bg-primary-hover text-text-inverse hover:bg-primary-active font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
