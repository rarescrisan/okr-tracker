'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, Badge, Avatar, Select } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { Project } from '@/src/types';
import { PRIORITY_OPTIONS } from '@/src/lib/constants';

type ViewMode = 'month' | 'quarter';

export default function GanttChart() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        setProjects(data.data || []);
        // Expand all by default
        setExpandedProjects(new Set((data.data || []).map((p: Project) => p.id)));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate date range for the timeline
  const { startDate, endDate, months } = useMemo(() => {
    const now = new Date();
    let minDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    let maxDate = new Date(now.getFullYear(), now.getMonth() + 6, 0);

    projects.forEach((p) => {
      if (p.start_date) {
        const start = new Date(p.start_date);
        if (start < minDate) minDate = new Date(start.getFullYear(), start.getMonth(), 1);
      }
      if (p.end_date) {
        const end = new Date(p.end_date);
        if (end > maxDate) maxDate = new Date(end.getFullYear(), end.getMonth() + 1, 0);
      }
      p.tasks?.forEach((t) => {
        if (t.start_date) {
          const start = new Date(t.start_date);
          if (start < minDate) minDate = new Date(start.getFullYear(), start.getMonth(), 1);
        }
        if (t.end_date) {
          const end = new Date(t.end_date);
          if (end > maxDate) maxDate = new Date(end.getFullYear(), end.getMonth() + 1, 0);
        }
      });
    });

    // Generate months array
    const monthsArr: { date: Date; label: string }[] = [];
    const current = new Date(minDate);
    while (current <= maxDate) {
      monthsArr.push({
        date: new Date(current),
        label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      });
      current.setMonth(current.getMonth() + 1);
    }

    return { startDate: minDate, endDate: maxDate, months: monthsArr };
  }, [projects]);

  const toggleExpand = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const getBarPosition = (itemStart: string | null | undefined, itemEnd: string | null | undefined) => {
    if (!itemStart || !itemEnd) return null;

    const start = new Date(itemStart);
    const end = new Date(itemEnd);
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    const startOffset = Math.max(0, (start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = Math.min((duration / totalDays) * 100, 100 - leftPercent);

    return { left: `${leftPercent}%`, width: `${Math.max(widthPercent, 1)}%` };
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || '#4573d2';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#5da283';
      case 'in_progress': return '#4573d2';
      case 'blocked': return '#f06a6a';
      default: return '#9ca0a4';
    }
  };

  // Today marker position
  const todayPosition = useMemo(() => {
    const today = new Date();
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const todayOffset = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const percent = (todayOffset / totalDays) * 100;
    return percent >= 0 && percent <= 100 ? `${percent}%` : null;
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Timeline" description="Gantt chart view of all projects and tasks" />
        <Card><div className="p-8 text-center text-[#6d6e6f]">Loading...</div></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Timeline"
        description="Gantt chart view of all projects and tasks"
        actions={
          <Select
            options={[
              { value: 'month', label: 'Monthly View' },
              { value: 'quarter', label: 'Quarterly View' },
            ]}
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="w-40"
          />
        }
      />

      {projects.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-[#6d6e6f]">
            No projects found. <a href="/admin/projects" className="text-[#4573d2]">Create a project</a> to get started.
          </div>
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="flex">
            {/* Left sidebar - Project/Task names */}
            <div className="w-72 flex-shrink-0 border-r border-[#e8ecee]">
              {/* Header */}
              <div className="h-12 px-4 flex items-center border-b border-[#e8ecee] bg-[#f6f8f9]">
                <span className="text-xs font-semibold text-[#6d6e6f] uppercase">Project / Task</span>
              </div>

              {/* Project rows */}
              {projects.map((project) => (
                <div key={project.id}>
                  <div
                    className="h-10 px-4 flex items-center gap-2 border-b border-[#edeef0] cursor-pointer hover:bg-[#f6f8f9]"
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
                    <span className="text-sm font-medium text-[#1e1f21] truncate">{project.name}</span>
                  </div>

                  {/* Task rows */}
                  {expandedProjects.has(project.id) && project.tasks?.map((task) => (
                    <div
                      key={task.id}
                      className="h-8 px-4 pl-10 flex items-center gap-2 border-b border-[#edeef0] bg-[#f6f8f9]"
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0`}
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      />
                      <span className="text-xs text-[#6d6e6f] truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Right side - Timeline */}
            <div className="flex-1 overflow-x-auto">
              {/* Month headers */}
              <div className="h-12 flex border-b border-[#e8ecee] bg-[#f6f8f9] relative">
                {months.map((month, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 px-2 flex items-center justify-center border-r border-[#edeef0] text-xs font-medium text-[#6d6e6f]"
                    style={{ width: `${100 / months.length}%`, minWidth: '80px' }}
                  >
                    {month.label}
                  </div>
                ))}
              </div>

              {/* Gantt rows */}
              <div className="relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {months.map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-[#edeef0]"
                      style={{ width: `${100 / months.length}%`, minWidth: '80px' }}
                    />
                  ))}
                </div>

                {/* Today marker */}
                {todayPosition && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#f06a6a] z-10"
                    style={{ left: todayPosition }}
                  >
                    <div className="absolute -top-1 -left-2 px-1 py-0.5 bg-[#f06a6a] text-white text-[10px] rounded">
                      Today
                    </div>
                  </div>
                )}

                {/* Project bars */}
                {projects.map((project) => (
                  <div key={project.id}>
                    {/* Project bar */}
                    <div className="h-10 relative border-b border-[#edeef0]">
                      {(() => {
                        const pos = getBarPosition(project.start_date, project.end_date);
                        if (!pos) return null;
                        return (
                          <div
                            className="absolute top-2 h-6 rounded-md flex items-center px-2 overflow-hidden"
                            style={{
                              left: pos.left,
                              width: pos.width,
                              backgroundColor: getPriorityColor(project.priority),
                            }}
                          >
                            {/* Progress fill */}
                            <div
                              className="absolute inset-0 bg-black/10"
                              style={{ width: `${project.progress_percentage}%` }}
                            />
                            <span className="relative text-xs text-white font-medium truncate">
                              {project.name}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Task bars */}
                    {expandedProjects.has(project.id) && project.tasks?.map((task) => (
                      <div key={task.id} className="h-8 relative border-b border-[#edeef0] bg-[#f6f8f9]">
                        {(() => {
                          const pos = getBarPosition(task.start_date, task.end_date);
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
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm text-[#6d6e6f]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#f06a6a]" />
          <span>P0 - Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#f1bd6c]" />
          <span>P1 - High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#4573d2]" />
          <span>P2 - Medium / In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#5da283]" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#9ca0a4]" />
          <span>Not Started</span>
        </div>
      </div>
    </div>
  );
}
