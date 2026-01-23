import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, getCurrentTimestamp } from '@/src/lib/db';
import { ProjectTask, UpdateProjectTask } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = await queryOne<ProjectTask>(
      `SELECT pt.*, u.name as assignee_name, u.email as assignee_email, u.avatar_url as assignee_avatar_url
       FROM project_tasks pt
       LEFT JOIN users u ON pt.assignee_user_id = u.id
       WHERE pt.id = $1`,
      [id]
    );

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateProjectTask = await request.json();

    const existing = await queryOne('SELECT * FROM project_tasks WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];
    let paramIndex = 1;

    const fields: (keyof UpdateProjectTask)[] = [
      'project_id', 'title', 'description', 'assignee_user_id',
      'status', 'start_date', 'end_date', 'display_order', 'document_link'
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        // Convert empty strings to null for date fields
        const value = body[field];
        if ((field === 'start_date' || field === 'end_date') && value === '') {
          values.push(null);
        } else {
          values.push(value as string | number | null ?? null);
        }
      }
    }

    if (updates.length > 0) {
      updates.push(`updated_at = $${paramIndex++}`);
      values.push(getCurrentTimestamp());
      values.push(id);

      await execute(
        `UPDATE project_tasks SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    }

    const task = await queryOne<ProjectTask>('SELECT * FROM project_tasks WHERE id = $1', [id]);
    return NextResponse.json({ data: task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await queryOne('SELECT * FROM project_tasks WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await execute('DELETE FROM project_tasks WHERE id = $1', [id]);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
