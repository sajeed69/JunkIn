# JunkIn - Hybrid Circular Economy Platform

JunkIn is a production-ready, scalable hybrid platform that maximizes the value of unwanted items through a dual-mode approach: **Reuse (Marketplace)** and **Scrap (Recycling)**. 

Powered by an AI Decision Engine, JunkIn analyzes every item to recommend whether it should be sold to a neighbor or professionally recycled for its material value.

<img width="757" height="437" alt="Screenshot 2026-03-13 221147" src="https://github.com/user-attachments/assets/659ee584-6f8a-47dc-b387-220427cd58b1" />

## 🚀 Key Features

- **AI-Driven Decision Engine**: Instantly analyzes items (images/text) to provide resale and scrap value estimates.
- **Rare Item Detection**: AI-powered rarity analysis that performs web searches to identify high-value/limited-edition items for collectors.
- **Collector Bidding Marketplace**: Dedicated auction-style platform where verified collectors can bid on rare items detected by AI.
- **Eco Rewards Gift Card System**: Gamified incentive system where users earn Eco Points for sustainable actions and unlock scratch cards for digital gift cards.
- **Dual-Mode Marketplace**:
  - **Reuse Mode**: Peer-to-peer marketplace for functional items.
  - **Scrap Mode**: Scheduled professional pickups for recyclables with transparent pricing.
- **Kabadiwala Interface**: Dedicated dashboard for scrap collectors with real-time request tracking and digital receipts.
- **Admin Control Panel**: Full platform monitoring, commission management, and scrap rate configuration.
- **Digital Receipts**: Automated PDF generation for every scrap transaction.
- **Environmental Impact Tracking**: CO2 savings calculation for every item diverted from landfills.
- **Requestly API Client Integration**: Built-in API interception tool for real-time market simulation and dynamic recommendation testing.
<img width="878" height="438" alt="Screenshot 2026-03-13 222819" src="https://github.com/user-attachments/assets/b887f991-7eff-4404-a5db-98747d0e4f70" /> <img width="331" height="411" alt="Screenshot 2026-03-13 223409" src="https://github.com/user-attachments/assets/4dbdcba6-a363-4c2e-bf87-1e524cd270ff" />  <img width="326" height="407" alt="Screenshot 2026-03-13 223724" src="https://github.com/user-attachments/assets/54159167-7486-491f-9c64-ee6bf7e7431a" />

---

## 🔌 Requestly API Client — Feature & Usage

JunkIn integrates a **built-in Requestly-inspired API Client** that allows real-time interception and modification of backend API responses. This enables dynamic market simulation without changing any backend code.

### 🎯 Purpose

The Requestly API Client demonstrates how **real-time market data changes** directly affect JunkIn's AI recommendation engine. By intercepting API responses, users can simulate scenarios like scrap price surges or demand crashes and watch the AI recommendation update live.

### 🏗 Architecture

```
┌──────────────┐     ┌────────────────────┐     ┌──────────────┐
│   Frontend   │────>│  Requestly Client   │────>│   Backend    │
│  AIAnalysis  │     │  (localStorage      │     │  /api/scrap  │
│    Page      │<────│   interception)     │<────│   -prices    │
└──────────────┘     └────────────────────┘     └──────────────┘
       │                      │
       └── Reactive useEffect ─┘
           recalculates AI
           recommendation
```

### 📡 Intercepted API Endpoints

| Endpoint | Purpose | Default Response |
|----------|---------|-----------------|
| `GET /api/scrap-prices` | Live scrap material rates | `{ plastic: 18, iron: 32, copper: 680, electronics: 50 }` |
| `GET /api/resale-demand` | Market resale demand index | `{ electronics: 0.82, furniture: 0.65, bicycle: 0.75 }` |
| `GET /api/collector-availability` | Collector availability status | `{ available_collectors: 12, avg_pickup_time: "2 hours" }` |

### 🚀 Built-in Simulation Scenarios

| Scenario | What It Simulates | Effect on AI |
|----------|-------------------|--------------|
| **Scrap Price Surge** | Market prices spike (Iron: ₹32 → ₹85, Copper: ₹680 → ₹1200) | AI may switch recommendation from **Reuse → Scrap** |
| **Demand Crash** | Resale demand drops significantly | AI lowers resale probability, may favor scrapping |
| **Peak Operations** | Few collectors available, long pickup times | Affects logistics recommendations |

### 📖 How to Use

#### Step 1: Open AI Analysis Page
- List an item on JunkIn → Navigate to the **AI Analysis** results page.
- You'll see the **Live Market Rates** card showing current scrap prices.

#### Step 2: Enable Simulation Mode
- Toggle the **"Simulation Mode"** switch in the top-right header.
- This reveals the **Future Value Simulator** panel with 3 scenario buttons.

#### Step 3: Run a Scenario
- Click any scenario (e.g., "Scrap Market Price Surge").
- Watch the **Today vs Future Scenario** comparison appear instantly.
- The AI recommendation dynamically recalculates based on modified prices.

#### Step 4: Use the Requestly API Client (Advanced)
- From the AI Analysis page (with Simulation Mode ON), click **"OPEN API CLIENT"**.
- This opens the full **Requestly API Client** interface at `/requestly-client`.
- Select an endpoint from the sidebar (e.g., Scrap Prices).
- Edit the JSON response body with custom values.
- Click **"Save & Intercept"** to mock the API response.
- Return to the AI Analysis page — your custom data is now active.

#### Step 5: Observe Reactive Changes
- Open your browser DevTools Console (`F12` → Console tab).
- Look for green `[REQUESTLY DEMO]` and `[REQUESTLY CLIENT]` log messages.
- These show exactly how intercepted data flows through the recommendation engine.

### 🔧 Technical Implementation

The Requestly Client uses **localStorage-based interception**:

```javascript
// Saving a mock (in RequestlyApiClient.jsx)
localStorage.setItem('rq_mock_/api/scrap-prices', JSON.stringify(customPrices));

// Checking for mock before fetching (in AIAnalysis.jsx)
const mockPrices = localStorage.getItem('rq_mock_/api/scrap-prices');
if (mockPrices) {
    // Use mocked data instead of real API
    setScrapPrices(JSON.parse(mockPrices));
} else {
    // Fetch real data from backend
    const { data } = await api.get('/scrap-prices');
    setScrapPrices(data);
}
```

A reactive `useEffect` in `AIAnalysis.jsx` watches for price changes and automatically recalculates the AI recommendation in real-time.

### 🗂 Key Files

| File | Role |
|------|------|
| `frontend/src/pages/RequestlyApiClient.jsx` | Full API client UI with JSON editor and scenario presets |
| `frontend/src/pages/AIAnalysis.jsx` | AI analysis page with Requestly interception and reactive recalculation |
| `backend/src/modules/scrap/scrap.controller.js` | Scrap prices, resale demand, and collector availability endpoints |

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** (Vibe: Sleek Dark/Light Mode, Glassmorphism)
- **React Router DOM** (Role-based Guards)
- **Axios** (Service-based API layer)
- **Lucide React** & **Material Symbols**
<img width="614" height="367" alt="Screenshot 2026-03-13 224200" src="https://github.com/user-attachments/assets/2ad93f0b-84b9-4b30-98a2-f39f103565cf" />

### Backend (Node.js)
- **Express.js** (MVC Architecture)
- **MongoDB** (Mongoose ODM)
- **JWT Authentication**
- **PDFKit** (Receipt Generation)
- **Multer** + **Cloudinary** (Image Management)
  
<img width="480" height="398" alt="Screenshot 2026-03-13 223935" src="https://github.com/user-attachments/assets/a832d21b-576d-4834-8853-a97f7df12b77" />


### AI Service (Python)
- **FastAPI**
- **Valuation Logic** (Simulated Vision/Market analysis)

## 📦 Getting Started

### Prerequisites
- Docker & Docker Compose

### Fast Launch (All Services)
```bash
docker-compose up --build
```

### Manual Development Setup

1. **Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

2. **AI Service**:
   ```bash
   cd ai-service
   pip install -r requirements.txt
   python main.py
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📂 Project Structure

```
JunkIn/
├── frontend/           # React SPA
├── backend/            # Express.js API
├── ai-service/         # Python/FastAPI AI engine
├── docker-compose.yml  # Root orchestration
└── README.md
```

---
Developed as a production-grade circular economy solution.
