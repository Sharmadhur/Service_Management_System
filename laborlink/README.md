# LaborLink — On-Demand Labor Service Management System

LaborLink is a full-stack MERN app that connects customers with verified workers across multiple service trades. The application supports request management, nearby worker matching, job lifecycle tracking, payments, worker reviews, and role-based admin management.

## Tech stack

- Frontend: React 18 + Vite + React Router + Tailwind CSS + React Toastify
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- Payments: Razorpay test mode integration
- Uploads: Multer with local storage under `/uploads`
- Real-time: Socket.io scaffold for live updates

## Setup

### 1. Prerequisites

- Node.js 18+
- MongoDB running locally or on MongoDB Atlas

### 2. Backend configuration

```bash
cd laborlink/backend
npm install
cp .env.example .env
```

Then update the values in `.env`:

- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — a secure random string
- `CLIENT_URL` — frontend origin, such as `http://localhost:5173`
- `RAZORPAY_KEY_ID` — your Razorpay test key
- `RAZORPAY_KEY_SECRET` — your Razorpay test secret
- `RAZORPAY_WEBHOOK_SECRET` — your Razorpay webhook secret

Run the app:

```bash
npm run seed
npm run dev
```

Demo accounts:

- Admin: `admin@laborlink.com` / `admin123`
- Customer: `customer@laborlink.com` / `password123`
- Worker: `worker1@laborlink.com` / `password123`

### 3. Frontend configuration

```bash
cd laborlink/frontend
npm install
cp .env.example .env
```

Add your public Razorpay key:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

Then run:

```bash
npm run dev
```

The Vite app proxies API requests to the backend at `http://localhost:5000`.

## Updated functionality

### 1) Real Razorpay payment integration

The app now creates Razorpay orders on the backend and verifies the payment signature before marking a request as paid. Payment records are stored in MongoDB and worker earnings are credited only once per verified payment.

Important behavior:

- The amount is calculated on the server using the request and worker data.
- The frontend never receives or stores the Razorpay secret key.
- Duplicate payments are blocked using request-level idempotency.
- Webhook validation is supported for reliable confirmation.

### 2) Customer-selected nearby workers

Customers can now:

- detect their current location using the browser geolocation API
- enter city/address manually if permission is denied
- search nearby approved and available workers within a configurable radius
- compare workers by distance, rating, reviews, and skills
- confirm a worker selection before creating the service request

The selected worker is assigned only after customer confirmation, and if the worker rejects the request, the customer returns to the selection flow rather than having another worker auto-assigned without consent.

### 3) Worker rating and review system

Customers can:

- submit a 1–5 star review after job completion
- leave an optional comment
- submit only one review per completed request

Worker ratings are recalculated automatically from all reviews and stored back on the worker profile.

## Payment configuration and testing

### Razorpay test mode

1. Sign in to the Razorpay Dashboard.
2. Open Test Mode.
3. Copy your test key ID and secret.
4. Set them in `backend/.env` as:

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_test_secret
```

5. Set the public key in `frontend/.env`:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

6. Create a webhook in the Razorpay dashboard and set `RAZORPAY_WEBHOOK_SECRET` in the backend.

### Payment testing workflow

1. Complete a job and ensure it is in `completed` status.
2. Click Pay Now from the customer dashboard.
3. A Razorpay checkout modal opens.
4. Use Razorpay test payment credentials to complete a successful payment.
5. The backend verifies the signature.
6. The request payment status becomes `paid` and worker earnings are credited.
7. Test a failed payment and confirm the payment record is marked `failed`.
8. Repeat the same payment flow to confirm duplicate protection.

## Updated API routes

### Customer

- `POST /api/customer/request`
- `POST /api/customer/selectWorker`
- `GET /api/customer/searchNearbyWorkers`
- `GET /api/customer/searchWorkers`
- `GET /api/customer/myRequests`
- `GET /api/customer/myPayments`
- `POST /api/customer/pay/:id`
- `POST /api/customer/verifyPayment`
- `POST /api/customer/payment/webhook`
- `POST /api/customer/review`
- `GET /api/customer/myReviews`
- `GET /api/customer/worker/:workerId`

### Worker

- `GET /api/worker/assignedJobs`
- `GET /api/worker/incomingRequests`
- `PUT /api/worker/acceptJob/:id`
- `PUT /api/worker/rejectJob/:id`
- `PUT /api/worker/updateStatus/:id`
- `PUT /api/worker/availability`
- `PUT /api/worker/location`
- `PUT /api/worker/profile`
- `GET /api/worker/earnings`
- `GET /api/worker/reviews`

### Admin

- `GET /api/admin/workers`
- `PUT /api/admin/approveWorker/:id`
- `GET /api/admin/requests`
- `PUT /api/admin/assignWorker/:id`
- `GET /api/admin/reviews`
- `DELETE /api/admin/reviews/:id`
- `GET /api/admin/analytics`

## Worker selection workflow

1. Customer chooses a service category and enters the address or location.
2. The app fetches nearby approved and available workers.
3. Workers are ranked by proximity, then rating.
4. Customer compares candidates and selects one.
5. A confirmation modal verifies the details.
6. A service request is created and assigned to the selected worker only after confirmation.
7. The worker can accept or reject the job.
8. If rejected, the customer must choose another worker.

## Rating workflow

1. After job completion, the customer can open Rate & Review.
2. The customer enters a 1–5 star score and optional comment.
3. The review is saved once per request.
4. The worker's average rating and total review count are recalculated automatically.
5. These values appear on worker cards and profile summaries.

## Verification

This project was validated with:

```bash
cd laborlink/backend
node --check server.js && node --check controllers/customerController.js && node --check controllers/workerController.js && node --check utils/assignWorker.js

cd ../frontend
npm run build
```

The frontend production build completed successfully with Vite. A live MongoDB-backed runtime test requires a running database and valid payment credentials.
