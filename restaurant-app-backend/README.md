# Dastarkhan Restaurant App — Backend API

Node.js + Express + MongoDB REST API

## Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB
- Cloudinary account (for image uploads)

## Installation
git clone https://github.com/yourusername/restaurant-app-backend.git
cd restaurant-app-backend
npm install
cp .env.example .env
# Fill in your values in .env

## Running the Server
npm run dev       # development with nodemon
npm start         # production

## Seed the Database
npm run seed

## API Base URL
http://localhost:5000/api

## Test Credentials (after seeding)
Customer:  ahmed@gmail.com      / customer123
Manager:   manager@restaurant.com / manager123

## All Endpoints

### Auth
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me            (protected)
PUT    /api/auth/profile       (protected)
PUT    /api/auth/change-password (protected)

### Menu
GET    /api/menu               (public)
GET    /api/menu/:id           (public)
POST   /api/menu               (manager only)
PUT    /api/menu/:id           (manager only)
DELETE /api/menu/:id           (manager only)
PATCH  /api/menu/:id/toggle-availability (manager only)

### Orders
POST   /api/orders             (customer only)
GET    /api/orders             (protected)
GET    /api/orders/my-orders   (customer only)
GET    /api/orders/:id         (protected)
PATCH  /api/orders/:id/status  (manager only)
PATCH  /api/orders/:id/cancel  (customer only)

### Reservations
POST   /api/reservations            (customer only)
GET    /api/reservations            (protected)
GET    /api/reservations/:id        (protected)
PATCH  /api/reservations/:id/cancel (protected)
PATCH  /api/reservations/:id/confirm (manager only)
PATCH  /api/reservations/:id/complete (manager only)

### Dashboard
GET    /api/dashboard/stats         (manager only)
GET    /api/dashboard/recent-orders (manager only)

### Health
GET    /api/health             (public)
