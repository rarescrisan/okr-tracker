import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, getCurrentTimestamp } from '@/src/lib/db';
import { Project, User, ProjectTask, CreateProject } from '@/src/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const objectiveId = searchParams.get('objective_id');
    const departmentId = searchParams.get('department_id');
    const status = searchParams.get('status');
    const driUserId = searchParams.get('dri_user_id');

    let sqlQuery = `
      SELECT p.*,
             d.name as department_name, d.color as department_color,
             o.code as objective_code, o.title as objective_title,
             u.name as dri_name, u.email as dri_email, u.avatar_url as dri_avatar_url
      FROM projects p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN objectives o ON p.objective_id = o.id
      LEFT JOIN users u ON p.dri_user_id = u.id
      WHERE 1=1
    `;
    const params: string[] = [];
    let paramIndex = 1;

    if (departmentId) {
      sqlQuery += ` AND p.department_id = $${paramIndex++}`;
      params.push(departmentId);
    }
    if (objectiveId) {
      sqlQuery += ` AND p.objective_id = $${paramIndex++}`;
      params.push(objectiveId);
    }
    if (status) {
      sqlQuery += ` AND p.status = $${paramIndex++}`;
      params.push(status);
    }
    if (driUserId) {
      sqlQuery += ` AND p.dri_user_id = $${paramIndex++}`;
      params.push(driUserId);
    }

    sqlQuery += ' ORDER BY d.display_order, p.display_order, p.priority, p.start_date';

    const projects = await query<Project & {
      department_name: string;
      department_color: string;
      objective_code: string;
      objective_title: string;
      dri_name: string;
      dri_email: string;
      dri_avatar_url: string;
    }>(sqlQuery, params);

    // Get working group and tasks for each project
    for (const project of projects) {
      // Working group
      const workingGroup = await query<User>(
        `SELECT u.* FROM users u
         JOIN project_working_group pwg ON u.id = pwg.user_id
         WHERE pwg.project_id = $1`,
        [project.id]
      );
      project.working_group = workingGroup;

      // Tasks
      const tasks = await query<ProjectTask>(
        `SELECT pt.*, u.name as assignee_name, u.email as assignee_email, u.avatar_url as assignee_avatar_url
         FROM project_tasks pt
         LEFT JOIN users u ON pt.assignee_user_id = u.id
         WHERE pt.project_id = $1
         ORDER BY pt.display_order`,
        [project.id]
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
    }

    return NextResponse.json({ data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProject & { working_group_ids?: number[] } = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const now = getCurrentTimestamp();

    // Get max display_order for the department
    let displayOrder = 0;
    if (body.department_id) {
      const maxOrder = await queryOne<{ max: number | null }>(
        'SELECT MAX(display_order) as max FROM projects WHERE department_id = $1',
        [body.department_id]
      );
      displayOrder = ((maxOrder?.max ?? -1) + 1);
    }

    const project = await queryOne<Project>(
      `INSERT INTO projects (
        name, description, department_id, objective_id, dri_user_id,
        progress_percentage, start_date, end_date,
        priority, status, color, display_order, document_link, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        body.name,
        body.description || null,
        body.department_id || null,
        body.objective_id || null,
        body.dri_user_id || null,
        body.progress_percentage ?? 0,
        body.start_date || null,
        body.end_date || null,
        body.priority || 'P1',
        body.status || 'not_started',
        body.color || '#4573d2',
        displayOrder,
        body.document_link || null,
        now,
        now
      ]
    );

    const projectId = project?.id;

    // Add working group members
    if (body.working_group_ids && body.working_group_ids.length > 0 && projectId) {
      for (const userId of body.working_group_ids) {
        await execute(
          'INSERT INTO project_working_group (project_id, user_id, created_at) VALUES ($1, $2, $3)',
          [projectId, userId, now]
        );
      }
    }

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
