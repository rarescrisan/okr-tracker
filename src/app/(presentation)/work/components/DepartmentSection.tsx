import { Project, Department, ProjectTask } from '@/src/types';
import { ProjectCard } from './ProjectCard';

interface DepartmentSectionProps {
  department: Department | null;
  projects: (Project & {
    objective_code?: string;
    tasks?: (ProjectTask & { assignee_name?: string })[];
  })[];
  expandedProjects: Set<number>;
  onToggleExpand: (projectId: number) => void;
  onTaskToggle: (taskId: number, currentStatus: string) => void;
}

export function DepartmentSection({
  department,
  projects,
  expandedProjects,
  onToggleExpand,
  onTaskToggle,
}: DepartmentSectionProps) {
  if (projects.length === 0) return null;

  return (
    <div>
      <DepartmentHeader
        name={department?.name || 'Unassigned'}
        color={department?.color || '#9ca0a4'}
        count={projects.length}
      />
      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isExpanded={expandedProjects.has(project.id)}
            onToggleExpand={onToggleExpand}
            onTaskToggle={onTaskToggle}
          />
        ))}
      </div>
    </div>
  );
}

interface DepartmentHeaderProps {
  name: string;
  color: string;
  count: number;
}

function DepartmentHeader({ name, color, count }: DepartmentHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <h2 className="text-base sm:text-lg font-semibold text-white">{name}</h2>
      <span className="text-sm text-[#A0A8C8]">({count})</span>
    </div>
  );
}
