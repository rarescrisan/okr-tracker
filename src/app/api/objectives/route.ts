import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, getCurrentTimestamp } from '@/src/lib/db';
import { Objective, KeyResult, CreateObjective } from '@/src/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department_id');

    let sqlQuery = `
      SELECT o.*, d.name as department_name, d.color as department_color
      FROM objectives o
      LEFT JOIN departments d ON o.department_id = d.id
    `;
    const params: string[] = [];

    if (departmentId) {
      sqlQuery += ' WHERE o.department_id = $1';
      params.push(departmentId);
    }

    sqlQuery += ' ORDER BY d.display_order, o.display_order';

    const objectives = await query<Objective & { department_name: string; department_color: string }>(
      sqlQuery,
      params
    );

    // Get key results for each objective
    for (const objective of objectives) {
      const keyResults = await query<KeyResult>(
        'SELECT * FROM key_results WHERE objective_id = $1 ORDER BY code',
        [objective.id]
      );
      objective.key_results = keyResults;
    }

    return NextResponse.json({ data: objectives });
  } catch (error) {
    console.error('Error fetching objectives:', error);
    return NextResponse.json({ error: 'Failed to fetch objectives' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateObjective = await request.json();

    if (!body.department_id || !body.code || !body.title) {
      return NextResponse.json({ error: 'Department ID, code, and title are required' }, { status: 400 });
    }

    const now = getCurrentTimestamp();

    // Get max display_order for this department
    const maxOrder = await queryOne<{ max: number | null }>(
      'SELECT MAX(display_order) as max FROM objectives WHERE department_id = $1',
      [body.department_id]
    );
    const displayOrder = body.display_order ?? ((maxOrder?.max || 0) + 1);

    const objective = await queryOne<Objective>(
      `INSERT INTO objectives (department_id, code, title, description, is_top_objective, display_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        body.department_id,
        body.code,
        body.title,
        body.description || null,
        body.is_top_objective || false,
        displayOrder,
        now,
        now
      ]
    );

    return NextResponse.json({ data: objective }, { status: 201 });
  } catch (error) {
    console.error('Error creating objective:', error);
    return NextResponse.json({ error: 'Failed to create objective' }, { status: 500 });
  }
}
