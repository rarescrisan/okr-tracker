-- Add document_link column to projects table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'document_link'
    ) THEN
        ALTER TABLE projects ADD COLUMN document_link TEXT;
    END IF;
END $$;

-- Add document_link column to project_tasks table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'project_tasks' AND column_name = 'document_link'
    ) THEN
        ALTER TABLE project_tasks ADD COLUMN document_link TEXT;
    END IF;
END $$;
