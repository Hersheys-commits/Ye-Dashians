# Nexus - Smart Meeting Point Finder

![Nexus Logo](frontend/public/image-removebg%20(1).png)

## 🌟 Overview
Nexus is a MERN stack application that helps friends find the perfect meeting spot by analyzing their locations and preferences. It calculates the optimal midpoint and suggests venues that are conveniently accessible to all participants.

## ✨ Key Features

### 📍 Location-Based Services
- Smart midpoint calculation between multiple user locations
- Integration with Google Maps API for accurate location services
- Address autocomplete for easy location input
- Customized venue suggestions based on:
  - Distance from midpoint
  - User preferences
  - Venue type/category
  - Travel time for all participants

### 💬 Real-Time Communication
- Integrated chat system using Socket.IO
- Instant messaging between friends
- Share and discuss meeting locations
- Coordinate meeting times seamlessly
- Real-time updates and notifications

### 👤 User Profiles & Social Features
- Customizable user profiles with:
  - Profile picture
  - Bio
  - Personal preferences
  - Location information
  - Age and other details
- Friend management system:
  - Send/receive friend requests
  - Accept/reject requests
  - Remove friends
  - View friend profiles
- Username-based friend search

### 🔍 Place Discovery
- Individual place search functionality
- Detailed venue information
- User reviews and ratings
- Operating hours and contact details
- Photos and additional venue details

### 🔐 Authentication & Security
- Dual authentication options:
  - Traditional email/password login
  - Google OAuth integration
- Secure signup process
- Protected user data
- Session management

### 🎨 UI/UX Features
- Clean, modern interface using DaisyUI
- Responsive design for all devices
- Customizable themes
- Settings panel for user preferences
- Intuitive navigation

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- DaisyUI
- Socket.IO Client
- Google Maps JavaScript API

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.IO
- Google Maps API
- OAuth 2.0

## 📋 Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google Maps API Key
- Google OAuth credentials

## 🚀 Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/Hersheys-commits/Ye-Dashians
cd Ye-Dashians
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Environment Setup
```bash
# Backend .env
PORT=5000
MONGODB_URI=your_mongodb_uri
GOOGLE_MAPS_API_KEY=your_api_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_jwt_secret

# Frontend .env
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key
REACT_APP_BACKEND_URL=http://localhost:5000
```

4. Start the application
```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm start
```

## 📱 Pages & Routes

### Public Routes
- `/login` - Login page
- `/signup` - Registration page

### Protected Routes
- `/` - Main dashboard
- `/user/profile` - User profile
- `/place/:id` - Place Details
- `/profile/:username` - Other Profiles
- `/message` - Real-time chat
- `/meeting` - Decide Meeting Place
- `/settings` - User settings
- `/questionnaire` - Questionnaire

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 👥 Contact
- Your Name - [harsh.20233137@mnnit.ac.in](mailto:harsh.20233137@mnnit.ac.in)
- Project Link: [https://github.com/Hersheys-commits/Ye-Dashians](https://github.com/Hersheys-commits/Ye-Dashians)

## 🙏 Acknowledgments
- Google Maps Platform
- Socket.IO
- DaisyUI
- Other libraries and tools used in this project