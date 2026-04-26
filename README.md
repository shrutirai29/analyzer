# SkillBridge

SkillBridge is a full-stack resume analysis platform with:
- Flask API (`Backend`)
- React + Vite frontend (`Frontend`)
- JWT auth, analysis history, and course recommendations

## Project Structure

- `Backend/` Flask API, SQLAlchemy models, analysis logic
- `Frontend/` React app with protected routes and dashboard pages

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+

## 1) Backend Setup (localhost:5000)

```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

Backend health check:
- [http://localhost:5000/api/health](http://localhost:5000/api/health)

## 2) Frontend Setup (localhost:3000)

Open a second terminal:

```bash
cd Frontend
npm install
copy .env.example .env
npm run dev
```

Open:
- [http://localhost:3000](http://localhost:3000)

The Vite dev server proxies `/api` to `http://localhost:5000`.

## Environment Notes

- Without `ANTHROPIC_API_KEY`, resume analysis falls back to keyword-based scoring.
- For production, replace `SECRET_KEY` and `JWT_SECRET_KEY` with strong random values.
- Switch `DATABASE_URL` to Postgres for production.

## Production Checklist

- Use Gunicorn behind Nginx/Apache (or a cloud load balancer)
- Use Postgres instead of SQLite
- Configure strict CORS origins
- Add CI checks (lint/test/build)
- Add DB migrations workflow (`flask db migrate` / `flask db upgrade`)
