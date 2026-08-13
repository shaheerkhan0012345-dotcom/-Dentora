# TEETHLY – AI-POWERED DENTAL PRACTICE OPERATING SYSTEM
## Phase 10 Production Documentation & Deployment Guide

---

## 1. ARCHITECTURE OVERVIEW

Teethly is an enterprise-grade, multi-tenant Dental Practice Operating System engineered with modern web standards, role-based access control (RBAC), and offline-first capabilities.

### Key Architectural Layers:
* **Frontend Framework:** React 18+ with Vite & TypeScript for strict type safety.
* **Styling & UI Design System:** Custom Tailwind CSS v4 design tokens, Lucide icons, responsive flex/grid layouts.
* **State Management:** React Context (`AuthProvider`, `ClinicProvider`), Zustand stores (`useOfflineSyncStore`).
* **Database & Auth:** Firebase Firestore with multi-tab IndexedDB offline persistence & Firebase Authentication.
* **AI Copilot Architecture:** Server-side Google Gemini 2.5/Flash API via proxy routes (`/api/gemini/analyze`) to ensure zero API key exposure to client browsers.
* **Progressive Web App (PWA):** Custom Service Worker (`/sw.js`), Web App Manifest (`manifest.json`), offline fallback shell, and Web Push Notifications.

---

## 2. PHASE 10 IMPLEMENTED PRODUCTION MODULES

### A. Progressive Web App (PWA) & Offline Mode
* **Service Worker (`public/sw.js`):** Implements Network-First strategy for dynamic API calls and Cache-First strategy for static shell assets.
* **Offline Sync Store (`src/services/offlineSyncService.ts`):** Automatically queues offline operations (appointments, notes, payments) when internet connectivity is lost, displaying a live banner (`OfflineBanner.tsx`). Automatically re-syncs queue upon network restoration.
* **PWA Installation Prompt (`PWAInstaller.tsx`):** Detects `beforeinstallprompt` event and guides users to install Teethly natively on desktop or mobile.

### B. Push & Email Notification Engine
* **Push Notification Service (`src/services/pushNotificationService.ts`):** Handles desktop/mobile notification permissions, plays synthesized audio feedback, and delivers alerts for appointments, overdue invoices, low inventory, and AI clinical warnings.
* **Email Engine (`src/services/emailService.ts` & `EmailPreviewModal.tsx`):** Provides HTML email templates with inline CSS for Appointment Confirmations, Reminders, Invoices, Password Resets, and Post-Procedure Oral Care follow-ups.

### C. System Health, Logging & Performance Telemetry
* **Central Logger (`src/services/loggerService.ts`):** Records runtime exceptions, security audit trails, and Web Vitals (LCP, FID, Firestore query latencies).
* **Global Error Boundary (`src/components/common/ErrorBoundary.tsx`):** Catches uncaught React render exceptions, shields patient data, and provides stack trace inspection and soft-recovery options.

### D. Backup, Recovery & Disaster Management
* **Backup Engine (`src/services/backupService.ts`):** Exports comprehensive JSON snapshots of all database collections (Patients, Appointments, Billing, Inventory, Staff, Clinic Settings).
* **Disaster Recovery Restore:** Validates and restores system state from uploaded JSON snapshot files directly inside `SystemHealthModal.tsx`.

### E. Security Hardening
* **XSS Sanitization & Input Guard (`src/utils/security.ts`):** Sanitizes inputs to prevent script injection attacks.
* **Client-Side Rate Limiter:** Guards sensitive authentication and booking forms from rapid automated requests.
* **CSRF Token Nonce Generator:** Binds unique nonces to state mutation forms.

---

## 3. PROJECT FOLDER STRUCTURE

```
teethly/
├── public/
│   ├── manifest.json            # PWA Manifest configuration
│   ├── sw.js                    # Service Worker caching & background sync
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/
│   │   ├── admin/               # Attendance, Financial Reports, Audit Trail
│   │   ├── common/              # ErrorBoundary, UI primitives
│   │   ├── dashboard/           # Sidebar, TopNavbar, MessagingPanel, Clinical Dashboards
│   │   ├── email/               # EmailPreviewModal & composer
│   │   ├── pwa/                 # PWAInstaller, OfflineBanner, SystemHealthModal
│   │   └── reports/             # ReportGenerator for Financial & Inventory PDF/Excel
│   ├── context/
│   │   ├── AuthContext.tsx       # Firebase Auth context
│   │   └── ClinicContext.tsx     # Multi-tenant SaaS clinic selector context
│   ├── firebase/
│   │   ├── config.ts            # Firebase app initialization & IndexedDB persistence
│   │   └── firestoreError.ts    # Error mapper for Firestore security rules
│   ├── services/
│   │   ├── auditLogService.ts    # System & clinical audit trail
│   │   ├── backupService.ts      # Database JSON backup & restore
│   │   ├── emailService.ts       # HTML Email dispatch & templates
│   │   ├── loggerService.ts     # Telemetry & performance metrics
│   │   ├── offlineSyncService.ts # Offline queue manager
│   │   └── pushNotificationService.ts # FCM / Web Push alerts
│   ├── utils/
│   │   └── security.ts          # XSS, RateLimiter, Input validators
│   ├── App.tsx
│   └── main.tsx                 # Entry point with PWA Service Worker registration
├── firebase-applet-config.json
├── firestore.rules
├── metadata.json
└── package.json
```

---

## 4. LOCAL DEVELOPMENT & DEPLOYMENT GUIDE

### Prerequisites
* Node.js v18.x or v20.x
* npm / yarn

### Local Setup
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server on Port 3000
npm run dev
```

### Production Build & Linting Verification
```bash
# Validate TypeScript and ESLint syntax
npm run lint

# Build production assets
npm run build
```

---

## 5. ENVIRONMENT VARIABLES (`.env.example`)

```env
# Server-Side Secrets (Never exposed to browser)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 6. VERIFICATION & QUALITY ASSURANCE

Teethly OS Phase 10 has been thoroughly tested for:
1. Zero TypeScript compilation errors (`npm run build` succeeds cleanly).
2. Clean linting score (`npm run lint` passes).
3. Service worker registration & offline cache fallback.
4. Data snapshot export & disaster recovery restore.
5. Role-based access control for Super Admin, Clinic Owner, Doctor, Assistant, Receptionist, and Patient.
