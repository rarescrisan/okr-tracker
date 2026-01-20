# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **novo-dri-tracker**, an OKR (Objectives and Key Results) tracking application built with Next.js 16. It allows organizations to manage departments, objectives, key results, projects, and tasks with DRI (Directly Responsible Individual) assignments.

## Commands

```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Production build
npm run lint       # Run ESLint
npm run db:seed    # Seed the database with sample data (uses tsx to run db/seed.ts)
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Database**: SQLite via better-sqlite3 (WAL mode, foreign keys enabled)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript with strict mode

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # REST API routes (CRUD for all entities)
│   ├── admin/             # Admin pages with sidebar (CRUD management)
│   └── (presentation)/    # Public-facing views (OKR, Gantt, Work)
├── components/
│   ├── ui/                # Reusable UI components (Button, Modal, Table, etc.)
│   └── layout/            # Layout components (Navbar, Sidebar, PageHeader)
├── lib/
│   ├── db.ts              # Database connection singleton and helpers
│   └── constants.ts       # Color palettes, status/priority options
└── types/index.ts         # TypeScript interfaces for all entities

db/
├── database.sqlite        # SQLite database file
├── migrations/            # SQL migration files (run on seed)
└── seed.ts               # Database seeding script
```

### Data Model

The app implements a hierarchical OKR structure:
- **Departments** → contain **Objectives**
- **Objectives** → contain **Key Results** (with baseline/target/current values)
- **Projects** → linked to Objectives, have a DRI (user), working group, and tasks
- **Users** → can be DRIs, task assignees, or working group members

### Route Groups

- `(presentation)`: Public views - `/okr`, `/gantt`, `/work` - uses Navbar only
- `admin`: Management pages - `/admin/*` - uses Navbar + Sidebar

### Path Alias

Use `@/*` for imports from project root (configured in tsconfig.json):
```typescript
import { getDb } from '@/src/lib/db';
import { Button } from '@/src/components/ui';
```

### API Pattern

All API routes follow the same pattern in `src/app/api/[entity]/route.ts`:
- `GET` - List with optional query filters
- `POST` - Create new entity
- Individual routes at `[id]/route.ts` for `GET`, `PUT`, `DELETE`

Database queries use parameterized statements via better-sqlite3's `prepare().all()` and `prepare().run()` methods.
