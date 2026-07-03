# SkillBridge

**An AI-powered resume analysis platform that scores your resume against a job description, tells you exactly what's missing, and points you to courses that fix it.**

Full-stack app: **Flask (Python) API** + **React (Vite) frontend**, with Claude-powered resume scoring, JWT auth, rejection-email analysis, a resume builder, and a personal history dashboard.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Feature Breakdown](#feature-breakdown)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Production Checklist](#production-checklist)

---

## What It Does

Upload a resume (PDF / DOCX / TXT) and paste a job description — SkillBridge sends both to **Claude** and gets back a structured, honest breakdown:

- An overall **match score** (0–100)
- Four **dimension scores**: technical, experience, education, soft skills
- **Found skills** vs **missing skills**
- A **verdict** — a short honest read on your fit
- **Actionable tips** referencing your actual resume content

It then cross-references your missing skills against a curated course database and recommends where to learn them (mixing free and paid, e.g. Coursera, Udemy, freeCodeCamp, Kaggle).

Beyond the core analyzer, it also includes:
- A **rejection-email analyzer** that classifies whether an email means you're selected, rejected, or unclear, with suggested next steps
- A **resume builder** that assembles a clean text resume from structured input
- A **dashboard** with KPIs (average match score, total analyses, top recurring missing skills)
- Full **auth** with JWT + OTP-based password reset over email

---

## Tech Stack

**Backend**
| Component | Choice |
|---|---|
| Framework | Flask 3.0 |
| ORM | SQLAlchemy (Flask-SQLAlchemy) |
| Migrations | Flask-Migrate |
| Auth | Flask-JWT-Extended (access + refresh tokens) |
| AI | Anthropic API (`claude-3-5-sonnet-latest` by default) |
| File parsing | `pdfplumber` (PDF), `python-docx` (DOCX) |
| Email | Flask-Mail (Gmail SMTP) for OTP delivery |
| Password hashing | `bcrypt` |
| Dev DB | SQLite (drop-in swap to Postgres via `DATABASE_URL`) |
| Server (prod) | Gunicorn |

**Frontend**
| Component | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Routing | React Router 6 |
| Styling | Tailwind CSS |
| HTTP client | Axios |
| Icons | lucide-react |
| Notifications | react-hot-toast |

**Repo-wide language split:** JavaScript 54.5% · Python 41.9% · CSS 3.1% · HTML 0.5%

---

## Architecture

```
                    ┌──────────────────────┐
                    │   React (Vite) SPA    │
                    │  localhost:3000       │
                    └──────────┬───────────┘
                               │  /api/*  (proxied by Vite dev server)
                               ▼
                    ┌──────────────────────┐
                    │   Flask API           │
                    │  localhost:5000       │
                    │                        │
                    │  Blueprints:           │
                    │   /api/auth            │
                    │   /api/analysis        │
                    │   /api/courses         │
                    │   /api/user            │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
     ┌────────────────┐ ┌─────────────┐ ┌──────────────────┐
     │ SQLite/Postgres │ │ Anthropic   │ │ Gmail SMTP        │
     │ (users,         │ │ API         │ │ (OTP password      │
     │  analyses,      │ │ (resume     │ │  reset emails)     │
     │  courses,       │ │  scoring)   │ │                    │
     │  email reports) │ └─────────────┘ └──────────────────┘
     └────────────────┘
```

If `ANTHROPIC_API_KEY` is missing or the API call fails, resume analysis **silently falls back** to a deterministic keyword-matching scorer (`analyze_resume_fallback`) — so the app degrades gracefully instead of breaking.

---

## Feature Breakdown

### 1. Resume ↔ Job Description Matching
`POST /api/analysis/analyze` accepts either an uploaded file (PDF/DOCX/TXT, 10 MB cap) or pasted resume text, plus a job description and optional target role. Claude is prompted to return strict JSON: match score, four dimension scores, found/missing skills, a verdict, and three actionable tips. Every analysis is persisted per-user for later retrieval (`/history`) and deletion.

### 2. Course Recommendations
Missing skills are matched against a hand-curated `COURSES_DB` (~20+ skills — Python, JavaScript, React, SQL, ML, Deep Learning, AWS, Docker, and more), each with 2–3 vetted courses spanning Coursera, Udemy, freeCodeCamp, Kaggle, and university programs, tagged free vs. paid.

### 3. Rejection Email Insights
`POST /api/analysis/email-feedback` runs a signal-based classifier over a pasted or uploaded rejection/response email — detecting phrases like "unfortunately" / "not moving forward" vs. "congratulations" / "next round" — and returns a decision label, a confidence score, likely reasons, and next steps. History is kept per-user.

### 4. Resume Builder
`POST /api/analysis/build-resume` takes structured input (name, target role, summary, skills, projects, experience, education) and assembles a clean, plain-text resume with built-in improvement tips — no AI call needed, purely deterministic formatting.

### 5. Dashboard & KPIs
`GET /api/user/dashboard-summary` aggregates a user's total analyses, average match score, saved/completed course counts, the 5 most recent resume and email reports, and the top 8 most frequently missing skills across all of a user's analyses.

### 6. Auth & Account
Signup/login with bcrypt-hashed passwords and JWT access + refresh tokens. Forgot-password flow uses a 6-digit OTP emailed via Gmail SMTP, valid for 10 minutes. Profile supports headline, bio, years of experience, location, work-type preference, skills list, and LinkedIn/GitHub links.

---

## Database Schema

| Model | Purpose | Key Fields |
|---|---|---|
| **User** | Account + profile | `email`, `password_hash`, `target_role`, `headline`, `bio`, `years_experience`, `location`, `skills` (JSON), `linkedin_url`, `github_url`, OTP fields |
| **Analysis** | One resume-vs-JD run | `match_score`, `technical/experience/education/soft_skills_score`, `found_skills`, `missing_skills`, `ai_tips`, `verdict`, `raw_result` (full JSON) |
| **SavedCourse** | Bookmarked course | `skill`, `title`, `platform`, `provider`, `duration`, `level`, `url`, `is_free`, `is_completed` |
| **EmailAnalysis** | One rejection-email run | `decision`, `confidence`, `summary`, `possible_reasons`, `next_steps`, `raw_email_excerpt` |

All child records cascade-delete with their parent `User`.

---

## API Reference

### Auth — `/api/auth`
| Method | Route | Description |
|---|---|---|
| POST | `/signup` | Create account, returns access + refresh tokens |
| POST | `/login` | Authenticate, returns tokens |
| POST | `/refresh` | Exchange refresh token for new access token |
| GET | `/me` | Get current user |
| POST | `/forgot-password/request-otp` | Email a 6-digit OTP |
| POST | `/forgot-password/verify-otp` | Verify OTP validity |
| POST | `/forgot-password/reset` | Reset password using verified OTP |

### Analysis — `/api/analysis`
| Method | Route | Description |
|---|---|---|
| POST | `/analyze` | Score resume against a job description |
| POST | `/email-feedback` | Classify a rejection/response email |
| GET | `/email-history` | Last 20 email analyses |
| POST | `/build-resume` | Generate a formatted resume from structured input |
| GET | `/history` | Last 20 resume analyses |
| GET | `/<id>` | Fetch one analysis + course recs |
| DELETE | `/<id>` | Delete an analysis |

### Courses — `/api/courses`
| Method | Route | Description |
|---|---|---|
| GET | `/` | List saved courses |
| POST | `/` | Save a course (dedup by URL) |
| PATCH | `/<id>/complete` | Toggle completion status |
| DELETE | `/<id>` | Remove a saved course |

### User — `/api/user`
| Method | Route | Description |
|---|---|---|
| GET | `/profile` | Get profile |
| PUT | `/profile` | Update profile fields |
| PUT | `/change-password` | Change password |
| GET | `/dashboard-summary` | KPIs + recent activity |

All routes except signup/login/OTP/health require a `Bearer` JWT.

---

## Project Structure

```
analyzer/
├── Backend/
│   ├── app.py                  # App factory, config, blueprint registration, health check
│   ├── model.py                # SQLAlchemy models: User, Analysis, SavedCourse, EmailAnalysis
│   ├── models.py                # Re-export shim for model.py
│   ├── mail_config.py           # Flask-Mail instance
│   ├── requirements.txt
│   ├── routes/
│   │   ├── auth.py              # Signup, login, refresh, OTP password reset
│   │   ├── analysis.py          # Analyze, email-feedback, build-resume, history
│   │   ├── courses.py           # Saved course CRUD
│   │   └── user.py              # Profile, password change, dashboard summary
│   └── utils/
│       ├── analyzer.py          # Claude prompt + JSON parsing + keyword fallback
│       ├── courses_db.py        # Curated skill → course mapping
│       ├── file_parser.py       # PDF/DOCX/TXT text extraction
│       └── text_cleaner.py
├── Frontend/
│   ├── src/
│   │   ├── App.jsx              # Route definitions, protected/public routes
│   │   ├── main.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── components/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── CourseCard.jsx
│   │   │   └── ScoreRing.jsx
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AnalyzePage.jsx
│   │   │   ├── ResumeBuilderPage.jsx
│   │   │   ├── EmailInsightsPage.jsx
│   │   │   ├── CoursesPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── GuestDashboardPage.jsx
│   │   │   └── forgotpassword.jsx
│   │   └── utils/api.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── .gitignore
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

### 1) Backend — `localhost:5000`

```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate        # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
copy .env.example .env        # `cp` on macOS/Linux
python app.py
```

Health check: `http://localhost:5000/api/health`

### 2) Frontend — `localhost:3000`

Open a second terminal:

```bash
cd Frontend
npm install
copy .env.example .env
npm run dev
```

Then open `http://localhost:3000`. The Vite dev server proxies `/api` to `http://localhost:5000`.

---

## Environment Variables

| Variable | Used by | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | Backend | Powers AI resume scoring; without it, falls back to keyword-based scoring |
| `ANTHROPIC_MODEL` | Backend | Defaults to `claude-3-5-sonnet-latest` |
| `DATABASE_URL` | Backend | Defaults to local SQLite; set to Postgres URI in production |
| `SECRET_KEY` / `JWT_SECRET_KEY` | Backend | Replace with strong random values in production |
| `EMAIL_USER` / `EMAIL_PASS` | Backend | Gmail SMTP credentials for OTP emails |
| `FLASK_ENV` / `FLASK_HOST` / `FLASK_PORT` | Backend | Runtime config |

---

## Production Checklist

- [ ] Serve via Gunicorn behind Nginx/Apache (or a cloud load balancer)
- [ ] Switch to Postgres instead of SQLite
- [ ] Configure strict CORS origins (currently `*`)
- [ ] Add CI checks (lint/test/build)
- [ ] Add a DB migrations workflow (`flask db migrate` / `flask db upgrade`)
- [ ] Rotate `SECRET_KEY` and `JWT_SECRET_KEY`

---

<p align="center">Built by <a href="https://github.com/shrutirai29">shrutirai29</a></p>
