-- Migration: Add x_requests table
-- Cross-team requests where one department asks another to do something

CREATE TABLE IF NOT EXISTS x_requests (
  id SERIAL PRIMARY KEY,
  requesting_department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  requesting_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requesting_project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  target_department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_x_requests_requesting_dept ON x_requests(requesting_department_id);
CREATE INDEX IF NOT EXISTS idx_x_requests_target_dept ON x_requests(target_department_id);
CREATE INDEX IF NOT EXISTS idx_x_requests_status ON x_requests(status);
