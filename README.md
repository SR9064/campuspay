# 💸 CampusPay

A full-stack expense-splitting and campus wallet application — built with a Node.js/Express/MongoDB backend and a React/TypeScript frontend. CampusPay lets groups of users (roommates, campus clubs, trip groups) track shared expenses, split bills fairly, settle up via an in-app wallet, and manage group membership — with a consent-based approval flow to prevent fraud or unwanted debt creation.

**🔗 Live App:** [https://euphonious-khapse-eb360b.netlify.app](https://euphonious-khapse-eb360b.netlify.app/)
**🔗 Backend API:** [https://campuspay-backend-b9a0.onrender.com](https://campuspay-backend-b9a0.onrender.com/)

> Note: the backend is hosted on Render's free tier, which sleeps after inactivity — the first request after idle time may take 30–60 seconds to respond.

---

## ✨ Features

- **Authentication** — secure signup/login with JWT and bcrypt password hashing
- **Groups** — create groups and invite members; invites must be accepted before the invitee is added, and declines notify the group creator
- **Expense Splitting** — add expenses split equally or with custom per-person amounts
- **Approval-based Expenses** — every expense (who paid, who owes what) requires explicit approval from everyone involved before any debt is created — prevents one member from fabricating debts against another
- **Debt Tracking** — automatic per-group and global balance calculations (who owes whom)
- **Settlement** — pay down debts directly from your in-app wallet balance, with automatic debt simplification
- **Wallet** — add money, send/transfer money directly to other users, view transaction history
- **Leave Group** — members can leave a group at any time
- **Notifications** — get notified when someone declines a group invite or rejects an expense
- **Dark/Light Mode** — full theme support with a glassmorphism UI
- **CI Pipeline** — GitHub Actions runs install, lint, and build checks on every push

---

## 🛠️ Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication, bcrypt password hashing

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router

**DevOps**
- GitHub Actions (CI: install check, lint, production build)
- Render (backend hosting)
- Netlify (frontend hosting)

---

## 📁 Project Structure
campuspay/
├── backend/
│ ├── src/
│ │ ├── config/ DB connection
│ │ ├── controllers/ Route logic (auth, group, expense, wallet)
│ │ ├── middleware/ JWT auth middleware
│ │ ├── models/ Mongoose schemas
│ │ └── routes/ Express routes
│ └── package.json
│
├── campuspay-frontend/
│ ├── src/
│ │ ├── api/ Axios instance
│ │ ├── components/ Reusable UI components
│ │ ├── pages/ Route-level pages
│ │ └── index.css Global styles / theme
│ └── package.json
│
└── .github/
└── workflows/
└── ci.yml CI pipeline


---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas cluster (or local MongoDB instance)

### 1. Clone the repo
```bash
git clone https://github.com/SR9064/campuspay.git
cd campuspay
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_string
PORT=3000
```

Run the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../campuspay-frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`, connecting to the backend at `http://localhost:3000`.

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt before storage
- JWT tokens authenticate all protected routes
- Expense payer and split amounts require explicit approval from every affected user before any debt is recorded
- `.env` files are excluded from version control
