'use client';

import { useState } from 'react';
import { Department, CreateAnnouncement } from '@/src/types';
import { Button, Textarea } from '@/src/components/ui';

interface AnnouncementFormProps {
  departments: Department[];
  onSubmit: (data: CreateAnnouncement) => Promise<void>;
  onCancel: () => void;
}

export function AnnouncementForm({ departments, onSubmit, onCancel }: AnnouncementFormProps) {
  const [authorName, setAuthorName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!authorName.trim() || !departmentId || !description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        author_name: authorName.trim(),
        department_id: Number(departmentId),
        description: description.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit announcement');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#A0A8C8] mb-1">
          Your name <span className="text-[#FF4D6A]">*</span>
        </label>
        <input
          type="text"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          placeholder="e.g. Alex Johnson"
          className="w-full h-10 px-3 text-sm border border-white/[0.12] rounded-md bg-[#1A1F36] text-white placeholder-[#6B7394] focus:outline-none focus:ring-2 focus:ring-[#00C8FF] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#A0A8C8] mb-1">
          Department <span className="text-[#FF4D6A]">*</span>
        </label>
        <select
          value={departmentId}
          onChange={e => setDepartmentId(e.target.value)}
          className="w-full h-10 px-3 text-sm border border-white/[0.12] rounded-md bg-[#1A1F36] text-white focus:outline-none focus:ring-2 focus:ring-[#00C8FF] focus:border-transparent"
        >
          <option value="">Select a department...</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#A0A8C8] mb-1">
          Announcement <span className="text-[#FF4D6A]">*</span>
        </label>
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Share something with the team..."
          rows={4}
        />
      </div>

      {error && <p className="text-sm text-[#FF4D6A]">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post Announcement'}
        </Button>
      </div>
    </form>
  );
}
