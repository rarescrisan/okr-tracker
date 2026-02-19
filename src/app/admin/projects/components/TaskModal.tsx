'use client';

import { Button, Modal, Input, Select } from '@/src/components/ui';
import { ProjectTask, User } from '@/src/types';
import { STATUS_OPTIONS } from '@/src/lib/constants';

interface TaskForm {
  title: string;
  assignee_user_id: string;
  status: string;
  progress_percentage: string;
  start_date: string;
  end_date: string;
  document_link: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: ProjectTask | null;
  form: TaskForm;
  setForm: (form: TaskForm) => void;
  users: User[];
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

export function TaskModal({ isOpen, onClose, editingTask, form, setForm, users, onSubmit, saving }: TaskModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? 'Edit Task' : 'Add Task'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} loading={saving}>
            {editingTask ? 'Save Changes' : 'Add Task'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Task Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Enter task title"
          required
        />
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Assignee"
            options={[
              { value: '', label: 'Unassigned' },
              ...users.map(u => ({ value: u.id.toString(), label: u.name })),
            ]}
            value={form.assignee_user_id}
            onChange={(e) => setForm({ ...form, assignee_user_id: e.target.value })}
          />
          <Select
            label="Status"
            options={STATUS_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
          <Input
            label="Progress %"
            type="number"
            min="0"
            max="100"
            value={form.progress_percentage}
            onChange={(e) => setForm({ ...form, progress_percentage: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
          <Input
            label="End Date"
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>
        <Input
          label="Document Link"
          type="url"
          value={form.document_link}
          onChange={(e) => setForm({ ...form, document_link: e.target.value })}
          placeholder="https://docs.google.com/..."
        />
      </form>
    </Modal>
  );
}
