'use client';

import { Button, Modal, Input, Select, Avatar } from '@/src/components/ui';
import { Project, User, Objective, Department } from '@/src/types';
import { PRIORITY_OPTIONS, PROJECT_STATUS_OPTIONS } from '@/src/lib/constants';

interface ProjectForm {
  name: string;
  department_id: string;
  objective_id: string;
  dri_user_id: string;
  working_group_ids: number[];
  priority: string;
  status: string;
  start_date: string;
  end_date: string;
  progress_percentage: string;
  document_link: string;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject: Project | null;
  form: ProjectForm;
  setForm: (form: ProjectForm) => void;
  users: User[];
  departments: Department[];
  objectives: Objective[];
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  driSearch: string;
  setDriSearch: (s: string) => void;
  workingGroupSearch: string;
  setWorkingGroupSearch: (s: string) => void;
}

export function ProjectModal({
  isOpen,
  onClose,
  editingProject,
  form,
  setForm,
  users,
  departments,
  objectives,
  onSubmit,
  saving,
  driSearch,
  setDriSearch,
  workingGroupSearch,
  setWorkingGroupSearch,
}: ProjectModalProps) {
  const toggleWorkingGroupMember = (userId: number) => {
    const newIds = form.working_group_ids.includes(userId)
      ? form.working_group_ids.filter(id => id !== userId)
      : [...form.working_group_ids, userId];
    setForm({ ...form, working_group_ids: newIds });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProject ? 'Edit Project' : 'Add Project'}
      size="lg"
      maxHeight={700}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} loading={saving}>
            {editingProject ? 'Save Changes' : 'Add Project'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Project Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Enter project name"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Department"
            options={[
              { value: '', label: 'Select department' },
              ...departments.map(d => ({ value: d.id.toString(), label: d.name })),
            ]}
            value={form.department_id}
            onChange={(e) => setForm({ ...form, department_id: e.target.value })}
          />
          <Select
            label="Linked Objective"
            options={[
              { value: '', label: 'None' },
              ...(form.department_id
                ? objectives.filter(o => o.department_id === parseInt(form.department_id))
                : objectives
              ).map(o => ({ value: o.id.toString(), label: `${o.code} - ${o.title}` })),
            ]}
            value={form.objective_id}
            onChange={(e) => setForm({ ...form, objective_id: e.target.value })}
          />
        </div>

        {/* DRI Selector */}
        <div>
          <label className="block text-sm font-medium text-[#A0A8C8] mb-2">DRI (Directly Responsible Individual)</label>
          {form.dri_user_id && (
            <div className="flex flex-wrap gap-2 mb-3">
              {(() => {
                const user = users.find(u => u.id.toString() === form.dri_user_id);
                if (!user) return null;
                return (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00C8FF]/[0.15] text-[#00C8FF] border border-[#00C8FF]/[0.3] text-sm">
                    <Avatar name={user.name} size="xs" />
                    {user.name}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, dri_user_id: '' })}
                      className="ml-1 hover:bg-[#00C8FF]/[0.25] rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                );
              })()}
            </div>
          )}
          <div className="relative">
            <Input
              placeholder="Search users to assign as DRI..."
              value={driSearch}
              onChange={(e) => setDriSearch(e.target.value)}
            />
            {driSearch && (
              <div className="absolute z-10 w-full mt-1 bg-[#2A3152] border border-white/[0.08] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {users
                  .filter(u =>
                    u.name.toLowerCase().includes(driSearch.toLowerCase()) &&
                    u.id.toString() !== form.dri_user_id
                  )
                  .map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, dri_user_id: user.id.toString() });
                        setDriSearch('');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.06] text-sm"
                    >
                      <Avatar name={user.name} size="xs" />
                      <span className="text-white">{user.name}</span>
                      {user.email && <span className="text-[#6B7394]">{user.email}</span>}
                    </button>
                  ))}
                {users.filter(u =>
                  u.name.toLowerCase().includes(driSearch.toLowerCase()) &&
                  u.id.toString() !== form.dri_user_id
                ).length === 0 && (
                  <div className="px-3 py-2 text-sm text-[#6B7394]">No users found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Working Group Selector */}
        <div>
          <label className="block text-sm font-medium text-[#A0A8C8] mb-2">Working Group</label>
          {form.working_group_ids.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {form.working_group_ids.map((userId) => {
                const user = users.find(u => u.id === userId);
                if (!user) return null;
                return (
                  <span
                    key={userId}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00C8FF]/[0.15] text-[#00C8FF] border border-[#00C8FF]/[0.3] text-sm"
                  >
                    <Avatar name={user.name} size="xs" />
                    {user.name}
                    <button
                      type="button"
                      onClick={() => toggleWorkingGroupMember(userId)}
                      className="ml-1 hover:bg-[#00C8FF]/[0.25] rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <div className="relative">
            <Input
              placeholder="Search users to add..."
              value={workingGroupSearch}
              onChange={(e) => setWorkingGroupSearch(e.target.value)}
            />
            {workingGroupSearch && (
              <div className="absolute z-10 w-full mt-1 bg-[#2A3152] border border-white/[0.08] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {users
                  .filter(u =>
                    u.name.toLowerCase().includes(workingGroupSearch.toLowerCase()) &&
                    !form.working_group_ids.includes(u.id)
                  )
                  .map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        toggleWorkingGroupMember(user.id);
                        setWorkingGroupSearch('');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.06] text-sm"
                    >
                      <Avatar name={user.name} size="xs" />
                      <span className="text-white">{user.name}</span>
                      {user.email && <span className="text-[#6B7394]">{user.email}</span>}
                    </button>
                  ))}
                {users.filter(u =>
                  u.name.toLowerCase().includes(workingGroupSearch.toLowerCase()) &&
                  !form.working_group_ids.includes(u.id)
                ).length === 0 && (
                  <div className="px-3 py-2 text-sm text-[#6B7394]">No users found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS.map(p => ({ value: p.value, label: p.label }))}
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          />
          <Select
            label="Status"
            options={PROJECT_STATUS_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
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
          <Input
            label="Progress %"
            type="number"
            min="0"
            max="100"
            value={form.progress_percentage}
            onChange={(e) => setForm({ ...form, progress_percentage: e.target.value })}
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
