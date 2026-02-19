'use client';

import { Button, Modal, Input, Textarea, Select, Checkbox } from '@/src/components/ui';
import { Department, Objective } from '@/src/types';

interface ObjForm {
  department_id: string;
  code: string;
  title: string;
  description: string;
  is_top_objective: boolean;
}

interface ObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingObj: Objective | null;
  form: ObjForm;
  setForm: (form: ObjForm) => void;
  departments: Department[];
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

export function ObjectiveModal({ isOpen, onClose, editingObj, form, setForm, departments, onSubmit, saving }: ObjectiveModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingObj ? 'Edit Objective' : 'Add Objective'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} loading={saving}>
            {editingObj ? 'Save Changes' : 'Add Objective'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Select
          label="Department"
          options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
          value={form.department_id}
          onChange={(e) => setForm({ ...form, department_id: e.target.value })}
          placeholder="Select department"
          required
        />
        <Input
          label="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          placeholder="e.g., E-O1"
          required
        />
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Objective title"
          required
        />
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Optional description"
        />
      </form>
    </Modal>
  );
}
