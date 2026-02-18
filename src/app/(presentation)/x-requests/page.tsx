'use client';

import { useEffect, useState } from 'react';
import { Card, Modal } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { XRequest, Department, User, Project, CreateXRequest } from '@/src/types';
import { X_REQUEST_STATUS_OPTIONS } from '@/src/lib/constants';
import { fetchXRequestsData, createXRequest, updateXRequestStatus, deleteXRequest } from './lib/api';
import { RequestCard, RequestForm } from './components';

export default function XRequestsPage() {
  const [requests, setRequests] = useState<XRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchXRequestsData();
        setRequests(data.requests);
        setDepartments(data.departments);
        setUsers(data.users);
        setProjects(data.projects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(data: CreateXRequest) {
    const created = await createXRequest(data);
    // Reload to get full joined data
    const fresh = await fetchXRequestsData();
    setRequests(fresh.requests);
    setShowForm(false);
  }

  async function handleStatusChange(id: number, status: XRequest['status']) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    try {
      await updateXRequestStatus(id, status);
    } catch {
      const fresh = await fetchXRequestsData();
      setRequests(fresh.requests);
    }
  }

  async function handleDelete(id: number) {
    setRequests(prev => prev.filter(r => r.id !== id));
    try {
      await deleteXRequest(id);
    } catch {
      const fresh = await fetchXRequestsData();
      setRequests(fresh.requests);
    }
  }

  const filtered = filterStatus
    ? requests.filter(r => r.status === filterStatus)
    : requests;

  if (loading) {
    return (
      <div>
        <PageHeader title="X-Requests" description="Cross-team requests" />
        <Card><div className="p-8 text-center text-[#6d6e6f]">Loading...</div></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="X-Requests" description="Cross-team requests" />
        <Card><div className="p-8 text-center text-[#6d6e6f]">{error}</div></Card>
      </div>
    );
  }

  const actions = (
    <div className="flex items-center gap-2">
      <select
        value={filterStatus}
        onChange={e => setFilterStatus(e.target.value)}
        className="h-9 px-3 text-sm rounded-md border border-[#e8ecee] bg-white text-[#1e1f21] focus:outline-none focus:ring-2 focus:ring-[#4573d2]"
      >
        <option value="">All statuses</option>
        {X_REQUEST_STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <button
        onClick={() => setShowForm(true)}
        className="h-9 px-4 text-sm font-medium bg-[#4573d2] text-white rounded-md hover:bg-[#3a62b3] transition-colors"
      >
        + New Request
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="X-Requests"
        description="Submit and track cross-team requests"
        actions={actions}
      />

      {filtered.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-[#6d6e6f]">
            {filterStatus ? 'No requests match this filter.' : 'No requests yet. Submit one to get started.'}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="New Cross-Team Request"
        size="lg"
        maxHeight={680}
      >
        <RequestForm
          departments={departments}
          users={users}
          projects={projects}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
