# Taskora - Setup & Deployment Guide

## Project Overview

Taskora is a full-stack peer-to-peer local task marketplace where users can post tasks and complete nearby tasks for payment. The application features geolocation-based task discovery, real-time chat, secure escrow payments, and user ratings.

## Project Structure

```
taskora/
├── app/                          # Next.js 16 frontend
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Task discovery dashboard
│   ├── my-tasks/                 # User's tasks (posted & accepted)
│   ├── post-task/                # Create new task
│   ├── tasks/[id]/               # Task details page
│   ├── wallet/                   # Wallet and balance management
│   ├── profile/                  # User profiles and reviews
│   └── page.tsx                  # Landing page
├── components/                   # Reusable React components
├── lib/                          # Utilities and context
│   ├── authContext.tsx           # Authentication provider
│   └── api.ts                    # API client utilities
├── backend/                      # Express.js backend
│   ├── config/                   # Database & JWT config
│   ├── models/                   # MongoDB Mongoose schemas
│   ├── controllers/              # Request handlers
│   ├── routes/                   # API route definitions
│   ├── middleware/               # Auth, validation, error handling
│   ├── socket/                   # Socket.io event handlers
│   ├── utils/                    # Helper functions (distance calc, etc)
│   └── server.js                 # Express server entry point
└── scripts/                      # Database setup scripts (future)
```

## Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB instance (local or Atlas)
- Razorpay account for payment processing
- Cloudinary account for image storage (optional, for future features)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pnpm install
```

### 2. Configure Environment Variables

Create `.env` file in `/backend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/taskora
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskora

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h
BCRYPT_SALT=10

# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Razorpay (get from https://razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# Cloudinary (optional)
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Start Backend Server

```bash
pnpm run dev
# Server will run on http://localhost:5000
```

## Frontend Setup

### 1. Install Dependencies

```bash
# From project root
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` file in project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Optional: For future features
# NEXT_PUBLIC_MAP_TOKEN=your_mapbox_token
# NEXT_PUBLIC_CLOUDINARY_NAME=your_name
```

### 3. Start Development Server

```bash
pnpm run dev
# Frontend will run on http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User signup
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires token)

### Tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/nearby` - Get nearby tasks with geolocation filtering
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks/:id/accept` - Accept task
- `POST /api/tasks/:id/complete` - Mark task as complete
- `POST /api/tasks/:id/confirm` - Owner confirms completion and releases payment
- `GET /api/tasks/user/list` - Get user's tasks (posted or accepted)
- `POST /api/tasks/:id/cancel` - Cancel task and return escrow

### Wallet
- `GET /api/wallet` - Get wallet balance and escrow info
- `GET /api/wallet/history` - Get transaction history
- `POST /api/wallet/add-funds` - Add funds to wallet

### Reviews
- `POST /api/reviews/:id` - Post review for completed task
- `GET /api/reviews/task/:id` - Get reviews for task
- `GET /api/reviews/user/:userId` - Get user's reviews

### Messages (Real-time via Socket.io)
- `join-task` - Join task chat room
- `send-message` - Send message
- `load-history` - Load chat history
- `message-read` - Mark message as read
- `leave-task` - Leave chat room

### Payments
- `POST /api/payments/initiate` - Start payment order
- `POST /api/payments/verify` - Verify payment and update wallet
- `POST /api/payments/webhook` - Handle Razorpay webhooks

## Key Features Implemented

### Authentication & Security
✅ JWT-based authentication with secure tokens
✅ Bcrypt password hashing
✅ Protected routes with middleware
✅ Automatic token refresh on app load

### Task Management
✅ Create, accept, complete, and confirm tasks
✅ Geolocation-based task discovery (Haversine formula)
✅ Task filtering by category and distance radius
✅ Escrow system for secure payments
✅ Task status lifecycle management

### Real-Time Features
✅ Socket.io for real-time chat between task parties
✅ Message persistence in database
✅ Chat room management per task
✅ Message read status tracking

### Payments & Wallet
✅ Razorpay payment integration
✅ Wallet balance tracking
✅ Escrow locking and release
✅ Transaction history with detailed logs
✅ Payment webhook handling

### User Features
✅ User profiles with ratings
✅ Review system (1-5 star ratings)
✅ Verification status
✅ User statistics (completed tasks, ratings)
✅ Profile management and settings

### Frontend UI
✅ Modern responsive design
✅ Dark/Light mode support (via theme provider)
✅ Interactive task cards with owner info
✅ Search and filtering
✅ Real-time notifications with toast messages
✅ Loading states with spinner

## File Structure Details

### Backend Models
- **User**: Stores user info, contact, rating, verification status
- **Task**: Complete task lifecycle data with location
- **Wallet**: User's balance, locked escrow, earnings tracking
- **Transaction**: Detailed payment and escrow logs
- **Message**: Chat messages with read status
- **Review**: User reviews and ratings

### Frontend Pages
- `/` - Landing page with features overview
- `/auth/login` - User login
- `/auth/signup` - User registration
- `/dashboard` - Task discovery with map and filters
- `/my-tasks` - Posted and accepted tasks
- `/post-task` - Create new task form
- `/tasks/[id]` - Task detail view
- `/wallet` - Balance and transaction history
- `/profile/[userId]` - User profile with reviews
- `/profile/settings` - Account settings

## Authentication Flow

1. User signs up/logs in → Backend issues JWT token
2. Token stored in localStorage
3. Token sent in Authorization header for all protected requests
4. Middleware verifies token on each request
5. User data fetched and stored in React context
6. Automatic redirect to login if token expires

## Payment Flow (Escrow System)

1. User posts task with reward amount
2. Reward locked in escrow (balance - amount, lockedEscrow + amount)
3. Worker accepts task
4. Worker completes task
5. Task owner confirms completion
6. Funds released to worker (balance + amount)
7. Owner's escrow reduced
8. Transaction logged for both parties

## Distance Calculation

Haversine formula calculates great-circle distance between coordinates:
- Default search radius: 10km
- User can adjust 1-50km range
- Automatic geolocation on dashboard load
- Tasks sorted by distance

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy (automatic on push)

### Backend (Node.js Host)
Options: Heroku, Railway, Render, AWS Elastic Beanstalk, DigitalOcean

```bash
# Example: Railway
1. Connect GitHub repo to Railway
2. Add environment variables
3. Set build command: cd backend && npm install
4. Set start command: node backend/server.js
5. Deploy
```

## Testing Checklist

- [ ] User can register and login
- [ ] JWT tokens stored and sent correctly
- [ ] Geolocation works and tasks display within radius
- [ ] Task creation locks escrow correctly
- [ ] Task acceptance updates status
- [ ] Chat messages send and persist
- [ ] Task completion and owner confirmation
- [ ] Payment verification updates wallet
- [ ] Transaction history displays correctly
- [ ] User profiles show correct ratings
- [ ] Profile settings update profile data
- [ ] Password change works
- [ ] Logout clears tokens and redirects

## Future Enhancements

1. Real-time notifications using Socket.io
2. Image uploads for tasks and profiles (Cloudinary integration)
3. Advanced search with filters
4. Task recommendations based on history
5. Dispute resolution system
6. Admin dashboard for moderation
7. Mobile app using React Native
8. SMS/Email notifications
9. Two-factor authentication
10. Advanced analytics and reporting

## Troubleshooting

### MongoDB Connection Issues
```bash
# Local MongoDB:
# macOS: brew services start mongodb-community
# Windows: net start MongoDB
# Verify: mongo --version
```

### JWT Token Issues
- Token expired: User automatically redirected to login
- Invalid token: Check JWT_SECRET matches in backend
- Token not sent: Check Authorization header format: `Bearer {token}`

### CORS Issues
- Frontend URL must match FRONTEND_URL in backend .env
- Socket.io CORS configured in server.js

### Payment Issues
- Verify Razorpay keys are correct
- Test keys start with `rzp_test_`
- Production keys start with `rzp_live_`

## Support & Resources

- MongoDB: https://docs.mongodb.com
- Express.js: https://expressjs.com
- Next.js 16: https://nextjs.org/docs
- Socket.io: https://socket.io/docs
- Razorpay: https://razorpay.com/docs
- Mongoose: https://mongoosejs.com/docs

---

Built with Next.js 16, Express.js, MongoDB, and Socket.io. Ready for production deployment!
