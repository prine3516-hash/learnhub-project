# 🎓 LearnHub - Next-Generation MERN Learning Management System

LearnHub is a full-featured, production-ready Learning Management System (LMS) built with the **MERN** stack (MongoDB, Express, React, Node.js). It features a modern, responsive design with Light/Dark mode, glassmorphism, role-based workflows for Students, Instructors, and Admins, an interactive video classroom, assessment quizzes, and verified print-ready certificates of completion.

---

## ✨ Features & Architecture

### 1. Multi-Role Ecosystem
- **🧑‍🎓 Student**:
  - Browse course catalog with instant search, category filters, and difficulty levels.
  - Interactive Course Details page with learning outcomes, curriculum syllabus, and pricing.
  - Interactive Video Classroom with lecture notes, syllabus drawer, and progress tracking.
  - Mark lessons complete with real-time progress calculations (0–100%).
  - Course Quizzes with instant scoring, pass/fail evaluation, and answer explanations.
  - Automated **Official Certificate of Completion** generated upon 100% course completion with unique verification IDs and print/PDF support.
- **👩‍🏫 Instructor / Teacher**:
  - Instructor Studio dashboard with real-time KPI metrics (Students taught, Active courses, Ratings, Royalties).
  - Course Creator & Editor (outcomes, levels, pricing, category, thumbnail).
  - Lesson Manager (video URLs, lecture notes, durations, ordering).
  - Quiz Builder (multiple-choice questions, options, correct answer keys, explanations).
- **⚙️ Admin**:
  - Platform KPIs (Students, Teachers, Total Courses, Total Enrollments, Platform Revenue).
  - User Directory with live role switching (promote student to teacher, etc.).
  - Course Moderation & deletion governance.

### 2. Design System & Aesthetics
- Built with **Vanilla CSS** and modern CSS Custom Properties.
- Dual theme support: **Light Mode** and sleek **Dark Mode** with instant theme toggle.
- Glassmorphic navigation header, floating cards, subtle gradients, and micro-interactions.
- Official certificate layout with gold ribbon badge and dedicated `@media print` styling.

### 3. Dual-Mode Resilient Backend
- **MongoDB Atlas / Local MongoDB**: Connects via `MONGO_URI` using Mongoose ODM.
- **Resilient Zero-Config Fallback**: If MongoDB credentials are unset or offline, boots automatically into an in-memory repository with pre-seeded courses, lessons, quizzes, users, and enrollments so the app runs out of the box with zero setup hurdles!

---

## 🚀 Quick Start Guide

### 1. Start Backend Server
```bash
cd server
npm install
node src/index.js
```
The server will start at `http://localhost:5000`.

### 2. Start Frontend Client
In a second terminal:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 One-Click Demo Logins
On the top bar and on the Sign In modal, click any of the instant demo buttons to explore each role perspective:

| Role | Account Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Student** | Alex Rivera | `student@learnhub.com` | `LearnHub@123` |
| **Instructor** | Dr. Sarah Jenkins | `teacher@learnhub.com` | `LearnHub@123` |
| **Admin** | LearnHub Admin | `admin@learnhub.com` | `LearnHub@123` |

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health & storage engine status | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `POST` | `/api/auth/demo` | Quick login for demo roles | No |
| `GET` | `/api/users/me` | Fetch active user profile | Bearer Token |
| `PUT` | `/api/users/me` | Update name, title, bio, avatar | Bearer Token |
| `GET` | `/api/courses` | List & filter courses (search, cat, level) | No |
| `GET` | `/api/courses/:id` | Get single course with lessons & quizzes | No |
| `POST` | `/api/courses` | Create new course | Teacher / Admin |
| `PUT` | `/api/courses/:id` | Update course details | Teacher / Admin |
| `DELETE` | `/api/courses/:id` | Delete course and its lessons | Teacher / Admin |
| `POST` | `/api/courses/:id/lessons`| Add lesson to course | Teacher / Admin |
| `DELETE` | `/api/lessons/:id` | Delete a lesson | Teacher / Admin |
| `POST` | `/api/enrollments` | Enroll in course | Student |
| `GET` | `/api/enrollments/me` | List enrolled courses with progress | Student |
| `PUT` | `/api/progress/:id` | Mark lesson complete & unlock cert | Student |
| `GET` | `/api/quizzes/course/:id` | Get quizzes for a course | No |
| `POST` | `/api/quizzes/:id/submit` | Submit quiz answers & get score | Student |
| `POST` | `/api/quizzes` | Create assessment quiz | Teacher / Admin |
| `GET` | `/api/certificates/me` | Get student earned certificates | Student |
| `GET` | `/api/admin/users` | List all platform users | Admin |
| `PUT` | `/api/admin/users/:id/role`| Update user role | Admin |
| `GET` | `/api/admin/stats` | Platform KPIs & analytics | Admin |
