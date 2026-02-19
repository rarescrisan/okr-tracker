export const COLORS = {
  // Primary palette (Asana-inspired soft colors)
  primary: {
    coral: '#f06a6a',
    orange: '#f1bd6c',
    yellow: '#f8df72',
    green: '#5da283',
    teal: '#4ecbc4',
    blue: '#4573d2',
    purple: '#aa62e3',
    pink: '#f9aaef',
  },

  // Neutral palette
  neutral: {
    background: '#f6f8f9',
    surface: '#ffffff',
    border: '#e8ecee',
    divider: '#edeef0',
    textPrimary: '#1e1f21',
    textSecondary: '#6d6e6f',
    textTertiary: '#9ca0a4',
  },

  // Status colors
  status: {
    notStarted: '#6B7394',
    inProgress: '#00C8FF',
    blocked: '#FF4D6A',
    completed: '#2DD4A8',
    onHold: '#FFB020',
  },

  // Priority colors
  priority: {
    P0: '#FF4D6A',
    P1: '#FFB020',
    P2: '#00C8FF',
    P3: '#6B7394',
  },

  // Department colors (for department sections)
  departments: [
    '#4573d2',
    '#5da283',
    '#aa62e3',
    '#f06a6a',
    '#4ecbc4',
    '#f1bd6c',
    '#f8df72',
    '#f9aaef',
    '#6c8ebf',
    '#e88c6a',
    '#7bc9a3',
  ],

  // User avatar colors (expanded palette)
  avatars: [
    '#4573d2', // Blue
    '#5da283', // Green
    '#aa62e3', // Purple
    '#f06a6a', // Coral
    '#4ecbc4', // Teal
    '#f1bd6c', // Orange
    '#e57373', // Light Red
    '#64b5f6', // Light Blue
    '#81c784', // Light Green
    '#ba68c8', // Light Purple
    '#ffb74d', // Amber
    '#4db6ac', // Cyan
    '#7986cb', // Indigo
    '#a1887f', // Brown
    '#90a4ae', // Blue Grey
    '#ff8a65', // Deep Orange
    '#aed581', // Light Lime
    '#4dd0e1', // Light Cyan
    '#9575cd', // Deep Purple
    '#f06292', // Pink
    '#dce775', // Lime
    '#26a69a', // Teal Dark
    '#5c6bc0', // Indigo Dark
    '#8d6e63', // Brown Dark
    '#78909c', // Blue Grey Dark
    '#ef5350', // Red
    '#66bb6a', // Green Medium
    '#42a5f5', // Blue Medium
    '#ab47bc', // Purple Medium
    '#ffa726', // Orange Medium
  ],
} as const;

export const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: COLORS.status.notStarted },
  { value: 'in_progress', label: 'In Progress', color: COLORS.status.inProgress },
  { value: 'blocked', label: 'Blocked', color: COLORS.status.blocked },
  { value: 'completed', label: 'Completed', color: COLORS.status.completed },
] as const;

export const PROJECT_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: COLORS.status.notStarted },
  { value: 'in_progress', label: 'In Progress', color: COLORS.status.inProgress },
  { value: 'completed', label: 'Completed', color: COLORS.status.completed },
  { value: 'on_hold', label: 'On Hold', color: COLORS.status.onHold },
] as const;

export const PRIORITY_OPTIONS = [
  { value: 'P0', label: 'P0 - Critical', color: COLORS.priority.P0 },
  { value: 'P1', label: 'P1 - High', color: COLORS.priority.P1 },
  { value: 'P2', label: 'P2 - Medium', color: COLORS.priority.P2 },
  { value: 'P3', label: 'P3 - Low', color: COLORS.priority.P3 },
] as const;

export const UNIT_TYPE_OPTIONS = [
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency ($)' },
  { value: 'percentage', label: 'Percentage (%)' },
] as const;

export const DIRECTION_OPTIONS = [
  { value: 'increase', label: 'Higher is better' },
  { value: 'decrease', label: 'Lower is better' },
] as const;

export const X_REQUEST_STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: COLORS.status.notStarted },
  { value: 'in_progress', label: 'In Progress', color: COLORS.status.inProgress },
  { value: 'completed', label: 'Completed', color: COLORS.status.completed },
  { value: 'declined', label: 'Declined', color: COLORS.status.blocked },
] as const;

export type StatusValue = typeof STATUS_OPTIONS[number]['value'];
export type ProjectStatusValue = typeof PROJECT_STATUS_OPTIONS[number]['value'];
export type PriorityValue = typeof PRIORITY_OPTIONS[number]['value'];
export type UnitTypeValue = typeof UNIT_TYPE_OPTIONS[number]['value'];
export type XRequestStatusValue = typeof X_REQUEST_STATUS_OPTIONS[number]['value'];
