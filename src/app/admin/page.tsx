'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';

interface Stats {
  users: number;
  departments: number;
  objectives: number;
  projects: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ users: 0, departments: 0, objectives: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, deptsRes, objsRes, projectsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/departments'),
          fetch('/api/objectives'),
          fetch('/api/projects'),
        ]);

        const [users, depts, objs, projects] = await Promise.all([
          usersRes.json(),
          deptsRes.json(),
          objsRes.json(),
          projectsRes.json(),
        ]);

        setStats({
          users: users.data?.length || 0,
          departments: depts.data?.length || 0,
          objectives: objs.data?.length || 0,
          projects: projects.data?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Team Members', value: stats.users, color: '#4573d2', icon: '👥' },
    { label: 'Departments', value: stats.departments, color: '#5da283', icon: '🏢' },
    { label: 'Objectives', value: stats.objectives, color: '#aa62e3', icon: '🎯' },
    { label: 'Projects', value: stats.projects, color: '#f1bd6c', icon: '📋' },
  ];

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Overview of your OKR tracking system"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#1e1f21]">
                {loading ? '-' : stat.value}
              </p>
              <p className="text-sm text-[#6d6e6f]">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-[#1e1f21] mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a
              href="/admin/users"
              className="block p-3 rounded-lg hover:bg-[#f6f8f9] transition-colors"
            >
              <span className="font-medium text-[#1e1f21]">Manage Users</span>
              <p className="text-sm text-[#6d6e6f]">Add or edit team members</p>
            </a>
            <a
              href="/admin/objectives"
              className="block p-3 rounded-lg hover:bg-[#f6f8f9] transition-colors"
            >
              <span className="font-medium text-[#1e1f21]">Manage OKRs</span>
              <p className="text-sm text-[#6d6e6f]">Create objectives and key results</p>
            </a>
            <a
              href="/admin/projects"
              className="block p-3 rounded-lg hover:bg-[#f6f8f9] transition-colors"
            >
              <span className="font-medium text-[#1e1f21]">Manage Projects</span>
              <p className="text-sm text-[#6d6e6f]">Track project progress and tasks</p>
            </a>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[#1e1f21] mb-4">Getting Started</h3>
          <ol className="space-y-3 text-sm text-[#6d6e6f]">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#4573d2] text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <span>Add team members who will be assigned to projects</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#4573d2] text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <span>Create departments to organize your objectives</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#4573d2] text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <span>Define objectives and their key results (KRs)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#4573d2] text-white rounded-full flex items-center justify-center text-xs font-medium">4</span>
              <span>Create projects and assign them to objectives</span>
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
