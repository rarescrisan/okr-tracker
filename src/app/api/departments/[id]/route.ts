import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, getCurrentTimestamp } from '@/src/lib/db';
import { Department, UpdateDepartment, Objective, KeyResult } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const department = await queryOne<Department>('SELECT * FROM departments WHERE id = $1', [id]);
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Get objectives with key results
    const objectives = await query<Objective>(
      'SELECT * FROM objectives WHERE department_id = $1 ORDER BY display_order',
      [id]
    );

    for (const objective of objectives) {
      const keyResults = await query<KeyResult>(
        'SELECT * FROM key_results WHERE objective_id = $1 ORDER BY code',
        [objective.id]
      );
      objective.key_results = keyResults;
    }

    department.objectives = objectives;

    return NextResponse.json({ data: department });
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateDepartment = await request.json();

    const existing = await queryOne('SELECT * FROM departments WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];
    let paramIndex = 1;

    if (body.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(body.name);
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(body.description || null);
    }
    if (body.color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      values.push(body.color);
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
        `UPDATE departments SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    }

    const department = await queryOne<Department>('SELECT * FROM departments WHERE id = $1', [id]);
    return NextResponse.json({ data: department });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await queryOne('SELECT * FROM departments WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    await execute('DELETE FROM departments WHERE id = $1', [id]);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
