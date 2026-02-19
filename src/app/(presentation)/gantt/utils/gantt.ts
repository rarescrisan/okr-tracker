import { Project } from '@/src/types';
import { PRIORITY_OPTIONS } from '@/src/lib/constants';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  months: { date: Date; label: string }[];
}

export function calculateDateRange(projects: Project[]): DateRange {
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

  const months: { date: Date; label: string }[] = [];
  const current = new Date(minDate);
  while (current <= maxDate) {
    months.push({
      date: new Date(current),
      label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    });
    current.setMonth(current.getMonth() + 1);
  }

  return { startDate: minDate, endDate: maxDate, months };
}

export function getBarPosition(
  itemStart: string | null | undefined,
  itemEnd: string | null | undefined,
  startDate: Date,
  endDate: Date
): { left: string; width: string } | null {
  if (!itemStart || !itemEnd) return null;

  const start = new Date(itemStart);
  const end = new Date(itemEnd);
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const startOffset = Math.max(0, (start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const duration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const leftPercent = (startOffset / totalDays) * 100;
  const widthPercent = Math.min((duration / totalDays) * 100, 100 - leftPercent);

  return { left: `${leftPercent}%`, width: `${Math.max(widthPercent, 1)}%` };
}

export function getTodayPosition(startDate: Date, endDate: Date): string | null {
  const today = new Date();
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const todayOffset = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const percent = (todayOffset / totalDays) * 100;
  return percent >= 0 && percent <= 100 ? `${percent}%` : null;
}

export function getPriorityColor(priority: string): string {
  return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || '#4573d2';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return '#5da283';
    case 'in_progress': return '#4573d2';
    case 'blocked': return '#f06a6a';
    default: return '#9ca0a4';
  }
}
