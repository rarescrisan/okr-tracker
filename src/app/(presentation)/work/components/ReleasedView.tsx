'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Avatar } from '@/src/components/ui';
import { Project, ProjectTask, Department } from '@/src/types';
import { getStatusColor, getTaskStatusLabel } from '../utils/helpers';

type FlatTask = ProjectTask & {
  assignee_name?: string;
  project_name: string;
  project_color: string;
  department_name?: string;
  department_color?: string;
};

interface DrawerSelection {
  deptName: string;
  deptColor: string | undefined;
  monthKey: string;
  tasks: FlatTask[];
}

interface ReleasedViewProps {
  projects: (Project & {
    tasks?: (ProjectTask & { assignee_name?: string })[];
  })[];
  departments: Department[];
}

function getMonthKey(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  const currentYear = new Date().getFullYear();
  const label = d.toLocaleString('default', { month: 'long' });
  return year !== currentYear ? `${label} ${year}` : label;
}

function formatShortDate(date: string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  const month = d.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
  const day = d.getUTCDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st'
    : day === 2 || day === 22 ? 'nd'
    : day === 3 || day === 23 ? 'rd'
    : 'th';
  return `${month} ${day}${suffix}`;
}

function DoughnutChart({ total, completed, color }: { total: number; completed: number; color?: string }) {
  const r = 15.9;
  const circumference = 2 * Math.PI * r;
  const arc = total === 0 ? 0 : (completed / total) * circumference;
  const fill = color ?? '#2DD4A8';
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <svg viewBox="0 0 36 36" className="w-16 h-16 flex-shrink-0">
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
      {completed > 0 && (
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke={fill}
          strokeWidth="3.5"
          strokeDasharray={`${arc} ${circumference - arc}`}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
      )}
      <text
        x="18" y="18"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        style={{ fontSize: '7px', fontWeight: '600' }}
      >
        {percentage}%
      </text>
    </svg>
  );
}

function TaskDrawer({ selection, onClose }: { selection: DrawerSelection; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const outstanding = selection.tasks.filter((t) => t.status !== 'completed');
  const completed = selection.tasks.filter((t) => t.status === 'completed');

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#151929] border-l border-white/[0.08] shadow-2xl animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            {selection.deptColor && selection.deptName !== 'No Department' && (
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: selection.deptColor }} />
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white leading-tight">{selection.deptName}</h2>
              <p className="text-sm text-[#6B7394] mt-0.5">{getMonthLabel(selection.monthKey)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A0A8C8] hover:text-white hover:bg-white/[0.08] rounded transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary pill */}
        <div className="px-6 pt-4 flex items-center gap-3">
          <span className="text-xs text-[#6B7394]">
            <span className="text-white font-medium">{completed.length}</span> / {selection.tasks.length} completed
          </span>
          {outstanding.length > 0 && (
            <span className="text-xs text-[#E57373] bg-[#E57373]/10 px-2 py-0.5 rounded">
              {outstanding.length} outstanding
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-6">
          {/* Outstanding */}
          {outstanding.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#A0A8C8] uppercase tracking-wide mb-2">
                Outstanding ({outstanding.length})
              </p>
              <div className="space-y-1.5">
                {outstanding.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-md bg-white/[0.05]"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-white block leading-snug">{task.title}</span>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge color={getStatusColor(task.status)} className="text-xs">
                          {getTaskStatusLabel(task.status)}
                        </Badge>
                        {task.end_date && (
                          <span className="text-xs text-[#6B7394]">{formatShortDate(task.end_date)}</span>
                        )}
                      </div>
                    </div>
                    {(task.assignee_name || task.assignee_user_id) && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Avatar name={task.assignee_name || 'User'} size="xs" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#A0A8C8] uppercase tracking-wide mb-2">
                Completed ({completed.length})
              </p>
              <div className="space-y-1.5">
                {completed.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-md bg-[#2DD4A8]/[0.04] border border-[#2DD4A8]/10"
                  >
                    <svg className="w-3.5 h-3.5 text-[#2DD4A8] flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[#6B7394] line-through block leading-snug">{task.title}</span>
                      {task.end_date && (
                        <span className="text-xs text-[#4B5470] mt-0.5 block">{formatShortDate(task.end_date)}</span>
                      )}
                    </div>
                    {(task.assignee_name || task.assignee_user_id) && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Avatar name={task.assignee_name || 'User'} size="xs" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function ReleasedView({ projects, departments }: ReleasedViewProps) {
  const [drawer, setDrawer] = useState<DrawerSelection | null>(null);

  const flatTasks: FlatTask[] = projects.flatMap((project) =>
    (project.tasks ?? []).map((task) => {
      const t = task as typeof task & { assignee_name?: string };
      return {
        ...task,
        assignee_name: t.assignee_name ?? project.dri?.name,
        assignee_user_id: task.assignee_user_id ?? project.dri_user_id,
        project_name: project.name,
        project_color: project.color,
        department_name: project.department?.name,
        department_color: project.department?.color,
      };
    })
  );

  const tasksWithDate = flatTasks.filter((t) => t.end_date);

  const monthMap = new Map<string, FlatTask[]>();
  for (const task of tasksWithDate) {
    const key = getMonthKey(task.end_date)!;
    if (!monthMap.has(key)) monthMap.set(key, []);
    monthMap.get(key)!.push(task);
  }

  const sortedMonths = [...monthMap.keys()]
    .filter((k) => k >= '2026-01')
    .sort((a, b) => a.localeCompare(b));

  if (sortedMonths.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center text-[#A0A8C8]">No tasks with deadlines found.</div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-10">
        {sortedMonths.map((monthKey) => {
          const tasks = monthMap.get(monthKey)!;
          const completedMonth = tasks.filter((t) => t.status === 'completed').length;

          const deptMap = new Map<string, { color: string | undefined; tasks: FlatTask[] }>();
          for (const task of tasks) {
            const name = task.department_name ?? 'No Department';
            if (!deptMap.has(name)) deptMap.set(name, { color: task.department_color, tasks: [] });
            deptMap.get(name)!.tasks.push(task);
          }
          const deptList = [...deptMap.entries()]
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => {
              const aOrder = departments.find((d) => d.name === a.name)?.display_order ?? Infinity;
              const bOrder = departments.find((d) => d.name === b.name)?.display_order ?? Infinity;
              return aOrder - bOrder;
            });

          return (
            <div key={monthKey}>
              <div className="flex items-baseline gap-3 mb-4 px-1">
                <h3 className="text-sm font-semibold text-[#A0A8C8] uppercase tracking-wide">
                  {getMonthLabel(monthKey)}
                </h3>
                <span className="text-sm text-[#6B7394]">
                  {completedMonth} / {tasks.length} completed
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {deptList.map((dept) => {
                  const deptCompleted = dept.tasks.filter((t) => t.status === 'completed').length;
                  const deptTotal = dept.tasks.length;
                  const allDone = deptCompleted === deptTotal && deptTotal > 0;

                  return (
                    <button
                      key={dept.name}
                      onClick={() => setDrawer({ deptName: dept.name, deptColor: dept.color, monthKey, tasks: dept.tasks })}
                      className={`rounded-xl border p-4 flex flex-col items-center gap-3 text-left w-full transition-colors cursor-pointer ${
                        allDone
                          ? 'bg-[#2DD4A8]/[0.06] border-[#2DD4A8]/30 hover:bg-[#2DD4A8]/[0.10]'
                          : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.14]'
                      }`}
                    >
                      <div className="flex items-center gap-2 self-stretch min-w-0">
                        {dept.color && dept.name !== 'No Department' && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dept.color }} />
                        )}
                        <span className="text-xs font-semibold text-[#A0A8C8] uppercase tracking-wide truncate">
                          {dept.name}
                        </span>
                      </div>

                      <DoughnutChart total={deptTotal} completed={deptCompleted} color={dept.color} />

                      <p className="text-xs text-[#6B7394] text-center">
                        <span className="text-white font-medium">{deptCompleted}</span> / {deptTotal} tasks
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {drawer && (
        <TaskDrawer selection={drawer} onClose={() => setDrawer(null)} />
      )}
    </>
  );
}
