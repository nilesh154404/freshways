# Freshways Project Context

## 1. Project Overview
**Name:** Freshways
**Description:** A comprehensive web application for managing fresh produce, vendor subscriptions, and marketing content. It features a multi-role ecosystem connecting Admins, Vendors, Pathology Vendors, and Customers.

## 2. Tech Stack

### Frontend (`/fresh`)
*   **Framework:** React (Vite) with TypeScript
*   **Styling:** Tailwind CSS
*   **UI Library:** Shadcn UI (Radix Primitives)
*   **Icons:** Lucide React
*   **Networking:** Axios
*   **Routing:** React Router DOM
*   **State Management:** React Hooks (useState, useEffect)

### Backend (`/freshwayz-api`)
*   **Framework:** NestJS (Node.js) with TypeScript
*   **Database:** MySQL
*   **ORM:** TypeORM
*   **Authentication:** Passport, JWT (JSON Web Tokens), Bcrypt encryption
*   **API Protocol:** REST via Express
*   **Port:** 3064 (Default)

## 3. Database & Architecture (Key Entities)

*   **Auth System:**
    *   `Auth` table stores credentials (username/password).
    *   Linked to specific profile tables: `User` (Admin), `Vendor` (Business), or `Customer` (End-user).
    *   `UserType` table defines roles (Admin, Vendor, Customer, PathologyVendor).
*   **Inventory & Commerce:**
    *   `Product`: Items for sale, linked to Vendors and Categories.
    *   `Category`: Product classification.
    *   `DailyPrice`: Dynamic pricing for products.
    *   `ProductDiscount`: Promotions (Percentage, Flat, BOGO).
*   **Content:**
    *   `Marketing`: Social-style content posts with media (images/videos).
    *   Support for Likes, Comments, and Deep Linking (`freshwayz://`).

## 4. Key Features Implemented

*   **Role-Based Dashboard:**
    *   Dynamic Sidebar rendering based on user role.
    *   Admin view: Full control (Categories, Users, Vendors).
    *   Vendor view: Product & Marketing management.
*   **Authentication:**
    *   Unified Login using Username, Email, or Phone.
    *   Secure JWT-based session management.
    *   Logout functionality.
*   **Marketing Module:**
    *   Create/Edit/Delete marketing posts.
    *   Media support (Image/Video previews).
    *   Social interaction simulation (Mock likes/comments, Deep link sharing).
*   **Product Management:**
    *   CRUD operations for Products.
    *   Image upload integration.
    *   Advanced pricing and discount configuration dialogs.

## 5. Current Environment Configuration

*   **Backend URL:** `http://localhost:3064` (Hardcoded IPs were recently replaced with localhost for stability).
*   **Frontend URL:** `http://localhost:5173` (Vite default).
*   **Database:** Local MySQL instance.

## 6. Recent Developments (Context for AI)
*   Fixed connection issues by standardizing API calls to `localhost` instead of dynamic IPs.
*   Resolved `EADDRINUSE` port conflicts on 3064.
*   Enhanced Error Handling in Login (Network error vs. Invalid credentials).
*   Implemented "Share" functionality in Marketing with deep-linking support.
