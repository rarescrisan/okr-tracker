import { type ClassValue, clsx } from 'clsx';

// Simple cn function without tailwind-merge for now
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format date for display (dd/mm/yyyy)
export function formatDisplayDate(date: string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Format date for input fields
export function formatInputDate(date: string | null | undefined): string {
  if (!date) return '';
  return date.split('T')[0];
}

// Calculate progress percentage
// direction='increase' (default): higher current = more progress
// direction='decrease': lower current = more progress (e.g. payback period, ticket count)
export function calculateProgress(
  current: number | null | undefined,
  target: number | null | undefined,
  baseline?: number | null,
  direction: 'increase' | 'decrease' = 'increase'
): number {
  const curr = current ?? 0;
  const tgt = target ?? 0;
  const base = baseline ?? 0;

  // Lower-is-better metrics
  if (direction === 'decrease') {
    if (curr <= 0) return 0;
    // If a meaningful baseline is provided above the target, use baseline-adjusted formula
    if (baseline !== null && baseline !== undefined && base > tgt) {
      const range = base - tgt;
      const progress = ((base - curr) / range) * 100;
      return Math.max(0, Math.min(Math.round(progress), 100));
    }
    // Simple: target/current — 100% when at target, <100% when above, >100% when below
    if (tgt <= 0) return 0;
    return Math.max(0, Math.min(Math.round((tgt / curr) * 100), 100));
  }

  // Higher-is-better (default)
  if (tgt === 0) return 0;

  if (baseline !== null && baseline !== undefined && tgt !== base) {
    const range = tgt - base;
    const progress = ((curr - base) / range) * 100;

    if (progress <= 0 && curr > 0 && tgt > base) {
      // Current hasn't moved above baseline yet (or regressed): fall back to simple ratio
      return Math.max(0, Math.min(Math.round((curr / tgt) * 100), 100));
    }
    if (progress < 0) {
      return 0;
    }

    return Math.max(0, Math.min(Math.round(progress), 100));
  }

  const progress = (curr / tgt) * 100;
  return Math.max(0, Math.min(Math.round(progress), 100));
}

// Format number based on unit type
export function formatValue(
  value: number | null | undefined,
  unitType: 'number' | 'currency' | 'percentage',
  label?: string | null
): string {
  if (value === null || value === undefined) return '-';

  switch (unitType) {
    case 'currency':
      return `$${value.toLocaleString()}${label ? ` ${label}` : ''}`;
    case 'percentage':
      return `${value}%${label ? ` ${label}` : ''}`;
    default:
      return `${value.toLocaleString()}${label ? ` ${label}` : ''}`;
  }
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Generate a random color from department colors
export function getRandomDepartmentColor(index: number): string {
  const colors = [
    '#4573d2', '#5da283', '#aa62e3',
    '#f06a6a', '#4ecbc4', '#f1bd6c'
  ];
  return colors[index % colors.length];
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate date range for Gantt chart
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Calculate position and width for Gantt bars
export function calculateGanttPosition(
  itemStart: string | null,
  itemEnd: string | null,
  viewStart: Date,
  viewEnd: Date,
  totalWidth: number
): { left: number; width: number } | null {
  if (!itemStart || !itemEnd) return null;

  const start = new Date(itemStart);
  const end = new Date(itemEnd);
  const viewDuration = viewEnd.getTime() - viewStart.getTime();

  if (end < viewStart || start > viewEnd) return null;

  const clampedStart = start < viewStart ? viewStart : start;
  const clampedEnd = end > viewEnd ? viewEnd : end;

  const left = ((clampedStart.getTime() - viewStart.getTime()) / viewDuration) * totalWidth;
  const width = ((clampedEnd.getTime() - clampedStart.getTime()) / viewDuration) * totalWidth;

  return { left: Math.max(0, left), width: Math.max(20, width) };
}
