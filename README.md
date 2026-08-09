# Daily Cash Book

A personal finance tracking app with a responsive Progressive Web App (React + Vite), a native mobile app (React Native), and a shared backend (Node.js + Express + MongoDB).

## Features

- Dashboard with income, expense, and balance overview
- Income & Expense Management
- Monthly Cash Book with Nepali month support
- Transaction History with filtering and search
- Reports & Analytics with charts
- Export to Excel and PDF
- Dark Mode support
- PWA — installable on mobile/desktop

## Tech Stack

- **Web Frontend:** React + Vite, Tailwind CSS, Framer Motion, Recharts
- **Mobile:** React Native, React Navigation, TanStack Query, Axios
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (JSON Web Tokens) + bcrypt

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)

### Installation

```bash
# Install root dev dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Variables

Copy `.env` from `server/` directory and update:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/daily-cash-book
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

### Running in Development

```bash
# From root — runs both server and client concurrently
npm run dev

# Or run separately:
cd server && npm run dev    # Backend on :5000
cd client && npm run dev    # Frontend on :5173
```

### Building for Production

```bash
npm run build
```

## Mobile App (React Native)

A native Android/iOS companion app sharing the same backend API.

```bash
# Install dependencies
cd mobile && npm install

# Start Metro bundler
npm start

# Build & run (in a second terminal)
npm run android   # Android
npm run ios       # iOS (run `bundle install && bundle exec pod install` first)
```

The API base URL is configured in `mobile/src/config.ts`. By default it points to the deployed backend (`https://bin-day-book.vercel.app/api`); change it to a LAN address (e.g. `http://192.168.1.x:5000/api`) for local development.

### Mobile Screens

| Tab | Screens |
|-----|---------|
| Home | Dashboard |
| Transactions | Transaction list, Add/Edit transaction |
| Cash Book | Monthly cash book, Daily summary, Add transaction |
| Reports | Reports |
| More | Accounts, Categories, Reports, Settings |

## Project Structure

```
client/           — React web frontend
  src/
    components/   — Reusable UI components
    pages/        — Route pages
    layouts/      — Layout wrappers
    hooks/        — Custom React hooks
    services/     — API service layer
    context/      — React contexts (auth, theme)
    firebase/     — Firebase config

mobile/           — React Native mobile app
  src/
    api/          — Axios client, types, React Query hooks
    auth/         — Auth context (login/register/session)
    components/   — Reusable UI components
    navigation/   — Stack & tab navigators
    screens/      — Screen components
    lib/          — Formatting helpers

server/           — Express backend
  config/         — DB connection
  models/         — Mongoose schemas
  controllers/    — Route handlers
  routes/         — Express routes
  middleware/     — Auth, validation, error handling
  utils/          — Helper functions
```

## API Endpoints

| Method | Endpoint              | Description            |
|--------|----------------------|------------------------|
| POST   | /api/auth/register   | Register user          |
| POST   | /api/auth/login      | Login user             |
| GET    | /api/auth/me         | Get current user       |
| PUT    | /api/auth/profile    | Update profile         |
| GET    | /api/transactions    | List transactions      |
| POST   | /api/transactions    | Create transaction     |
| PUT    | /api/transactions/:id| Update transaction     |
| DELETE | /api/transactions/:id| Delete transaction     |
| GET    | /api/reports/dashboard | Dashboard summary    |
| GET    | /api/reports/monthly | Monthly summaries      |
| GET    | /api/reports/yearly  | Yearly report          |
| GET    | /api/reports/categories | Category breakdown  |
| GET    | /api/categories      | List categories        |
| POST   | /api/categories      | Create category        |
| GET    | /api/export/excel    | Export to Excel        |
| GET    | /api/export/pdf      | Export to PDF          |

