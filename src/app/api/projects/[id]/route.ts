import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, getCurrentTimestamp } from '@/src/lib/db';
import { Project, User, ProjectTask, UpdateProject } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await queryOne<Project & {
      department_name: string;
      department_color: string;
      objective_code: string;
      objective_title: string;
      dri_name: string;
      dri_email: string;
      dri_avatar_url: string;
    }>(
      `SELECT p.*,
              d.name as department_name, d.color as department_color,
              o.code as objective_code, o.title as objective_title,
              u.name as dri_name, u.email as dri_email, u.avatar_url as dri_avatar_url
       FROM projects p
       LEFT JOIN departments d ON p.department_id = d.id
       LEFT JOIN objectives o ON p.objective_id = o.id
       LEFT JOIN users u ON p.dri_user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Working group
    const workingGroup = await query<User>(
      `SELECT u.* FROM users u
       JOIN project_working_group pwg ON u.id = pwg.user_id
       WHERE pwg.project_id = $1`,
      [id]
    );
    project.working_group = workingGroup;

    // Tasks
    const tasks = await query<ProjectTask>(
      `SELECT pt.*, u.name as assignee_name, u.email as assignee_email, u.avatar_url as assignee_avatar_url
       FROM project_tasks pt
       LEFT JOIN users u ON pt.assignee_user_id = u.id
       WHERE pt.project_id = $1
       ORDER BY pt.display_order`,
      [id]
    );
    project.tasks = tasks;

    // Format Department
    if (project.department_id) {
      project.department = {
        id: project.department_id,
        name: project.department_name,
        color: project.department_color,
        display_order: 0,
        created_at: '',
        updated_at: ''
      };
    }

    // Format DRI
    if (project.dri_user_id) {
      project.dri = {
        id: project.dri_user_id,
        name: project.dri_name,
        email: project.dri_email,
        avatar_url: project.dri_avatar_url,
        created_at: '',
        updated_at: ''
      };
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateProject & { working_group_ids?: number[] } = await request.json();

    const existing = await queryOne('SELECT * FROM projects WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];
    let paramIndex = 1;

    const fields: (keyof UpdateProject)[] = [
      'name', 'description', 'department_id', 'objective_id', 'dri_user_id',
      'progress_percentage', 'start_date', 'end_date',
      'priority', 'status', 'color', 'display_order', 'document_link'
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(body[field] as string | number | null ?? null);
      }
    }

    if (updates.length > 0) {
      updates.push(`updated_at = $${paramIndex++}`);
      values.push(getCurrentTimestamp());
      values.push(id);

      await execute(
        `UPDATE projects SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    }

    // Update working group if provided
    if (body.working_group_ids !== undefined) {
      const now = getCurrentTimestamp();
      await execute('DELETE FROM project_working_group WHERE project_id = $1', [id]);

      if (body.working_group_ids.length > 0) {
        for (const userId of body.working_group_ids) {
          await execute(
            'INSERT INTO project_working_group (project_id, user_id, created_at) VALUES ($1, $2, $3)',
            [id, userId, now]
          );
        }
      }
    }

    const project = await queryOne<Project>('SELECT * FROM projects WHERE id = $1', [id]);
    return NextResponse.json({ data: project });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await queryOne('SELECT * FROM projects WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await execute('DELETE FROM projects WHERE id = $1', [id]);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
