# CIG Event & Media Management Platform

> A centralized, scalable platform for college clubs to upload, organize, and discover event media — with AI facial recognition, real-time notifications, and enterprise-grade cloud storage.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Run with Docker](#run-with-docker)
  - [Run Manually](#run-manually)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Developed By](#team)

---

## About the Project

College clubs and societies currently rely on scattered Google Drive links and personal folders to share event photos — making media hard to find, manage, or credit.

**CIG Media Platform** solves this by providing a single, role-controlled hub where photographers can bulk-upload media, members can interact with it in real time, and anyone can find photos of themselves using AI facial recognition.

---

## Features

### 🔐 Role-Based Access Control (RBAC)
Secure authentication using JWT stored in HTTP-only cookies. Three distinct roles govern what each user can do:

| Role | Permissions |
|------|-------------|
| `admin` | Full access — delete any media, manage users and events |
| `photographer` | Bulk upload up to 50 photos per batch |
| `viewer` | Browse, like, comment, and download media |

### ☁️ Cloud Media Pipeline
Files are uploaded directly from the Node.js backend to an **AWS S3** bucket, ensuring scalable, enterprise-grade storage with no local disk dependency.

### 🤖 AI Facial Recognition — "Find Me"
Users upload a selfie and the backend runs an AI script that scans all event photos, returning only the images containing their face. No manual searching required.

### ⚡ Real-Time Social Engine
Likes and comments powered by **Socket.io** (WebSockets). Notifications appear instantly on screen — no page refresh needed.

### 🏷️ Smart Image Tagging & Search
Photos are automatically tagged on upload. Users can filter the entire media library by:
- Event name
- Upload date
- Specific tags
- Photographer

### 💧 Automated Watermarking
When a user downloads an image, the backend dynamically applies a custom club watermark before serving the file — protecting club-owned content automatically.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Cloud Storage | Amazon Web Services (AWS S3) |
| Real-Time | Socket.io (WebSockets) |
| Containerization | Docker, Docker Compose |
| API Docs | Swagger UI (OpenAPI / YAML) |

---

## Database Schema

Five MongoDB collections and their relationships:

```
User ──< Media        (one user uploads many media files)
User ──< Like         (one user gives many likes)
User ──< Comment      (one user writes many comments)
Event ──< Media       (one event has many media files)
Media ──< Like        (one media receives many likes)
Media ──< Comment     (one media receives many comments)
```

| Collection | Key Fields |
|------------|-----------|
| `User` | `username`, `email`, `password` (hashed), `role` |
| `Event` | `name`, `date`, `category`, `description` |
| `Media` | `url` (S3), `tags[]`, `event` (ref), `uploadedBy` (ref) |
| `Like` | `media` (ref), `likedBy` (ref) — unique compound index |
| `Comment` | `content`, `media` (ref), `commentedBy` (ref) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) & Docker Compose
- MongoDB Atlas URI
- AWS S3 bucket + credentials

### Run with Docker

The easiest way to run the entire stack with a single command:

```bash
git clone https://github.com/your-username/cig-media-platform.git
cd cig-media-platform

# Create your environment variables in the backend folder
touch backend/.env    # Then open this file and paste your credentials

docker-compose up --build
```

The app will be available at `http://localhost:5173` (frontend) and `http://localhost:8000` (backend).

### Run Manually

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory based on the following:

```env
# Server
PORT=8000

# MongoDB
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

---

## API Documentation

Full API documentation is available via **Swagger UI** once the backend is running:

```
http://localhost:8000/api-docs
```

All routes across **Auth**, **Events**, and **Media** are documented with request/response schemas and can be tested directly in the browser.

---

## Project Structure

```
cig-media-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.jsx
│   ├── Dockerfile
│   └── vite.config.js
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Media.js
│   │   ├── Like.js
│   │   └── Comment.js
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── Dockerfile
│   └── server.js
├── docker-compose.yml
└── README.md
```

---

## Developed By

**Rishi Chaudhary** Indian Institute of Technology (IIT) Roorkee
