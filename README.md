<div align="center">
  <img src="frontend/public/favicon.svg" alt="Grit icon" width="48" height="48" />
  <h1>grit</h1>
  <p>
    A minimalist, keyboard-first deep work timer &amp; daily accountability tracker.
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-19-2563EB?style=flat-square&logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-6-2563EB?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-2563EB?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/FastAPI-Python-2563EB?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon-2563EB?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>
</div>

> **Private Deployment Note:** Grit is built and deployed as a private, single-tenant tool for my own daily workflow (Vercel + Neon Postgres, gated by a personal `X-Grit-Key` secret) rather than a public multi-user SaaS. Below is a visual walkthrough and local setup guide.

---

<p align="center">
  <img width="800" alt="Grit dashboard overview showing active timer and category cards" src="https://github.com/user-attachments/assets/46ba461c-0f9d-4737-b3ed-8c8627f9df2f" />
  <br />
  <sub><em>Active timer hero, global daily/weekly progress bars, and category cards.</em></sub>
</p>


---

## Core Features

### 1. Focus Timer & Category Targets

- **Single Active Session Guarantee:** Enforced at the PostgreSQL level via a partial unique index (`uq_one_running_session`)—starting or switching categories automatically closes the previous session.
- **Daily & Weekly Goals:** Track per-category targets alongside global daily and weekly progress bars.
- **Full Session Control:** Inline editing of durations and notes, plus chronological or day-grouped session history.

### 2. Keyboard Command Palette (`Cmd / Ctrl + K`)

- Minimalist command bar with a structured keyword guide when empty and ranked matching as you type.
- Supports timer controls (`switch` / `grind <cat>`, `pause` / `stop` / `end`, `resume` / `continue`), rituals (`shutdown`, `mirror`, `cookie jar`), and category actions (`new`, `edit <cat>`, `archive <cat>`).

<p align="center">
  <img width="800" alt="Keyboard Command Palette opened with Cmd/Ctrl + K" src="https://github.com/user-attachments/assets/85589e9c-49fa-45e4-995d-d6d1068e07dd" />
  <br />
  <sub><em>Switching categories and controlling the timer from the keyboard with <code>Cmd / Ctrl + K</code>.</em></sub>
</p>

### 3. Accountability Mirror & Cookie Jar

- **End-of-Day Shutdown Ritual:** Rate **Mood** (`1–5`) and **Focus** (`1–5`) with custom sliders and log a daily reflection.
- **Calloused Mind Detection:** Automatically highlights days where execution stayed high despite heavy resistance (`mood <= 2` and `focus >= 4`).
- **Cookie Jar:** Bookmark hard-fought days and review past wins in a dedicated modal.

<p align="center">
  <img width="800" alt="Accountability Mirror modal and Cookie Jar review" src="https://github.com/user-attachments/assets/305c4022-f068-450a-b91f-bbb3e2ca6b1f" />
  <br />
  <sub><em>Daily Accountability Mirror ratings, Calloused Mind detection, and the Cookie Jar modal.</em></sub>
</p>

### 4. Monthly Aggregates & History Export

- **Monthly Breakdown:** Stacked category distribution bar, active-day vs. calendar-day averages, and a compact monthly **Accountability Mirror** strip (`Avg Mood`, `Avg Focus`, `Calloused days`, and logged-day count).
- **CSV Export:** Export either the currently filtered month/category view or a full backup of all completed sessions.

<p align="center">
  <img width="800" alt="Monthly aggregates, Accountability Mirror summary, and grouped daily history" src="https://github.com/user-attachments/assets/ce688981-b766-4802-94bd-69b80bdf9d38" />
  <br />
  <sub><em>Monthly category breakdown, Accountability Mirror averages, and grouped daily session logs.</em></sub>
</p>

---

## Engineering Highlights

- **Dynamic Target Shifting on Category Archive:** Soft-deleting (archiving) a category removes it from active dashboard controls and tomorrow's targets, while preserving its name, icon, and color in historical logs (marked with an `Archived` badge). Today's and this week's global targets shift by the exact time already logged on that category, so earned progress is preserved without discounting remaining active goals.
- **Single-Tenant Privacy Gate:** FastAPI verifies `X-Grit-Key` in constant time (`APIKeyHeader` + `secrets.compare_digest`) via a global app dependency and disables `/docs`, `/redoc`, and `/openapi.json` whenever `DEBUG=False`. On the frontend, a one-time unlock screen caches the key in `localStorage`, attaches it via Axios interceptors, and locks the UI automatically on `401`.
- **Zero-Config Serverless FastAPI on Vercel:** Stateless API deployed as a Vercel Python function backed by Neon Postgres, keeping cold starts sub-second on the free Hobby tier.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite, Axios, `react-icons`
- **Backend:** FastAPI, SQLModel, SQLAlchemy 2, Alembic, Pydantic, `psycopg[binary]`
- **Database & Hosting:** Neon (PostgreSQL), Vercel (Frontend & Serverless Backend)

---

## Project Structure

```text
grit-app/
├── backend/
│   ├── alembic/          # Database migrations
│   ├── routers/          # Categories, sessions, daily_logs endpoints
│   ├── database.py       # SQLModel engine & session dependency
│   ├── main.py           # FastAPI app, CORS, and X-Grit-Key gate
│   ├── models.py         # Category, TimeSession, DailyLog tables
│   ├── schemas.py        # Request/response Pydantic schemas
│   └── services.py       # Shared session helpers
└── frontend/
    ├── public/           # Custom mountain SVG favicon
    └── src/
        ├── api/          # Axios client + endpoint modules
        ├── components/   # accountability/, categories/, command-palette/, history/
        ├── hooks/        # useGritData, useTimer
        └── utils/        # Progress math, command parser, CSV, time, ratings
```

---

## Local Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL (or a free [Neon](https://neon.tech) database)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Fill in DATABASE_URL, CORS_ALLOWED_ORIGINS, DEBUG=True, and GRIT_SECRET_KEY

alembic upgrade head
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install

cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

npm run dev
```

Open `http://localhost:5173` and enter the `GRIT_SECRET_KEY` you configured in `backend/.env` on the unlock screen.
