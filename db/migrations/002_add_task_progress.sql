-- Add progress_percentage column to project_tasks table
ALTER TABLE project_tasks
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0;
