'use client';

import { useEffect, useState } from 'react';
import { Button, Card } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { Project, ProjectTask, User, Objective, Department } from '@/src/types';
import { formatInputDate } from '@/src/lib/utils';
import { fetchProjectsPageData, saveProject, deleteProject, saveTask, deleteTask, reorderProjects, reorderTasks } from './lib/api';
import { ProjectModal } from './components/ProjectModal';
import { TaskModal } from './components/TaskModal';
import { ProjectRow } from './components/ProjectRow';

interface ProjectForm {
  name: string;
  department_id: string;
  objective_id: string;
  dri_user_id: string;
  working_group_ids: number[];
  priority: string;
  status: string;
  start_date: string;
  end_date: string;
  progress_percentage: string;
  document_link: string;
}

interface TaskForm {
  title: string;
  assignee_user_id: string;
  status: string;
  progress_percentage: string;
  start_date: string;
  end_date: string;
  document_link: string;
}

const defaultProjectForm: ProjectForm = {
  name: '', department_id: '', objective_id: '', dri_user_id: '',
  working_group_ids: [], priority: 'P1', status: 'not_started',
  start_date: '', end_date: '', progress_percentage: '0', document_link: '',
};

const defaultTaskForm: TaskForm = {
  title: '', assignee_user_id: '', status: 'not_started',
  progress_percentage: '0', start_date: '', end_date: '', document_link: '',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm>(defaultProjectForm);
  const [driSearch, setDriSearch] = useState('');
  const [workingGroupSearch, setWorkingGroupSearch] = useState('');

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [taskProjectId, setTaskProjectId] = useState<number | null>(null);
  const [taskForm, setTaskForm] = useState<TaskForm>(defaultTaskForm);

  const [saving, setSaving] = useState(false);
  const [draggedProjectId, setDraggedProjectId] = useState<number | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<number | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchProjectsPageData();
      setProjects(data.projects);
      setUsers(data.users);
      setObjectives(data.objectives);
      setDepartments(data.departments);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggleExpand = (projectId: number) => {
    const next = new Set(expandedProjects);
    next.has(projectId) ? next.delete(projectId) : next.add(projectId);
    setExpandedProjects(next);
  };

  const openProjectModal = (project?: Project) => {
    setDriSearch('');
    setWorkingGroupSearch('');
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
      setProjectForm(defaultProjectForm);
    }
    setProjectModalOpen(true);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name) return;
    setSaving(true);
    try {
      await saveProject(projectForm, editingProject?.id);
      await loadData();
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
      await deleteProject(project.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const openTaskModal = (projectId: number, task?: ProjectTask) => {
    setTaskProjectId(projectId);
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        assignee_user_id: task.assignee_user_id?.toString() || '',
        status: task.status,
        progress_percentage: task.progress_percentage.toString(),
        start_date: formatInputDate(task.start_date),
        end_date: formatInputDate(task.end_date),
        document_link: task.document_link || '',
      });
    } else {
      setEditingTask(null);
      setTaskForm(defaultTaskForm);
    }
    setTaskModalOpen(true);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title || !taskProjectId) return;
    setSaving(true);
    try {
      await saveTask(taskForm, taskProjectId, editingTask?.id);
      await loadData();
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
      await deleteTask(task.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Drag handlers — projects
  const handleProjectDragStart = (e: React.DragEvent, projectId: number) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.4';
  };
  const handleProjectDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
    setDraggedProjectId(null);
    setDragOverProjectId(null);
  };
  const handleProjectDragOver = (e: React.DragEvent, projectId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverProjectId(projectId);
  };
  const handleProjectDragLeave = () => setDragOverProjectId(null);

  const handleProjectDrop = async (e: React.DragEvent, targetProjectId: number, departmentId: number | null) => {
    e.preventDefault();
    if (!draggedProjectId || draggedProjectId === targetProjectId) return;

    const originalProjects = [...projects];
    const deptProjects = projects.filter(p => p.department_id === departmentId).sort((a, b) => a.display_order - b.display_order);
    const draggedIndex = deptProjects.findIndex(p => p.id === draggedProjectId);
    const targetIndex = deptProjects.findIndex(p => p.id === targetProjectId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const reordered = [...deptProjects];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    const updatesMap = new Map<number, number>();
    reordered.forEach((project, index) => updatesMap.set(project.id, index));

    setProjects(projects.map(p => updatesMap.has(p.id) ? { ...p, display_order: updatesMap.get(p.id)! } : p));

    try {
      await reorderProjects(Array.from(updatesMap.entries()).map(([id, display_order]) => ({ id, display_order })));
    } catch (error) {
      console.error('Error reordering project:', error);
      setProjects(originalProjects);
    }
  };

  // Drag handlers — tasks
  const handleTaskDragStart = (e: React.DragEvent, taskId: number) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.4';
  };
  const handleTaskDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };
  const handleTaskDragOver = (e: React.DragEvent, taskId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTaskId(taskId);
  };
  const handleTaskDragLeave = () => setDragOverTaskId(null);

  const handleTaskDrop = async (e: React.DragEvent, targetTaskId: number, projectId: number) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    const originalProjects = [...projects];
    const project = projects.find(p => p.id === projectId);
    if (!project?.tasks) return;

    const projectTasks = [...project.tasks].sort((a, b) => a.display_order - b.display_order);
    const draggedIndex = projectTasks.findIndex(t => t.id === draggedTaskId);
    const targetIndex = projectTasks.findIndex(t => t.id === targetTaskId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const reordered = [...projectTasks];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    const updatesMap = new Map<number, number>();
    reordered.forEach((task, index) => updatesMap.set(task.id, index));

    setProjects(projects.map(p =>
      p.id === projectId && p.tasks
        ? { ...p, tasks: p.tasks.map(t => updatesMap.has(t.id) ? { ...t, display_order: updatesMap.get(t.id)! } : t) }
        : p
    ));

    try {
      await reorderTasks(Array.from(updatesMap.entries()).map(([id, display_order]) => ({ id, display_order })));
    } catch (error) {
      console.error('Error reordering task:', error);
      setProjects(originalProjects);
    }
  };

  const dragHandlers = {
    draggedProjectId, dragOverProjectId, draggedTaskId, dragOverTaskId,
    onProjectDragStart: handleProjectDragStart,
    onProjectDragEnd: handleProjectDragEnd,
    onProjectDragOver: handleProjectDragOver,
    onProjectDragLeave: handleProjectDragLeave,
    onProjectDrop: handleProjectDrop,
    onTaskDragStart: handleTaskDragStart,
    onTaskDragEnd: handleTaskDragEnd,
    onTaskDragOver: handleTaskDragOver,
    onTaskDragLeave: handleTaskDragLeave,
    onTaskDrop: handleTaskDrop,
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
          {departments.map((dept) => {
            const deptProjects = projects
              .filter(p => p.department_id === dept.id)
              .sort((a, b) => a.display_order - b.display_order);
            if (deptProjects.length === 0) return null;
            return (
              <div key={dept.id}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                  <h2 className="text-lg font-semibold text-[#1e1f21]">{dept.name}</h2>
                  <span className="text-sm text-[#6d6e6f]">({deptProjects.length} projects)</span>
                </div>
                <div className="space-y-3">
                  {deptProjects.map((project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      isExpanded={expandedProjects.has(project.id)}
                      onToggleExpand={toggleExpand}
                      onEdit={openProjectModal}
                      onDelete={handleProjectDelete}
                      onAddTask={openTaskModal}
                      onEditTask={openTaskModal}
                      onDeleteTask={handleTaskDelete}
                      departmentId={dept.id}
                      {...dragHandlers}
                    />
                  ))}
                </div>
              </div>
            );
          })}

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
                {projects
                  .filter(p => !p.department_id)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      isExpanded={expandedProjects.has(project.id)}
                      onToggleExpand={toggleExpand}
                      onEdit={openProjectModal}
                      onDelete={handleProjectDelete}
                      onAddTask={openTaskModal}
                      onEditTask={openTaskModal}
                      onDeleteTask={handleTaskDelete}
                      departmentId={null}
                      {...dragHandlers}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        editingProject={editingProject}
        form={projectForm}
        setForm={setProjectForm}
        users={users}
        departments={departments}
        objectives={objectives}
        onSubmit={handleProjectSubmit}
        saving={saving}
        driSearch={driSearch}
        setDriSearch={setDriSearch}
        workingGroupSearch={workingGroupSearch}
        setWorkingGroupSearch={setWorkingGroupSearch}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        editingTask={editingTask}
        form={taskForm}
        setForm={setTaskForm}
        users={users}
        onSubmit={handleTaskSubmit}
        saving={saving}
      />
    </div>
  );
}
