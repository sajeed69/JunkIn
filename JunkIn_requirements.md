# JUNKIN -- Hybrid Circular Economy Platform

## 1. Project Overview

**Project Name:** JunkIn\
**Type:** Hybrid Circular Economy Platform (Reuse + Scrap)

### Target Users:

-   Households\
-   Kabadiwalas (scrap collectors)\
-   Recyclers / Bulk Buyers\
-   Admin

### Vision

To build a structured, transparent, AI-powered circular economy
ecosystem that enables intelligent reuse before recycling and ensures
fair, verified scrap transactions.

------------------------------------------------------------------------

## 2. Problem Statement

India's scrap ecosystem is: - Informal and unorganized\
- Lacking price transparency\
- Prone to weight manipulation\
- Missing digital records\
- Fragmented supply chain

Users do not know whether to: - Sell (reuse) an item\
- Scrap (recycle) an item

Kabadiwalas: - Work independently\
- Have unstable income\
- Lack structured demand

Recyclers: - Struggle to source verified bulk material

------------------------------------------------------------------------

## 3. Core Features (Functional Requirements)

### 3.1 User Module (Households)

#### Account & Authentication

-   Register/Login (Email + OTP / Phone + OTP)\
-   Profile management\
-   Address management (multiple pickup addresses)

#### Item Listing

User can: - Upload item image (multiple images supported)\
- Select category\
- Add description\
- Add condition (New / Good / Moderate / Scrap)\
- Add estimated weight (optional)

System must: - Use AI to estimate resale value\
- Use AI to estimate scrap value\
- Suggest "Reuse Mode" or "Scrap Mode"

------------------------------------------------------------------------

### 3.2 Hybrid Decision Flow

After AI analysis, system displays: - Estimated resale value range\
- Estimated scrap value range\
- Suggested best mode (Reuse / Scrap)

User chooses: - Reuse Mode\
- Scrap Mode

------------------------------------------------------------------------

### 3.3 Reuse Mode (Marketplace)

If user selects Reuse Mode: - Item appears in marketplace feed\
- Buyers can view listing\
- Buyers can express interest\
- Chat (optional v1 feature)\
- Seller marks item as sold\
- Commission = 5%

If item not sold in X days (configurable): - User receives notification
to convert to scrap

------------------------------------------------------------------------

### 3.4 Scrap Mode

If user selects Scrap Mode: - Pickup scheduling interface\
- Select date & time slot\
- Assigned kabadiwala

Kabadiwala: - Accepts pickup request\
- Visits location\
- Weighs item\
- Enters actual weight\
- System calculates amount\
- Generates digital receipt\
- Commission = 5%

Receipt must include: - Item category\
- Weight\
- Rate per kg\
- Final amount\
- Timestamp\
- Transaction ID

------------------------------------------------------------------------

### 3.5 Kabadiwala Module

Dashboard includes: - Scrap Pickup Requests\
- Active Pickups\
- Completed Pickups\
- Earnings\
- Ratings\
- Scrap Buy Requests from recyclers

Kabadiwala can: - Accept/reject pickup\
- Update pickup status\
- View analytics\
- Upgrade to Pro subscription

------------------------------------------------------------------------

### 3.6 Recycler / Bulk Buyer Module (Future-Ready)

Recyclers can: - Post bulk buy requests\
- View available scrap material\
- Purchase in bulk

------------------------------------------------------------------------

### 3.7 Admin Panel

Admin can: - Manage users\
- Manage kabadiwalas\
- Approve/reject recyclers\
- Set scrap rates\
- View transaction logs\
- View analytics\
- Manage commissions\
- Configure conversion time (X days)

------------------------------------------------------------------------

## 4. AI Requirements

### 4.1 AI Models Needed

1.  **Resale vs Scrap Decision Model**
    -   Input: Image + category + condition\
    -   Output: Best mode recommendation
2.  **Resale Value Prediction**
    -   Regression model\
    -   Output: Value range
3.  **Scrap Classification**
    -   Use OpenCV + ML\
    -   Identify material type (Plastic / Metal / Paper / Electronics)
4.  **Demand-Based Suggestion**
    -   Recommend items kabadiwalas should prioritize\
    -   Based on recycler demand

------------------------------------------------------------------------

## 5. Tech Stack Requirements

### Frontend

-   React.js\
-   Tailwind CSS\
-   HTML5\
-   CSS3\
-   JavaScript

### Backend

-   Node.js\
-   Express.js

### Database

-   MongoDB Atlas

### AI/ML

-   Python\
-   OpenCV\
-   TensorFlow / Scikit-learn

### Cloud

-   AWS / Vercel / Render\
-   Cloudinary (image storage)

------------------------------------------------------------------------

## 6. Database Schema (High-Level)

### Users Collection

-   \_id\
-   name\
-   email\
-   phone\
-   role (user / kabadiwala / recycler / admin)\
-   addresses\[\]\
-   ratings\
-   createdAt

### Listings Collection

-   \_id\
-   userId\
-   images\[\]\
-   category\
-   description\
-   condition\
-   AI_resale_estimate\
-   AI_scrap_estimate\
-   mode (reuse / scrap)\
-   status (active / sold / converted / completed)\
-   createdAt

### ScrapTransactions

-   \_id\
-   listingId\
-   kabadiwalaId\
-   weight\
-   rate\
-   finalAmount\
-   receiptUrl\
-   commission\
-   timestamp

### ReuseTransactions

-   \_id\
-   listingId\
-   buyerId\
-   sellerId\
-   finalAmount\
-   commission\
-   timestamp

------------------------------------------------------------------------

## 7. API Requirements

### Auth APIs

-   POST /register\
-   POST /login\
-   POST /verify-otp

### Listing APIs

-   POST /list-item\
-   GET /marketplace\
-   GET /my-listings\
-   PUT /convert-to-scrap

### Scrap APIs

-   POST /schedule-pickup\
-   PUT /update-weight\
-   GET /my-scrap-pickups

### AI APIs

-   POST /ai/analyze-item\
-   POST /ai/predict-value

### Admin APIs

-   GET /admin/dashboard\
-   PUT /admin/update-rates\
-   GET /admin/transactions

------------------------------------------------------------------------

## 8. Business Rules

-   Commission = 5% default (configurable)\
-   Scrap rates configurable by admin\
-   Conversion from reuse → scrap after X days\
-   Kabadiwala must confirm weight on-site\
-   Digital receipt mandatory for scrap transactions\
-   Ratings system required

------------------------------------------------------------------------

## 9. Non-Functional Requirements

### Security

-   JWT authentication\
-   Role-based access control\
-   Secure image upload\
-   Encrypted passwords (bcrypt)

### Performance

-   API response \< 500ms\
-   Image optimization\
-   Lazy loading for marketplace feed

### Scalability

-   Microservice-ready backend\
-   AI service deployed separately\
-   Horizontal scaling supported

### Reliability

-   Daily database backups\
-   Transaction logging\
-   Error monitoring (Sentry)

------------------------------------------------------------------------

## 10. UI/UX Requirements

-   Clean minimal interface\
-   Clear decision visualization (Reuse vs Scrap)\
-   Dashboard analytics for kabadiwala\
-   Transparent pricing display\
-   Real-time status updates

------------------------------------------------------------------------

## 11. Revenue Model Implementation

System must support:

-   5% commission on:
    -   Scrap transactions\
    -   Resale transactions
-   Boosted Listings:
    -   Paid feature\
    -   Appear at top of feed
-   Kabadiwala Pro Subscription:
    -   Monthly payment\
    -   Access to priority pickups\
    -   Advanced analytics
-   Bulk Buyer Service Fee (future)

------------------------------------------------------------------------

## 12. Impact Goals (Measurable Metrics)

Track: - % Items reused before scrapped\
- Total scrap weight processed\
- Avg earnings per kabadiwala\
- Landfill waste reduced (estimated)\
- Monthly active users

------------------------------------------------------------------------

## 13. Future Roadmap (Phase 2+)

-   Blockchain-based transaction verification\
-   Smart IoT weighing machine integration\
-   Carbon credit tracking\
-   AI-based dynamic scrap pricing\
-   Geo-optimization for pickup routes

------------------------------------------------------------------------

## 14. Deployment Requirements

-   CI/CD pipeline\
-   Separate staging & production\
-   Environment variables management\
-   Docker support\
-   API documentation (Swagger)

------------------------------------------------------------------------

## Final Positioning Statement

JunkIn is a smart hybrid circular economy platform that maximizes value
through intelligent reuse and transparent recycling, enabling structured
supply chains and sustainable waste management.
