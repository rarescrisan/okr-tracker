import { Card } from '@/src/components/ui';

interface EmptyStateProps {
  hasProjects: boolean;
}

export function EmptyState({ hasProjects }: EmptyStateProps) {
  return (
    <Card>
      <div className="p-8 text-center text-[#6d6e6f]">
        {!hasProjects ? (
          <>
            No projects found.{' '}
            <a href="/admin/projects" className="text-[#4573d2]">
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
