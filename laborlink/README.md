# LaborLink — On-Demand Labor Service Management System

A full-stack MERN application connecting customers with skilled/unskilled workers
across 12 service trades. Customers request a worker; the system automatically
matches the nearest available, skill-matched worker (or an admin can assign one
manually); the job moves through a full status lifecycle to payment and review.

## Tech stack

- **Frontend:** React 18 (Vite), React Router, Axios, Tailwind CSS, React Toastify, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt, role-based access control (customer / worker / admin)
- **Uploads:** Multer (local disk storage, served from `/uploads`)
- **Real-time:** Socket.io scaffolding is wired up server-side for live status pushes

## Folder structure

```
laborlink/
  backend/
    server.js
    config/db.js
    controllers/        # auth, customer, worker, admin
    middlewares/         # auth (JWT + RBAC), errorHandler, upload
    models/              # User, Worker, ServiceRequest, Review, Payment, Category
    routes/
    utils/assignWorker.js  # skill + location matching logic
    seed/seed.js
  frontend/
    src/
      api/axios.js
      context/AuthContext.jsx
      components/         # Navbar, DashboardLayout, StatusBadge, ProtectedRoute
      pages/
        public/            # Home, About, Services, Contact, Login, Register
        customer/
        worker/
        admin/
```

## Setup

### 1. Prerequisites
- Node.js 18+
- A running MongoDB instance (local, or a connection string from MongoDB Atlas)

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit MONGO_URI / JWT_SECRET if needed
npm run seed            # optional: creates demo admin/customer/worker accounts
npm run dev              # starts on http://localhost:5000
```

Demo accounts created by the seed script:

| Role     | Email                    | Password     |
|----------|---------------------------|--------------|
| Admin    | admin@laborlink.com       | admin123     |
| Customer | customer@laborlink.com    | password123  |
| Worker   | worker1@laborlink.com     | password123  |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev              # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`,
so no `.env` is needed on the frontend for local development.

## How worker assignment works

1. A customer submits a request with category, address/city, and preferred date/time.
2. `utils/assignWorker.js` looks for **approved, available** workers whose `skills`
   include the requested category, excluding any worker who already rejected this job.
3. Candidates are ranked by: same city first, then nearest by lat/lng (haversine
   distance) if coordinates are set, then highest rating.
4. The top candidate is auto-assigned (`status: assigned`). If none are available,
   the request stays `requested` until an admin assigns one manually, or a worker
   becomes available (a fresh request can be resubmitted, or an admin can assign).
5. If the assigned worker rejects, the job is automatically reassigned to the next
   best candidate.

## Job status lifecycle

```
requested → assigned → accepted → on_the_way → in_progress → completed → (paid) → (reviewed)
```
A request can also move to `cancelled` (by the customer, before completion) or
`rejected`-then-reassigned (by a worker declining an assigned job).

## Key API routes

| Method | Route                                  | Access   |
|--------|------------------------------------------|----------|
| POST   | /api/auth/register                        | Public   |
| POST   | /api/auth/login                           | Public   |
| GET    | /api/auth/me                              | Any      |
| POST   | /api/customer/request                     | Customer |
| GET    | /api/customer/myRequests                  | Customer |
| PUT    | /api/customer/cancelRequest/:id           | Customer |
| POST   | /api/customer/pay/:id                     | Customer |
| POST   | /api/customer/review                       | Customer |
| GET    | /api/customer/searchWorkers                | Customer |
| GET    | /api/worker/assignedJobs                   | Worker   |
| PUT    | /api/worker/acceptJob/:id                  | Worker   |
| PUT    | /api/worker/rejectJob/:id                  | Worker   |
| PUT    | /api/worker/updateStatus/:id               | Worker   |
| PUT    | /api/worker/availability                    | Worker   |
| GET    | /api/admin/users                            | Admin    |
| GET    | /api/admin/workers                          | Admin    |
| PUT    | /api/admin/approveWorker/:id                | Admin    |
| GET    | /api/admin/requests                          | Admin    |
| PUT    | /api/admin/assignWorker/:id                  | Admin    |
| GET    | /api/admin/analytics                         | Admin    |

See `backend/routes/` for the full list, including categories CRUD and review
moderation.

## Notes / what's simplified for this build

- **Payments** are dummy — `POST /api/customer/pay/:id` immediately marks a
  completed job as paid and credits the worker's earnings, with no real payment
  gateway integration.
- **Email notifications** and **PDF invoice download** are not implemented;
  Socket.io is wired up server-side as the foundation for live status pushes,
  but the frontend does not yet subscribe to socket events.
- **Cloudinary** is not integrated — profile images are stored on local disk
  under `backend/uploads/` and served statically.
- Extend `utils/assignWorker.js` if you want geocoding (address → lat/lng) for
  true distance-based matching; currently lat/lng must be supplied directly.

## Production notes

- Set a strong, random `JWT_SECRET` in `backend/.env` before deploying.
- Point `MONGO_URI` at your production database and `CLIENT_URL` at your deployed
  frontend origin (used for CORS).
- Build the frontend with `npm run build` inside `frontend/` and serve the
  `dist/` folder from your static host or CDN of choice.
