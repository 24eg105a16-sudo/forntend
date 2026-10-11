# Frontend — Personal Expense Tracker

React 18 + Vite single-page web application featuring React Router, Recharts, Axios, and custom responsive CSS.

## Structure
- `src/components`: UI components such as ProtectedRoute.
- `src/context`: AuthContext handling JWT persistence and global login state.
- `src/layouts`: Sidebar, Navbar, and DashboardLayout.
- `src/pages`: 10 pages (Login, Register, Dashboard, Transactions, AddTransaction, EditTransaction, Budgets, Reports, Profile, NotFound).
- `src/services`: Centralized Axios API client with automatic token attachment and 401 handling.
- `src/utils`: Currency/date formatters and default category definitions.
- `src/index.css`: Design system stylesheet.

## Running the Frontend

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Serves the application locally at `http://localhost:5173`.

### Production Build
```bash
npm run build
```
Generates production assets in `dist/`.
