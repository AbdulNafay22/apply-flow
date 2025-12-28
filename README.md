# Apply Flow

Apply Flow is a modern job application tracker designed to help students and early-career professionals manage their co-op, internship, and full-time job search in one place.

It combines a clean, focused frontend with backend-ready architecture for persistence and future expansion.

---

## Features

- Track job applications by stage  
  **Saved · Applied · Interviewing · Offer · Rejected**
- Add, edit, and delete applications using a modal-based workflow
- Search and filter your application pipeline
- View detailed application information including notes and links
- Responsive, dark-themed UI designed for daily use
- Backend integration support for persistent data storage

---

## Tech Stack

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Radix UI)
- Lucide Icons

**Backend / Data**
- Supabase (PostgreSQL + API)
- Designed to support authenticated, persistent user data

---

## Architecture Overview

Apply Flow is built with a frontend-first approach while supporting backend integration.

- The UI and application logic are fully functional on the client
- When connected to Supabase, application data can be persisted and synced
- The project structure is designed to scale with authentication, user accounts, and richer backend features

This allows the app to run locally without setup, while remaining backend-ready for deployment.

---

## Getting Started

Install dependencies:

```bash
npm install
