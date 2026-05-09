Daily Cash Book — Responsive Web App Specification
Project Overview
Build a modern web app “Daily Cash Book” for personal finance tracking. responsive Progressive Web Application (PWA) using React + Vite, Node.js, and Firebase.
Tech Stack
Frontend: React + Vite
Backend: Node.js + Express.js
Database: MongoDB / Mongoose
Authentication: JWT Authentication / Google Login (optional) / bcrypt password encryption
Hosting: Render / Vercel
Main Features
• Dashboard with income, expense, and balance overview
• Income Management
• Expense Management
• Monthly Cash Book
• Transaction History
• Reports & Analytics
• Export to Excel and PDF
• Notifications
• Settings & Dark Mode
Responsive Design Requirements
Mobile View:
• Bottom navigation
• Floating action button
• Swipe actions

Desktop View:
• Sidebar navigation
• Multi-column dashboard
• Large analytics charts
Firebase Collections
users
transactions
monthly_summaries
categories
settings
Transaction Fields
• Date
• Title
• Amount
• Category
• Payment Type
• Notes
Nepali Months Support
Baishakh, Jestha, Ashadh, Shrawan, Bhadra, Ashwin, Kartik, Mangsir, Poush, Magh, Falgun, Chaitra
Recommended Frontend Packages
react-router-dom
firebase
axios
tailwindcss
framer-motion
react-hook-form
recharts
jspdf
xlsx
Recommended Backend Packages
express
cors
dotenv
firebase-admin
nodemon
Suggested Folder Structure
client/
├── src/
│ ├── components/
│ ├── pages/
│ ├── layouts/
│ ├── hooks/
│ ├── services/
│ ├── firebase/
│ └── App.jsx

server/
├── config/
│ └── db.js
├── models/
│ ├── User.js
│ ├── Transaction.js
│ └── MonthlySummary.js
├── controllers/
├── routes/
├── middleware/
├── utils/
└── server.jsPWA Features
• Installable on Android/iPhone
• Offline caching
• Fast loading
• Mobile app-like experience
Security Requirements
• Protected routes
• JWT authentication
• Input validation
• Secure environment variables
Final Deliverables
• Full React + Vite source code
• Responsive UI
• MongoDB integration
• Authentication system
• Dashboard & analytics
• Export functionality
• README documentation
• Production-ready project structure
