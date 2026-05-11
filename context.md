# Dastarkhan - Full Stack Restaurant MVP - Project Context

*This file is continually updated to reflect the current state and context of the Dastarkhan project.*

## Overview
**Dastarkhan** is a Full-Stack Restaurant App MVP handling customer and manager interactions. 
The application supports features like role-based registration, browsing menus, placing orders, managing table reservations, and manager-specific tasks like managing menu offerings.

## Tech Stack & Architecture

### Frontend (Mobile App)
- **Framework**: React Native with Expo.
- **Navigation**: React Navigation (`@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`).
- **State Management**: React Context API (`AuthContext`, `CartContext`, `ReservationsContext`).
- **Authentication**: Integrates `@better-auth/expo` and standard React Native `AsyncStorage` / `SecureStore`.
- **Key Directories**:
  - `src/components/`: Reusable UI components.
  - `src/screens/`: App screens for customers and managers.
  - `src/context/`: Global state contexts.
  - `src/navigation/`: App routing and stack/tab navigators.
  - `src/services/` & `src/utils/`: API calls and helper functions.

### Backend (`/restaurant-app-backend`)
- **Server**: Node.js + Express (ES Modules enabled via `"type": "module"`).
- **Core Dependencies**:
  - `express`, `cors`, `helmet`, `morgan` for server and middleware.
  - `bcryptjs` and `jsonwebtoken` for manual authentication routes.
  - `@supabase/supabase-js`, `@better-auth/infra`, `better-auth` for extended authentication capabilities.
  - `pg` and `sequelize` for database connectivity.
  - `multer` and `multer-storage-cloudinary` for image uploads.
- **Key Files**:
  - `server.js`: Main Express entry point.
  - `migrate.js`: Handles database migrations.

### Database (`/supabase/schema.sql`)
- **Type**: PostgreSQL (specifically configured for Supabase with Row Level Security).
- **Key Tables**:
  - `profiles`: Stores user info (name, email, phone, role `customer`/`manager`). Extends `auth.users`.
  - `orders`: Tracks order details, type (Dine In/Takeaway), subtotal, total, and status.
  - `reservations`: Tracks table reservations, guest counts, and status.
  - `menu_items`: Stores menu details (name, price, category, image, availability). Includes seed data for Uzbek cuisine.
- **Security**: Utilizes Row Level Security (RLS) ensuring that customers only see their own orders/reservations, while managers have broader access to view and update them, as well as manage menu items.

## Current Status & Next Steps
- The repository has been successfully cloned.
- Docker configuration is complete, and the containers are up and running locally.
- Note: We identified a minor port conflict with AirPlay (5000) which was resolved by exposing backend port `5001`.
- Database initialization is fully functional. A stub for `auth.uid()` was successfully added to support the schema execution. All tables, policies, and seed data have been inserted.
- **Agent Skill Installed**: The `supabase-postgres-best-practices` skill has been successfully cloned and installed into `.agent-skills/supabase-postgres-best-practices` to inform future database development.
- **DB Cloud Deployment**: Successfully created the `Dastarkhan DB` project on Supabase Cloud using MCP tools. The entire schema (`schema.sql`) and all 9 seed menu items were successfully migrated to the remote database.
- **Local Docker Status**: Verified that all three containers (`dastarkhan_frontend`, `dastarkhan_backend`, and `dastarkhan_db`) are currently up and running correctly on the local machine.
- **Networking Fix**: Updated `docker-compose.yml` to use the local machine's IP (`192.168.1.17`) for the Expo packager and backend API URL, ensuring the iPhone can communicate with the server.
- **Cleanup & Maintenance**: Removed temporary log and response files (`.log`, `.txt`) to keep the repository clean.
- **Project Success**: The application is now fully functional and verified. The frontend connects perfectly to the backend via local IP (**192.168.1.17**), and the entire stack is running smoothly in Docker.
- **Cloud Readiness**: The database is live on Supabase Cloud, and the backend is ready for one-click deployment to Render.
- **GitHub Sync**: All latest changes and configurations have been successfully pushed to the GitHub repository using the GitHub MCP server.
