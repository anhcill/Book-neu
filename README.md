# Neu Book (Frontend)

This repository contains the frontend for the Neu Book e-commerce application (React). This README covers frontend-specific setup, development and deployment notes so contributors can get started quickly.

## Quick overview
- Framework: React (Create React App)
- Language: JavaScript (JSX)
- State: Context API
- HTTP client: axios
- Dev server port: `3000` (default)
- Backend API: expected at `http://localhost:5000` (see `REACT_APP_API_URL` in env)

This frontend integrates with the backend API located in the `backend/` folder. Admin pages include: product management, order manager, user management and analytics.

---

## Prerequisites
- Node.js v16+ (recommended) and npm or yarn
- A running MySQL database for the backend (if you want full end-to-end)

## Environment
Create a `.env` file in the project root (or set env vars in your environment). Important variables used by the frontend:

- `REACT_APP_API_URL`  Base URL for the backend API (default used in code: `http://localhost:5000`)

Example `.env`:

```
REACT_APP_API_URL=http://localhost:5000
```

> Note: Some code uses `localStorage` to store `token`, `userRole`, and `userInfo` for authentication. To test admin pages, login as an admin user in the backend or set a valid token in `localStorage`.

---

## Install (frontend)

Open a terminal in the repository root and run:

```powershell
# install frontend dependencies
npm install
```

If you prefer `yarn`:

```powershell
# with yarn
yarn install
```

---

## Run (development)

Start the frontend dev server:

```powershell
npm start
```

The app will open at `http://localhost:3000` by default.

If running the backend locally as well, ensure it is started (typically `node server.js` or `npm run dev` in the `backend/` folder) so the frontend can call the API.

---

## Build (production)

Build static assets for production:

```powershell
npm run build
```

The `build/` directory will contain the production-ready static site. The `build/` folder is already present in this workspace with a previous build.

---

## Project structure (important parts)

- `src/`  React source
  - `Components/`  reusable UI components (Navbar, ProductCard, Sidebar, etc.)
  - `Pages/`  top-level pages (Home, Shop, ProductPage, Admin)
  - `Context/`  Context API providers (user, cart, wishlist, toast, etc.)
  - `UtilityFunctions/`  small helpers

- `public/`  static public assets
- `build/`  production build output

Admin pages are under `src/Pages/Admin/` and include:
- `AdminDashboard.jsx`  entry dashboard
- `ProductManager.jsx`, `ProductEditor.jsx`  product CRUD
- `OrderManager.jsx`  admin order list & status updates
- `UserManagement.jsx`  admin user management
- `OrderAnalytics.jsx` (frontend analytics page UI)

---

## Admin features (what's available)
- Order management (view, update status, confirm/ship/deliver/cancel)
- User management (list, ban/unban, delete, view recent orders)
- Notifications in the navbar for user/admin events
- Role switcher to toggle admin/user view locally
- Order cancellation flow and delivery history

Note: The analytics UI (`OrderAnalytics.jsx`) is present, but requires the backend analytics endpoint (`/api/admin/orders/analytics`) to be available for full functionality. If that endpoint is missing, analytics widgets will show empty states.

---

## Testing

There are no automated tests included by default. Manual testing steps:

1. Start backend: open `backend/` and run the backend server (check `backend/server.js` and `backend/package.json` scripts).
2. Start frontend: `npm start` in project root.
3. Log in as admin (use a seeded admin or create one via backend) and open `/admin` pages.

---

## Common commands

```powershell
# frontend
npm install
npm start
npm run build

# backend (example from backend folder)
cd backend
npm install
node server.js
# or if backend has a dev script
npm run dev
```

---

## Contributing

If you want to contribute:

1. Create an issue describing the feature/bug.
2. Create a feature branch: `git checkout -b feat/my-feature`.
3. Make changes, keep them focused and small.
4. Run `npm start` to test and `npm run build` to verify production build.
5. Open a PR with a clear description and testing steps.

---

## Troubleshooting

- API calls failing: ensure `REACT_APP_API_URL` is set to your backend URL and backend is running.
- CORS issues: check backend CORS configuration (backend/server.js).
- Authentication: frontend expects JWT in `localStorage` key `token` and `x-access-token` header is used for protected endpoints.

---

## Contact

If you need help, ping the maintainer: Lê Đức Anh  `0815913408`  Instagram: `@anhcill`.

---

Thank you  bắt đầu phát triển thôi! 
