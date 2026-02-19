import { XRequest, Department, User, Project, CreateXRequest, Announcement, CreateAnnouncement } from '@/src/types';

export async function fetchDiscussionsData() {
  try {
    const [requestsRes, announcementsRes, deptsRes, usersRes, projectsRes] = await Promise.all([
      fetch('/api/x-requests'),
      fetch('/api/announcements'),
      fetch('/api/departments'),
      fetch('/api/users'),
      fetch('/api/projects'),
    ]);

    if (!requestsRes.ok || !announcementsRes.ok || !deptsRes.ok || !usersRes.ok || !projectsRes.ok) {
      throw new Error('Failed to fetch data');
    }

    const [requestsData, announcementsData, deptsData, usersData, projectsData] = await Promise.all([
      requestsRes.json(),
      announcementsRes.json(),
      deptsRes.json(),
      usersRes.json(),
      projectsRes.json(),
    ]);

    return {
      requests: (requestsData.data || []) as XRequest[],
      announcements: (announcementsData.data || []) as Announcement[],
      departments: (deptsData.data || []) as Department[],
      users: (usersData.data || []) as User[],
      projects: (projectsData.data || []) as Project[],
    };
  } catch (error) {
    console.error('Error fetching discussions data:', error);
    throw new Error('Unable to load data. Please refresh the page.');
  }
}

export async function createAnnouncement(data: CreateAnnouncement): Promise<Announcement> {
  const response = await fetch('/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to create announcement');
  }

  const result = await response.json();
  return result.data;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  const response = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete announcement');
}

export async function createXRequest(data: CreateXRequest): Promise<XRequest> {
  const response = await fetch('/api/x-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to create request');
  }

  const result = await response.json();
  return result.data;
}

export async function updateXRequestStatus(id: number, status: XRequest['status']): Promise<void> {
  const response = await fetch(`/api/x-requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update request');
}

export async function deleteXRequest(id: number): Promise<void> {
  const response = await fetch(`/api/x-requests/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete request');
}
