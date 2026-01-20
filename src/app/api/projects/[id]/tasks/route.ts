import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, getCurrentTimestamp } from '@/src/lib/db';
import { ProjectTask, CreateProjectTask } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tasks = await query<ProjectTask>(
      `SELECT pt.*, u.name as assignee_name, u.email as assignee_email, u.avatar_url as assignee_avatar_url
       FROM project_tasks pt
       LEFT JOIN users u ON pt.assignee_user_id = u.id
       WHERE pt.project_id = $1
       ORDER BY pt.display_order`,
      [id]
    );

    return NextResponse.json({ data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Omit<CreateProjectTask, 'project_id'> = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const now = getCurrentTimestamp();

    // Get max display_order
    const maxOrder = await queryOne<{ max: number | null }>(
      'SELECT MAX(display_order) as max FROM project_tasks WHERE project_id = $1',
      [id]
    );
    const displayOrder = body.display_order ?? ((maxOrder?.max || 0) + 1);

    const task = await queryOne<ProjectTask>(
      `INSERT INTO project_tasks (
        project_id, title, description, assignee_user_id,
        status, start_date, end_date, display_order, document_link,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        id,
        body.title,
        body.description || null,
        body.assignee_user_id || null,
        body.status || 'not_started',
        body.start_date || null,
        body.end_date || null,
        displayOrder,
        body.document_link || null,
        now,
        now
      ]
    );

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
