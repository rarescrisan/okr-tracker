import { Project } from '@/src/types';

export async function fetchGanttData(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching gantt data:', error);
    throw new Error('Failed to load projects');
  }
}
