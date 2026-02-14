import { Card, Avatar, Badge, ProgressBar } from '@/src/components/ui';
import { formatDisplayDate } from '@/src/lib/utils';
import { Project, ProjectTask } from '@/src/types';
import { getPriorityColor, getStatusColor, getStatusLabel } from '../utils/helpers';
import { TaskRow } from './TaskRow';

interface ProjectCardProps {
  project: Project & {
    objective_code?: string;
    tasks?: (ProjectTask & { assignee_name?: string })[];
  };
  isExpanded: boolean;
  onToggleExpand: (projectId: number) => void;
  onTaskToggle: (taskId: number, currentStatus: string) => void;
}

export function ProjectCard({ project, isExpanded, onToggleExpand, onTaskToggle }: ProjectCardProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      <ProjectRowDesktop
        project={project}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
      <ProjectRowMobile
        project={project}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
      {isExpanded && <TasksList tasks={project.tasks} onTaskToggle={onTaskToggle} />}
    </Card>
  );
}

interface ProjectRowProps {
  project: Project & {
    objective_code?: string;
    tasks?: (ProjectTask & { assignee_name?: string })[];
  };
  isExpanded: boolean;
  onToggleExpand: (projectId: number) => void;
}

function ProjectRowDesktop({ project, isExpanded, onToggleExpand }: ProjectRowProps) {
  return (
    <div
      className="hidden md:flex items-center gap-4 lg:gap-6 px-4 py-3 cursor-pointer hover:bg-[#f6f8f9] transition-colors"
      onClick={() => onToggleExpand(project.id)}
    >
      <ExpandIcon isExpanded={isExpanded} />

      <Badge color={getPriorityColor(project.priority)} className="flex-shrink-0">
        {project.priority}
      </Badge>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-[#1e1f21] truncate">{project.name}</h3>
          {project.objective_code && (
            <Badge variant="outline" className="flex-shrink-0">
              {project.objective_code}
            </Badge>
          )}
          {project.document_link && (
            <DocumentLink href={project.document_link} />
          )}
        </div>
        {project.description && (
          <p className="text-sm text-[#6d6e6f] truncate">{project.description}</p>
        )}
      </div>

      <DRIInfo dri={project.dri} className="hidden lg:flex w-36" />
      <WorkingGroup users={project.working_group} className="hidden xl:flex" />

      <div className="w-20 lg:w-24 flex-shrink-0">
        <ProgressBar value={project.progress_percentage} showLabel size="md" />
      </div>

      <div className="hidden xl:block text-sm text-[#6d6e6f] w-44 flex-shrink-0 text-center whitespace-nowrap">
        {formatDisplayDate(project.start_date)} - {formatDisplayDate(project.end_date)}
      </div>

      <Badge color={getStatusColor(project.status)} className="flex-shrink-0">
        {getStatusLabel(project.status)}
      </Badge>
    </div>
  );
}

function ProjectRowMobile({ project, isExpanded, onToggleExpand }: ProjectRowProps) {
  return (
    <div
      className="md:hidden p-4 cursor-pointer hover:bg-[#f6f8f9] transition-colors"
      onClick={() => onToggleExpand(project.id)}
    >
      <div className="flex items-start gap-3">
        <ExpandIcon isExpanded={isExpanded} className="mt-1" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge color={getPriorityColor(project.priority)} className="flex-shrink-0">
              {project.priority}
            </Badge>
            <Badge color={getStatusColor(project.status)} className="flex-shrink-0">
              {getStatusLabel(project.status)}
            </Badge>
            {project.objective_code && (
              <Badge variant="outline" className="flex-shrink-0">
                {project.objective_code}
              </Badge>
            )}
          </div>

          <h3 className="font-medium text-[#1e1f21] mb-1">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-[#6d6e6f] line-clamp-2 mb-2">{project.description}</p>
          )}

          <div className="flex items-center justify-between gap-4">
            <DRIInfo dri={project.dri} size="xs" />
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
  );
}

interface ExpandIconProps {
  isExpanded: boolean;
  className?: string;
}

function ExpandIcon({ isExpanded, className = '' }: ExpandIconProps) {
  return (
    <svg
      className={`w-4 h-4 text-[#6d6e6f] transition-transform flex-shrink-0 ${
        isExpanded ? 'rotate-90' : ''
      } ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

interface DocumentLinkProps {
  href: string;
}

function DocumentLink({ href }: DocumentLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="px-2 py-0.5 text-xs font-medium text-[#4573d2] bg-[#e8f0fe] hover:bg-[#d2e3fc] rounded-full transition-colors flex-shrink-0"
      title="View Document"
      onClick={(e) => e.stopPropagation()}
    >
      1-pager
    </a>
  );
}

interface DRIInfoProps {
  dri?: { id: number; name: string; email?: string | null } | null;
  className?: string;
  size?: 'xs' | 'sm';
}

function DRIInfo({ dri, className = '', size = 'sm' }: DRIInfoProps) {
  return (
    <div className={`flex items-center gap-2 flex-shrink-0 ${className}`}>
      {dri ? (
        <>
          <Avatar name={dri.name} size={size} />
          <span className={`text-${size === 'xs' ? 'xs' : 'sm'} text-[#6d6e6f] truncate`}>
            {dri.name}
          </span>
        </>
      ) : (
        <span className={`text-${size === 'xs' ? 'xs' : 'sm'} text-[#9ca0a4]`}>Unassigned</span>
      )}
    </div>
  );
}

interface WorkingGroupProps {
  users?: { id: number; name: string }[];
  className?: string;
}

function WorkingGroup({ users, className = '' }: WorkingGroupProps) {
  if (!users || users.length === 0) return null;

  return (
    <div className={`-space-x-2 w-20 flex-shrink-0 ${className}`}>
      {users.slice(0, 3).map((user) => (
        <Avatar key={user.id} name={user.name} size="sm" />
      ))}
      {users.length > 3 && (
        <div className="w-8 h-8 rounded-full bg-[#e8ecee] flex items-center justify-center text-xs text-[#6d6e6f] border-2 border-white">
          +{users.length - 3}
        </div>
      )}
    </div>
  );
}

interface TasksListProps {
  tasks?: (ProjectTask & { assignee_name?: string })[];
  onTaskToggle: (taskId: number, currentStatus: string) => void;
}

function TasksList({ tasks, onTaskToggle }: TasksListProps) {
  return (
    <div className="border-t border-[#e8ecee] bg-[#f6f8f9]">
      {tasks && tasks.length > 0 ? (
        <div className="divide-y divide-[#edeef0]">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={onTaskToggle} />
          ))}
        </div>
      ) : (
        <div className="px-4 py-4 pl-8 md:pl-12 text-sm text-[#9ca0a4]">
          No tasks for this project.
        </div>
      )}
    </div>
  );
}
