# AI-Powered Lead Generator & WhatsApp Outreach App

## Overview

A full-stack production-ready web application for freelancers and agencies to manage leads, generate AI-powered personalized WhatsApp messages, and track outreach campaigns. Inspired by the dark-themed reference UI provided.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, Tailwind CSS, Framer Motion, React Router, Recharts |
| Backend | Flask (Python) + Flask-JWT-Extended |
| Database | Firebase Firestore |
| Auth | JWT + bcrypt |
| File Upload | Flask (in-memory JSON parsing) |
| AI Messages | Rule-based + template engine (no paid AI API required) |
| Deployment | Frontend → Vercel, Backend → Railway/Render |

---

## Open Questions

> [!IMPORTANT]
> **AI Message Generation**: No external AI API key (OpenAI etc.) is specified. The plan uses a smart rule-based template engine with multiple tones (Professional, Friendly, Premium, Casual) that produces highly personalized messages — no external cost. Should I integrate OpenAI/Gemini API instead?

> [!IMPORTANT]
> **Firebase Config**: The user needs to provide their own Firebase project credentials (stored in `.env`). The app will be architected to use Firestore as the primary database. Do you already have a Firebase project set up?

> [!NOTE]
> **Authentication**: Using JWT with bcrypt for password hashing. User records stored in Firestore.

---

## Proposed Changes

### Frontend (`frontend/`)

#### [NEW] Project scaffold via Vite + React + Tailwind
- `vite.config.js`, `tailwind.config.js`, `postcss.config.js`
- `package.json` with all deps: react-router-dom, framer-motion, axios, recharts, react-dropzone, react-hot-toast, lucide-react

#### [NEW] Pages
| Page | Path | Description |
|------|------|-------------|
| Login | `/login` | JWT login form |
| Register | `/register` | Signup form |
| Dashboard | `/` | Stats cards + recent activity |
| Leads | `/leads` | Full lead table + filters + bulk ops |
| Clients | `/clients` | Client project tracking |
| Analytics | `/analytics` | Charts: bar, pie, line |
| Settings | `/settings` | Profile + preferences |
| Uploaded Files | `/files` | Manage uploaded JSON files |

#### [NEW] Core Components
- `Sidebar.jsx` — Dark collapsible sidebar matching reference images
- `StatCard.jsx` — Animated metric cards
- `LeadTable.jsx` — Sortable, filterable, paginated table
- `LeadCard.jsx` — Card view for individual lead
- `MessageGenerator.jsx` — AI message UI with tone selector
- `WhatsAppButton.jsx` — One-click wa.me launcher
- `FileUploader.jsx` — Drag-and-drop JSON upload zone
- `AnalyticsCharts.jsx` — Recharts dashboard
- `FilterBar.jsx` — Location/Category/Status filters
- `BulkActions.jsx` — Bulk select + send + export
- `AuthGuard.jsx` — Protected route wrapper

#### [NEW] Services & Hooks
- `api.js` — Axios instance with JWT interceptors
- `useLeads.js`, `useAuth.js`, `useAnalytics.js`
- `AuthContext.jsx`, `LeadsContext.jsx`

---

### Backend (`backend/`)

#### [NEW] Flask Application
- `app.py` — Entry point
- `config.py` — Environment config
- `firebase_admin` — Firestore client

#### [NEW] API Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create user |
| POST | `/api/auth/login` | Return JWT |
| GET | `/api/leads` | Paginated lead list |
| POST | `/api/leads/upload` | Parse + store JSON |
| PUT | `/api/leads/:id` | Update status/notes |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/messages/generate` | AI message generation |
| GET | `/api/analytics` | Dashboard stats |
| GET | `/api/files` | Uploaded file records |
| DELETE | `/api/files/:id` | Delete file batch |
| POST | `/api/campaigns` | Create campaign |

#### [NEW] Key Backend Modules
- `routes/auth.py`
- `routes/leads.py`
- `routes/messages.py`
- `routes/analytics.py`
- `routes/files.py`
- `services/lead_parser.py` — JSON normalization, dedup, phone formatting
- `services/message_engine.py` — Rule-based AI message generator
- `middleware/auth_middleware.py` — JWT validation decorator
- `models/schemas.py` — Pydantic validation schemas

---

### Database (Firebase Firestore)

#### Collections

**`users`**
```
{ id, email, password_hash, role, created_at, last_login }
```

**`leads`**
```
{ id, business_name, domain, phone_number, location, category,
  rating, status, notes, file_id, user_id, created_at, last_contacted }
```

**`uploaded_files`**
```
{ id, filename, user_id, lead_count, upload_date }
```

**`outreach_messages`**
```
{ id, lead_id, message_text, tone, sent_at, status }
```

**`campaigns`**
```
{ id, name, user_id, lead_ids[], status, created_at, stats }
```

**`analytics_logs`**
```
{ id, user_id, event_type, lead_id, timestamp }
```

---

## UI Design System

- **Background**: `#0a0a0f` (near-black)
- **Surface**: `#111118` / `#1a1a2e`
- **Accent**: Cyan `#00d4ff` + Purple `#7c3aed`
- **Text**: White/Gray-400
- **Cards**: Glassmorphism with `backdrop-blur`
- **Sidebar**: Dark `#0d0d14` with active glow
- **Animations**: Framer Motion page transitions, hover lifts, loading skeletons

---

## AI Message Engine (No External API)

Rule-based logic with 4 tone templates per scenario:

**Scenarios:**
1. Business has no website → pitch website creation
2. Business has website but low rating → pitch reputation management
3. Business has website + good rating → pitch growth/marketing
4. Generic cold outreach fallback

**Tones:** Professional | Friendly | Premium | Casual

---

## WhatsApp Integration

```
https://wa.me/{phone}?text={encoded_message}
```
- Opens WhatsApp Web on desktop
- Opens WhatsApp app on mobile
- Auto-updates lead status to "Sent" on click

---

## Verification Plan

### Automated
- `npm run build` — Production build check
- Flask: `flask run` with test JSON upload

### Manual
- Upload sample Apify JSON → verify lead extraction
- Generate message for each tone/scenario
- Click WhatsApp button → verify link opens correctly
- Test auth flow: register → login → protected routes
- Test analytics charts render with data

---

## Folder Structure

```
Leads/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── models/
│   ├── uploads/
│   ├── app.py
│   ├── config.py
│   └── requirements.txt
└── README.md
```

---

## Deployment Instructions (included in README)

- **Frontend**: `vercel --prod` from `frontend/`
- **Backend**: Deploy to Railway with `Procfile`
- **Environment Variables**: `.env.example` provided for both frontend and backend
