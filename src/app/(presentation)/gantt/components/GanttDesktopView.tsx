'use client';

import { Card, Badge } from '@/src/components/ui';
import { Project } from '@/src/types';
import { DateRange, getBarPosition, getPriorityColor, getStatusColor } from '../utils/gantt';

interface GanttDesktopViewProps {
  projects: Project[];
  expandedProjects: Set<number>;
  onToggleExpand: (projectId: number) => void;
  dateRange: DateRange;
  todayPosition: string | null;
}

export function GanttDesktopView({ projects, expandedProjects, onToggleExpand, dateRange, todayPosition }: GanttDesktopViewProps) {
  const { startDate, endDate, months } = dateRange;

  return (
    <div className="hidden lg:block">
      <Card padding="none" className="overflow-hidden">
        <div className="flex">
          {/* Left sidebar */}
          <div className="w-64 xl:w-72 flex-shrink-0 border-r border-[#e8ecee]">
            <div className="h-12 px-4 flex items-center border-b border-[#e8ecee] bg-[#f6f8f9]">
              <span className="text-xs font-semibold text-[#6d6e6f] uppercase">Project / Task</span>
            </div>
            {projects.map((project) => (
              <div key={project.id}>
                <div
                  className="h-10 px-4 flex items-center gap-2 border-b border-[#edeef0] cursor-pointer hover:bg-[#f6f8f9]"
                  onClick={() => onToggleExpand(project.id)}
                >
                  <svg
                    className={`w-4 h-4 text-[#6d6e6f] transition-transform flex-shrink-0 ${expandedProjects.has(project.id) ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <Badge color={getPriorityColor(project.priority)} className="flex-shrink-0">
                    {project.priority}
                  </Badge>
                  <span className="text-sm font-medium text-[#1e1f21] truncate">{project.name}</span>
                </div>
                {expandedProjects.has(project.id) && project.tasks?.map((task) => (
                  <div key={task.id} className="h-8 px-4 pl-10 flex items-center gap-2 border-b border-[#edeef0] bg-[#f6f8f9]">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getStatusColor(task.status) }} />
                    <span className="text-xs text-[#6d6e6f] truncate">{task.title}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-x-auto">
            <div className="h-12 flex border-b border-[#e8ecee] bg-[#f6f8f9] relative">
              {months.map((month, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 px-2 flex items-center justify-center border-r border-[#edeef0] text-xs font-medium text-[#6d6e6f]"
                  style={{ width: `${100 / months.length}%`, minWidth: '60px' }}
                >
                  {month.label}
                </div>
              ))}
            </div>

            <div className="relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {months.map((_, i) => (
                  <div
                    key={i}
                    className="border-r border-[#edeef0]"
                    style={{ width: `${100 / months.length}%`, minWidth: '60px' }}
                  />
                ))}
              </div>

              {/* Today marker */}
              {todayPosition && (
                <div className="absolute top-0 bottom-0 w-0.5 bg-[#f06a6a] z-10" style={{ left: todayPosition }}>
                  <div className="absolute -top-1 -left-2 px-1 py-0.5 bg-[#f06a6a] text-white text-[10px] rounded">Today</div>
                </div>
              )}

              {/* Project bars */}
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="h-10 relative border-b border-[#edeef0]">
                    {(() => {
                      const pos = getBarPosition(project.start_date, project.end_date, startDate, endDate);
                      if (!pos) return null;
                      return (
                        <div
                          className="absolute top-2 h-6 rounded-md flex items-center px-2 overflow-hidden"
                          style={{ left: pos.left, width: pos.width, backgroundColor: getPriorityColor(project.priority) }}
                        >
                          <div className="absolute inset-0 bg-black/10" style={{ width: `${project.progress_percentage}%` }} />
                          <span className="relative text-xs text-white font-medium truncate">{project.name}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {expandedProjects.has(project.id) && project.tasks?.map((task) => (
                    <div key={task.id} className="h-8 relative border-b border-[#edeef0] bg-[#f6f8f9]">
                      {(() => {
                        const pos = getBarPosition(task.start_date, task.end_date, startDate, endDate);
                        if (!pos) return null;
                        return (
                          <div
                            className="absolute top-1.5 h-5 rounded flex items-center px-2 overflow-hidden"
                            style={{
                              left: pos.left,
                              width: pos.width,
                              backgroundColor: getStatusColor(task.status),
                              opacity: task.status === 'completed' ? 0.6 : 1,
                            }}
                          >
                            <span className="text-[10px] text-white truncate">{task.title}</span>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
