# 🛠 JunkIn Setup & Installation Guide

This guide provides a comprehensive walkthrough to get the entire JunkIn ecosystem running on your local machine.

## 📋 Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.10 or higher) & **pip**
- **MongoDB** (Local Community Server or a MongoDB Atlas account)
- **Docker Desktop** (Optional, for containerized launch)

---

## 1. Backend Setup (Node.js/Express)

The backend handles API requests, database interactions, and business logic.

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
    - Copy the example environment file: `cp .env.example .env` (or manually rename it).
    - Open `.env` and fill in your credentials:
      - `MONGODB_URI`: Your MongoDB connection string.
      - `JWT_SECRET`: Any random string (e.g., `junkin_key_123`).
      - `CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET`: Required for image uploads (Get these free from [Cloudinary](https://cloudinary.com/)).
4.  **Start the development server**:
    ```bash
    npm run dev
    ```
    *The server will run on [http://localhost:5000](http://localhost:5000)*

---

## 2. AI Microservice Setup (Python/FastAPI)

The AI service handles item valuation and environmental impact analysis.

1.  **Navigate to the AI service directory**:
    ```bash
    cd ai-service
    ```
2.  **Create a virtual environment (Recommended)**:
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    ```
3.  **Install requirements**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Launch the service**:
    ```bash
    python main.py
    ```
    *The AI service will run on [http://localhost:8000](http://localhost:8000)*

---

## 3. Frontend Setup (React/Vite)

The frontend provides the user interface for all roles.

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    *The app will be available at [http://localhost:5173](http://localhost:5173)*

---

## 🐳 Option 4: Docker Launch (Quickest)

If you have Docker installed, you can launch everything (including MongoDB) with a single command:

1.  **From the project root**:
    ```bash
    docker-compose up --build
    ```
    *This will build images for all three services and start them in the background.*

---

## 🛠 Detailed Service Setup

### 1. MongoDB Setup (Cloud/Atlas)
1.  **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  **Create Cluster**: Follow the "Free Tier" setup. Pick any provider (AWS/Google) and region.
3.  **Database Access**: 
    - Create a user (e.g., `junkin_user`).
    - Save the password securely.
4.  **Network Access**: 
    - Click "Network Access" -> "Add IP Address".
    - Click "Allow Access from Anywhere" (0.0.0.0/0) for development.
5.  **Get Connection String**:
    - Go to "Database" -> "Connect" -> "Drivers".
    - Copy the string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/junkin?retryWrites=true&w=majority`.
    - **Note**: Replace `<password>` with your database user's password.

### 2. Email Setup (Gmail SMTP)
1.  **Enable 2FA**: Ensure your Gmail account has 2-Step Verification enabled.
2.  **App Password**:
    - Go to [Google Account Security](https://myaccount.google.com/security).
    - Search for "App passwords" in the top search bar.
    - Create a new app (name it "JunkIn").
    - Google will give you a **16-character code**. **Save this.**
3.  **Configure .env**:
    ```env
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_email@gmail.com
    SMTP_PASS=xxxx-xxxx-xxxx-xxxx  # Your App Password
    EMAIL_FROM=noreply@junkin.com
    ```

### 3. Image Upload (Cloudinary)
1.  Sign up at [Cloudinary](https://cloudinary.com/).
2.  Copy your **Cloud Name**, **API Key**, and **API Secret** from the Dashboard.
3.  Add them to the `.env` file in the `backend/` folder.

---

## 🧪 Testing the Setup

1.  **Register Account**: Go to the Register page, choose a role, and use the OTP logged in the **backend terminal console**.
2.  **AI Analysis**: Try "Creating a Listing". The AI Analysis page should appear with estimates even if the Python service is offline (it has a built-in fallback).
3.  **Dashboards**: Login with your role-specific credentials to see the User, Kabadiwala, or Admin dashboards.

---
**Need help?** Check the `logs/` folder in the backend for error details.
