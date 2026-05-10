# Dastarkhan - Full Stack Restaurant MVP

## Overview
**Dastarkhan** is a Full-Stack Restaurant App MVP built to handle both customer and manager interactions seamlessly.

- **Frontend:** Built with React Native and Expo.
- **Backend:** Powered by Node.js, Express, and PostgreSQL (via Supabase/Railway).
- **Storage:** Cloudinary handles image storage for menu items.

The application allows users to register as either customers or managers, browse menus, manage table reservations, place orders, and manage restaurant offerings.

---

## Technical Stack
### Frontend
- **Framework:** React Native (Expo)
- **Navigation:** React Navigation (Tabs & Stacks)
- **State Management:** React Context API (`AuthContext`, `CartContext`, `ReservationsContext`)
- **API Requests:** Axios / Fetch

### Backend
- **Server:** Node.js + Express
- **Database:** PostgreSQL (with `pg` and `sequelize` optional integration, raw queries mostly used for migrations)
- **Authentication:** JWT (JSON Web Tokens) & `bcryptjs`
- **File Uploads:** `multer` & `multer-storage-cloudinary`

---

## Features

### Role-Based Access
- **Customers** can view menus, add items to their cart, place orders, and book table reservations.
- **Managers** can view, add, and manage menu items securely, as well as view incoming reservations and orders. (Requires special Access Code upon registration).

### Authentication
- Secure registration and login flows.
- Tokens are securely stored and validated for protected routes.

---

## Setup & Run Instructions

### 1. Backend Setup

The backend handles the core logic, API endpoints, and database interactions.

**Prerequisites:**
- Node.js (v20+)
- PostgreSQL Database URL (Local, Railway, or Supabase)
- Cloudinary Account (for image uploads)

**Steps:**
1. Navigate to the backend directory:
   ```bash
   cd restaurant-app-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `restaurant-app-backend` folder with required variables:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Start the backend server (This automatically runs table migrations):
   ```bash
   npm run dev
   ```
   - The API will be available at `http://localhost:5000/api`.
   - Health check: `http://localhost:5000/health`.

### 2. Frontend Setup

The frontend is a cross-platform mobile application built with Expo.

**Prerequisites:**
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your physical device OR an iOS Simulator/Android Emulator installed.

**Steps:**
1. Open a new terminal and navigate to the project root directory (the parent directory containing `App.js`):
   ```bash
   cd restaurant-app-mvp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. *(Important: Ensure your backend is running. If running the app on a physical device, make sure your mobile device and PC are on the same Wi-Fi network and update your API base URLs in the frontend code from `localhost` to your computer's local IP address).*
4. Start the Expo development server:
   ```bash
   npm start
   # or
   npx expo start
   ```
5. Choose how to run the app:
   - **Physical Device:** Scan the QR code with the Expo Go app.
   - **Android Emulator:** Press `a` in the terminal.
   - **iOS Simulator:** Press `i` in the terminal.
   - **Web Browser:** Press `w` in the terminal.

---

## Deployment
- The backend is configured to be perfectly deployable on **Railway**. Ensure you have set the `Root Directory` in Railway settings to `/restaurant-app-backend` or use the provided `Procfile` and `nixpacks.toml` optimizations.
- The `start` script handles migrations automatically before starting the server.
