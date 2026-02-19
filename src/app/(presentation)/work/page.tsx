'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { Project, Department } from '@/src/types';
import { fetchWorkData, updateTaskStatus } from './lib/api';
import { toggleTaskStatus } from './utils/helpers';
import { EmptyState } from './components/EmptyState';
import { DepartmentSection } from './components/DepartmentSection';
import { PriorityView } from './components/PriorityView';

export default function WorkTracker() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'department' | 'priority'>('department');

  // Filters (currently not rendered in UI, but kept for future use)
  const [departmentFilter] = useState('all');
  const [statusFilter] = useState('all');
  const [priorityFilter] = useState('all');
  const [driFilter] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchWorkData();
        setProjects(data.projects);
        setDepartments(data.departments);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const toggleExpand = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleTaskToggle = async (taskId: number, currentStatus: string) => {
    const { status: newStatus, progress: newProgress } = toggleTaskStatus(currentStatus);

    // Optimistic update
    const updatedProjects = projects.map(project => {
      if (project.tasks) {
        return {
          ...project,
          tasks: project.tasks.map(task =>
            task.id === taskId
              ? { ...task, status: newStatus as 'not_started' | 'in_progress' | 'blocked' | 'completed', progress_percentage: newProgress }
              : task
          )
        };
      }
      return project;
    }) as Project[];
    setProjects(updatedProjects);

    // Update in background
    try {
      await updateTaskStatus(taskId, newStatus, newProgress);
    } catch (error) {
      // Revert on error
      setProjects(projects);
      console.error('Failed to update task:', error);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (departmentFilter !== 'all' && p.department_id?.toString() !== departmentFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;
    if (driFilter !== 'all' && p.dri_user_id?.toString() !== driFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div>
        <PageHeader title="Work Tracker" description="View all projects and tasks" />
        <Card>
          <div className="p-8 text-center text-[#A0A8C8]">Loading...</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Work Tracker" description="View all projects and tasks" />
        <Card>
          <div className="p-8 text-center text-[#A0A8C8]">{error}</div>
        </Card>
      </div>
    );
  }

  const viewToggle = (
    <div className="flex items-center gap-1 bg-white/[0.08] rounded-lg p-1">
      <button
        onClick={() => setViewMode('department')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          viewMode === 'department'
            ? 'bg-[#2A3152] text-white shadow-sm'
            : 'text-[#A0A8C8] hover:text-white'
        }`}
      >
        Department
      </button>
      <button
        onClick={() => setViewMode('priority')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          viewMode === 'priority'
            ? 'bg-[#2A3152] text-white shadow-sm'
            : 'text-[#A0A8C8] hover:text-white'
        }`}
      >
        Deadline
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader title="Work Tracker" description="View all projects and tasks" actions={viewToggle} />

      {filteredProjects.length === 0 ? (
        <EmptyState hasProjects={projects.length > 0} />
      ) : viewMode === 'priority' ? (
        <PriorityView
          projects={filteredProjects}
          onTaskToggle={handleTaskToggle}
        />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Projects grouped by department */}
          {departments.map((dept) => {
            const deptProjects = filteredProjects.filter(p => p.department_id === dept.id);
            return (
              <DepartmentSection
                key={dept.id}
                department={dept}
                projects={deptProjects}
                expandedProjects={expandedProjects}
                onToggleExpand={toggleExpand}
                onTaskToggle={handleTaskToggle}
              />
            );
          })}

          {/* Projects without department */}
          <DepartmentSection
            department={null}
            projects={filteredProjects.filter(p => !p.department_id)}
            expandedProjects={expandedProjects}
            onToggleExpand={toggleExpand}
            onTaskToggle={handleTaskToggle}
          />
        </div>
      )}
    </div>
  );
}
