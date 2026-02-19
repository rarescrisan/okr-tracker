'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, Select } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { Project } from '@/src/types';
import { fetchGanttData } from './lib/api';
import { calculateDateRange, getTodayPosition } from './utils/gantt';
import { GanttDesktopView } from './components/GanttDesktopView';
import { GanttMobileView } from './components/GanttMobileView';

type ViewMode = 'month' | 'quarter';

export default function GanttChart() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchGanttData();
        setProjects(data);
        setExpandedProjects(new Set(data.map((p: Project) => p.id)));
      } catch (error) {
        console.error('Error loading gantt data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const dateRange = useMemo(() => calculateDateRange(projects), [projects]);

  const todayPosition = useMemo(
    () => getTodayPosition(dateRange.startDate, dateRange.endDate),
    [dateRange.startDate, dateRange.endDate]
  );

  const toggleExpand = (projectId: number) => {
    const next = new Set(expandedProjects);
    next.has(projectId) ? next.delete(projectId) : next.add(projectId);
    setExpandedProjects(next);
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Timeline" description="Gantt chart view of projects and tasks" />
        <Card><div className="p-8 text-center text-[#6d6e6f]">Loading...</div></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Timeline"
        description="Gantt chart view of projects and tasks"
        actions={
          <Select
            options={[
              { value: 'month', label: 'Monthly' },
              { value: 'quarter', label: 'Quarterly' },
            ]}
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="w-28 sm:w-36"
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
        <>
          <GanttDesktopView
            projects={projects}
            expandedProjects={expandedProjects}
            onToggleExpand={toggleExpand}
            dateRange={dateRange}
            todayPosition={todayPosition}
          />
          <GanttMobileView
            projects={projects}
            expandedProjects={expandedProjects}
            onToggleExpand={toggleExpand}
          />

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-[#6d6e6f]">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#f06a6a]" /><span>P0</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#f1bd6c]" /><span>P1</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#4573d2]" /><span>P2 / In Progress</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#5da283]" /><span>Completed</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#9ca0a4]" /><span>Not Started</span></div>
          </div>
        </>
      )}
    </div>
  );
}
