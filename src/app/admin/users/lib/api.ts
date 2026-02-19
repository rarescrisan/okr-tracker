import { User } from '@/src/types';

export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch('/api/users');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to load users');
  }
}

interface UserForm {
  name: string;
  email: string;
}

export async function saveUser(form: UserForm, editingId?: number): Promise<void> {
  try {
    const url = editingId ? `/api/users/${editingId}` : '/api/users';
    const method = editingId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

export async function deleteUser(id: number): Promise<void> {
  try {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
