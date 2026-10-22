# AutoCare — Vehicle Service Management Platform 🚗🔧

[![Node.js Version](https://img.shields.io/badge/Node.js-v16%2B-green.svg)](https://nodejs.org/)
[![Vite Production Build](https://img.shields.io/badge/Vite%20Build-Passing-brightgreen.svg)](https://vitejs.dev/)
[![Automated Security Checks](https://img.shields.io/badge/Security%20Checks-28%2F28%20Passing-success.svg)](#-verification--test-suites)
[![Database](https://img.shields.io/badge/Database-MongoDB%207.x%20%7C%20Mongoose-blue.svg)](https://www.mongodb.com/)

AutoCare is a full-stack MERN (MongoDB, Express, React, Node.js) web application engineered to manage end-to-end automotive service center operations. It provides a multi-role workflow coordinating vehicle owners, service desk staff, technicians, and administrators through state-driven appointment scheduling, workshop bay job execution, dynamic bill calculation, and atomic payment settlement.

---

## 🏛️ System Architecture

AutoCare is organized into a modular decoupled architecture:

```
[ Client Application (React 18 + Redux Toolkit + Vite + Tailwind CSS) ]
                               │
                       HTTP / REST (JSON)
                     Authorization: Bearer <JWT>
                               │
                               ▼
[ Express.js REST API Server (Node.js ES Modules) ]
    ├── Authentication & Soft-Delete Gate (protect middleware)
    ├── Role-Based Access Control (roleMiddleware: Admin / ServiceCenter / Technician)
    ├── Domain Controllers (Users, Vehicles, Appointments, ServiceRecords, Invoices)
    └── Transactional Email Dispatcher (Nodemailer: SMTP / Ethereal Fallback)
                               │
                        Mongoose 7.5 ODM
                               │
                               ▼
[ MongoDB Database Engine ]
    ├── Users Collection (Bcrypt Hashed Passwords, Role Discriminator)
    ├── Vehicles Collection (Unique License Plates, Sparse VINs)
    ├── Appointments Collection (Multi-State Lifecycle Engine)
    ├── ServiceRecords Collection (Parts Registry, Labor Hours, Status Sync)
    └── Invoices Collection (Atomic Settlement Concurrency Guard)
```

---

## 👥 User Roles and Permissions (RBAC)

The platform enforces Role-Based Access Control (RBAC) across four roles:

| Role | Core Responsibilities | Accessible Endpoints & Views |
| :--- | :--- | :--- |
| **Customer** | Registers personal vehicles, books service appointments for owned vehicles, reviews repair histories, tracks service progress, and settles pending invoices. | `/api/vehicles/myvehicles`<br>`/api/appointments/myappointments`<br>`/api/invoices/myinvoices`<br>`PUT /api/invoices/:id/pay` |
| **Technician** | Inspects assigned workshop repairs, updates real-time bay status, logs replacement parts used, records labor hours, and marks repairs as Completed. | `GET /api/servicerecords/myjobs`<br>`PUT /api/servicerecords/:id/status` (Assigned records only) |
| **ServiceCenter** | Reviews submitted customer appointments, accepts or rejects requests, assigns master technicians to bays, and generates final billed invoices upon repair completion. | `GET /api/appointments` (Global queue)<br>`PUT /api/appointments/:id/approve`<br>`PUT /api/appointments/:id/reject`<br>`POST /api/invoices` |
| **Admin** | Manages system-wide operations, provisions staff and technician accounts, oversees global invoices, deletes records, and has administrative operational override permissions. | `POST /api/users/create-technician`<br>`DELETE /api/servicerecords/:id`<br>All ServiceCenter endpoints |

---

## 🔄 Core Business Workflows

### 1. Appointment Scheduling & Approval Lifecycle
Appointments transition through a state machine preventing invalid actions:
```
[ Customer Submits Request ] ──► status: "Pending Approval"
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
          [ Staff Approves ]                             [ Staff Rejects ]
        status: "Approved"                             status: "Rejected"
                  │                                  (Rejection reason recorded)
                  ▼
      [ Assign Technician ]
    status: "Technician Assigned"
    (Creates ServiceRecord link)
```

* **Ownership Enforcement:** Customers can only book appointments for vehicles they verifiably own in the database (`vehicle.user === req.user._id`).
* **Cancellation Protection:** Customers may cancel requests only before hands-on repair work starts (`Pending Approval`, `Approved`, or `Technician Assigned`).

### 2. Workshop Execution & Invoice Generation
```
[ Technician Starts Bay Work ] ──► status: "Repair In Progress"
                                              │
                                              ▼
[ Parts & Labor Logged ] ────────► status: "Completed"
                                  (Calculates Parts Cost + Labor @ $100/hr + 10% Tax)
                                              │
                                              ▼
[ Staff Generates Invoice ] ─────► Invoice Created (status: "Pending")
                                  (Sets ServiceRecord.invoiceGenerated = true)
```

### 3. Concurrency-Safe Payment Settlement
Invoice payment uses an **atomic single-document conditional update** combined with a **compensating rollback** on standalone MongoDB:
```
[ Customer Submits Payment ]
             │
             ▼
[ Atomic Transition on Invoice ]
Invoice.findOneAndUpdate({ _id: id, paymentStatus: 'Pending' }, { $set: { paymentStatus: 'Paid' } })
   ├── Matched 0 Docs ──► Rejection HTTP 400 (Already paid or competing concurrent lock)
   └── Matched 1 Doc
             │
             ▼
[ Synchronize ServiceRecord ]
ServiceRecord.updateOne({ _id: recordId }, { $set: { isPaid: true } })
   ├── Failure / 0 Matched ──► Compensating Rollback: Reverts Invoice to 'Pending', Throws HTTP 500
   └── Success
             │
             ▼
[ Dispatch Asynchronous Notifications & Customer Email Receipt ] ──► Returns HTTP 200 OK
```

---

## 🛠️ Technology Stack

### Frontend
* **React 18**: Component-driven SPA architecture.
* **Redux Toolkit**: Centralized store slices for authentication, vehicles, appointments, services, and billing.
* **React Router v6**: Client-side protected and role-guarded routes.
* **Vite 4**: Build engine delivering tree-shaken production bundles.
* **Tailwind CSS 3**: Utility-first styling with dark/light theme support.
* **React Hot Toast**: Real-time asynchronous operation notifications.

### Backend
* **Node.js**: Asynchronous event-driven runtime (ES Modules format).
* **Express.js 4**: Middleware pipeline and REST route routing.
* **Mongoose 7.5**: Object Data Modeling (ODM) with custom pre-save hooks and population schemas.
* **Bcrypt.js**: Cryptographic salt generation (10 rounds) and password hashing.
* **JSON Web Tokens (jsonwebtoken)**: HMAC-SHA256 tokens for stateless API authorization.
* **Nodemailer**: Transactional email dispatcher with development SMTP (Ethereal) fallback.

---

## 📁 Repository Structure

```text
├── client/                     # React Single Page Application (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components & route guards
│   │   ├── pages/              # Role-specific dashboards & workflows
│   │   ├── redux/              # Redux Toolkit store and feature slices
│   │   │   ├── slices/         # authSlice, appointmentSlice, invoiceSlice, etc.
│   │   │   └── store.js        # Configured Redux store with Vite devTools
│   │   ├── services/           # Axios client with JWT bearer interceptors
│   │   └── utils/              # Route constants, status enums, and icons
│   ├── .env.example            # Client environment variable template
│   └── package.json            # Frontend dependencies and Vite scripts
│
├── server/                     # Express.js REST API Server
│   ├── controllers/            # Controller business logic & validation
│   ├── middleware/             # authMiddleware, roleMiddleware, errorMiddleware
│   ├── models/                 # Mongoose schemas: User, Vehicle, Appointment, ServiceRecord, Invoice
│   ├── routes/                 # Express route endpoint definitions
│   ├── utils/                  # Email dispatchers, templates, token generators
│   ├── test_phase2c.mjs        # Isolated payment concurrency & authorization test suite
│   ├── test_user_hook.mjs      # Isolated Mongoose 7 async pre-save hook test suite
│   ├── .env.example            # Server environment configuration template
│   └── package.json            # Backend dependencies and scripts
│
├── docs/                       # Technical deep dives and change summaries
│   ├── ARCHITECTURE.md         # Full system architecture, ER diagrams & security
│   ├── CHANGES_SUMMARY.md      # Detailed audit logs of remediations
│   ├── INVOICE_FIX_GUIDE.md    # Architecture guide for financial consistency
│   ├── QUICK_TEST_GUIDE.md     # Manual smoke-testing runbook
│   └── SMOKE_TEST_RUNBOOK.md   # Isolated 12-step E2E verification runbook
│
├── PROJECT_MASTER_DATA.md      # Seed credentials, roles, and model attributes
├── PROJECT_SUMMARY.md          # Comprehensive platform summary & data manifest
└── README.md                   # Primary architectural and setup documentation
```

---

## 🔐 Authentication & Token Flow

1. **Credentials Validation:** Login request (`POST /api/users/login`) validates email and bcrypt password hash.
2. **Token Generation:** Server signs a JWT containing `{ userId, role }` signed with `JWT_SECRET` (valid for 30 days).
3. **Client Storage:** The token is returned in the JSON response and stored in browser `localStorage`.
4. **Request Authorization:** Outgoing API requests attach the token via HTTP header:
   ```http
   Authorization: Bearer <token>
   ```
5. **Backend Verification:** `protect` middleware decodes the token, loads the user record, and verifies active status (`isActive !== false`).

> **Architectural Note:** Documentation in early prototypes claimed HTTP-only cookie storage. The active implementation stores JWTs in `localStorage` and transmits via `Bearer` headers. Migrating to secure, same-site HTTP-only cookies is documented in [Known Trade-offs](#-known-limitations--architectural-trade-offs).

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** v16.0.0 or higher (v18+ recommended)
* **MongoDB:** Local MongoDB Community Server (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Thapan6/Vehicle-Service-Management.git
cd Vehicle-Service-Management
```

### 2. Configure Backend Environment
Create `server/.env` based on `server/.env.example`:
```bash
cd server
cp .env.example .env
```
Ensure the following variables are configured in `server/.env`:
* `PORT=5000`
* `NODE_ENV=development`
* `MONGO_URI=mongodb://127.0.0.1:27017/vehicle_service_db`
* `JWT_SECRET=your_secure_development_jwt_secret`
* `EMAIL_ENABLED=false` *(Optional: set to `true` with SMTP credentials to enable transactional email receipts)*

### 3. Install and Run Backend
```bash
npm install
npm run dev
```
Backend starts on `http://localhost:5000`.

### 4. Configure & Run Frontend
In a new terminal window:
```bash
cd client
cp .env.example .env   # Defaults to VITE_API_BASE_URL=http://localhost:5000
npm install
npm run dev
```
Frontend application opens on `http://localhost:3000`.

---

## 🧪 Verification & Test Suites

The repository contains isolated test suites that execute completely in-memory without accessing or mutating the application database:

### 1. User Pre-Save Password Hook Suite
Tests password hashing on creation, idempotency on profile edits, re-hashing on update, and preservation across account deactivation/restoration:
```bash
node server/test_user_hook.mjs
```
* **Coverage:** 13 automated checks. **Result:** 13/13 PASS (100%).

### 2. Payment Concurrency, IDOR, & Authorization Suite
Tests atomic invoice payment locks, simultaneous concurrent requests, cross-document failure compensating rollbacks, vehicle booking ownership validation, and technician task BOLA guards:
```bash
node server/test_phase2c.mjs
```
* **Coverage:** 15 automated checks. **Result:** 15/15 PASS (100%).

### 3. Frontend Production Build
Validates bundle compilation, JSX typing, and dependency packaging:
```bash
cd client
npm run build
```
* **Result:** PASS (185 modules compiled into optimized distribution bundle in ~2.4s).

---

## 🎥 Live Demonstration & Genuine Interface Walkthrough

### Demonstration Assets & Recordings
* **External Cloud Walkthrough:** [Google Drive Full Demonstration Video](https://drive.google.com/file/d/1xhlkniJSBTGXFG65aGaPUYQWhAVKaErZ/view?usp=drive_link) *(as recorded in `Video_Project_Demonstration`)*
* **Repository Walkthrough Video:** `Demonstration_VSM6.mp4` (~19.2 MB) and `Demonstration_VSM.mp4` (~6.8 MB) in the repository root.
* **Architecture Deep Dive:** Full technical specifications and schema relationships documented in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

### Genuine Application Interface Inventory

| View / Dashboard | Target Role | Key Genuine UI Capabilities & Controls |
| :--- | :--- | :--- |
| **Customer Portal** (`/dashboard`, `/book-service`) | Customer | Registered vehicle fleet cards, instant service booking modal with real-time date/time slot pickers, live service state tracking badge (`Pending Approval` → `Completed`). |
| **Payment Hub** (`/payments`) | Customer | Itemized breakdown of labor hours, parts consumed, 10% tax calculation, and atomic one-click checkout. |
| **Service Desk Queue** (`/service-center`) | ServiceCenter | Master Appointment Queue with single-click Approve/Reject actions, Technician Allocation Matrix, and Invoice Generation Engine. |
| **Technician Workbench** (`/technician`) | Technician | Assigned bay jobs list, interactive status changer (`Repair In Progress`), dynamic parts & labor logger ($100/hr base rate), and completion trigger. |
| **Admin Operations** (`/admin`) | Admin | Platform-wide KPI counters, technician onboarding modal, and user management with soft-delete toggle (`isActive`). |

### ⏱️ Fast-Track 3-Minute Demo Walkthrough Plan
1. **Act 1 — Customer Booking (45s):**
   * Log in as `customer@vsm.com` (`CustomerPassword123!`).
   * Navigate to `/book-service`, select owned vehicle, pick service type `Oil Change`, and submit booking (`Pending Approval`).
2. **Act 2 — Service Desk Dispatch (45s):**
   * Log in as `service@vsm.com` (`ServicePassword123!`).
   * Review queue on `/service-center`, click **Approve**, then dispatch Master Technician `mechanic@vsm.com`. Status transitions to `Technician Assigned`.
3. **Act 3 — Technician Execution & Logging (45s):**
   * Log in as `mechanic@vsm.com` (`MechanicPassword123!`).
   * On `/technician`, move job to `Repair In Progress`. Add replacement part (Oil Filter, $25.00), log `1.5` labor hours, and click **Mark as Completed**.
4. **Act 4 — Invoicing & Atomic Settlement (45s):**
   * On `/service-center`, click **Generate Invoice** ($150 labor + $25 parts + 10% tax = $192.50).
   * Switch to `customer@vsm.com` on `/payments`, review itemized invoice, and click **Pay Now**. Status transitions to `Paid` with real-time toast confirmation.

---

## ⚖️ Known Limitations & Architectural Trade-offs

1. **Standalone MongoDB vs. Multi-Document ACID Transactions:**
   * *Status:* The local development environment uses standalone MongoDB (`mongodb://127.0.0.1:27017`), which does not support multi-document replica-set transactions (`session.withTransaction`).
   * *Mitigation:* Single-document atomic updates on `Invoice` prevent double-spending; transient synchronization errors on `ServiceRecord` execute a compensating rollback.
   * *Production Recommendation:* Deploy MongoDB as a replica set (`--replSet rs0`) and wrap payment synchronization in native ACID transactions.

2. **Client-Side Token Storage:**
   * *Status:* JWT is stored in browser `localStorage`.
   * *Production Recommendation:* Migrate session tokens to secure, `HttpOnly`, `SameSite=Strict` cookies to mitigate Cross-Site Scripting (XSS) token exfiltration risks.

3. **Repository Media Storage:**
   * *Status:* The Git repository history contains ~40MB of demonstration video and documentation assets.
   * *Showcase Recommendation:* Migrate binary demonstration videos to external video hosting (e.g., YouTube/Vimeo) and untrack large binary files to minimize clone times.

---

## 📄 License

This project is submitted for SDE Showcase Review. For open-source terms, an MIT License is proposed and pending maintainer approval.
