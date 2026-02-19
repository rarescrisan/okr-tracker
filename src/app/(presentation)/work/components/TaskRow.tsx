import { Avatar, Badge, ProgressBar } from '@/src/components/ui';
import { formatDisplayDate } from '@/src/lib/utils';
import { ProjectTask } from '@/src/types';
import { getStatusColor, getTaskStatusLabel } from '../utils/helpers';

interface TaskRowProps {
  task: ProjectTask & { assignee_name?: string };
  onToggle: (taskId: number, currentStatus: string) => void;
}

export function TaskRow({ task, onToggle }: TaskRowProps) {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(task.id, task.status);
  };

  const isCompleted = task.status === 'completed';

  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6 px-4 py-2.5 pl-12 hover:bg-white/[0.04] transition-colors">
        <TaskCheckbox isCompleted={isCompleted} onToggle={handleToggle} />

        <span className={`flex-1 text-sm ${
          isCompleted ? 'text-[#A0A8C8] line-through' : 'text-white'
        }`}>
          {task.title}
        </span>

        <div className="hidden lg:block w-36 flex-shrink-0">
          {task.assignee_user_id ? (
            <div className="flex items-center gap-2">
              <Avatar name={task.assignee_name || 'User'} size="xs" />
              <span className="text-sm text-[#A0A8C8] truncate">{task.assignee_name}</span>
            </div>
          ) : (
            <span className="text-sm text-[#6B7394]">Unassigned</span>
          )}
        </div>

        <div className="hidden lg:block w-20 flex-shrink-0">
          <ProgressBar value={task.progress_percentage} showLabel size="sm" />
        </div>

        <div className="hidden xl:block text-sm text-[#A0A8C8] w-44 flex-shrink-0 text-center whitespace-nowrap">
          {formatDisplayDate(task.start_date)} - {formatDisplayDate(task.end_date)}
        </div>

        <Badge color={getStatusColor(task.status)} className="flex-shrink-0">
          {getTaskStatusLabel(task.status)}
        </Badge>
      </div>

      {/* Mobile View */}
      <div className="md:hidden px-4 py-3 pl-8 hover:bg-white/[0.04] transition-colors">
        <div className="flex items-start gap-3">
          <TaskCheckbox isCompleted={isCompleted} onToggle={handleToggle} />

          <div className="flex-1 min-w-0">
            <span className={`text-sm block ${
              isCompleted ? 'text-[#A0A8C8] line-through' : 'text-white'
            }`}>
              {task.title}
            </span>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge color={getStatusColor(task.status)} className="text-xs">
                {getTaskStatusLabel(task.status)}
              </Badge>
              {task.assignee_user_id && (
                <span className="text-xs text-[#A0A8C8]">{task.assignee_name}</span>
              )}
            </div>

            <div className="w-20 mt-2">
              <ProgressBar value={task.progress_percentage} showLabel size="sm" />
            </div>

            {(task.start_date || task.end_date) && (
              <div className="text-xs text-[#6B7394] mt-1">
                {formatDisplayDate(task.start_date)} - {formatDisplayDate(task.end_date)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskCheckboxProps {
  isCompleted: boolean;
  onToggle: (e: React.MouseEvent) => void;
}

function TaskCheckbox({ isCompleted, onToggle }: TaskCheckboxProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-4 h-4 rounded border-2 flex-shrink-0 ${
        isCompleted ? 'mt-0' : 'md:mt-0 mt-0.5'
      } flex items-center justify-center cursor-pointer transition-colors ${
        isCompleted
          ? 'bg-[#2DD4A8] border-[#2DD4A8] hover:bg-[#25B890]'
          : 'border-white/[0.20] hover:border-[#2DD4A8] hover:bg-[#2DD4A8]/[0.10]'
      }`}
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
