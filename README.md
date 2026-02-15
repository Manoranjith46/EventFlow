# 🚀 EventFlow

### Real-Time Event Management System (Hackathon Edition)

> A Mobile-First MERN Stack Web Application designed to eliminate chaos in large-scale college events through real-time routing, digital verification, and instant communication.

---

## 📌 Overview

**EventFlow** is a real-time event coordination platform built to streamline hackathons, symposiums, and large campus events with 500+ participants.

Unlike static schedules or WhatsApp groups, EventFlow acts as a **digital nervous system** — delivering live venue updates, verification status, and urgent alerts directly to participants’ devices.

---

## 🎯 Problem Statement

Managing large-scale student events creates three major challenges:

* ⚠️ **Information Latency** – Announcements are missed.
* 🧭 **Venue Confusion** – Last-minute room changes cause chaos.
* 🛑 **Verification Bottlenecks** – Manual ID checks slow entry.

EventFlow solves these using real-time synchronization and digital identity validation.

---

## 🏗️ System Architecture

```
Frontend (React + Vite)
        ↓
REST API (Node + Express)
        ↓
MongoDB Atlas (Cloud Database)
```

* 🔄 Polling every 5 seconds (No WebSockets for stability)
* 🌐 DNS Bypass Mode (8.8.8.8) for restricted college networks
* 📱 Mobile-First Responsive UI

---

## 👥 User Roles & Interfaces

### 👤 Participant – “Live Hub”

* Secure login via Temporary ID & Password
* Waiting Room until verified
* Real-time active venue display
* Google Maps deep-link navigation
* Digital ID modal
* Instant notifications feed

---

### 🛡️ Volunteer – Verification Panel

* Fast ID-based verification
* Instant check-in updates
* Reduces physical bottlenecks

---

### ⚡ Admin – Command Center

* Change active venue globally
* Push live announcements
* Mark alerts as urgent
* Control event state in real-time

---

## ✨ Core Features

### 🔐 Authentication & Onboarding

* Temporary credential login
* Credential validation via MongoDB
* Role-based redirection
* Waiting Room for unverified users

---

### ✅ Digital Verification Module

* Volunteer verifies via ID
* Backend updates user status
* Frontend auto-refresh (Polling)
* Instant dashboard unlock

---

### 📍 Live Hub Dashboard

* Dynamic Venue Card
* “Get Directions” (Google Maps Deep Link)
* Profile Modal with Verified Badge
* Scrollable Live Feed
* Urgent Alert Highlighting (Red UI emphasis)

---

### 🔄 Real-Time Communication (Polling Based)

* Data refresh every 5 seconds
* Near real-time synchronization
* Stable under hackathon network conditions

---

## 🛠️ Tech Stack

### 🎨 Frontend

* React.js (Vite)
* Pure CSS (Mobile-First)
* Lucide-React Icons
* Plus Jakarta Sans
* Clash Display (Headers)

### ⚙️ Backend

* Node.js
* Express.js
* RESTful API Architecture

### 🗄️ Database

* MongoDB Atlas (Cloud)
* Local fallback (Resilience Mode)

### 🌐 Infrastructure

* Custom DNS Routing (8.8.8.8)
* Designed for restricted college networks

---

## 📡 API Endpoints

| Method | Endpoint                | Description                 |
| ------ | ----------------------- | --------------------------- |
| POST   | `/api/login`            | Validate Temp ID & Password |
| GET    | `/api/user/:id`         | Fetch user profile & status |
| PATCH  | `/api/verify`           | Mark user as checked-in     |
| GET    | `/api/live-hub`         | Fetch venue & feed          |
| POST   | `/api/admin/set-status` | Update global event state   |

---

## 🎨 UI/UX Design System

### 🎨 Color Palette

| Purpose | Color | Hex       |
| ------- | ----- | --------- |
| Primary | Blue  | `#2563EB` |
| Success | Green | `#16A34A` |
| Alert   | Red   | `#E11D48` |

### 🧠 Design Principles

* Clean & Urgent
* High contrast text
* Large mobile touch targets
* Real-time visual emphasis
* Clear verification state indicators

---

## 📂 Project Structure (Suggested)

```
eventflow/
│
├── client/              # React Frontend
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── services/
│
├── server/              # Express Backend
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── middleware/
│
└── README.md
```

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/eventflow.git
cd eventflow
```

---

### 2️⃣ Setup Backend

```bash
cd server
npm install
node index.js
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

---

### 3️⃣ Setup Frontend

```bash
cd client
npm install
npm run dev
```

---

## 🔐 Environment Variables

Backend `.env`

```
PORT=5000
MONGO_URI=
NODE_ENV=development
```

---

## 🧪 Testing Credentials (Hackathon Mode)

Temporary IDs and passwords are generated during event registration.

Example:

```
ID: EV1234
Password: temp@123
```

---

## 📊 Performance Considerations

* Optimized polling (5s interval)
* Lean MongoDB queries
* Role-based data fetching
* Mobile-first rendering
* DNS fallback mode

---

## 🏆 Hackathon Highlights

* Solves real college infrastructure problem
* Works on restricted campus networks
* No WebSocket dependency
* Clear role-based separation
* Designed for 500+ concurrent users

---

## 🔮 Future Improvements

* WebSocket-based real-time sync
* QR-based verification
* Push Notifications
* Analytics Dashboard
* Progressive Web App (PWA)
* Offline Mode
* Role-based JWT authentication

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

---

## 📄 License

MIT License

---

## 👨‍💻 Built For

Hackathons, Symposiums, College Tech Fests, and Campus Events.

---

# 💡 EventFlow

**Because chaos should never be part of the schedule.**
