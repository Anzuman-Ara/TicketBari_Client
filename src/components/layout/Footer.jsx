import React from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Facebook, Instagram, Mail, Phone, MapPin, Bus, Train, Plane, Ship } from 'lucide-react'
import { FaXTwitter } from 'react-icons/fa6'

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-surface text-text-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
      </div>
      
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          
          {/* Column 1: Logo + Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <Bus className="h-7 w-7 text-primary" />
                <Train className="h-4 w-4 text-primary absolute -top-1 -right-1" />
              </div>
              <span className="text-2xl font-bold transition-colors text-text-primary">
                TicketBari
              </span>
            </div>
            <p className={`text-text-secondary mb-6 leading-relaxed`}>
              Book bus, train, launch & flight tickets easily. Your trusted platform for seamless transportation booking across Bangladesh.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://facebook.com/ticketbari"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/ticketbari"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background-secondary hover:bg-surface-tertiary p-2 rounded-lg transition-all duration-200 hover:scale-110"
                aria-label="X (Twitter)"
              >
                <FaXTwitter className="h-4 w-4 text-text-primary" />
              </a>
              <a
                href="https://instagram.com/ticketbari"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink-600 hover:bg-pink-700 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-text-primary">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className={`text-text-secondary hover:text-text-primary hover:translate-x-1 transition-all duration-200 flex items-center space-x-2 group`}
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200"></span>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className={`text-text-secondary hover:text-text-primary hover:translate-x-1 transition-all duration-200 flex items-center space-x-2 group`}
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200"></span>
                  <span>All Tickets</span>
                </Link>
              </li>
              <li>
                <a
                  href="/contact"
                  className={`text-text-secondary hover:text-text-primary hover:translate-x-1 transition-all duration-200 flex items-center space-x-2 group`}
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200"></span>
                  <span>Contact Us</span>
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className={`text-text-secondary hover:text-text-primary hover:translate-x-1 transition-all duration-200 flex items-center space-x-2 group`}
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200"></span>
                  <span>About</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-text-primary">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <a
                    href="mailto:support@ticketbari.com"
                    className={`text-text-secondary hover:text-text-primary transition-colors`}
                  >
                    support@ticketbari.com
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <a
                    href="tel:+8801234567890"
                    className={`text-text-secondary hover:text-text-primary transition-colors`}
                  >
                    +880 1234-567890
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Facebook className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <a
                    href="https://facebook.com/ticketbari"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-text-secondary hover:text-text-primary transition-colors`}
                  >
                    Facebook Page
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Payment Methods */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-text-primary">Payment Methods</h3>
            <div className="bg-background-tertiary backdrop-blur-sm border border-border rounded-xl p-4 shadow-sm">
              <p className={`text-sm text-text-secondary mb-4`}>
                Secure payments powered by Stripe
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 flex items-center justify-center shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">
                      VISA
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 flex items-center justify-center shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-5 bg-gradient-to-r from-red-600 to-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">
                      MC
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 flex items-center justify-center shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-blue-400 rounded text-white text-xs flex items-center justify-center font-bold">
                      bKash
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 flex items-center justify-center shadow-sm">
                  <div className="text-center">
                    <div className="w-8 h-5 bg-gradient-to-r from-green-500 to-green-400 rounded text-white text-xs flex items-center justify-center font-bold">
                      Nagad
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className={`flex items-center space-x-2 text-xs text-text-tertiary`}>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Stripe Secured</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 w-full">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 w-full">
            <p className={`text-text-tertiary text-sm`}>
              © 2025 TicketBari. All rights reserved.
            </p>
            <div className={`flex items-center space-x-6 text-sm text-text-tertiary`}>
              <a href="/privacy" className={`hover:text-text-primary transition-colors`}>Privacy Policy</a>
              <a href="/terms" className={`hover:text-text-primary transition-colors`}>Terms of Service</a>
              <a href="/cookies" className={`hover:text-text-primary transition-colors`}>Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer