import { PRIORITY_OPTIONS, PROJECT_STATUS_OPTIONS, STATUS_OPTIONS } from '@/src/lib/constants';

export function getPriorityColor(priority: string): string {
  return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || '#9ca0a4';
}

export function getStatusColor(status: string): string {
  return STATUS_OPTIONS.find(s => s.value === status)?.color || '#9ca0a4';
}

export function getStatusLabel(status: string): string {
  return PROJECT_STATUS_OPTIONS.find(s => s.value === status)?.label || status;
}

export function getTaskStatusLabel(status: string): string {
  return STATUS_OPTIONS.find(s => s.value === status)?.label || status;
}

export function toggleTaskStatus(currentStatus: string): { status: string; progress: number } {
  const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
  const newProgress = currentStatus === 'completed' ? 0 : 100;
  return { status: newStatus, progress: newProgress };
}
