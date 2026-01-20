import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, getCurrentTimestamp } from '@/src/lib/db';
import { Objective, KeyResult, UpdateObjective } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const objective = await queryOne<Objective & { department_name: string; department_color: string }>(
      `SELECT o.*, d.name as department_name, d.color as department_color
       FROM objectives o
       LEFT JOIN departments d ON o.department_id = d.id
       WHERE o.id = $1`,
      [id]
    );

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    const keyResults = await query<KeyResult>(
      'SELECT * FROM key_results WHERE objective_id = $1 ORDER BY code',
      [id]
    );

    objective.key_results = keyResults;

    return NextResponse.json({ data: objective });
  } catch (error) {
    console.error('Error fetching objective:', error);
    return NextResponse.json({ error: 'Failed to fetch objective' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateObjective = await request.json();

    const existing = await queryOne('SELECT * FROM objectives WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    let paramIndex = 1;

    if (body.department_id !== undefined) {
      updates.push(`department_id = $${paramIndex++}`);
      values.push(body.department_id);
    }
    if (body.code !== undefined) {
      updates.push(`code = $${paramIndex++}`);
      values.push(body.code);
    }
    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(body.title);
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(body.description || null);
    }
    if (body.is_top_objective !== undefined) {
      updates.push(`is_top_objective = $${paramIndex++}`);
      values.push(body.is_top_objective);
    }
    if (body.display_order !== undefined) {
      updates.push(`display_order = $${paramIndex++}`);
      values.push(body.display_order);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = $${paramIndex++}`);
      values.push(getCurrentTimestamp());
      values.push(id);

      await execute(
        `UPDATE objectives SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    }

    const objective = await queryOne<Objective>('SELECT * FROM objectives WHERE id = $1', [id]);
    return NextResponse.json({ data: objective });
  } catch (error) {
    console.error('Error updating objective:', error);
    return NextResponse.json({ error: 'Failed to update objective' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await queryOne('SELECT * FROM objectives WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    await execute('DELETE FROM objectives WHERE id = $1', [id]);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting objective:', error);
    return NextResponse.json({ error: 'Failed to delete objective' }, { status: 500 });
  }
}
