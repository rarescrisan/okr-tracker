ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS completion_note TEXT;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS completion_link TEXT;
