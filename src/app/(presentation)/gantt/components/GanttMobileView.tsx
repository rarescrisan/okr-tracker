'use client';

import { Card, Badge } from '@/src/components/ui';
import { Project } from '@/src/types';
import { formatDisplayDate } from '@/src/lib/utils';
import { getPriorityColor, getStatusColor } from '../utils/gantt';

interface GanttMobileViewProps {
  projects: Project[];
  expandedProjects: Set<number>;
  onToggleExpand: (projectId: number) => void;
}

export function GanttMobileView({ projects, expandedProjects, onToggleExpand }: GanttMobileViewProps) {
  return (
    <div className="lg:hidden space-y-4">
      {projects.map((project) => (
        <Card key={project.id} padding="none" className="overflow-hidden">
          <div
            className="p-4 cursor-pointer hover:bg-[#f6f8f9] transition-colors"
            onClick={() => onToggleExpand(project.id)}
          >
            <div className="flex items-start gap-3">
              <svg
                className={`w-4 h-4 text-[#6d6e6f] transition-transform flex-shrink-0 mt-1 ${expandedProjects.has(project.id) ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge color={getPriorityColor(project.priority)} className="flex-shrink-0">{project.priority}</Badge>
                  <Badge color={getStatusColor(project.status)} className="flex-shrink-0">
                    {project.status === 'in_progress' ? 'In Progress' :
                     project.status === 'not_started' ? 'Not Started' :
                     project.status === 'on_hold' ? 'On Hold' : 'Completed'}
                  </Badge>
                </div>
                <h3 className="font-medium text-[#1e1f21] mb-2">{project.name}</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-[#6d6e6f] mb-1">
                    <span>{formatDisplayDate(project.start_date)}</span>
                    <span>{formatDisplayDate(project.end_date)}</span>
                  </div>
                  <div className="h-2 bg-[#e8ecee] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${project.progress_percentage}%`, backgroundColor: getPriorityColor(project.priority) }}
                    />
                  </div>
                  <div className="text-xs text-[#6d6e6f] text-right mt-1">{project.progress_percentage}% complete</div>
                </div>
              </div>
            </div>
          </div>

          {expandedProjects.has(project.id) && project.tasks && project.tasks.length > 0 && (
            <div className="border-t border-[#e8ecee] bg-[#f6f8f9]">
              <div className="divide-y divide-[#edeef0]">
                {project.tasks.map((task) => (
                  <div key={task.id} className="px-4 py-3 pl-8">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: getStatusColor(task.status) }} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm mb-1 ${task.status === 'completed' ? 'text-[#6d6e6f] line-through' : 'text-[#1e1f21]'}`}>
                          {task.title}
                        </p>
                        {(task.start_date || task.end_date) && (
                          <div className="text-xs text-[#9ca0a4]">
                            {formatDisplayDate(task.start_date)} - {formatDisplayDate(task.end_date)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
