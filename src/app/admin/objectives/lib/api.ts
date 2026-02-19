import { Department, Objective } from '@/src/types';

export async function fetchObjectivesPageData(): Promise<{ departments: Department[]; objectives: Objective[] }> {
  try {
    const [deptsRes, objsRes] = await Promise.all([
      fetch('/api/departments'),
      fetch('/api/objectives'),
    ]);
    const [depts, objs] = await Promise.all([deptsRes.json(), objsRes.json()]);
    return {
      departments: depts.data || [],
      objectives: objs.data || [],
    };
  } catch (error) {
    console.error('Error fetching objectives page data:', error);
    throw new Error('Failed to load page data');
  }
}

interface ObjForm {
  department_id: string;
  code: string;
  title: string;
  description: string;
  is_top_objective: boolean;
}

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

export async function saveObjective(form: ObjForm, editingId?: number): Promise<void> {
  try {
    const url = editingId ? `/api/objectives/${editingId}` : '/api/objectives';
    const method = editingId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, department_id: parseInt(form.department_id) }),
    });
  } catch (error) {
    console.error('Error saving objective:', error);
    throw error;
  }
}

export async function deleteObjective(id: number): Promise<void> {
  try {
    await fetch(`/api/objectives/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting objective:', error);
    throw error;
  }
}

export async function saveKeyResult(form: KrForm, objectiveId: number, editingId?: number): Promise<void> {
  try {
    const url = editingId ? `/api/key-results/${editingId}` : '/api/key-results';
    const method = editingId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        objective_id: objectiveId,
        baseline_value: form.baseline_value ? parseFloat(form.baseline_value) : null,
        target_value: parseFloat(form.target_value),
        current_value: parseFloat(form.current_value) || 0,
        target_date: form.target_date || null,
      }),
    });
  } catch (error) {
    console.error('Error saving key result:', error);
    throw error;
  }
}

export async function deleteKeyResult(id: number): Promise<void> {
  try {
    await fetch(`/api/key-results/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting key result:', error);
    throw error;
  }
}
