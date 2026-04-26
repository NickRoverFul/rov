# ROV — Rover Fulfillment WMS

Internal warehouse management system for Rover Fulfillment LLC.

## Session 1 — Client Profiles, Order Feed UI, Vercel Deployment

### Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build & Deploy to Vercel

```bash
npm run build
```

Then push to GitHub and connect repo to Vercel. The `vercel.json` handles SPA routing.

Alternatively via Vercel CLI:
```bash
npm i -g vercel
vercel
```

---

## Session Roadmap

| Session | Feature |
|---------|---------|
| ✅ 1    | Client profiles, order feed UI, Vercel deployment |
| 2       | Wix REST API polling (every 5 min) |
| 3       | EasyPost rate shopping + auto label purchase |
| 4       | Invoice generation + Resend email automation |

---

## Client: HH Zero (Denisa)

- **SKUs:** Single Bottle (HHZ-001), 12 Pack (HHZ-012), 24 Pack (HHZ-024)
- **Pallet config:** 70 cases/pallet, 25 lbs/case
- **Fulfillment fee:** $3.00/order
- **Billing cycle:** 15 days
- **Payment:** Zelle / ACH
- **Free storage:** Apr 20 – Jun 19, 2026
- **Storage billing starts:** Jun 20, 2026 ($20/pallet/month, prorated)

---

## Tech Stack

| Layer     | Tool         | Notes |
|-----------|--------------|-------|
| Frontend  | React + Vite | |
| Routing   | React Router | |
| Hosting   | Vercel       | Free tier |
| Email     | Resend       | Session 4 |
| Labels    | EasyPost     | Session 3 |
| Store API | Wix REST     | Session 2 |

---

## Project Structure

```
src/
├── data/
│   └── mockData.js        ← All client/order data + helpers
├── components/
│   ├── Sidebar.jsx/.css
│   ├── TopBar.jsx/.css
│   ├── OrderTable.jsx/.css
│   ├── StorageCard.jsx/.css
│   ├── StatCard.jsx/.css
│   └── StatusBadge.jsx/.css
└── pages/
    ├── Dashboard.jsx/.css
    ├── Orders.jsx/.css
    └── Clients.jsx/.css
```

## Design Tokens

Primary font: `Barlow Condensed` (UI labels)  
Data font: `JetBrains Mono` (order IDs, costs, quantities)  
Accent: `#FF6200` (Rover orange)  
Background: `#0B0B0B`

## Storage Fee Calculation

```
pallets = ceil(total_cases / 70)
fee = pallets × $20 × proration_factor
proration = days_in_first_partial_month / days_in_month
```

First invoice: June 30, 2026 (10 days × prorated)
