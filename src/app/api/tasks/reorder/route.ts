import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, getCurrentTimestamp } from '@/src/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body: { taskId: number; direction: 'up' | 'down'; projectId: number } = await request.json();
    const { taskId, direction, projectId } = body;

    if (!taskId || !direction || !projectId) {
      return NextResponse.json(
        { error: 'Task ID, direction, and project ID are required' },
        { status: 400 }
      );
    }

    const now = getCurrentTimestamp();

    // Get the current task
    const currentTask = await queryOne<{ id: number; display_order: number }>(
      'SELECT id, display_order FROM project_tasks WHERE id = $1 AND project_id = $2',
      [taskId, projectId]
    );

    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Find the adjacent task to swap with
    let adjacentTask: { id: number; display_order: number } | undefined;

    if (direction === 'up') {
      adjacentTask = await queryOne<{ id: number; display_order: number }>(
        `SELECT id, display_order FROM project_tasks
         WHERE project_id = $1 AND display_order < $2
         ORDER BY display_order DESC
         LIMIT 1`,
        [projectId, currentTask.display_order]
      );
    } else {
      adjacentTask = await queryOne<{ id: number; display_order: number }>(
        `SELECT id, display_order FROM project_tasks
         WHERE project_id = $1 AND display_order > $2
         ORDER BY display_order ASC
         LIMIT 1`,
        [projectId, currentTask.display_order]
      );
    }

    if (!adjacentTask) {
      return NextResponse.json({ data: { success: true, message: 'Already at boundary' } });
    }

    // Swap the display_order values
    await execute(
      'UPDATE project_tasks SET display_order = $1, updated_at = $2 WHERE id = $3',
      [adjacentTask.display_order, now, currentTask.id]
    );
    await execute(
      'UPDATE project_tasks SET display_order = $1, updated_at = $2 WHERE id = $3',
      [currentTask.display_order, now, adjacentTask.id]
    );

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error reordering task:', error);
    return NextResponse.json({ error: 'Failed to reorder task' }, { status: 500 });
  }
}
