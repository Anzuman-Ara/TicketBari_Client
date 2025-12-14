# TicketBari - Online Ticket Booking Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-brightgreen.svg)](https://www.mongodb.com/)

TicketBari is a comprehensive online ticket booking platform built with the MERN stack. It allows users to search, book, and manage tickets for various transportation services including buses, trains, flights, and more.

## 🚀 Features

### Core Features
- **Multi-modal Transportation**: Book tickets for buses, trains, flights, launches, and ferries
- **Real-time Search**: Find available routes and compare prices
- **Secure Payment**: Integrated with Stripe and local payment methods (bKash, Nagad, Rocket)
- **User Management**: Registration, authentication, and profile management
- **Booking Management**: View, modify, and cancel bookings
- **Admin Dashboard**: Comprehensive admin panel for route and booking management

### Advanced Features
- **Dynamic Pricing**: Surge pricing during peak hours
- **Real-time Notifications**: Email and push notifications for booking updates
- **Analytics & Reports**: Detailed booking and revenue analytics
- **Responsive Design**: Mobile-first responsive UI
- **Multi-language Support**: English and Bengali language support
- **Multi-currency Support**: BDT and USD currency options

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **React Hook Form** - Form validation and management
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Toast notifications
- **Stripe Elements** - Payment integration

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time communication
- **Winston** - Logging library
- **Stripe** - Payment processing
- **Firebase Admin** - Push notifications and auth

### DevOps & Tools
- **Nodemon** - Development server auto-restart
- **Concurrently** - Run multiple commands
- **ESLint** - Code linting
- **Jest** - Testing framework
- **Supertest** - HTTP testing

## 📁 Project Structure

```
TicketBari/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── context/       # React context providers
│   │   └── assets/        # Images, fonts, etc.
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── server/                # Node.js backend application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes
│   ├── utils/            # Utility functions
│   ├── scripts/          # Database and utility scripts
│   ├── logs/             # Application logs
│   ├── uploads/          # File uploads
│   ├── package.json
│   ├── server.js
│   └── .env.example
├── package.json          # Root package.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v4.4 or higher)
- **Git**
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ticketbari.git
   cd ticketbari
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   npm run client:install
   ```

4. **Install server dependencies**
   ```bash
   npm run server:install
   ```

5. **Set up environment variables**
   ```bash
   # Server environment
   cp server/.env.example server/.env
   
   # Client environment
   cp client/.env.example client/.env
   ```

6. **Configure your environment variables** in both `.env` files:
   - MongoDB connection string
   - JWT secret
   - Stripe keys
   - Firebase configuration
   - Email settings

### Running the Application

#### Development Mode
```bash
# Run both client and server concurrently
npm run dev

# Or run separately
npm run client:dev  # Runs on http://localhost:3000
npm run server:dev  # Runs on http://localhost:5000
```

#### Production Mode
```bash
# Build the client
npm run build

# Start the server
npm start
```

## 🔧 Environment Configuration

### Server (.env)
```env
MONGODB_URI=mongodb://localhost:27017/ticketbari
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
PORT=5000
CLIENT_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
# ... other variables
```

### Client (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
# ... other variables
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgotpassword` - Forgot password
- `PUT /api/auth/resetpassword/:resettoken` - Reset password

### Route Endpoints
- `GET /api/routes` - Get all routes
- `GET /api/routes/:id` - Get single route
- `POST /api/routes/search` - Search routes
- `POST /api/routes` - Create new route (Admin)
- `PUT /api/routes/:id` - Update route (Admin)
- `DELETE /api/routes/:id` - Delete route (Admin)

### Booking Endpoints
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Payment Endpoints
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/refund` - Request refund

### Admin Endpoints
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/analytics` - Get analytics data

## 🧪 Testing

```bash
# Run server tests
cd server && npm test

# Run client tests
cd client && npm test
```

## 🚀 Deployment

### Using Heroku
1. Create a Heroku app
2. Set environment variables in Heroku config
3. Deploy using Git:
   ```bash
   git push heroku main
   ```

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. Build the client: `npm run build`
2. Set production environment variables
3. Start the server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write unit tests for new features
- Update documentation for API changes
- Use conventional commits format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@ticketbari.com
- **Phone**: +880 1234-567890
- **Documentation**: [Wiki](https://github.com/yourusername/ticketbari/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ticketbari/issues)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend library
- [Node.js](https://nodejs.org/) - Runtime environment
- [MongoDB](https://www.mongodb.com/) - Database
- [Stripe](https://stripe.com/) - Payment processing
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vite](https://vitejs.dev/) - Build tool

## 📈 Roadmap

- [ ] Mobile app development (React Native)
- [ ] AI-powered route recommendations
- [ ] Integration with more payment gateways
- [ ] Multi-language support expansion
- [ ] Advanced analytics dashboard
- [ ] Loyalty program implementation
- [ ] Real-time chat support
- [ ] Blockchain-based ticketing

---

**Made with ❤️ by the TicketBari Team**