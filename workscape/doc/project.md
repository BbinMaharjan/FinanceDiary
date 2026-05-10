### Daily Cash Book — Responsive Web App Specification

## Project Overview

Build a modern web app "Daily Cash Book" for personal finance tracking. Responsive Progressive Web Application (PWA) using React + Vite, Node.js, and Firebase.

**Tech Stack**
- Frontend: React + Vite + TypeScript
- UI Library: Ant Design (antd)
- Charts: Recharts
- Animations: Framer Motion
- Routing: React Router DOM
- Icons: Lucide React + @ant-design/icons
- HTTP: Axios
- Backend: Node.js + Express.js
- Database: MongoDB / Mongoose
- Authentication: JWT / bcrypt password encryption
- Hosting: Render / Vercel

## Main Features

- Dashboard with income, expense, and balance overview (stat cards, cash flow chart, spending breakdown, recent transactions)
- Income Management
- Expense Management
- Monthly Cash Book
- Transaction History
- Reports & Analytics
- Export to Excel and PDF
- Notifications
- Settings & Dark Mode

## Responsive Design Requirements

**Mobile View:**
- Bottom navigation (Ant Design theme-aware)
- Floating action button (Ant Design FloatButton)
- Full-width stat cards stacked vertically

**Desktop View:**
- Sidebar navigation (Ant Design theme tokens)
- 3-column stat card layout
- Side-by-side chart and spending breakdown
- Full-width recent transactions

**Reference:** https://story-board-synth.lovable.app/

## UI Implementation Notes

- All components use Ant Design theme tokens via `theme.useToken()` for consistent dark/light mode support
- `Sidebar.tsx`: Custom `<aside>` with Ant Design `theme.useToken()` colors, responsive hide/show with CSS media queries
- `BottomNav.tsx`: Custom `<nav>` with Ant Design theme tokens, hidden on desktop via CSS media queries
- `StatCard.tsx`: Ant Design `Card` with gradient backgrounds and Ant Design `Typography`
- `Dashboard.tsx`: Ant Design `Row`/`Col`/`Card`/`Flex`/`Typography` with Recharts `BarChart`
- `TransactionItem.tsx`: Ant Design `Typography` with theme-aware hover states
- `AppShell.tsx`: Ant Design `Layout`/`Header`/`Content` with sticky header and proper spacing

## Firebase Collections

- users
- transactions
- monthly_summaries
- categories
- settings

## Transaction Fields

- Date
- Title
- Amount
- Category
- Payment Type
- Notes

## Nepali Months Support

Baishakh, Jestha, Ashadh, Shrawan, Bhadra, Ashwin, Kartik, Mangsir, Poush, Magh, Falgun, Chaitra

## Recommended Frontend Packages

- react-router-dom
- firebase
- axios
- antd (Ant Design)
- @ant-design/icons
- framer-motion
- react-hook-form
- recharts
- jspdf
- xlsx
- lucide-react

## Recommended Backend Packages

- express
- cors
- dotenv
- firebase-admin
- nodemon

## Folder Structure

```
client/
├── src/
│   ├── components/
│   │   └── cashbook/
│   │       ├── AppShell.tsx       # Main layout shell with Header/Sidebar/BottomNav
│   │       ├── Sidebar.tsx        # Desktop sidebar navigation
│   │       ├── BottomNav.tsx      # Mobile bottom tab navigation
│   │       ├── StatCard.tsx       # Dashboard stat card with gradient
│   │       ├── TransactionItem.tsx # Transaction row component
│   ├── pages/
│   │   ├── Dashboard.tsx          # Main dashboard with charts & cards
│   │   ├── Transactions.tsx       # Transaction listing
│   │   ├── TransactionForm.tsx    # Add/edit transaction form
│   │   ├── MonthlyBook.tsx        # Monthly cash book view
│   │   ├── Reports.tsx            # Reports & analytics
│   │   ├── Categories.tsx         # Category management
│   │   ├── Settings.tsx           # User settings
│   │   ├── Login.tsx              # Login page
│   │   └── Register.tsx           # Registration page
│   ├── layouts/
│   │   ├── MainLayout.tsx         # Authenticated layout wrapper
│   │   └── AuthLayout.tsx         # Auth pages layout
│   ├── hooks/
│   ├── services/
│   ├── firebase/
│   ├── context/
│   ├── lib/
│   │   ├── antdConfig.ts          # Ant Design theme configuration
│   │   └── utils.ts
│   ├── App.tsx                    # Route configuration
│   └── main.tsx                   # Entry point with ConfigProvider

server/
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── Transaction.js
│   └── MonthlySummary.js
├── controllers/
│   ├── authController.js
│   ├── transactionController.js
│   ├── categoryController.js
│   ├── reportController.js
│   └── exportController.js
├── routes/
├── middleware/
├── utils/
└── server.js
```

## PWA Features

- Installable on Android/iPhone
- Offline caching
- Fast loading
- Mobile app-like experience

## Security Requirements

- Protected routes
- JWT authentication
- Input validation
- Secure environment variables

## Final Deliverables

- Full React + Vite source code
- Responsive UI with Ant Design
- MongoDB integration
- Authentication system
- Dashboard & analytics with Recharts
- Export functionality
- README documentation
- Production-ready project structure
