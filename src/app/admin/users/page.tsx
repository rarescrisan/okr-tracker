'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Table, Modal, Input, Avatar } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { User } from '@/src/types';
import { fetchUsers, saveUser, deleteUser } from './lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setUsers(await fetchUsers());
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email || '' });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      await saveUser(formData, editingUser?.id);
      await loadUsers();
      closeModal();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete ${user.name}?`)) return;
    try {
      await deleteUser(user.id);
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="sm" />
          <span className="font-medium">{user.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (user: User) => <span className="text-[#6d6e6f]">{user.email || '-'}</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (user: User) => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => openModal(user)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(user)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage team members who can be assigned to projects"
        actions={<Button onClick={() => openModal()}>Add User</Button>}
      />

      <Card padding="none">
        {loading ? (
          <div className="p-8 text-center text-[#6d6e6f]">Loading...</div>
        ) : (
          <Table
            columns={columns}
            data={users}
            keyExtractor={(user) => user.id}
            emptyMessage="No users found. Add your first team member."
          />
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingUser ? 'Edit User' : 'Add User'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingUser ? 'Save Changes' : 'Add User'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email (optional)"
          />
        </form>
      </Modal>
    </div>
  );
}
