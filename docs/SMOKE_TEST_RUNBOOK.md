# 🧪 Dedicated End-to-End Smoke-Test Runbook

This runbook outlines the 12-step verification procedure for validating the Vehicle Service Management Platform in a **dedicated, isolated test environment**.

> [!CAUTION]
> **Safety Rule:** NEVER execute this runbook against the active development or production database (`vehicle_service_db`). Run only against a freshly seeded, dedicated test database instance (e.g. `vehicle_service_test_db`).

---

## ⚙️ Test Environment Configuration

Before executing manual or automated end-to-end smoke testing, verify that:
1. A separate test database URI is configured in a temporary `.env.test` file:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/vehicle_service_test_db
   PORT=5001
   JWT_SECRET=test_runner_jwt_secret_12345
   NODE_ENV=test
   EMAIL_ENABLED=false
   ```
2. The server is launched pointing to the isolated configuration:
   ```bash
   NODE_ENV=test node server.js
   ```
3. Database isolation is confirmed by asserting `mongoose.connection.name === 'vehicle_service_test_db'`.

---

## 📋 The 12-Step Smoke-Test Checklist

| Step # | Verification Area | Test Actions | Expected System Behavior | Verification Status |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Customer Authentication** | Submit `POST /api/users/login` with valid customer credentials. | Server returns HTTP 200, JWT token, and user payload. Password hash is never returned. | **READY (Awaiting Test DB)** |
| **2** | **Vehicle Registration** | As Customer, submit `POST /api/vehicles` with make, model, year, and unique license plate. | HTTP 201 Created. Vehicle record created with `user: req.user._id`. | **READY (Awaiting Test DB)** |
| **3** | **Appointment Booking & IDOR Gate** | a) Customer books appointment for owned vehicle.<br>b) Customer attempts to book appointment passing foreign vehicle ID. | a) HTTP 201 Created (`Pending Approval`).<br>b) HTTP 403 Forbidden (`You can only book appointments for vehicles you own`). | **READY (Awaiting Test DB)** |
| **4** | **Service Desk Approval** | Login as ServiceCenter staff; submit `PUT /api/appointments/:id/approve`. | HTTP 200 OK. Status transitions strictly from `Pending Approval` to `Approved`. Customer notification emitted. | **READY (Awaiting Test DB)** |
| **5** | **Technician Assignment** | ServiceCenter staff submits `POST /api/servicerecords` linking the approved appointment and technician ID. | HTTP 201 Created. ServiceRecord created; Appointment status transitions to `Technician Assigned`. | **READY (Awaiting Test DB)** |
| **6** | **Technician Status Update & BOLA Gate** | a) Assigned technician updates status to `Repair In Progress`.<br>b) Unassigned technician attempts to update that record. | a) HTTP 200 OK. Record and appointment status transition to `Repair In Progress`.<br>b) HTTP 403 Forbidden (`You can only update service records assigned to you`). | **READY (Awaiting Test DB)** |
| **7** | **Repair Completion & Invoicing** | a) Technician logs labor hours (2.5) and parts used; marks `Completed`.<br>b) ServiceCenter generates invoice via `POST /api/invoices`. | a) HTTP 200 OK. Status is `Completed`. Total cost computed (parts + labor + 10% tax).<br>b) HTTP 201 Created. Invoice generated in `Pending` state. Duplicate generation blocked. | **READY (Awaiting Test DB)** |
| **8** | **Invoice Access & Ownership Gate** | a) Customer inspects `GET /api/invoices/myinvoices`.<br>b) Customer 2 attempts to pay Customer 1's invoice. | a) HTTP 200 OK. Customer sees invoice with itemized parts, labor, tax.<br>b) HTTP 403 Forbidden (`Not authorized to pay this invoice`). | **READY (Awaiting Test DB)** |
| **9** | **Duplicate & Concurrency Settlement** | a) Customer settles invoice via `PUT /api/invoices/:id/pay`.<br>b) Customer submits payment again for settled invoice.<br>c) Concurrent simultaneous requests. | a) HTTP 200 OK. Invoice transitions to `Paid`; ServiceRecord `isPaid` set to `true`.<br>b) HTTP 400 Bad Request (`Invoice is already marked as paid`).<br>c) Exactly one request succeeds; losing request receives HTTP 400. | **READY (Awaiting Test DB)** |
| **10** | **Deactivated User Auth Gate** | Set `isActive = false` on user record; attempt any protected API call with their JWT. | HTTP 401 Unauthorized (`Not authorized, user not found or deactivated`). | **READY (Awaiting Test DB)** |
| **11** | **Role-Based Protected Endpoints** | Customer attempts `GET /api/appointments` or `POST /api/invoices`; Technician attempts `/api/users/technicians`. | HTTP 403 Forbidden across all unauthorized role boundaries. | **READY (Awaiting Test DB)** |
| **12** | **Customer Notifications & Receipts** | Inspect `GET /api/notifications` after each lifecycle step (booking, approval, completion, payment). | Accurate notification alerts recorded with timestamps and valid vehicle details. | **READY (Awaiting Test DB)** |

---

## 📊 Status Classification
* **In-Memory Mock/Unit Tests:** **PASS** (15/15 checks passing in `test_phase2c.mjs`, 13/13 in `test_user_hook.mjs`).
* **Frontend Compilation:** **PASS** (Vite production compiler).
* **Live Full-Stack E2E Run:** **NOT RUN** (Preserving strict non-destructive isolation from application database `vehicle_service_db`).
