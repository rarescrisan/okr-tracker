'use client';

import { useEffect, useRef, useState } from 'react';
import { Department, User, Project, ProjectTask, CreateXRequest } from '@/src/types';
import { Button, Select, Textarea } from '@/src/components/ui';

interface RequestFormProps {
  departments: Department[];
  users: User[];
  projects: Project[];
  onSubmit: (data: CreateXRequest) => Promise<void>;
  onCancel: () => void;
}

// --- Autocomplete ---

interface ACOption {
  value: string;
  label: string;
}

interface AutocompleteProps {
  options: ACOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

function Autocomplete({ options, value, onChange, placeholder, disabled }: AutocompleteProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const selected = options.find(o => o.value === value);
  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  if (selected) {
    return (
      <div className={`flex items-center h-10 px-3 border border-[#e8ecee] rounded-md bg-white gap-2 ${disabled ? 'opacity-50' : ''}`}>
        <span className="flex-1 text-sm text-[#1e1f21] truncate">{selected.label}</span>
        {!disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="shrink-0 text-[#9ca0a4] hover:text-[#1e1f21] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-10 px-3 text-sm border border-[#e8ecee] rounded-md bg-white text-[#1e1f21] placeholder-[#9ca0a4] focus:outline-none focus:ring-2 focus:ring-[#4573d2] focus:border-transparent disabled:bg-[#f6f8f9] disabled:cursor-not-allowed"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-30 top-full mt-1 w-full bg-white border border-[#e8ecee] rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(o => (
            <button
              key={o.value}
              type="button"
              onMouseDown={() => { onChange(o.value); setQuery(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-[#1e1f21] hover:bg-[#f6f8f9]"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
      {open && query.length > 0 && filtered.length === 0 && (
        <div className="absolute z-30 top-full mt-1 w-full bg-white border border-[#e8ecee] rounded-md shadow-lg px-3 py-2 text-sm text-[#9ca0a4]">
          No results
        </div>
      )}
    </div>
  );
}

// --- Form ---

export function RequestForm({ departments, users, projects, onSubmit, onCancel }: RequestFormProps) {
  const [requestingDeptId, setRequestingDeptId] = useState('');
  const [requestingUserId, setRequestingUserId] = useState('');
  const [requestingProjectId, setRequestingProjectId] = useState('');
  const [requestingTaskId, setRequestingTaskId] = useState('');
  const [targetDeptId, setTargetDeptId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deptOptions: ACOption[] = departments.map(d => ({ value: String(d.id), label: d.name }));
  const userOptions: ACOption[] = users.map(u => ({ value: String(u.id), label: u.name }));

  const filteredProjects = requestingDeptId
    ? projects.filter(p => p.department_id === Number(requestingDeptId))
    : projects;

  const projectOptions: ACOption[] = filteredProjects.map(p => ({ value: String(p.id), label: p.name }));

  const selectedProject = requestingProjectId
    ? projects.find(p => p.id === Number(requestingProjectId))
    : null;

  const taskOptions = selectedProject?.tasks
    ? [
        { value: '', label: 'None' },
        ...selectedProject.tasks.map((t: ProjectTask) => ({ value: String(t.id), label: t.title })),
      ]
    : [{ value: '', label: 'None' }];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!requestingDeptId || !requestingUserId || !targetDeptId || !description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        requesting_department_id: Number(requestingDeptId),
        requesting_user_id: Number(requestingUserId),
        requesting_project_id: requestingProjectId ? Number(requestingProjectId) : null,
        requesting_task_id: requestingTaskId ? Number(requestingTaskId) : null,
        target_department_id: Number(targetDeptId),
        target_user_id: targetUserId ? Number(targetUserId) : null,
        description: description.trim(),
        status: 'open',
        display_order: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* From */}
      <div>
        <h3 className="text-sm font-semibold text-[#1e1f21] mb-3">From</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#6d6e6f] mb-1">
              Department <span className="text-[#f06a6a]">*</span>
            </label>
            <Autocomplete
              options={deptOptions}
              value={requestingDeptId}
              onChange={v => {
                setRequestingDeptId(v);
                setRequestingProjectId('');
                setRequestingTaskId('');
              }}
              placeholder="Type to search departments..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6d6e6f] mb-1">
              Person <span className="text-[#f06a6a]">*</span>
            </label>
            <Autocomplete
              options={userOptions}
              value={requestingUserId}
              onChange={setRequestingUserId}
              placeholder="Type to search people..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6d6e6f] mb-1">
              Project (optional)
            </label>
            <Autocomplete
              options={projectOptions}
              value={requestingProjectId}
              onChange={v => {
                setRequestingProjectId(v);
                setRequestingTaskId('');
              }}
              placeholder="Type to search projects..."
            />
          </div>
          {requestingProjectId && (
            <div>
              <label className="block text-xs font-medium text-[#6d6e6f] mb-1">
                Task (optional)
              </label>
              <Select
                value={requestingTaskId}
                onChange={e => setRequestingTaskId(e.target.value)}
                options={taskOptions}
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#edeef0]" />

      {/* To */}
      <div>
        <h3 className="text-sm font-semibold text-[#1e1f21] mb-3">To</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#6d6e6f] mb-1">
              Department <span className="text-[#f06a6a]">*</span>
            </label>
            <Autocomplete
              options={deptOptions}
              value={targetDeptId}
              onChange={v => {
                setTargetDeptId(v);
                setTargetUserId('');
              }}
              placeholder="Type to search departments..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6d6e6f] mb-1">
              Person (optional)
            </label>
            <Autocomplete
              options={userOptions}
              value={targetUserId}
              onChange={setTargetUserId}
              placeholder="Type to search people..."
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[#edeef0]" />

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-[#6d6e6f] mb-1">
          What do you need? <span className="text-[#f06a6a]">*</span>
        </label>
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe what you need from the other team..."
          rows={4}
        />
      </div>

      {error && <p className="text-sm text-[#f06a6a]">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
}
