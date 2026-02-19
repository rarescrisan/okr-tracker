'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Table, Modal, Input, Textarea, Badge } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { Department } from '@/src/types';
import { COLORS } from '@/src/lib/constants';
import { fetchDepartments, saveDepartment, deleteDepartment, reorderDepartments } from './lib/api';

const colorOptions: string[] = [...COLORS.departments];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: colorOptions[0] });
  const [saving, setSaving] = useState(false);

  const loadDepartments = async () => {
    try {
      setDepartments(await fetchDepartments());
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDepartments(); }, []);

  const openModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name, description: dept.description || '', color: dept.color || colorOptions[0] });
    } else {
      setEditingDept(null);
      setFormData({ name: '', description: '', color: colorOptions[0] });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDept(null);
    setFormData({ name: '', description: '', color: colorOptions[0] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      await saveDepartment(formData, editingDept?.id);
      await loadDepartments();
      closeModal();
    } catch (error) {
      console.error('Error saving department:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!confirm(`Delete ${dept.name}? This will also delete all associated objectives and key results.`)) return;
    try {
      await deleteDepartment(dept.id);
      await loadDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  const handleMove = async (dept: Department, direction: 'up' | 'down') => {
    const currentIndex = departments.findIndex(d => d.id === dept.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= departments.length) return;
    const targetDept = departments[targetIndex];
    try {
      await reorderDepartments(dept.id, targetDept.id, dept.display_order, targetDept.display_order);
      await loadDepartments();
    } catch (error) {
      console.error('Error reordering departments:', error);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (dept: Department) => (
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
          <span className="font-medium">{dept.name}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (dept: Department) => <span className="text-[#6d6e6f]">{dept.description || '-'}</span>,
    },
    {
      key: 'order',
      header: 'Order',
      width: '120px',
      render: (dept: Department) => {
        const index = departments.findIndex(d => d.id === dept.id);
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleMove(dept, 'up')}
              disabled={index === 0}
              className="p-1 rounded hover:bg-[#e8ecee] disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move up"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 4l4 4H4l4-4z" />
              </svg>
            </button>
            <button
              onClick={() => handleMove(dept, 'down')}
              disabled={index === departments.length - 1}
              className="p-1 rounded hover:bg-[#e8ecee] disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move down"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 12l4-4H4l4 4z" />
              </svg>
            </button>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (dept: Department) => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => openModal(dept)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(dept)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Organize objectives by department"
        actions={<Button onClick={() => openModal()}>Add Department</Button>}
      />

      <Card padding="none">
        {loading ? (
          <div className="p-8 text-center text-[#6d6e6f]">Loading...</div>
        ) : (
          <Table
            columns={columns}
            data={departments}
            keyExtractor={(dept) => dept.id}
            emptyMessage="No departments found. Add your first department."
          />
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingDept ? 'Edit Department' : 'Add Department'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingDept ? 'Save Changes' : 'Add Department'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Engineering"
            required
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the department"
          />
          <div>
            <label className="block text-sm font-medium text-[#1e1f21] mb-2">Color</label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-[#4573d2]' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
