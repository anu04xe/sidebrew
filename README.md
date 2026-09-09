# Sidebrew☕️

**A small reporting tool for cafe operations.**

[**Live demo →**](https://sidebrew.vercel.app)

Sidebrew was built around a simple question:

> **What if the daily cafe report didn't have to be written by hand?**

It takes sales data, checks what changed, looks at inventory, and turns
the useful parts into a short morning brief.

Built as a one-day prototype for a demo application.

<img width="679" height="722" alt="Screenshot 2026-09-09 at 11 55 32 AM" src="https://github.com/user-attachments/assets/06e3316a-aa27-4f06-bb06-6a4ce2628980" />


------------------------------------------------------------------------

## The idea

A typical daily reporting routine can look like this:

**Sales spreadsheet → calculations → comparisons → inventory check →
interpretation → report**

Sidebrew compresses that into:

**Sales data → Sidebrew → morning brief**

## What it handles

-   Daily revenue, orders, average order value, and units sold
-   Comparisons against a recent 7-day baseline
-   Detection of unusual changes in sales patterns
-   Inventory usage and estimated stock risk
-   A concise operational brief that can be copied or exported as a PDF
-   CSV import with validation and a preview before processing

## Where AI fits

The numbers do not come from an LLM.

Core calculations and operational signals are deterministic:

-   Revenue and order metrics
-   Historical comparisons
-   Anomaly detection
-   Inventory estimates

AI is optional and is used only to turn those structured results into a
more natural-language brief.

If an AI key isn't available, Sidebrew falls back to a deterministic
brief generator, so the core workflow still works.

## The demo

The included demo uses synthetic sales data for three fictional cafes.

The dataset covers roughly 60 days of hourly sales activity, including
normal patterns and a handful of deliberately introduced anomalies so
the reporting workflow has something meaningful to find.

## Built with

**Backend**

Python 3.11 · FastAPI · SQLite · SQLAlchemy · Pandas · Pydantic

**Frontend**

React · TypeScript · Vite · Tailwind CSS · Recharts

**Reports**

ReportLab



The intended flow is deliberately short:

1.  Open Sidebrew
2.  Review the morning brief
3.  Import a sales CSV
4.  Let Sidebrew process the data
5.  Review what changed and what needs attention
6.  Copy the brief or export it as a PDF

## Deployment

The frontend is deployed on Vercel and the FastAPI backend runs
separately.

**Live:** [sidebrew.vercel.app](https://sidebrew.vercel.app)

------------------------------------------------------------------------

*Sidebrew is a portfolio prototype, not a production POS or inventory
system.*
