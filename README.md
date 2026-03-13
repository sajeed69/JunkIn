# JunkIn - Hybrid Circular Economy Platform

JunkIn is a production-ready, scalable hybrid platform that maximizes the value of unwanted items through a dual-mode approach: **Reuse (Marketplace)** and **Scrap (Recycling)**. 

Powered by an AI Decision Engine, JunkIn analyzes every item to recommend whether it should be sold to a neighbor or professionally recycled for its material value.

## 🚀 Key Features

- **AI-Driven Decision Engine**: Instantly analyzes items (images/text) to provide resale and scrap value estimates.
- **Dual-Mode Marketplace**:
  - **Reuse Mode**: Peer-to-peer marketplace for functional items.
  - **Scrap Mode**: Scheduled professional pickups for recyclables with transparent pricing.
- **Kabadiwala Interface**: Dedicated dashboard for scrap collectors with real-time request tracking and digital receipts.
- **Admin Control Panel**: Full platform monitoring, commission management, and scrap rate configuration.
- **Digital Receipts**: Automated PDF generation for every scrap transaction.
- **Environmental Impact Tracking**: CO2 savings calculation for every item diverted from landfills.

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** (Vibe: Sleek Dark/Light Mode, Glassmorphism)
- **React Router DOM** (Role-based Guards)
- **Axios** (Service-based API layer)
- **Lucide React** & **Material Symbols**

### Backend (Node.js)
- **Express.js** (MVC Architecture)
- **MongoDB** (Mongoose ODM)
- **JWT Authentication** + **OTP Verification**
- **PDFKit** (Receipt Generation)
- **Multer** + **Cloudinary** (Image Management)

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
