-- Migration: Add todo_items table
-- Global org-level todo list displayed on the Discussions page

CREATE TABLE IF NOT EXISTS todo_items (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
