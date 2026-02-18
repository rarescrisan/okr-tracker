import { Card, Avatar, Badge, ProgressBar } from '@/src/components/ui';
import { formatDisplayDate } from '@/src/lib/utils';
import { Project, ProjectTask } from '@/src/types';
import { getStatusColor, getTaskStatusLabel } from '../utils/helpers';

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
  const flatTasks: FlatTask[] = projects.flatMap((project) =>
    (project.tasks ?? []).map((task) => ({
      ...task,
      project_name: project.name,
      project_color: project.color,
      department_name: project.department?.name,
      department_color: project.department?.color,
    }))
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
              <DeadlineTaskRow key={task.id} task={task} onToggle={onTaskToggle} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface DeadlineTaskRowProps {
  task: FlatTask;
  onToggle: (taskId: number, currentStatus: string) => void;
}

function DeadlineTaskRow({ task, onToggle }: DeadlineTaskRowProps) {
  const isCompleted = task.status === 'completed';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(task.id, task.status);
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
            <Badge color={task.project_color} className="flex-shrink-0">
              {task.project_name}
            </Badge>
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
              <Badge color={task.project_color} className="text-xs flex-shrink-0">
                {task.project_name}
              </Badge>
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
