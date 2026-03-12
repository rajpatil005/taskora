# Taskora - Local P2P Task Marketplace

A full-stack peer-to-peer local task marketplace platform where users can post tasks and complete nearby tasks for payment. Features real-time chat, secure escrow payments, and community-based ratings.

## Key Features

### User Features
- **User Authentication**: Secure JWT-based auth with bcrypt password hashing
- **Task Discovery**: Geolocation-based task discovery with adjustable search radius (1-50km)
- **Task Management**: Create, accept, complete, and review tasks
- **Real-Time Chat**: Socket.io powered messaging between task parties
- **Secure Payments**: Escrow system with Razorpay integration
- **Wallet System**: Balance tracking, transaction history, fund management
- **User Profiles**: Public profiles with ratings and reviews
- **Search & Filters**: Filter tasks by category, distance, and reward amount

### Technical Features
- **Frontend**: Next.js 16 with React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with MongoDB and Mongoose
- **Real-Time**: Socket.io for live chat and notifications
- **Payments**: Razorpay integration with webhook handling
- **Security**: JWT tokens, password hashing, protected routes, input validation
- **Geolocation**: Haversine formula for accurate distance calculations
- **Responsive**: Mobile-first design with full responsive support

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.2 + shadcn/ui components
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Real-Time**: Socket.io
- **Payment**: Razorpay API
- **Validation**: Express-validator, Joi

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB instance
- Razorpay account
- Git

### Frontend Setup

```bash
# Install dependencies
pnpm install

# Create .env.local (copy from .env.local.example)
cp .env.local.example .env.local

# Edit .env.local with your API URL
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Run development server
pnpm run dev
# Frontend at http://localhost:3000
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pnpm install

# Create .env file with configuration
# See SETUP_GUIDE.md for all required variables

# Key variables:
# MONGODB_URI=mongodb://localhost:27017/taskora
# JWT_SECRET=your_secret_key
# RAZORPAY_KEY_ID=your_key
# RAZORPAY_KEY_SECRET=your_secret

# Start backend server
pnpm run dev
# Backend at http://localhost:5000
```

## Project Structure

```
taskora/
├── app/                    # Next.js 16 frontend
│   ├── auth/              # Login/signup pages
│   ├── dashboard/         # Task discovery
│   ├── my-tasks/          # User's tasks
│   ├── post-task/         # Create task
│   ├── tasks/[id]/        # Task details
│   ├── wallet/            # Balance management
│   └── profile/           # User profiles
├── components/            # Reusable UI components
├── lib/                   # Utilities and context
│   ├── authContext.tsx    # Auth provider
│   └── api.ts            # API client
├── backend/              # Express.js backend
│   ├── config/           # Database & JWT config
│   ├── models/           # MongoDB schemas
│   ├── controllers/      # Route handlers
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & validation
│   ├── socket/           # Socket.io handlers
│   └── server.js         # Entry point
└── SETUP_GUIDE.md        # Detailed setup guide
```

## API Overview

### Authentication Endpoints
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Task Endpoints
- `POST /api/tasks` - Create task
- `GET /api/tasks/nearby` - Get nearby tasks
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks/:id/accept` - Accept task
- `POST /api/tasks/:id/complete` - Complete task
- `POST /api/tasks/:id/confirm` - Confirm completion

### Wallet Endpoints
- `GET /api/wallet` - Get balance
- `GET /api/wallet/history` - Transaction history
- `POST /api/wallet/add-funds` - Add funds

### Real-Time Chat (Socket.io)
- `join-task` - Join task chat room
- `send-message` - Send message
- `load-history` - Load chat history
- `leave-task` - Leave chat room

See `SETUP_GUIDE.md` for complete API documentation.

## User Flows

### Posting a Task
1. User logs in
2. Navigate to "Post Task"
3. Fill task details (title, description, category, reward)
4. Select location (geolocation or manual)
5. Submit - reward amount locked in escrow
6. Task visible to nearby users

### Completing a Task
1. User finds task on dashboard
2. Click "Accept Task"
3. Communicate with task owner via chat
4. Complete the task
5. Owner confirms completion
6. Payment released to wallet
7. Both parties can leave reviews

### Earning & Withdrawing
1. Complete tasks to earn
2. Balance automatically updated
3. View transaction history
4. Withdraw funds (when available)

## Authentication

- **JWT Tokens**: Stored in localStorage
- **Token Duration**: 24 hours (configurable)
- **Refresh**: Automatic on app load
- **Protected Routes**: Redirect to login if not authenticated

## Payment Flow

1. User posts task → reward locked in escrow
2. Worker accepts task → status updated
3. Worker completes task → work proof submitted
4. Owner confirms → funds released to worker
5. Both can review → ratings updated

## Distance Calculation

- Uses Haversine formula for accuracy
- Default radius: 10km (adjustable 1-50km)
- Automatic geolocation on dashboard
- Tasks sorted by distance

## Database Schema

### User
- name, email, password (hashed)
- phone, profilePhoto
- location (lat/lon, address)
- rating, completedTasks, verificationStatus

### Task
- title, description, itemName, category
- estimatedPrice, rewardAmount
- location (lat/lon, address)
- status, owner, acceptedBy
- timestamps

### Wallet
- user reference, balance
- lockedEscrow, totalEarned, totalSpent

### Message
- task reference, sender, receiver
- text, attachments, read status

### Review
- task reference, reviewer, reviewee
- rating (1-5), comment

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy (auto on push)

### Backend (Any Node.js Host)
Recommended: Railway, Render, AWS, DigitalOcean

See `SETUP_GUIDE.md` for detailed deployment steps.

## Development

### Running Tests
```bash
# Frontend tests (future)
pnpm test

# Backend tests (future)
cd backend && pnpm test
```

### Building for Production
```bash
# Frontend
pnpm build
pnpm start

# Backend
cd backend
# Use production database URL and secrets
NODE_ENV=production pnpm start
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env)
```
MONGODB_URI=
JWT_SECRET=
PORT=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

See `.env.local.example` and `backend/.env` for complete list.

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify .env variables
- Check port 5000 is available

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check NEXT_PUBLIC_API_URL in .env.local
- Check CORS configuration in backend

### Geolocation not working
- Enable location permissions in browser
- Check user has location services enabled
- Verify browser supports Geolocation API

### Payment issues
- Verify Razorpay keys
- Check test vs production mode
- Review payment logs

See `SETUP_GUIDE.md` for more troubleshooting.

## Security Features

✅ JWT-based authentication
✅ Bcrypt password hashing (salt rounds: 10)
✅ Protected API routes with middleware
✅ Input validation on all endpoints
✅ CORS properly configured
✅ No sensitive data in client code
✅ Secure escrow system
✅ Transaction verification

## Future Enhancements

- [ ] Image uploads (Cloudinary)
- [ ] Mobile app (React Native)
- [ ] Advanced search with ML recommendations
- [ ] Dispute resolution system
- [ ] Admin moderation panel
- [ ] Email/SMS notifications
- [ ] Two-factor authentication
- [ ] Analytics dashboard
- [ ] Task category matching
- [ ] Premium features

## Contributing

Contributions welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning and commercial purposes.

## Support

For help and questions:
- Check `SETUP_GUIDE.md` for detailed documentation
- Review API endpoints in backend routes
- Check error messages and logs
- See troubleshooting section

## Authors

Built as a comprehensive full-stack application with modern web technologies.

---

**Ready to launch?** Follow the Quick Start section above to get Taskora running locally!
