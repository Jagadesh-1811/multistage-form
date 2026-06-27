# Multistage Registration & Application Form

A modern, responsive, and secure MERN-based Multistage Registration and Application Form built with React, Vite, Tailwind CSS, Express, Node.js, MongoDB, and Supabase. This application supports user authentication, multi-step progress tracking, file uploads, and a smooth user experience.

---

## Key Features

* **Secure Authentication**: User Signup and Login with JWT authentication and hashed passwords (using bcryptjs).
* **Multistage Flow**:
  1. **Personal Information**: Collects contact details (name, email, phone, gender, dob).
  2. **Education Details**: Collects academic history (qualification, institute, year of passing, percentage, resume/document upload).
  3. **Payment Details**: Upload proof of payment / transactional details.
  4. **Confirmation & Review**: View a comprehensive summary of all entered details before final submission.
* **Supabase Integration**: Seamless file uploading for resumes/documents and payment receipts to Supabase Storage.
* **Interactive UI**:
  * Step-by-step progress indicator.
  * Real-time validations.
  * Delightful micro-animations and confetti explosion upon successful submission.
  * Dark/light harmonious visual styling with Tailwind CSS.

---

##  Technology Stack

### Frontend
* **Core**: React 19 (Functional Components, Hooks)
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **Navigation**: React Router DOM (v7)
* **Icons**: Lucide React
* **Effects**: Canvas Confetti (for success states)

### Backend
* **Runtime**: Node.js
* **Framework**: Express
* **Database**: MongoDB (Mongoose ORM)
* **File Storage**: Supabase (Supabase JS SDK)
* **Auth**: JSON Web Tokens (JWT) & bcryptjs
* **Middleware**: CORS, Multer (for multipart form parsing)

---

##  Directory Structure

```text
├── backend/
│   ├── config/              # Database & external service configurations
│   ├── controllers/         # Request handling logic (auth, application)
│   ├── middleware/          # JWT verification, upload helpers
│   ├── models/              # MongoDB Mongoose schemas (User, Form)
│   ├── routes/              # Express API endpoints
│   ├── server.js            # Main backend entry point
│   └── .env                 # Backend environment variables
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── assets/          # Images/illustrations
│   │   ├── components/      # Reusable components (FileUploader, StepProgress, etc.)
│   │   ├── context/         # Auth & Form state contexts
│   │   ├── pages/           # Pages (Signup, Login, and Stage wizard components)
│   │   ├── App.jsx          # Route management & orchestration
│   │   ├── index.css        # Global CSS / Tailwind directives
│   │   └── main.jsx         # App entry point
│   ├── package.json         # Frontend configuration
│   └── vite.config.js       # Vite configuration
```

---

##  Installation & Setup

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **MongoDB** (Local instance or MongoDB Atlas URI)
* **Supabase Account** (For file/document storage)

### Backend Configuration
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and define the following environment variables:
   ```env
   PORT=5000
   MONGOURI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_signing_secret
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_or_service_role_key
   ```

### Frontend Configuration
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## Running the Application

### Start Backend Server
From the `backend/` directory:
* Development mode (with nodemon):
  ```bash
  npm run dev
  ```
* Production mode:
  ```bash
  npm start
  ```
The backend server runs on `http://localhost:5000` by default.

### Start Frontend Server
From the `frontend/` directory:
* Run development server:
  ```bash
  npm run dev
  ```
The frontend application runs on `http://localhost:5173` (or the next available port indicated by Vite).


