# 🚉 Railway Ticket Booking System

A state-of-the-art, full-stack Railway Ticket Booking application built with **Vue 3** and **Node.js**. This platform offers a premium booking experience with advanced features like AI-driven recommendations and real-time train tracking.

![Project Preview](https://raw.githubusercontent.com/Mathes24/Railway-booking-App/main/public/logo.png)

## ✨ Key Features

-   **🤖 AI Recommendation Engine**: Personalized train suggestions based on your travel history, preferences, and typical spend.
-   **📍 Live GPS Tracking**: Real-time simulation of train movements on an interactive dark-themed map (powered by Leaflet).
-   **💺 Interactive Coach Map**: Choose your preferred seats (Window vs Aisle) with a dynamic, filterable coach layout.
-   **🌐 Multi-Language Support**: Fully internationalized UI supporting English, Hindi (हिंदी), Tamil (தமிழ்), Malayalam (മലയാളം), and Telugu (తెలుగు).
-   **📱 Modern Responsive Design**: A premium "Glassmorphism" dark theme optimized for both desktop and mobile web experiences.
-   **💳 UPI Payment Simulation**: Secure booking flow with simulated UPI verification and instant ticket confirmation.
-   **📩 Smart Notifications**: Automated email and SMS simulation for booking confirmations and train delay alerts.
-   **📊 Admin Dashboard**: Comprehensive management interface for tracking revenue, user growth, and booking statistics.

## 🚀 Tech Stack

-   **Frontend**: [Vue.js 3](https://vuejs.org/), [Vite](https://vitejs.dev/), [Vue Router](https://router.vuejs.org/), [Vue-i18n](https://vue-i18n.intlify.dev/)
-   **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/)
-   **Database**: [SQLite](https://sqlite.org/) (Persistent file-based storage)
-   **Maps**: [Leaflet.js](https://leafletjs.com/) with Dark Mode tiles
-   **Styling**: Modern Vanilla CSS with a custom design system

## 🛠️ Installation & Setup

### Prerequisites
-   Node.js (v16+)
-   npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/Mathes24/Railway-booking-App.git
cd Railway-booking-App
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
You will need to run both the backend server and the frontend dev server.

**Start the Backend (Port 3001):**
```bash
npm run start
```

**Start the Frontend (Vite):**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📂 Project Structure

```text
├── src/
│   ├── components/       # Reusable UI components (Navbar, RouteMap, Toast)
│   ├── pages/            # Main application views (Search, Booking, MyTickets, Admin)
│   ├── services/         # Logic for AI Engine and Notifications
│   ├── utils/            # Helper functions for coordinates and data
│   ├── router.js         # Navigation logic
│   └── i18n.js           # Multi-language translations
├── public/               # Static assets (logo, manifest, sw)
├── server.js             # Express API server & SQLite integration
└── database.sqlite       # Local database (generated automatically)
```

## 🔒 Security
The system uses a persistent SQLite database to manage users and bookings. For production use, ensure to implement proper JWT authentication and password hashing.

## 📄 License
This project is for educational purposes. Feel free to fork and enhance!

---
Built with ❤️ for better travel experiences.
