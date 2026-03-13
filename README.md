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
<img width="878" height="438" alt="Screenshot 2026-03-13 222819" src="https://github.com/user-attachments/assets/b887f991-7eff-4404-a5db-98747d0e4f70" /> <img width="331" height="411" alt="Screenshot 2026-03-13 223409" src="https://github.com/user-attachments/assets/4dbdcba6-a363-4c2e-bf87-1e524cd270ff" />  <img width="326" height="407" alt="Screenshot 2026-03-13 223724" src="https://github.com/user-attachments/assets/54159167-7486-491f-9c64-ee6bf7e7431a" />
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
- **JWT Authentication** + **OTP Verification**
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
