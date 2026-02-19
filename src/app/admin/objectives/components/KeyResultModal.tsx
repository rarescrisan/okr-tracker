'use client';

import { Button, Modal, Input, Checkbox, Select } from '@/src/components/ui';
import { KeyResult } from '@/src/types';
import { UNIT_TYPE_OPTIONS, DIRECTION_OPTIONS } from '@/src/lib/constants';

interface KrForm {
  code: string;
  title: string;
  description: string;
  baseline_value: string;
  baseline_label: string;
  target_value: string;
  target_label: string;
  current_value: string;
  current_label: string;
  unit_type: 'number' | 'currency' | 'percentage';
  direction: 'increase' | 'decrease';
  target_date: string;
  is_top_kr: boolean;
}

interface KeyResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingKr: KeyResult | null;
  form: KrForm;
  setForm: (form: KrForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

export function KeyResultModal({ isOpen, onClose, editingKr, form, setForm, onSubmit, saving }: KeyResultModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingKr ? 'Edit Key Result' : 'Add Key Result'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} loading={saving}>
            {editingKr ? 'Save Changes' : 'Add Key Result'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="e.g., KR1.1"
            required
          />
          <Select
            label="Unit Type"
            options={UNIT_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            value={form.unit_type}
            onChange={(e) => setForm({ ...form, unit_type: e.target.value as 'number' | 'currency' | 'percentage' })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#A0A8C8] mb-1">Direction</label>
          <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
            {DIRECTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, direction: opt.value as 'increase' | 'decrease' })}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  form.direction === opt.value
                    ? 'bg-[#00C8FF] text-[#0F1326]'
                    : 'bg-transparent text-[#A0A8C8] hover:bg-white/[0.06]'
                }`}
              >
                {opt.value === 'increase' ? '↑ ' : '↓ '}{opt.label}
              </button>
            ))}
          </div>
        </div>
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Key result title"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Baseline Value"
            type="number"
            step="any"
            value={form.baseline_value}
            onChange={(e) => setForm({ ...form, baseline_value: e.target.value })}
            placeholder="Starting value"
          />
          <Input
            label="Baseline Label"
            value={form.baseline_label}
            onChange={(e) => setForm({ ...form, baseline_label: e.target.value })}
            placeholder="e.g., per month"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Target Value"
            type="number"
            step="any"
            value={form.target_value}
            onChange={(e) => setForm({ ...form, target_value: e.target.value })}
            placeholder="Target value"
            required
          />
          <Input
            label="Target Label"
            value={form.target_label}
            onChange={(e) => setForm({ ...form, target_label: e.target.value })}
            placeholder="e.g., per month"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Current Value"
            type="number"
            step="any"
            value={form.current_value}
            onChange={(e) => setForm({ ...form, current_value: e.target.value })}
            placeholder="Current progress"
          />
          <Input
            label="Target Date"
            type="date"
            value={form.target_date}
            onChange={(e) => setForm({ ...form, target_date: e.target.value })}
          />
        </div>
        <Checkbox
          label="Mark as Top KR (one per department, shown prominently)"
          checked={form.is_top_kr}
          onChange={(e) => setForm({ ...form, is_top_kr: e.target.checked })}
        />
      </form>
    </Modal>
  );
}
