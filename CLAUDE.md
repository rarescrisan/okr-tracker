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
- **Database**: PostgreSQL via `pg` package (connection pool)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript with strict mode

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # REST API routes (CRUD for all entities)
│   │   ├── users/         # User CRUD
│   │   ├── departments/   # Department CRUD
│   │   ├── objectives/    # Objective CRUD
│   │   ├── key-results/   # Key Results CRUD
│   │   ├── projects/      # Projects CRUD + reorder + tasks
│   │   └── tasks/         # Task CRUD + reorder
│   ├── admin/             # Admin pages with sidebar (CRUD management)
│   │   ├── users/         # User management
│   │   ├── departments/   # Department management
│   │   ├── objectives/    # Objectives management
│   │   └── projects/      # Projects management
│   └── (presentation)/    # Public-facing views
│       ├── okr/           # OKR view
│       ├── gantt/         # Gantt chart view
│       └── work/          # Work view
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Textarea.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Tabs.tsx
│   │   └── index.ts       # Barrel export
│   └── layout/            # Layout components
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── PageHeader.tsx
│       └── index.ts       # Barrel export
├── lib/
│   ├── db.ts              # PostgreSQL connection pool and query helpers
│   ├── constants.ts       # Color palettes, status/priority options
│   └── utils.ts           # Utility functions
└── types/index.ts         # TypeScript interfaces for all entities

db/
├── migrations/            # SQL migration files
│   └── 001_initial_schema.sql
├── seed-data.sql          # PostgreSQL seed data
└── seed.ts               # Database seeding script
```

### Database Schema

The database uses PostgreSQL with the following tables:

```sql
-- Users table (people assigned to projects/tasks)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6d6e6f',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Objectives table (OKRs - the "O" part)
CREATE TABLE objectives (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  code TEXT NOT NULL,                -- e.g., "C-O1", "M-O2"
  title TEXT NOT NULL,
  description TEXT,
  is_top_objective BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Key Results table (the "KR" part)
CREATE TABLE key_results (
  id SERIAL PRIMARY KEY,
  objective_id INTEGER NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  code TEXT NOT NULL,                -- e.g., "KR1.1", "KR2.1"
  title TEXT NOT NULL,
  description TEXT,
  baseline_value REAL,
  baseline_label TEXT,
  target_value REAL NOT NULL,
  target_label TEXT,
  current_value REAL DEFAULT 0,
  current_label TEXT,
  unit_type TEXT DEFAULT 'number',   -- 'number' | 'currency' | 'percentage'
  target_date DATE,
  is_top_kr BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  objective_id INTEGER REFERENCES objectives(id) ON DELETE SET NULL,
  dri_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  progress_percentage INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  priority TEXT DEFAULT 'P1',        -- 'P0' | 'P1' | 'P2' | 'P3'
  status TEXT DEFAULT 'not_started', -- 'not_started' | 'in_progress' | 'completed' | 'on_hold'
  color TEXT DEFAULT '#4573d2',
  display_order INTEGER DEFAULT 0,
  document_link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Working Group (many-to-many: projects <-> users)
CREATE TABLE project_working_group (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

-- Project Tasks (subtasks)
CREATE TABLE project_tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'not_started', -- 'not_started' | 'in_progress' | 'blocked' | 'completed'
  progress_percentage INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  display_order INTEGER DEFAULT 0,
  document_link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Data Model Relationships

```
Departments (1) ──── (*) Objectives (1) ──── (*) Key Results
     │                        │
     │                        │
     └──────── (*) Projects (*) ────┘
                    │
                    ├── dri_user_id ──── Users (1)
                    │
                    ├── (*) ──── project_working_group ──── (*) Users
                    │
                    └── (1) ──── (*) Project Tasks
                                       │
                                       └── assignee_user_id ──── Users (1)
```

### Route Groups

- `(presentation)`: Public views - `/okr`, `/gantt`, `/work` - uses Navbar only
- `admin`: Management pages - `/admin/*` - uses Navbar + Sidebar

### Path Alias

Use `@/*` for imports from project root (configured in tsconfig.json):
```typescript
import { query, queryOne, execute } from '@/src/lib/db';
import { Button } from '@/src/components/ui';
```

### API Pattern

All API routes follow the same pattern in `src/app/api/[entity]/route.ts`:
- `GET` - List with optional query filters
- `POST` - Create new entity
- Individual routes at `[id]/route.ts` for `GET`, `PUT`, `DELETE`

Database queries use the `pg` package with parameterized statements:
```typescript
import { query, queryOne, execute } from '@/src/lib/db';

// Query multiple rows
const rows = await query<MyType>('SELECT * FROM table WHERE id = $1', [id]);

// Query single row
const row = await queryOne<MyType>('SELECT * FROM table WHERE id = $1', [id]);

// Execute INSERT/UPDATE/DELETE
await execute('UPDATE table SET name = $1 WHERE id = $2', [name, id]);
```

### Constants

Status and priority options are defined in `src/lib/constants.ts`:
- **Project Status**: `not_started`, `in_progress`, `completed`, `on_hold`
- **Task Status**: `not_started`, `in_progress`, `blocked`, `completed`
- **Priority**: `P0` (Critical), `P1` (High), `P2` (Medium), `P3` (Low)
- **Unit Types**: `number`, `currency`, `percentage`
