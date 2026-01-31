'use client';

import { useEffect, useState } from 'react';
import { Card, Badge, Avatar, ProgressBar } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { Project, User, Department } from '@/src/types';
import { PRIORITY_OPTIONS, PROJECT_STATUS_OPTIONS, STATUS_OPTIONS } from '@/src/lib/constants';
import { formatDisplayDate } from '@/src/lib/utils';

export default function WorkTracker() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [driFilter, setDriFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, deptsRes, usersRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/departments'),
          fetch('/api/users'),
        ]);
        const [projectsData, deptsData, usersData] = await Promise.all([
          projectsRes.json(),
          deptsRes.json(),
          usersRes.json(),
        ]);

        setProjects(projectsData.data || []);
        setDepartments(deptsData.data || []);
        setUsers(usersData.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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

  const filteredProjects = projects.filter((p) => {
    if (departmentFilter !== 'all' && p.department_id?.toString() !== departmentFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;
    if (driFilter !== 'all' && p.dri_user_id?.toString() !== driFilter) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || '#9ca0a4';
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || '#9ca0a4';
  };

  const getStatusLabel = (status: string) => {
    return PROJECT_STATUS_OPTIONS.find(s => s.value === status)?.label || status;
  };

  const getTaskStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.label || status;
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Work Tracker" description="View all projects and tasks" />
        <Card><div className="p-8 text-center text-[#6d6e6f]">Loading...</div></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Work Tracker"
        description="View all projects and tasks"
      />

      {filteredProjects.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-[#6d6e6f]">
            {projects.length === 0
              ? <>No projects found. <a href="/admin/projects" className="text-[#4573d2]">Create a project</a> to get started.</>
              : 'No projects match the selected filters.'}
          </div>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Group by department */}
          {departments.map((dept) => {
            const deptProjects = filteredProjects.filter(p => p.department_id === dept.id);
            if (deptProjects.length === 0) return null;
            return (
              <div key={dept.id}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dept.color }}
                  />
                  <h2 className="text-base sm:text-lg font-semibold text-[#1e1f21]">{dept.name}</h2>
                  <span className="text-sm text-[#6d6e6f]">({deptProjects.length})</span>
                </div>
                <div className="space-y-3">
                  {deptProjects.map((project) => (
                    <Card key={project.id} padding="none" className="overflow-hidden">
                      {/* Project Row - Desktop */}
                      <div
                        className="hidden md:flex items-center gap-4 lg:gap-6 px-4 py-3 cursor-pointer hover:bg-[#f6f8f9] transition-colors"
                        onClick={() => toggleExpand(project.id)}
                      >
                        {/* Expand Icon */}
                        <svg
                          className={`w-4 h-4 text-[#6d6e6f] transition-transform flex-shrink-0 ${
                            expandedProjects.has(project.id) ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>

                        {/* Priority Badge */}
                        <Badge color={getPriorityColor(project.priority)} className="flex-shrink-0">
                          {project.priority}
                        </Badge>

                        {/* Project Name & OKR */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[#1e1f21] truncate">{project.name}</h3>
                            {(project as unknown as { objective_code?: string }).objective_code && (
                              <Badge variant="outline" className="flex-shrink-0">
                                {(project as unknown as { objective_code: string }).objective_code}
                              </Badge>
                            )}
                            {project.document_link && (
                              <a
                                href={project.document_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 text-xs font-medium text-[#4573d2] bg-[#e8f0fe] hover:bg-[#d2e3fc] rounded-full transition-colors flex-shrink-0"
                                title="View Document"
                                onClick={(e) => e.stopPropagation()}
                              >
                                1-pager
                              </a>
                            )}
                          </div>
                          {project.description && (
                            <p className="text-sm text-[#6d6e6f] truncate">{project.description}</p>
                          )}
                        </div>

                        {/* DRI */}
                        <div className="hidden lg:flex items-center gap-2 w-36 flex-shrink-0">
                          {project.dri ? (
                            <>
                              <Avatar name={project.dri.name} size="sm" />
                              <span className="text-sm text-[#6d6e6f] truncate">{project.dri.name}</span>
                            </>
                          ) : (
                            <span className="text-sm text-[#9ca0a4]">Unassigned</span>
                          )}
                        </div>

                        {/* Working Group */}
                        <div className="hidden xl:flex -space-x-2 w-20 flex-shrink-0">
                          {project.working_group?.slice(0, 3).map((user) => (
                            <Avatar key={user.id} name={user.name} size="sm" />
                          ))}
                          {(project.working_group?.length || 0) > 3 && (
                            <div className="w-8 h-8 rounded-full bg-[#e8ecee] flex items-center justify-center text-xs text-[#6d6e6f] border-2 border-white">
                              +{(project.working_group?.length || 0) - 3}
                            </div>
                          )}
                        </div>

                        {/* Progress */}
                        <div className="w-20 lg:w-24 flex-shrink-0">
                          <ProgressBar value={project.progress_percentage} showLabel size="md" />
                        </div>

                        {/* Dates */}
                        <div className="hidden xl:block text-sm text-[#6d6e6f] w-44 flex-shrink-0 text-center whitespace-nowrap">
                          {formatDisplayDate(project.start_date)} - {formatDisplayDate(project.end_date)}
                        </div>

                        {/* Status */}
                        <Badge color={getStatusColor(project.status)} className="flex-shrink-0">
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>

                      {/* Project Row - Mobile */}
                      <div
                        className="md:hidden p-4 cursor-pointer hover:bg-[#f6f8f9] transition-colors"
                        onClick={() => toggleExpand(project.id)}
                      >
                        <div className="flex items-start gap-3">
                          <svg
                            className={`w-4 h-4 text-[#6d6e6f] transition-transform flex-shrink-0 mt-1 ${
                              expandedProjects.has(project.id) ? 'rotate-90' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge color={getPriorityColor(project.priority)} className="flex-shrink-0">
                                {project.priority}
                              </Badge>
                              <Badge color={getStatusColor(project.status)} className="flex-shrink-0">
                                {getStatusLabel(project.status)}
                              </Badge>
                              {(project as unknown as { objective_code?: string }).objective_code && (
                                <Badge variant="outline" className="flex-shrink-0">
                                  {(project as unknown as { objective_code: string }).objective_code}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-medium text-[#1e1f21] mb-1">{project.name}</h3>
                            {project.description && (
                              <p className="text-sm text-[#6d6e6f] line-clamp-2 mb-2">{project.description}</p>
                            )}
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                {project.dri ? (
                                  <>
                                    <Avatar name={project.dri.name} size="xs" />
                                    <span className="text-xs text-[#6d6e6f]">{project.dri.name}</span>
                                  </>
                                ) : (
                                  <span className="text-xs text-[#9ca0a4]">Unassigned</span>
                                )}
                              </div>
                              <div className="w-20">
                                <ProgressBar value={project.progress_percentage} showLabel size="sm" />
                              </div>
                            </div>
                            {(project.start_date || project.end_date) && (
                              <div className="text-xs text-[#9ca0a4] mt-2">
                                {formatDisplayDate(project.start_date)} - {formatDisplayDate(project.end_date)}
                              </div>
                            )}
                            {project.document_link && (
                              <a
                                href={project.document_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 px-2 py-0.5 text-xs font-medium text-[#4573d2] bg-[#e8f0fe] hover:bg-[#d2e3fc] rounded-full transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View 1-pager
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tasks */}
                      {expandedProjects.has(project.id) && (
                        <div className="border-t border-[#e8ecee] bg-[#f6f8f9]">
                          {project.tasks && project.tasks.length > 0 ? (
                            <div className="divide-y divide-[#edeef0]">
                              {project.tasks.map((task) => (
                                <div key={task.id}>
                                  {/* Task - Desktop */}
                                  <div className="hidden md:flex items-center gap-4 lg:gap-6 px-4 py-2.5 pl-12 hover:bg-[#edeef0] transition-colors">
                                    {/* Task checkbox visual */}
                                    <div
                                      className={`w-4 h-4 rounded border-2 flex-shrink-0 ${
                                        task.status === 'completed'
                                          ? 'bg-[#5da283] border-[#5da283]'
                                          : 'border-[#e8ecee]'
                                      }`}
                                    >
                                      {task.status === 'completed' && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>

                                    {/* Task Title */}
                                    <span className={`flex-1 text-sm ${
                                      task.status === 'completed' ? 'text-[#6d6e6f] line-through' : 'text-[#1e1f21]'
                                    }`}>
                                      {task.title}
                                    </span>

                                    {/* Assignee */}
                                    <div className="hidden lg:block w-36 flex-shrink-0">
                                      {task.assignee_user_id ? (
                                        <div className="flex items-center gap-2">
                                          <Avatar
                                            name={(task as unknown as { assignee_name: string }).assignee_name || 'User'}
                                            size="xs"
                                          />
                                          <span className="text-sm text-[#6d6e6f] truncate">
                                            {(task as unknown as { assignee_name: string }).assignee_name}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-sm text-[#9ca0a4]">Unassigned</span>
                                      )}
                                    </div>

                                    {/* Dates */}
                                    <div className="hidden xl:block text-sm text-[#6d6e6f] w-44 flex-shrink-0 text-center whitespace-nowrap">
                                      {formatDisplayDate(task.start_date)} - {formatDisplayDate(task.end_date)}
                                    </div>

                                    {/* Status */}
                                    <Badge color={getStatusColor(task.status)} className="flex-shrink-0">
                                      {getTaskStatusLabel(task.status)}
                                    </Badge>
                                  </div>

                                  {/* Task - Mobile */}
                                  <div className="md:hidden px-4 py-3 pl-8 hover:bg-[#edeef0] transition-colors">
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 ${
                                          task.status === 'completed'
                                            ? 'bg-[#5da283] border-[#5da283]'
                                            : 'border-[#e8ecee]'
                                        }`}
                                      >
                                        {task.status === 'completed' && (
                                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <span className={`text-sm block ${
                                          task.status === 'completed' ? 'text-[#6d6e6f] line-through' : 'text-[#1e1f21]'
                                        }`}>
                                          {task.title}
                                        </span>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                          <Badge color={getStatusColor(task.status)} className="text-xs">
                                            {getTaskStatusLabel(task.status)}
                                          </Badge>
                                          {task.assignee_user_id && (
                                            <span className="text-xs text-[#6d6e6f]">
                                              {(task as unknown as { assignee_name: string }).assignee_name}
                                            </span>
                                          )}
                                        </div>
                                        {(task.start_date || task.end_date) && (
                                          <div className="text-xs text-[#9ca0a4] mt-1">
                                            {formatDisplayDate(task.start_date)} - {formatDisplayDate(task.end_date)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-4 pl-8 md:pl-12 text-sm text-[#9ca0a4]">
                              No tasks for this project.
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Projects without department */}
          {filteredProjects.filter(p => !p.department_id).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-[#9ca0a4]" />
                <h2 className="text-base sm:text-lg font-semibold text-[#1e1f21]">Unassigned</h2>
                <span className="text-sm text-[#6d6e6f]">
                  ({filteredProjects.filter(p => !p.department_id).length})
                </span>
              </div>
              <div className="space-y-3">
                {filteredProjects.filter(p => !p.department_id).map((project) => (
                  <Card key={project.id} padding="none" className="overflow-hidden">
                    {/* Desktop */}
                    <div
                      className="hidden md:flex items-center gap-4 lg:gap-6 px-4 py-3 cursor-pointer hover:bg-[#f6f8f9] transition-colors"
                      onClick={() => toggleExpand(project.id)}
                    >
                      <svg
                        className={`w-4 h-4 text-[#6d6e6f] transition-transform flex-shrink-0 ${
                          expandedProjects.has(project.id) ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <Badge color={getPriorityColor(project.priority)} className="flex-shrink-0">
                        {project.priority}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[#1e1f21] truncate">{project.name}</h3>
                          {(project as unknown as { objective_code?: string }).objective_code && (
                            <Badge variant="outline" className="flex-shrink-0">
                              {(project as unknown as { objective_code: string }).objective_code}
                            </Badge>
                          )}
                          {project.document_link && (
                            <a
                              href={project.document_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 text-xs font-medium text-[#4573d2] bg-[#e8f0fe] hover:bg-[#d2e3fc] rounded-full transition-colors flex-shrink-0"
                              title="View Document"
                              onClick={(e) => e.stopPropagation()}
                            >
                              1-pager
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 lg:gap-6">
                        {project.dri && (
                          <div className="hidden lg:flex items-center gap-2 w-36">
                            <Avatar name={project.dri.name} size="sm" />
                            <span className="text-sm text-[#6d6e6f] truncate">{project.dri.name}</span>
                          </div>
                        )}
                        <div className="w-20 lg:w-24 flex-shrink-0">
                          <ProgressBar value={project.progress_percentage} showLabel size="md" />
                        </div>
                        <Badge color={getStatusColor(project.status)} className="flex-shrink-0">
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                    </div>

                    {/* Mobile */}
                    <div
                      className="md:hidden p-4 cursor-pointer hover:bg-[#f6f8f9] transition-colors"
                      onClick={() => toggleExpand(project.id)}
                    >
                      <div className="flex items-start gap-3">
                        <svg
                          className={`w-4 h-4 text-[#6d6e6f] transition-transform flex-shrink-0 mt-1 ${
                            expandedProjects.has(project.id) ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge color={getPriorityColor(project.priority)} className="flex-shrink-0">
                              {project.priority}
                            </Badge>
                            <Badge color={getStatusColor(project.status)} className="flex-shrink-0">
                              {getStatusLabel(project.status)}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-[#1e1f21] mb-2">{project.name}</h3>
                          <div className="flex items-center justify-between gap-4">
                            {project.dri && (
                              <div className="flex items-center gap-2">
                                <Avatar name={project.dri.name} size="xs" />
                                <span className="text-xs text-[#6d6e6f]">{project.dri.name}</span>
                              </div>
                            )}
                            <div className="w-20">
                              <ProgressBar value={project.progress_percentage} showLabel size="sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
