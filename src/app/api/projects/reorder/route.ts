import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, getCurrentTimestamp } from '@/src/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body: { projectId: number; direction: 'up' | 'down'; departmentId: number } = await request.json();
    const { projectId, direction, departmentId } = body;

    if (!projectId || !direction || !departmentId) {
      return NextResponse.json(
        { error: 'Project ID, direction, and department ID are required' },
        { status: 400 }
      );
    }

    const now = getCurrentTimestamp();

    // Get the current project
    const currentProject = await queryOne<{ id: number; display_order: number }>(
      'SELECT id, display_order FROM projects WHERE id = $1 AND department_id = $2',
      [projectId, departmentId]
    );

    if (!currentProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Find the adjacent project to swap with
    let adjacentProject: { id: number; display_order: number } | undefined;

    if (direction === 'up') {
      adjacentProject = await queryOne<{ id: number; display_order: number }>(
        `SELECT id, display_order FROM projects
         WHERE department_id = $1 AND display_order < $2
         ORDER BY display_order DESC
         LIMIT 1`,
        [departmentId, currentProject.display_order]
      );
    } else {
      adjacentProject = await queryOne<{ id: number; display_order: number }>(
        `SELECT id, display_order FROM projects
         WHERE department_id = $1 AND display_order > $2
         ORDER BY display_order ASC
         LIMIT 1`,
        [departmentId, currentProject.display_order]
      );
    }

    if (!adjacentProject) {
      return NextResponse.json({ data: { success: true, message: 'Already at boundary' } });
    }

    // Swap the display_order values
    await execute(
      'UPDATE projects SET display_order = $1, updated_at = $2 WHERE id = $3',
      [adjacentProject.display_order, now, currentProject.id]
    );
    await execute(
      'UPDATE projects SET display_order = $1, updated_at = $2 WHERE id = $3',
      [currentProject.display_order, now, adjacentProject.id]
    );

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error reordering project:', error);
    return NextResponse.json({ error: 'Failed to reorder project' }, { status: 500 });
  }
}
