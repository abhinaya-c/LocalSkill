# LocalSkill — Premium Local Skill Marketplace

**LocalSkill** is a modern, high-conversion, community-focused skill marketplace designed to connect home owners, businesses, and learners directly with verified local professionals (electricians, plumbers, designers, tutors, cleaners, and mechanics) in Pokhara. 

Built on a zero-commission, direct-to-customer model, LocalSkill streamlines local service discovery through an interactive map-enabled interface, real-time availability slot booking, instant live chat, and automated administrative credential verification auditing.

---

## 🎨 Design Philosophy & Themes

LocalSkill features a cohesive, premium glassmorphic visual layout that dynamically adjusts its branding variables to match the active user's roles:
- 🔵 **Customer UI (Blue)**: Focused on discovery feeds, search filters, interactive maps, and recent booking status trackers.
- 🟢 **Service Provider UI (Emerald)**: Tailored for studio workspace management, scheduler logs, balance wallets, and portfolio showcases.
- 🟣 🟡 **Administrative Control UI (Indigo/Gold)**: Tailored for kanban operations, audit log review, credential inspections, and spam warning moderation.

---

## ✨ Features Checklist

### 🙋‍♂️ For Customers (Discovery Feed)
- **Interactive Map Coverage Preview**: Custom mapping area visualization representing Phewa Lake and Lakeside/Chipledhunga neighborhoods.
- **🚨 Need Help Right Now?**: Real-time availability support widget showing nearby active professionals online with ETA estimations.
- **Search & Quick Autocomplete**: Dynamic search filters supporting categories and popular keyword tags.
- **Featured Professionals Grid**: Airbnb-style catalog cards detailing star reviews, verified checkmarks, pricing (Rs.), and response times.
- **Booking Flow Progress**: Visual step tracker monitoring booking states (`Requested` ➜ `Confirmed` ➜ `Completed`).

### 🛠 For Service Providers (Partner Studio)
- **Studio Dashboard Stats**: Real-time summary analytics tracking average rating, listing counts, and reviews.
- **Interactive Earnings Estimator**: Built-in sliders calculating monthly revenue potential (Rs.) at 100% payout retention (0% commission).
- **Batch Schedule Planner**: Weekly template selector to generate availability calendar slots in seconds.
- **Simulated Payout Wallet**: Log financial withdrawals directly to bank or digital wallet accounts.
- **Project Showcases**: Upload "Before & After" photos and credentials.

### 👑 For Administrators (Control Panel)
- **Kanban Booking Board**: Visual status-driven board categorizing system-wide bookings.
- **Inspect Credentials Preview**: Audit modal verifying provider licenses and documents prior to issuing verification checkmark badges.
- **Moderation Dispatch Center**: Audit warnings history logs and moderate spam report complaints.

---

## 🏗 Repository Architecture

LocalSkill is organized as a workspace-based monorepo:

```
LocalSkill/
├── shared/            # Common TS interfaces, Zod schemas, & validation rules
├── backend/           # Express server, REST endpoints, and mockDb JSON layer
├── frontend/          # React, Vite, Tailwind CSS, Zustand, and Lucide icons
├── prisma/            # Database schema mappings and seed utilities
└── package.json       # Workspace root configurations
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or later)
- npm

### Installation

1. Clone the repository and navigate to the directory:
   ```bash
   git clone https://github.com/abhinaya-c/LocalSkill.git
   cd LocalSkill
   ```

2. Install workspace dependencies from the root directory:
   ```bash
   npm install
   ```

### Running Locally

To start the development servers for both the frontend client and the backend API concurrently:

```bash
npm run dev
```

The application will run locally:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

### Build Verification

To compile all three workspaces and compile the static bundle assets for deployment:

```bash
npm run build
```

---

## 🛣 API Endpoint Routing

### Authentication
* `POST /api/auth/register` — Create a new Customer or Provider profile
* `POST /api/auth/login` — Authenticate credentials and acquire JWT tokens

### Service Listings
* `GET /api/services/search` — Query services by category or keywords
* `GET /api/services/provider` — Get listings managed by the active provider
* `POST /api/services` — Create a new service offering

### Bookings & Scheduling
* `GET /api/bookings/customer` — Retrieve bookings made by the active customer
* `GET /api/bookings/provider` — Retrieve incoming bookings requested from the provider
* `POST /api/bookings` — Create a new booking request
* `PATCH /api/bookings/:id/status` — Approve or transition booking states

### Administration Panel
* `GET /api/admin/bookings` — Fetch aggregated bookings for the Kanban board
* `GET /api/admin/audit-logs` — Fetch global audit logging events
* `POST /api/admin/verify-provider` — Action provider verification checkmarks
