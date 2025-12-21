# Prolance - Freelancer Platform

A full-stack web application built with React (Frontend) and Node.js/Express (Backend) with MongoDB database and JWT authentication.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** (already configured in this project)

## 🚀 Quick Start Guide

### 1. Clone or Navigate to Project
```bash
cd /Users/merazmz/Projects/prolance
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Variables
The `.env` file is already configured with:
- `PORT=8080` - Backend server port
- `MONGO_CONN` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT token generation

⚠️ **Important**: Never commit the `.env` file to version control in production!

#### Start Backend Server
```bash
npm start
```

The backend will run on `http://localhost:8080` using **nodemon** (auto-restarts on file changes).

✅ Verify backend is running by visiting: `http://localhost:8080/ping` (should return "PONG")

### 3. Frontend Setup

#### Install Dependencies
Open a **new terminal** and run:
```bash
cd frontend
npm install
```

#### Environment Variables
The `.env` file is already configured with:
- `VITE_API_BASE_URL=http://localhost:8080` - Backend API endpoint

#### Start Frontend Development Server
```bash
npm run dev
```

The frontend will typically run on `http://localhost:5173` (Vite will show the exact URL in terminal).

## 📁 Project Structure

```
prolance/
├── backend/
│   ├── Controllers/       # Business logic
│   ├── Middlewares/       # Auth middleware
│   ├── Models/           # MongoDB schemas
│   ├── Routes/           # API routes
│   ├── .env              # Environment variables
│   ├── index.js          # Server entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── context/      # AuthContext
    │   ├── pages/        # Login, Signup, Dashboard
    │   ├── services/     # API services
    │   └── App.jsx       # Main app component
    ├── .env              # Frontend environment variables
    └── package.json
```

## 🛠️ Technology Stack

### Backend
- **Express.js** - Web framework
- **MongoDB** (Atlas) - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Joi** - Input validation
- **CORS** - Cross-origin requests

### Frontend
- **React** (v19) - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Motion** - Animations
- **Particles** - Background effects
- **Lucide React** - Icons

## 🔑 Available Scripts

### Backend
```bash
npm start          # Start server with nodemon (auto-reload)
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🔐 Authentication Flow

1. **Signup**: Create new user account (`/auth/signup`)
2. **Login**: Authenticate user and receive JWT token (`/auth/login`)
3. **Protected Routes**: Access dashboard and other protected pages
4. **Logout**: Clear authentication state

## 🌐 API Endpoints

### Base URL: `http://localhost:8080`

- `GET /ping` - Health check endpoint
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- Additional auth routes in `/auth/*`

## 📝 Development Workflow

1. **Start both servers**:
   - Terminal 1: `cd backend && npm start`
   - Terminal 2: `cd frontend && npm run dev`

2. **Make changes**: Edit files and see live updates
   - Backend: nodemon auto-restarts
   - Frontend: Vite hot-reloads

3. **Test the application**: Open browser to frontend URL

## ⚠️ Troubleshooting

### Port Already in Use
If port 8080 or 5173 is busy:
- **Backend**: Change `PORT` in `backend/.env`
- **Frontend**: Vite will auto-assign a different port or you can configure in `vite.config.js`

### Database Connection Issues
- Verify MongoDB Atlas connection string in `backend/.env`
- Check if IP address is whitelisted in MongoDB Atlas
- Ensure network connectivity

### Module Not Found Errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
- Ensure backend CORS is enabled (already configured)
- Verify `VITE_API_BASE_URL` matches backend URL

## 🚢 Production Deployment

### Backend
1. Set up proper environment variables
2. Change `JWT_SECRET` to a strong, random value
3. Use PM2 or similar for process management
4. Enable HTTPS

### Frontend
1. Run `npm run build` to create production bundle
2. Deploy the `dist` folder to hosting service (Vercel, Netlify, etc.)
3. Update `VITE_API_BASE_URL` to production backend URL

## 📄 License

This project is private and proprietary.

## 👤 Author

**Meraz Haque**

---

**Happy Coding! 🎉**
