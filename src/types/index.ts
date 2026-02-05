export interface User {
  id: number;
  name: string;
  email?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string | null;
  color: string;
  display_order: number;
  objectives?: Objective[];
  created_at: string;
  updated_at: string;
}

export interface Objective {
  id: number;
  department_id: number;
  code: string;
  title: string;
  description?: string | null;
  is_top_objective: boolean;
  display_order: number;
  key_results?: KeyResult[];
  department?: Department;
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: number;
  objective_id: number;
  code: string;
  title: string;
  description?: string | null;
  baseline_value?: number | null;
  baseline_label?: string | null;
  target_value: number;
  target_label?: string | null;
  current_value: number;
  current_label?: string | null;
  unit_type: 'number' | 'currency' | 'percentage';
  target_date?: string | null;
  is_top_kr: boolean;
  objective?: Objective;
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  department_id?: number | null;
  objective_id?: number | null;
  dri_user_id?: number | null;
  progress_percentage: number;
  start_date?: string | null;
  end_date?: string | null;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  color: string;
  display_order: number;
  document_link?: string | null;
  department?: Department;
  objective?: Objective;
  dri?: User;
  working_group?: User[];
  tasks?: ProjectTask[];
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: number;
  project_id: number;
  title: string;
  description?: string | null;
  assignee_user_id?: number | null;
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed';
  progress_percentage: number;
  start_date?: string | null;
  end_date?: string | null;
  display_order: number;
  document_link?: string | null;
  assignee?: User;
  project?: Project;
  created_at: string;
  updated_at: string;
}

export interface WorkingGroupMember {
  id: number;
  project_id: number;
  user_id: number;
  role?: string | null;
  user?: User;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Form types for creating/updating
export type CreateUser = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type UpdateUser = Partial<CreateUser>;

export type CreateDepartment = Omit<Department, 'id' | 'created_at' | 'updated_at' | 'objectives'>;
export type UpdateDepartment = Partial<CreateDepartment>;

export type CreateObjective = Omit<Objective, 'id' | 'created_at' | 'updated_at' | 'key_results' | 'department'>;
export type UpdateObjective = Partial<CreateObjective>;

export type CreateKeyResult = Omit<KeyResult, 'id' | 'created_at' | 'updated_at' | 'objective' | 'progress_percentage'>;
export type UpdateKeyResult = Partial<CreateKeyResult>;

export type CreateProject = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'objective' | 'dri' | 'working_group' | 'tasks'>;
export type UpdateProject = Partial<CreateProject>;

export type CreateProjectTask = Omit<ProjectTask, 'id' | 'created_at' | 'updated_at' | 'assignee' | 'project'>;
export type UpdateProjectTask = Partial<CreateProjectTask>;
