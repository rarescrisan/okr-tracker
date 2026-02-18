-- Add direction field to key_results
-- 'increase': higher current is better (default)
-- 'decrease': lower current is better (e.g. payback period, ticket count)
ALTER TABLE key_results
  ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'increase';
