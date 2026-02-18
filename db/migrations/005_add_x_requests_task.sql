DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'x_requests' AND column_name = 'requesting_task_id'
    ) THEN
        ALTER TABLE x_requests ADD COLUMN requesting_task_id INTEGER REFERENCES project_tasks(id) ON DELETE SET NULL;
    END IF;
END $$;
