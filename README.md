# Sidebrew

Sidebrew is a small internal operations tool for cafes. It automates the daily workflow of checking sales and inventory trends, spotting what changed, and drafting a shareable morning update.

## The problem

Cafe managers repeatedly do the same manual work:

Spreadsheet → manual calculations → interpretation → message

## The solution

Sidebrew turns that into:

CSV → Sidebrew → Morning Brief

## What is automated

- Sales aggregation and KPI calculation
- Historical baseline comparison (recent 7-day baseline)
- Explainable anomaly detection
- Inventory risk estimation and reorder recommendations
- Shareable morning brief (copy text + PDF export)

## AI usage

### Deterministic (always)

- Revenue, orders, AOV, units
- Historical comparisons
- Anomaly detection
- Inventory usage and days remaining estimates

### AI-assisted (optional)

- Natural-language synthesis of the operational brief from structured analytics

If no AI key is configured, Sidebrew uses a deterministic fallback brief generator.

## Tech stack

- Backend: Python 3.11+, FastAPI, SQLite, SQLAlchemy, Pandas, Pydantic
- Frontend: React, TypeScript, Vite, Tailwind CSS, Recharts
- Reports: ReportLab (PDF)

## Synthetic data

The demo includes coherent **synthetic data** for three fictional stores:

- Indiranagar
- Civil Lines
- Koregaon Park

It seeds ~60 days of realistic hourly sales behavior with deliberate operational patterns/anomalies.

## Run locally

### 1) Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2) Configure environment

```bash
cd ..
cp .env.example .env
```

### 3) Start backend

```bash
PYTHONPATH=backend uvicorn app.main:app --reload --app-dir backend
```

### 4) Start frontend

```bash
cd frontend
npm install
npm run dev
```

### 5) Seed demo data

On first launch the frontend calls `/api/seed` automatically. You can also seed manually:

```bash
curl -X POST http://localhost:8000/api/seed
```

### 6) Tests

```bash
cd /path/to/sidebrew
PYTHONPATH=backend pytest backend/app/tests
```

### 7) Frontend build

```bash
cd frontend
npm run build
```

## Core flow to demo (60–90 seconds)

1. Open Sidebrew
2. View latest Morning Brief
3. Import CSV (validation + preview + warnings)
4. Generate updated brief insights
5. Copy brief text
6. Export PDF memo
