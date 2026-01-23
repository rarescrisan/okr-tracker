'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Modal, Input, Select, Badge, Avatar, ProgressBar } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { Project, ProjectTask, User, Objective, Department } from '@/src/types';
import { PRIORITY_OPTIONS, PROJECT_STATUS_OPTIONS, STATUS_OPTIONS } from '@/src/lib/constants';
import { formatDisplayDate, formatInputDate } from '@/src/lib/utils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

  // Project modal
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [workingGroupSearch, setWorkingGroupSearch] = useState('');
  const [projectForm, setProjectForm] = useState({
    name: '',
    department_id: '',
    objective_id: '',
    dri_user_id: '',
    working_group_ids: [] as number[],
    priority: 'P1',
    status: 'not_started',
    start_date: '',
    end_date: '',
    progress_percentage: '0',
    document_link: '',
  });
  const [driSearch, setDriSearch] = useState('');

  // Task modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [taskProjectId, setTaskProjectId] = useState<number | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    assignee_user_id: '',
    status: 'not_started',
    start_date: '',
    end_date: '',
    document_link: '',
  });

  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes, objectivesRes, departmentsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/users'),
        fetch('/api/objectives'),
        fetch('/api/departments'),
      ]);
      const [projectsData, usersData, objectivesData, departmentsData] = await Promise.all([
        projectsRes.json(),
        usersRes.json(),
        objectivesRes.json(),
        departmentsRes.json(),
      ]);
      setProjects(projectsData.data || []);
      setUsers(usersData.data || []);
      setObjectives(objectivesData.data || []);
      setDepartments(departmentsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // Project CRUD
  const openProjectModal = (project?: Project) => {
    setWorkingGroupSearch('');
    setDriSearch('');
    if (project) {
      setEditingProject(project);
      setProjectForm({
        name: project.name,
        department_id: project.department_id?.toString() || '',
        objective_id: project.objective_id?.toString() || '',
        dri_user_id: project.dri_user_id?.toString() || '',
        working_group_ids: project.working_group?.map(u => u.id) || [],
        priority: project.priority,
        status: project.status,
        start_date: formatInputDate(project.start_date),
        end_date: formatInputDate(project.end_date),
        progress_percentage: project.progress_percentage.toString(),
        document_link: project.document_link || '',
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        name: '',
        department_id: '',
        objective_id: '',
        dri_user_id: '',
        working_group_ids: [],
        priority: 'P1',
        status: 'not_started',
        start_date: '',
        end_date: '',
        progress_percentage: '0',
        document_link: '',
      });
    }
    setProjectModalOpen(true);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name) return;

    setSaving(true);
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectForm,
          department_id: projectForm.department_id ? parseInt(projectForm.department_id) : null,
          objective_id: projectForm.objective_id ? parseInt(projectForm.objective_id) : null,
          dri_user_id: projectForm.dri_user_id ? parseInt(projectForm.dri_user_id) : null,
          progress_percentage: parseInt(projectForm.progress_percentage),
          start_date: projectForm.start_date || null,
          end_date: projectForm.end_date || null,
          document_link: projectForm.document_link || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save project');
      }

      await fetchData();
      setProjectModalOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      alert(error instanceof Error ? error.message : 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleProjectDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.name}"? This will also delete all tasks.`)) return;
    try {
      await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
      await fetchData();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  // Task CRUD
  const openTaskModal = (projectId: number, task?: ProjectTask) => {
    setTaskProjectId(projectId);
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        assignee_user_id: task.assignee_user_id?.toString() || '',
        status: task.status,
        start_date: formatInputDate(task.start_date),
        end_date: formatInputDate(task.end_date),
        document_link: task.document_link || '',
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        assignee_user_id: '',
        status: 'not_started',
        start_date: '',
        end_date: '',
        document_link: '',
      });
    }
    setTaskModalOpen(true);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title || !taskProjectId) return;

    setSaving(true);
    try {
      const url = editingTask
        ? `/api/tasks/${editingTask.id}`
        : `/api/projects/${taskProjectId}/tasks`;
      const method = editingTask ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskForm,
          assignee_user_id: taskForm.assignee_user_id ? parseInt(taskForm.assignee_user_id) : null,
          start_date: taskForm.start_date || null,
          end_date: taskForm.end_date || null,
          document_link: taskForm.document_link || null,
        }),
      });

      await fetchData();
      setTaskModalOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTaskDelete = async (task: ProjectTask) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      await fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || '#9ca0a4';
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || '#9ca0a4';
  };

  const toggleWorkingGroupMember = (userId: number) => {
    const newIds = projectForm.working_group_ids.includes(userId)
      ? projectForm.working_group_ids.filter(id => id !== userId)
      : [...projectForm.working_group_ids, userId];
    setProjectForm({ ...projectForm, working_group_ids: newIds });
  };

  const handleReorderProject = async (projectId: number, direction: 'up' | 'down', departmentId: number) => {
    try {
      await fetch('/api/projects/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, direction, departmentId }),
      });
      await fetchData();
    } catch (error) {
      console.error('Error reordering project:', error);
    }
  };

  const handleReorderTask = async (taskId: number, direction: 'up' | 'down', projectId: number) => {
    try {
      await fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, direction, projectId }),
      });
      await fetchData();
    } catch (error) {
      console.error('Error reordering task:', error);
    }
  };

  return (
    <div>
      <PageHeader
        title="Projects & Tasks"
        description="Manage projects and track their progress"
        actions={<Button onClick={() => openProjectModal()}>Add Project</Button>}
      />

      {loading ? (
        <Card><div className="p-8 text-center text-[#6d6e6f]">Loading...</div></Card>
      ) : projects.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-[#6d6e6f]">
            No projects found. Create your first project to get started.
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Group projects by department */}
          {departments.map((dept) => {
            const deptProjects = projects.filter(p => p.department_id === dept.id);
            if (deptProjects.length === 0) return null;
            return (
              <div key={dept.id}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: dept.color }}
                  />
                  <h2 className="text-lg font-semibold text-[#1e1f21]">{dept.name}</h2>
                  <span className="text-sm text-[#6d6e6f]">({deptProjects.length} projects)</span>
                </div>
                <div className="space-y-3">
                  {deptProjects.map((project) => (
                    <Card key={project.id} padding="none">
                      <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#f6f8f9]"
                        onClick={() => toggleExpand(project.id)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <svg
                            className={`w-4 h-4 text-[#6d6e6f] transition-transform ${
                              expandedProjects.has(project.id) ? 'rotate-90' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>

                          <Badge color={getPriorityColor(project.priority)}>{project.priority}</Badge>

                          <div className="flex-1 flex items-center gap-2">
                            <span className="font-medium text-[#1e1f21]">{project.name}</span>
                            {project.objective && (
                              <span className="text-sm text-[#6d6e6f]">
                                ({(project as unknown as { objective_code: string }).objective_code})
                              </span>
                            )}
                            {project.document_link && (
                              <a
                                href={project.document_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 text-xs font-medium text-[#4573d2] bg-[#e8f0fe] hover:bg-[#d2e3fc] rounded-full transition-colors"
                                title="View Document"
                                onClick={(e) => e.stopPropagation()}
                              >
                                1-pager
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-6">
                            {project.dri && (
                              <div className="flex items-center gap-2 min-w-[140px]">
                                <Avatar name={project.dri.name} size="xs" />
                                <span className="text-sm text-[#6d6e6f] truncate">{project.dri.name}</span>
                              </div>
                            )}

                            {project.working_group && project.working_group.length > 0 && (
                              <div className="flex -space-x-2">
                                {project.working_group.slice(0, 3).map((user) => (
                                  <Avatar key={user.id} name={user.name} size="xs" />
                                ))}
                                {project.working_group.length > 3 && (
                                  <div className="w-6 h-6 rounded-full bg-[#e8ecee] flex items-center justify-center text-[10px] text-[#6d6e6f]">
                                    +{project.working_group.length - 3}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="w-24">
                              <ProgressBar value={project.progress_percentage} showLabel size="sm" />
                            </div>

                            <div className="text-sm text-[#6d6e6f] w-44 text-center whitespace-nowrap">
                              {formatDisplayDate(project.start_date)} - {formatDisplayDate(project.end_date)}
                            </div>

                            <Badge color={getStatusColor(project.status)}>
                              {PROJECT_STATUS_OPTIONS.find(s => s.value === project.status)?.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-0.5 mr-2">
                            <button
                              onClick={() => handleReorderProject(project.id, 'up', dept.id)}
                              className="p-0.5 text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#e8ecee] rounded transition-colors"
                              title="Move up"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReorderProject(project.id, 'down', dept.id)}
                              className="p-0.5 text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#e8ecee] rounded transition-colors"
                              title="Move down"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={() => openTaskModal(project.id)}
                            className="px-3 py-1 text-xs font-medium text-[#4573d2] bg-[#e8f0fe] hover:bg-[#d2e3fc] rounded-full transition-colors"
                          >
                            + Task
                          </button>
                          <button
                            onClick={() => openProjectModal(project)}
                            className="px-3 py-1 text-xs font-medium text-[#6d6e6f] bg-[#f1f3f4] hover:bg-[#e8ecee] rounded-full transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleProjectDelete(project)}
                            className="px-3 py-1 text-xs font-medium text-[#d93025] bg-[#fce8e6] hover:bg-[#f8d7da] rounded-full transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {expandedProjects.has(project.id) && project.tasks && project.tasks.length > 0 && (
                        <div className="border-t border-[#e8ecee] bg-[#f6f8f9]">
                          {project.tasks.map((task) => (
                            <div key={task.id} className="flex items-center px-4 py-3 pl-12 border-b border-[#edeef0] last:border-0">
                              <div className="flex items-center gap-2 mr-3">
                                <button
                                  onClick={() => handleReorderTask(task.id, 'up', project.id)}
                                  className="p-0.5 text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#e8ecee] rounded transition-colors"
                                  title="Move up"
                                >
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleReorderTask(task.id, 'down', project.id)}
                                  className="p-0.5 text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#e8ecee] rounded transition-colors"
                                  title="Move down"
                                >
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <span className="text-sm text-[#1e1f21]">{task.title}</span>
                                {task.document_link && (
                                  <a
                                    href={task.document_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-[#4573d2] bg-[#e8f0fe] hover:bg-[#d2e3fc] rounded-full transition-colors"
                                    title="View Document"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    doc
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="w-36">
                                  {task.assignee_user_id && (
                                    <div className="flex items-center gap-2">
                                      <Avatar name={(task as unknown as { assignee_name: string }).assignee_name || 'User'} size="xs" />
                                      <span className="text-sm text-[#6d6e6f] truncate">
                                        {(task as unknown as { assignee_name: string }).assignee_name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="w-44 text-sm text-[#6d6e6f] text-center whitespace-nowrap">
                                  {formatDisplayDate(task.start_date)} - {formatDisplayDate(task.end_date)}
                                </div>
                                <div className="w-24">
                                  <Badge color={getStatusColor(task.status)}>
                                    {STATUS_OPTIONS.find(s => s.value === task.status)?.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => openTaskModal(project.id, task)} title="Edit">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleTaskDelete(task)} title="Delete">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Projects without department */}
          {projects.filter(p => !p.department_id).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-[#9ca0a4]" />
                <h2 className="text-lg font-semibold text-[#1e1f21]">Unassigned</h2>
                <span className="text-sm text-[#6d6e6f]">
                  ({projects.filter(p => !p.department_id).length} projects)
                </span>
              </div>
              <div className="space-y-3">
                {projects.filter(p => !p.department_id).map((project) => (
                  <Card key={project.id} padding="none">
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#f6f8f9]"
                      onClick={() => toggleExpand(project.id)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <svg
                          className={`w-4 h-4 text-[#6d6e6f] transition-transform ${
                            expandedProjects.has(project.id) ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>

                        <Badge color={getPriorityColor(project.priority)}>{project.priority}</Badge>

                        <div className="flex-1 flex items-center gap-2">
                          <span className="font-medium text-[#1e1f21]">{project.name}</span>
                          {project.document_link && (
                            <a
                              href={project.document_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 text-xs font-medium text-[#4573d2] bg-[#e8f0fe] hover:bg-[#d2e3fc] rounded-full transition-colors"
                              title="View Document"
                              onClick={(e) => e.stopPropagation()}
                            >
                              1-pager
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-6">
                          {project.dri && (
                            <div className="flex items-center gap-2 min-w-[140px]">
                              <Avatar name={project.dri.name} size="xs" />
                              <span className="text-sm text-[#6d6e6f] truncate">{project.dri.name}</span>
                            </div>
                          )}
                          <div className="w-24">
                            <ProgressBar value={project.progress_percentage} showLabel size="sm" />
                          </div>
                          <Badge color={getStatusColor(project.status)}>
                            {PROJECT_STATUS_OPTIONS.find(s => s.value === project.status)?.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openProjectModal(project)}
                          className="px-3 py-1 text-xs font-medium text-[#6d6e6f] bg-[#f1f3f4] hover:bg-[#e8ecee] rounded-full transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleProjectDelete(project)}
                          className="px-3 py-1 text-xs font-medium text-[#d93025] bg-[#fce8e6] hover:bg-[#f8d7da] rounded-full transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Modal */}
      <Modal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add Project'}
        size="lg"
        maxHeight={700}
        footer={
          <>
            <Button variant="secondary" onClick={() => setProjectModalOpen(false)}>Cancel</Button>
            <Button onClick={handleProjectSubmit} loading={saving}>
              {editingProject ? 'Save Changes' : 'Add Project'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <Input
            label="Project Name"
            value={projectForm.name}
            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
            placeholder="Enter project name"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Department"
              options={[
                { value: '', label: 'Select department' },
                ...departments.map(d => ({ value: d.id.toString(), label: d.name })),
              ]}
              value={projectForm.department_id}
              onChange={(e) => setProjectForm({ ...projectForm, department_id: e.target.value })}
            />
            <Select
              label="Linked Objective"
              options={[
                { value: '', label: 'None' },
                ...(projectForm.department_id
                  ? objectives.filter(o => o.department_id === parseInt(projectForm.department_id))
                  : objectives
                ).map(o => ({ value: o.id.toString(), label: `${o.code} - ${o.title}` })),
              ]}
              value={projectForm.objective_id}
              onChange={(e) => setProjectForm({ ...projectForm, objective_id: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1e1f21] mb-2">DRI (Directly Responsible Individual)</label>
            {/* Selected DRI */}
            {projectForm.dri_user_id && (
              <div className="flex flex-wrap gap-2 mb-3">
                {(() => {
                  const user = users.find(u => u.id.toString() === projectForm.dri_user_id);
                  if (!user) return null;
                  return (
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4573d2] text-white text-sm">
                      <Avatar name={user.name} size="xs" />
                      {user.name}
                      <button
                        type="button"
                        onClick={() => setProjectForm({ ...projectForm, dri_user_id: '' })}
                        className="ml-1 hover:bg-[#3562c1] rounded-full p-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                })()}
              </div>
            )}
            {/* DRI Search input */}
            <div className="relative">
              <Input
                placeholder="Search users to assign as DRI..."
                value={driSearch}
                onChange={(e) => setDriSearch(e.target.value)}
              />
              {driSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#e8ecee] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {users
                    .filter(u =>
                      u.name.toLowerCase().includes(driSearch.toLowerCase()) &&
                      u.id.toString() !== projectForm.dri_user_id
                    )
                    .map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setProjectForm({ ...projectForm, dri_user_id: user.id.toString() });
                          setDriSearch('');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#f6f8f9] text-sm"
                      >
                        <Avatar name={user.name} size="xs" />
                        <span className="text-[#1e1f21]">{user.name}</span>
                        {user.email && <span className="text-[#9ca0a4]">{user.email}</span>}
                      </button>
                    ))
                  }
                  {users.filter(u =>
                    u.name.toLowerCase().includes(driSearch.toLowerCase()) &&
                    u.id.toString() !== projectForm.dri_user_id
                  ).length === 0 && (
                    <div className="px-3 py-2 text-sm text-[#9ca0a4]">No users found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1e1f21] mb-2">Working Group</label>
            {/* Selected members */}
            {projectForm.working_group_ids.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {projectForm.working_group_ids.map((userId) => {
                  const user = users.find(u => u.id === userId);
                  if (!user) return null;
                  return (
                    <span
                      key={userId}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4573d2] text-white text-sm"
                    >
                      <Avatar name={user.name} size="xs" />
                      {user.name}
                      <button
                        type="button"
                        onClick={() => toggleWorkingGroupMember(userId)}
                        className="ml-1 hover:bg-[#3562c1] rounded-full p-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            {/* Search input */}
            <div className="relative">
              <Input
                placeholder="Search users to add..."
                value={workingGroupSearch}
                onChange={(e) => setWorkingGroupSearch(e.target.value)}
              />
              {workingGroupSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#e8ecee] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {users
                    .filter(u =>
                      u.name.toLowerCase().includes(workingGroupSearch.toLowerCase()) &&
                      !projectForm.working_group_ids.includes(u.id)
                    )
                    .map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          toggleWorkingGroupMember(user.id);
                          setWorkingGroupSearch('');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#f6f8f9] text-sm"
                      >
                        <Avatar name={user.name} size="xs" />
                        <span className="text-[#1e1f21]">{user.name}</span>
                        {user.email && <span className="text-[#9ca0a4]">{user.email}</span>}
                      </button>
                    ))
                  }
                  {users.filter(u =>
                    u.name.toLowerCase().includes(workingGroupSearch.toLowerCase()) &&
                    !projectForm.working_group_ids.includes(u.id)
                  ).length === 0 && (
                    <div className="px-3 py-2 text-sm text-[#9ca0a4]">No users found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS.map(p => ({ value: p.value, label: p.label }))}
              value={projectForm.priority}
              onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
            />
            <Select
              label="Status"
              options={PROJECT_STATUS_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
              value={projectForm.status}
              onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={projectForm.start_date}
              onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={projectForm.end_date}
              onChange={(e) => setProjectForm({ ...projectForm, end_date: e.target.value })}
            />
            <Input
              label="Progress %"
              type="number"
              min="0"
              max="100"
              value={projectForm.progress_percentage}
              onChange={(e) => setProjectForm({ ...projectForm, progress_percentage: e.target.value })}
            />
          </div>
          <Input
            label="Document Link"
            type="url"
            value={projectForm.document_link}
            onChange={(e) => setProjectForm({ ...projectForm, document_link: e.target.value })}
            placeholder="https://docs.google.com/..."
          />
        </form>
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Add Task'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setTaskModalOpen(false)}>Cancel</Button>
            <Button onClick={handleTaskSubmit} loading={saving}>
              {editingTask ? 'Save Changes' : 'Add Task'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="Enter task title"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assignee"
              options={[
                { value: '', label: 'Unassigned' },
                ...users.map(u => ({ value: u.id.toString(), label: u.name })),
              ]}
              value={taskForm.assignee_user_id}
              onChange={(e) => setTaskForm({ ...taskForm, assignee_user_id: e.target.value })}
            />
            <Select
              label="Status"
              options={STATUS_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
              value={taskForm.status}
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={taskForm.start_date}
              onChange={(e) => setTaskForm({ ...taskForm, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={taskForm.end_date}
              onChange={(e) => setTaskForm({ ...taskForm, end_date: e.target.value })}
            />
          </div>
          <Input
            label="Document Link"
            type="url"
            value={taskForm.document_link}
            onChange={(e) => setTaskForm({ ...taskForm, document_link: e.target.value })}
            placeholder="https://docs.google.com/..."
          />
        </form>
      </Modal>
    </div>
  );
}
