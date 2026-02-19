import { Project, ProjectTask, User, Objective, Department } from '@/src/types';

interface ProjectFormData {
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

interface TaskFormData {
  title: string;
  assignee_user_id: string;
  status: string;
  progress_percentage: string;
  start_date: string;
  end_date: string;
  document_link: string;
}

export async function fetchProjectsPageData(): Promise<{
  projects: Project[];
  users: User[];
  objectives: Objective[];
  departments: Department[];
}> {
  try {
    const [projectsRes, usersRes, objectivesRes, departmentsRes] = await Promise.all([
      fetch('/api/projects'),
      fetch('/api/users'),
      fetch('/api/objectives'),
      fetch('/api/departments'),
    ]);
    const [projectsData, usersData, objectivesData, departmentsData] = await Promise.all([
      projectsRes.json(),
      usersRes.json(),
      objectivesRes.json(),
      departmentsRes.json(),
    ]);
    return {
      projects: projectsData.data || [],
      users: usersData.data || [],
      objectives: objectivesData.data || [],
      departments: departmentsData.data || [],
    };
  } catch (error) {
    console.error('Error fetching projects page data:', error);
    throw new Error('Failed to load page data');
  }
}

export async function saveProject(form: ProjectFormData, editingId?: number): Promise<void> {
  const url = editingId ? `/api/projects/${editingId}` : '/api/projects';
  const method = editingId ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...form,
      department_id: form.department_id ? parseInt(form.department_id) : null,
      objective_id: form.objective_id ? parseInt(form.objective_id) : null,
      dri_user_id: form.dri_user_id ? parseInt(form.dri_user_id) : null,
      progress_percentage: parseInt(form.progress_percentage),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      document_link: form.document_link || null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save project');
  }
}

export async function deleteProject(id: number): Promise<void> {
  try {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

export async function saveTask(form: TaskFormData, projectId: number, editingId?: number): Promise<void> {
  const url = editingId ? `/api/tasks/${editingId}` : `/api/projects/${projectId}/tasks`;
  const method = editingId ? 'PUT' : 'POST';

  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        assignee_user_id: form.assignee_user_id ? parseInt(form.assignee_user_id) : null,
        progress_percentage: parseInt(form.progress_percentage),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        document_link: form.document_link || null,
      }),
    });
  } catch (error) {
    console.error('Error saving task:', error);
    throw error;
  }
}

export async function deleteTask(id: number): Promise<void> {
  try {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

export async function reorderProjects(updates: { id: number; display_order: number }[]): Promise<void> {
  const response = await fetch('/api/projects/reorder-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });
  if (!response.ok) throw new Error('Failed to reorder projects');
}

export async function reorderTasks(updates: { id: number; display_order: number }[]): Promise<void> {
  const response = await fetch('/api/tasks/reorder-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });
  if (!response.ok) throw new Error('Failed to reorder tasks');
}
