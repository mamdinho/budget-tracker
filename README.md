# Budget Tracker

A modern, full-stack personal finance app. Track income and expenses, filter by date/type/category with autocomplete, visualize trends, export to CSV, and authenticate with Amazon Cognito. Responsive UI, dark mode, and production-ready deploys.

> **Tech:** React (Vite) • Bootstrap 5.3 • Recharts • AWS Amplify Auth (Cognito) • Node/Express • PostgreSQL

---

## Features

- 🔐 **Auth**: Amazon Cognito via AWS Amplify Auth (Public app client, no secret)
- ✍️ **Transactions CRUD**: income & expense
- 🔎 **Filters**: date range, type, category with **autocomplete**
- 📊 **Charts**:
  - **By Category** pie with toggle **Expenses / Income**
  - **Monthly Income vs Expense** bar with toggle **Grouped / Stacked**
- 📄 **Pagination** + **CSV export**
- 🌓 **Dark mode** toggle (Bootstrap 5.3 `data-bs-theme`)
- ♿ **Accessible**: honors `prefers-reduced-motion`

---

## Monorepo Layout
-- PL/pgSQL function
budget-tracker/
├─ server/                    # Express API + Postgres
│  ├─ src/
│  │  ├─ index.js            # app bootstrap
│  │  ├─ db.js               # pg Pool
│  │  ├─ auth.js             # Cognito JWT verify (access or id token)
│  │  ├─ routes/
│  │  │  ├─ transactions.js  # CRUD + pagination + categories
│  │  │  └─ stats.js         # summary (income/expense + by-category)
│  ├─ package.json
│  └─ .env.example
├─ src/                      # React app
│  ├─ components/
│  │  ├─ FiltersBar.jsx
│  │  ├─ TransactionsTable.jsx
│  │  ├─ TransactionForm.jsx
│  │  ├─ SpendingByCategoryPie.jsx
│  │  ├─ MonthlyTotalsBar.jsx
│  │  ├─ PaginationBar.jsx
│  │  └─ ThemeToggle.jsx
│  ├─ context/AuthContext.jsx
│  ├─ lib/api.js
│  ├─ pages/
│  │  ├─ Home.jsx (+ home.css)     # animated landing hero
│  │  └─ Dashboard.jsx
│  ├─ App.jsx, main.jsx, index.css
│  └─ vite.config.js (optional proxy)
├─ package.json              # root scripts (concurrently)
├─ .env.example              # frontend env (no secrets)
└─ README.md
$$ LANGUAGE plpgsql;

---

## Requirements

- **Node.js ≥ 22.12** (Vite 7 requires 20.19+ or 22.12+; recommended 22.x)
- **npm** (bundled with Node)
- **PostgreSQL 16+**
- An **Amazon Cognito User Pool** with a **Public** app client (no client secret)

Optional (recommended):

- Add a `.nvmrc` in repo root:

### Install & Run (local)
```bash
# clone
git clone https://github.com/<you>/<repo>.git
cd budget-tracker

# frontend deps
npm install

# backend deps
cd server && npm install && cd ..
```

- Start PostgreSQL and create DB (macOS Homebrew example):
  ```bash
  brew services start postgresql@16
  createdb budget_tracker
  ```

- Run schema
    ```bash
    # Terminal A - Frontend (Vite @ http://localhost:5173)
    npm run dev

    # Terminal B - Backend (Express @ http://localhost:4000)
    cd server
    npm run dev
    ```

### API (Quick Reference)

All endpoints require Authorization: Bearer <JWT>, where the JWT is a Cognito access token (ID token also accepted).
Base URL (local): http://localhost:4000

- Transactions
```bash
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/categories
```
