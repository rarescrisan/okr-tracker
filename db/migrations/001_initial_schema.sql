-- migrations-pg/001_initial_schema.sql (PostgreSQL)

-- Users table (people assigned to projects/tasks)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6d6e6f',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Objectives table (OKRs - the "O" part)
CREATE TABLE IF NOT EXISTS objectives (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_top_objective BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Key Results table (the "KR" part)
CREATE TABLE IF NOT EXISTS key_results (
  id SERIAL PRIMARY KEY,
  objective_id INTEGER NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  baseline_value REAL,
  baseline_label TEXT,
  target_value REAL NOT NULL,
  target_label TEXT,
  current_value REAL DEFAULT 0,
  current_label TEXT,
  unit_type TEXT DEFAULT 'number',
  target_date DATE,
  is_top_kr BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  objective_id INTEGER REFERENCES objectives(id) ON DELETE SET NULL,
  dri_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  progress_percentage INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  priority TEXT DEFAULT 'P1',
  status TEXT DEFAULT 'not_started',
  color TEXT DEFAULT '#4573d2',
  display_order INTEGER DEFAULT 0,
  document_link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Working Group (many-to-many: projects <-> users)
CREATE TABLE IF NOT EXISTS project_working_group (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

-- Project Tasks (subtasks)
CREATE TABLE IF NOT EXISTS project_tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'not_started',
  start_date DATE,
  end_date DATE,
  display_order INTEGER DEFAULT 0,
  document_link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_objectives_department ON objectives(department_id);
CREATE INDEX IF NOT EXISTS idx_key_results_objective ON key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_projects_objective ON projects(objective_id);
CREATE INDEX IF NOT EXISTS idx_projects_dri ON projects(dri_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_department_id ON projects(department_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_working_group_project ON project_working_group(project_id);
