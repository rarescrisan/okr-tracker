'use client';

import { useEffect, useState } from 'react';
import { Card, Modal, Tabs } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { XRequest, Department, User, Project, CreateXRequest, Announcement, CreateAnnouncement, TodoItem } from '@/src/types';
import { X_REQUEST_STATUS_OPTIONS } from '@/src/lib/constants';
import {
  fetchDiscussionsData,
  createAnnouncement,
  deleteAnnouncement,
  createXRequest,
  updateXRequestStatus,
  deleteXRequest,
  fetchTodoItems,
  createTodoItem,
  toggleTodoItem,
  deleteTodoItem,
} from './lib/api';
import { AnnouncementCard, AnnouncementForm, TodoList } from './components';
import { RequestCard, RequestForm } from '../x-requests/components';

const TABS = [
  { id: 'announcements', label: 'Announcements' },
  { id: 'requests', label: 'Requests' },
];

export default function DiscussionsPage() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'requests'>('announcements');

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [requests, setRequests] = useState<XRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestFilterStatus, setRequestFilterStatus] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        const [data, todos] = await Promise.all([
          fetchDiscussionsData(),
          fetchTodoItems(),
        ]);
        setAnnouncements(data.announcements);
        setRequests(data.requests);
        setDepartments(data.departments);
        setUsers(data.users);
        setProjects(data.projects);
        setTodoItems(todos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAnnouncementSubmit(data: CreateAnnouncement) {
    await createAnnouncement(data);
    const fresh = await fetchDiscussionsData();
    setAnnouncements(fresh.announcements);
    setShowAnnouncementForm(false);
  }

  async function handleAnnouncementDelete(id: number) {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    try {
      await deleteAnnouncement(id);
    } catch {
      const fresh = await fetchDiscussionsData();
      setAnnouncements(fresh.announcements);
    }
  }

  async function handleRequestSubmit(data: CreateXRequest) {
    await createXRequest(data);
    const fresh = await fetchDiscussionsData();
    setRequests(fresh.requests);
    setShowRequestForm(false);
  }

  async function handleRequestStatusChange(id: number, status: XRequest['status']) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    try {
      await updateXRequestStatus(id, status);
    } catch {
      const fresh = await fetchDiscussionsData();
      setRequests(fresh.requests);
    }
  }

  async function handleRequestDelete(id: number) {
    setRequests(prev => prev.filter(r => r.id !== id));
    try {
      await deleteXRequest(id);
    } catch {
      const fresh = await fetchDiscussionsData();
      setRequests(fresh.requests);
    }
  }

  async function handleTodoAdd(text: string) {
    const item = await createTodoItem({ text });
    setTodoItems(prev => [...prev, item]);
  }

  async function handleTodoToggle(id: number) {
    setTodoItems(prev => prev.map(i => i.id === id ? { ...i, is_completed: !i.is_completed } : i));
    try {
      const updated = await toggleTodoItem(id);
      setTodoItems(prev => prev.map(i => i.id === id ? updated : i));
    } catch {
      setTodoItems(prev => prev.map(i => i.id === id ? { ...i, is_completed: !i.is_completed } : i));
    }
  }

  async function handleTodoDelete(id: number) {
    setTodoItems(prev => prev.filter(i => i.id !== id));
    try {
      await deleteTodoItem(id);
    } catch {
      const todos = await fetchTodoItems();
      setTodoItems(todos);
    }
  }

  const filteredRequests = requestFilterStatus
    ? requests.filter(r => r.status === requestFilterStatus)
    : requests;

  if (loading) {
    return (
      <div>
        <PageHeader title="Discussions" description="Announcements and cross-team requests" />
        <Card><div className="p-8 text-center text-[#A0A8C8]">Loading...</div></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Discussions" description="Announcements and cross-team requests" />
        <Card><div className="p-8 text-center text-[#A0A8C8]">{error}</div></Card>
      </div>
    );
  }

  const announcementActions = (
    <button
      onClick={() => setShowAnnouncementForm(true)}
      className="h-9 px-4 text-sm font-medium bg-[#00C8FF] text-[#0F1326] rounded-md hover:bg-[#00A8D4] transition-colors"
    >
      + New Announcement
    </button>
  );

  const requestActions = (
    <div className="flex items-center gap-2">
      <select
        value={requestFilterStatus}
        onChange={e => setRequestFilterStatus(e.target.value)}
        className="h-9 px-3 text-sm rounded-md border border-white/[0.12] bg-[#1A1F36] text-white focus:outline-none focus:ring-2 focus:ring-[#00C8FF]"
      >
        <option value="">All statuses</option>
        {X_REQUEST_STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <button
        onClick={() => setShowRequestForm(true)}
        className="h-9 px-4 text-sm font-medium bg-[#2A3152] text-[#00C8FF] border border-[#00C8FF]/[0.4] rounded-md hover:bg-[#00C8FF]/[0.12] transition-colors"
      >
        + New Request
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Discussions"
        description="Announcements and cross-team requests"
        actions={activeTab === 'announcements' ? announcementActions : requestActions}
      />

      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'announcements' | 'requests')}
        className="mb-6"
      />

      {/* Announcements tab — todo list left, announcements right */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Left — To-do list */}
          <Card padding="none">
            <div className="px-5 pt-4 pb-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-white">To-do list</h2>
              <p className="text-xs text-[#6B7394] mt-0.5">
                {todoItems.filter(i => !i.is_completed).length} remaining
              </p>
            </div>
            <div className="p-4">
              <TodoList
                items={todoItems}
                onAdd={handleTodoAdd}
                onToggle={handleTodoToggle}
                onDelete={handleTodoDelete}
              />
            </div>
          </Card>

          {/* Right — Announcements */}
          <div>
            {announcements.length === 0 ? (
              <Card>
                <div className="p-8 text-center text-[#A0A8C8]">
                  No announcements yet. Post one to get started.
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {announcements.map(a => (
                  <AnnouncementCard key={a.id} announcement={a} onDelete={handleAnnouncementDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Requests tab */}
      {activeTab === 'requests' && (
        filteredRequests.length === 0 ? (
          <Card>
            <div className="p-8 text-center text-[#A0A8C8]">
              {requestFilterStatus ? 'No requests match this filter.' : 'No requests yet. Submit one to get started.'}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map(r => (
              <RequestCard
                key={r.id}
                request={r}
                onStatusChange={handleRequestStatusChange}
                onDelete={handleRequestDelete}
              />
            ))}
          </div>
        )
      )}

      {/* Announcement modal */}
      <Modal
        isOpen={showAnnouncementForm}
        onClose={() => setShowAnnouncementForm(false)}
        title="New Announcement"
        size="md"
        maxHeight={560}
      >
        <AnnouncementForm
          departments={departments}
          onSubmit={handleAnnouncementSubmit}
          onCancel={() => setShowAnnouncementForm(false)}
        />
      </Modal>

      {/* Request modal */}
      <Modal
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        title="New Cross-Team Request"
        size="lg"
        maxHeight={680}
      >
        <RequestForm
          departments={departments}
          users={users}
          projects={projects}
          onSubmit={handleRequestSubmit}
          onCancel={() => setShowRequestForm(false)}
        />
      </Modal>
    </div>
  );
}
