import { Card } from '@/src/components/ui';

interface EmptyStateProps {
  hasProjects: boolean;
}

export function EmptyState({ hasProjects }: EmptyStateProps) {
  return (
    <Card>
      <div className="p-8 text-center text-[#A0A8C8]">
        {!hasProjects ? (
          <>
            No projects found.{' '}
            <a href="/admin/projects" className="text-[#00C8FF]">
              Create a project
            </a>{' '}
            to get started.
          </>
        ) : (
          'No projects match the selected filters.'
        )}
      </div>
    </Card>
  );
}
