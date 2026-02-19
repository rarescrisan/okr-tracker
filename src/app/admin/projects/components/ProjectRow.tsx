'use client';

import { Card, Badge, Avatar, ProgressBar, Button } from '@/src/components/ui';
import { Project, ProjectTask } from '@/src/types';
import { PRIORITY_OPTIONS, PROJECT_STATUS_OPTIONS, STATUS_OPTIONS } from '@/src/lib/constants';
import { formatDisplayDate } from '@/src/lib/utils';

interface ProjectRowProps {
  project: Project;
  isExpanded: boolean;
  onToggleExpand: (id: number) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onAddTask: (projectId: number) => void;
  onEditTask: (projectId: number, task: ProjectTask) => void;
  onDeleteTask: (task: ProjectTask) => void;
  draggedProjectId: number | null;
  dragOverProjectId: number | null;
  draggedTaskId: number | null;
  dragOverTaskId: number | null;
  departmentId: number | null;
  onProjectDragStart: (e: React.DragEvent, projectId: number) => void;
  onProjectDragEnd: (e: React.DragEvent) => void;
  onProjectDragOver: (e: React.DragEvent, projectId: number) => void;
  onProjectDragLeave: () => void;
  onProjectDrop: (e: React.DragEvent, targetProjectId: number, departmentId: number | null) => void;
  onTaskDragStart: (e: React.DragEvent, taskId: number) => void;
  onTaskDragEnd: (e: React.DragEvent) => void;
  onTaskDragOver: (e: React.DragEvent, taskId: number) => void;
  onTaskDragLeave: () => void;
  onTaskDrop: (e: React.DragEvent, targetTaskId: number, projectId: number) => void;
}

function getPriorityColor(priority: string) {
  return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || '#6B7394';
}

function getStatusColor(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status)?.color || '#6B7394';
}

export function ProjectRow({
  project,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddTask,
  onEditTask,
  onDeleteTask,
  draggedProjectId,
  dragOverProjectId,
  draggedTaskId,
  dragOverTaskId,
  departmentId,
  onProjectDragStart,
  onProjectDragEnd,
  onProjectDragOver,
  onProjectDragLeave,
  onProjectDrop,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskDragOver,
  onTaskDragLeave,
  onTaskDrop,
}: ProjectRowProps) {
  return (
    <Card padding="none">
      <div
        draggable
        onDragStart={(e) => onProjectDragStart(e, project.id)}
        onDragEnd={onProjectDragEnd}
        onDragOver={(e) => onProjectDragOver(e, project.id)}
        onDragLeave={onProjectDragLeave}
        onDrop={(e) => onProjectDrop(e, project.id, departmentId)}
        className={`flex items-center justify-between px-4 py-3 cursor-move hover:bg-white/[0.04] transition-all ${
          dragOverProjectId === project.id && draggedProjectId !== project.id
            ? 'border-t-2 border-[#00C8FF]'
            : ''
        }`}
      >
        <div className="flex items-center gap-4 flex-1" onClick={() => onToggleExpand(project.id)}>
          <svg className="w-4 h-4 text-[#6B7394] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
          <svg
            className={`w-4 h-4 text-[#A0A8C8] transition-transform cursor-pointer ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <Badge color={getPriorityColor(project.priority)}>{project.priority}</Badge>

          <div className="flex-1 flex items-center gap-2">
            <span className="font-medium text-white">{project.name}</span>
            {project.objective && (
              <span className="text-sm text-[#A0A8C8]">
                ({(project as unknown as { objective_code: string }).objective_code})
              </span>
            )}
            {project.document_link && (
              <a
                href={project.document_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 text-xs font-medium text-[#00C8FF] bg-[#00C8FF]/[0.12] hover:bg-[#00C8FF]/[0.20] rounded-full transition-colors"
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
                <span className="text-sm text-[#A0A8C8] truncate">{project.dri.name}</span>
              </div>
            )}
            {project.working_group && project.working_group.length > 0 && (
              <div className="flex -space-x-2">
                {project.working_group.slice(0, 3).map((user) => (
                  <Avatar key={user.id} name={user.name} size="xs" />
                ))}
                {project.working_group.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-white/[0.10] flex items-center justify-center text-[10px] text-[#A0A8C8]">
                    +{project.working_group.length - 3}
                  </div>
                )}
              </div>
            )}
            <div className="w-24">
              <ProgressBar value={project.progress_percentage} showLabel size="sm" />
            </div>
            <div className="text-sm text-[#A0A8C8] w-44 text-center whitespace-nowrap">
              {formatDisplayDate(project.start_date)} - {formatDisplayDate(project.end_date)}
            </div>
            <Badge color={getStatusColor(project.status)}>
              {PROJECT_STATUS_OPTIONS.find(s => s.value === project.status)?.label}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onAddTask(project.id)}
            className="px-3 py-1 text-xs font-medium text-[#00C8FF] bg-[#00C8FF]/[0.12] hover:bg-[#00C8FF]/[0.20] rounded-full transition-colors"
          >
            + Task
          </button>
          <button
            onClick={() => onEdit(project)}
            className="px-3 py-1 text-xs font-medium text-[#A0A8C8] bg-white/[0.08] hover:bg-white/[0.12] rounded-full transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(project)}
            className="px-3 py-1 text-xs font-medium text-[#FF4D6A] bg-[#FF4D6A]/[0.12] hover:bg-[#FF4D6A]/[0.20] rounded-full transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {isExpanded && project.tasks && project.tasks.length > 0 && (
        <div className="border-t border-white/[0.08] bg-white/[0.02]">
          {project.tasks
            .slice()
            .sort((a, b) => a.display_order - b.display_order)
            .map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => onTaskDragStart(e, task.id)}
                onDragEnd={onTaskDragEnd}
                onDragOver={(e) => onTaskDragOver(e, task.id)}
                onDragLeave={onTaskDragLeave}
                onDrop={(e) => onTaskDrop(e, task.id, project.id)}
                className={`flex items-center px-4 py-3 pl-12 border-b border-white/[0.05] last:border-0 cursor-move hover:bg-white/[0.04] transition-all ${
                  dragOverTaskId === task.id && draggedTaskId !== task.id
                    ? 'border-t-2 border-[#00C8FF]'
                    : ''
                }`}
              >
                <svg className="w-3.5 h-3.5 text-[#6B7394] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-sm text-white">{task.title}</span>
                  {task.document_link && (
                    <a
                      href={task.document_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-[#00C8FF] bg-[#00C8FF]/[0.12] hover:bg-[#00C8FF]/[0.20] rounded-full transition-colors"
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
                        <span className="text-sm text-[#A0A8C8] truncate">
                          {(task as unknown as { assignee_name: string }).assignee_name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="w-20">
                    <ProgressBar value={task.progress_percentage} showLabel size="sm" />
                  </div>
                  <div className="w-44 text-sm text-[#A0A8C8] text-center whitespace-nowrap">
                    {formatDisplayDate(task.start_date)} - {formatDisplayDate(task.end_date)}
                  </div>
                  <div className="w-24">
                    <Badge color={getStatusColor(task.status)}>
                      {STATUS_OPTIONS.find(s => s.value === task.status)?.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEditTask(project.id, task)} title="Edit">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteTask(task)} title="Delete">
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
  );
}
