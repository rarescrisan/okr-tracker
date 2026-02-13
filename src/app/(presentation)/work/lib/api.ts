import { Project, Department, User } from '@/src/types';

export async function fetchWorkData() {
  try {
    const [projectsRes, deptsRes, usersRes] = await Promise.all([
      fetch('/api/projects'),
      fetch('/api/departments'),
      fetch('/api/users'),
    ]);

    if (!projectsRes.ok || !deptsRes.ok || !usersRes.ok) {
      throw new Error('Failed to fetch work data');
    }

    const [projectsData, deptsData, usersData] = await Promise.all([
      projectsRes.json(),
      deptsRes.json(),
      usersRes.json(),
    ]);

    return {
      projects: projectsData.data || [],
      departments: deptsData.data || [],
      users: usersData.data || [],
    };
  } catch (error) {
    console.error('Error fetching work data:', error);
    throw new Error('Unable to load work data. Please refresh the page.');
  }
}

export async function updateTaskStatus(
  taskId: number,
  status: string,
  progressPercentage: number
) {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, progress_percentage: progressPercentage }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error('Unable to update task. Please try again.');
  }
}
