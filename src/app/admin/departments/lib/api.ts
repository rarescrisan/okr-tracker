import { Department } from '@/src/types';

export async function fetchDepartments(): Promise<Department[]> {
  try {
    const res = await fetch('/api/departments');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw new Error('Failed to load departments');
  }
}

interface DeptForm {
  name: string;
  description: string;
  color: string;
}

export async function saveDepartment(form: DeptForm, editingId?: number): Promise<void> {
  try {
    const url = editingId ? `/api/departments/${editingId}` : '/api/departments';
    const method = editingId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
  } catch (error) {
    console.error('Error saving department:', error);
    throw error;
  }
}

export async function deleteDepartment(id: number): Promise<void> {
  try {
    await fetch(`/api/departments/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
}

export async function reorderDepartments(deptId: number, targetId: number, deptOrder: number, targetOrder: number): Promise<void> {
  try {
    await Promise.all([
      fetch(`/api/departments/${deptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: targetOrder }),
      }),
      fetch(`/api/departments/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: deptOrder }),
      }),
    ]);
  } catch (error) {
    console.error('Error reordering departments:', error);
    throw error;
  }
}
