import { useState } from 'react';
import { Card, Avatar, Badge, ProgressBar, Modal } from '@/src/components/ui';
import { formatDisplayDate } from '@/src/lib/utils';
import { Project, ProjectTask } from '@/src/types';
import { getStatusColor, getStatusLabel, getTaskStatusLabel, getPriorityColor } from '../utils/helpers';

type FlatTask = ProjectTask & {
  assignee_name?: string;
  project_name: string;
  project_color: string;
  department_name?: string;
  department_color?: string;
};

interface PriorityViewProps {
  projects: (Project & {
    objective_code?: string;
    tasks?: (ProjectTask & { assignee_name?: string })[];
  })[];
  onTaskToggle: (taskId: number, currentStatus: string) => void;
}

function getMonthKey(dateStr: string | null | undefined): string {
  if (!dateStr) return 'no-deadline';
  const d = new Date(dateStr);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string): string {
  if (key === 'no-deadline') return 'No Deadline';
  const [year, month] = key.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  const now = new Date();
  const currentYear = now.getFullYear();
  const label = d.toLocaleString('default', { month: 'long' });
  return year !== currentYear ? `${label} ${year}` : label;
}

export function PriorityView({ projects, onTaskToggle }: PriorityViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  const flatTasks: FlatTask[] = projects.flatMap((project) =>
    (project.tasks ?? []).map((task) => {
      const t = task as typeof task & { assignee_name?: string };
      const effectiveName = t.assignee_name ?? project.dri?.name;
      const effectiveUserId = task.assignee_user_id ?? project.dri_user_id;
      return {
        ...task,
        assignee_name: effectiveName,
        assignee_user_id: effectiveUserId,
        project_name: project.name,
        project_color: project.color,
        department_name: project.department?.name,
        department_color: project.department?.color,
      };
    })
  );

  const activeTasks = [...flatTasks]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => {
      if (!a.end_date && !b.end_date) return 0;
      if (!a.end_date) return 1;
      if (!b.end_date) return -1;
      return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
    });

  if (activeTasks.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center text-[#6d6e6f]">No tasks found.</div>
      </Card>
    );
  }

  // Group by month key, preserving sort order
  const groups = activeTasks.reduce<{ key: string; tasks: FlatTask[] }[]>((acc, task) => {
    const key = getMonthKey(task.end_date);
    const existing = acc.find((g) => g.key === key);
    if (existing) {
      existing.tasks.push(task);
    } else {
      acc.push({ key, tasks: [task] });
    }
    return acc;
  }, []);

  // Move "no-deadline" group to the end
  const sorted = [
    ...groups.filter((g) => g.key !== 'no-deadline'),
    ...groups.filter((g) => g.key === 'no-deadline'),
  ];

  return (
    <>
      <div className="space-y-6">
        {sorted.map(({ key, tasks }) => (
          <div key={key}>
            <h3 className="text-sm font-semibold text-[#6d6e6f] uppercase tracking-wide mb-2 px-1">
              {getMonthLabel(key)}
              <span className="ml-2 font-normal normal-case tracking-normal text-[#9ca0a4]">
                ({tasks.length})
              </span>
            </h3>
            <div className="space-y-2">
              {tasks.map((task) => (
                <DeadlineTaskRow
                  key={task.id}
                  task={task}
                  onToggle={onTaskToggle}
                  onProjectClick={setSelectedProjectId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProjectId(null)}
        />
      )}
    </>
  );
}

interface DeadlineTaskRowProps {
  task: FlatTask;
  onToggle: (taskId: number, currentStatus: string) => void;
  onProjectClick: (projectId: number) => void;
}

function DeadlineTaskRow({ task, onToggle, onProjectClick }: DeadlineTaskRowProps) {
  const isCompleted = task.status === 'completed';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(task.id, task.status);
  };

  const handleProjectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProjectClick(task.project_id);
  };

  const borderColor = task.department_color ?? '#e8ecee';

  return (
    <Card
      padding="none"
      className="overflow-hidden"
      style={{ borderLeftColor: borderColor, borderLeftWidth: '3px' }}
    >
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6 px-4 py-3">
        <TaskCheckbox isCompleted={isCompleted} onToggle={handleToggle} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium ${isCompleted ? 'text-[#6d6e6f] line-through' : 'text-[#1e1f21]'}`}>
              {task.title}
            </span>
            <button onClick={handleProjectClick} className="flex-shrink-0 hover:opacity-75 transition-opacity">
              <Badge color={task.project_color}>
                {task.project_name}
              </Badge>
            </button>
            {task.department_name && task.department_color && (
              <Badge color={task.department_color} dot className="flex-shrink-0">
                {task.department_name}
              </Badge>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 w-36 flex-shrink-0">
          {task.assignee_user_id ? (
            <>
              <Avatar name={task.assignee_name || 'User'} size="xs" />
              <span className="text-sm text-[#6d6e6f] truncate">{task.assignee_name}</span>
            </>
          ) : (
            <span className="text-sm text-[#9ca0a4]">Unassigned</span>
          )}
        </div>

        <div className="hidden lg:block w-20 flex-shrink-0">
          <ProgressBar value={task.progress_percentage} showLabel size="sm" />
        </div>

        <div className="hidden xl:block text-sm text-[#6d6e6f] w-44 flex-shrink-0 text-center whitespace-nowrap">
          {formatDisplayDate(task.start_date)} - {formatDisplayDate(task.end_date)}
        </div>

        <Badge color={getStatusColor(task.status)} className="flex-shrink-0">
          {getTaskStatusLabel(task.status)}
        </Badge>
      </div>

      {/* Mobile */}
      <div className="md:hidden p-4">
        <div className="flex items-start gap-3">
          <TaskCheckbox isCompleted={isCompleted} onToggle={handleToggle} className="mt-0.5" />

          <div className="flex-1 min-w-0">
            <span className={`text-sm block mb-1.5 ${isCompleted ? 'text-[#6d6e6f] line-through' : 'text-[#1e1f21]'}`}>
              {task.title}
            </span>

            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <Badge color={getStatusColor(task.status)} className="text-xs">
                {getTaskStatusLabel(task.status)}
              </Badge>
              <button onClick={handleProjectClick} className="flex-shrink-0 hover:opacity-75 transition-opacity">
                <Badge color={task.project_color} className="text-xs">
                  {task.project_name}
                </Badge>
              </button>
              {task.department_name && task.department_color && (
                <Badge color={task.department_color} dot className="text-xs flex-shrink-0">
                  {task.department_name}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              {task.assignee_user_id ? (
                <div className="flex items-center gap-1.5">
                  <Avatar name={task.assignee_name || 'User'} size="xs" />
                  <span className="text-xs text-[#6d6e6f]">{task.assignee_name}</span>
                </div>
              ) : (
                <span className="text-xs text-[#9ca0a4]">Unassigned</span>
              )}
              <div className="w-20">
                <ProgressBar value={task.progress_percentage} showLabel size="sm" />
              </div>
            </div>

            {(task.start_date || task.end_date) && (
              <div className="text-xs text-[#9ca0a4] mt-1.5">
                {formatDisplayDate(task.start_date)} - {formatDisplayDate(task.end_date)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ProjectDetailModalProps {
  project: Project & {
    objective_code?: string;
    tasks?: (ProjectTask & { assignee_name?: string })[];
  };
  onClose: () => void;
}

function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const tasks = project.tasks ?? [];

  return (
    <Modal isOpen onClose={onClose} size="xl" maxHeight={680}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
          <h2 className="text-lg font-semibold text-[#1e1f21] leading-tight">{project.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#6d6e6f] hover:text-[#1e1f21] hover:bg-[#f6f8f9] rounded transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge color={getStatusColor(project.status)}>{getStatusLabel(project.status)}</Badge>
        <Badge color={getPriorityColor(project.priority)}>{project.priority}</Badge>
        {project.department && (
          <Badge color={project.department.color} dot>{project.department.name}</Badge>
        )}
        {project.objective_code && (
          <span className="text-xs text-[#6d6e6f] bg-[#f0f2f4] px-2 py-0.5 rounded">
            {project.objective_code}
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#6d6e6f]">Overall progress</span>
          <span className="text-xs font-medium text-[#1e1f21]">{project.progress_percentage}%</span>
        </div>
        <ProgressBar value={project.progress_percentage} size="sm" />
      </div>

      {/* Dates / DRI / Description row */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5 text-sm">
        {(project.start_date || project.end_date) && (
          <div>
            <p className="text-xs text-[#9ca0a4] mb-0.5">Dates</p>
            <p className="text-[#1e1f21]">
              {formatDisplayDate(project.start_date)} – {formatDisplayDate(project.end_date)}
            </p>
          </div>
        )}
        {project.dri && (
          <div>
            <p className="text-xs text-[#9ca0a4] mb-0.5">DRI</p>
            <div className="flex items-center gap-1.5">
              <Avatar name={project.dri.name} size="xs" />
              <span className="text-[#1e1f21]">{project.dri.name}</span>
            </div>
          </div>
        )}
        {project.description && (
          <div className="col-span-2">
            <p className="text-xs text-[#9ca0a4] mb-0.5">Description</p>
            <p className="text-[#1e1f21] whitespace-pre-line">{project.description}</p>
          </div>
        )}
      </div>

      {/* Tasks */}
      {tasks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#6d6e6f] uppercase tracking-wide mb-2">
            Tasks ({tasks.length})
          </p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#f6f8f9]"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0`}
                  style={{ backgroundColor: getStatusColor(task.status) }}
                />
                <span className={`flex-1 text-sm min-w-0 truncate ${task.status === 'completed' ? 'line-through text-[#9ca0a4]' : 'text-[#1e1f21]'}`}>
                  {task.title}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.assignee?.name && (
                    <div className="hidden sm:flex items-center gap-1">
                      <Avatar name={task.assignee.name} size="xs" />
                      <span className="text-xs text-[#6d6e6f]">{task.assignee.name}</span>
                    </div>
                  )}
                  <Badge color={getStatusColor(task.status)} className="text-xs">
                    {getTaskStatusLabel(task.status)}
                  </Badge>
                  {task.end_date && (
                    <span className="text-xs text-[#9ca0a4] hidden md:block whitespace-nowrap">
                      {formatDisplayDate(task.end_date)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

interface TaskCheckboxProps {
  isCompleted: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
}

function TaskCheckbox({ isCompleted, onToggle, className = '' }: TaskCheckboxProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
        isCompleted
          ? 'bg-[#5da283] border-[#5da283] hover:bg-[#4a8a6b]'
          : 'border-[#c4c7c9] hover:border-[#5da283] hover:bg-[#f0f9f5]'
      } ${className}`}
      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {isCompleted && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}
