import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, getCurrentTimestamp } from '@/src/lib/db';
import { KeyResult, UpdateKeyResult } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const keyResult = await queryOne<KeyResult>('SELECT * FROM key_results WHERE id = $1', [id]);
    if (!keyResult) {
      return NextResponse.json({ error: 'Key result not found' }, { status: 404 });
    }

    return NextResponse.json({ data: keyResult });
  } catch (error) {
    console.error('Error fetching key result:', error);
    return NextResponse.json({ error: 'Failed to fetch key result' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateKeyResult = await request.json();

    const existing = await queryOne('SELECT * FROM key_results WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Key result not found' }, { status: 404 });
    }

    // If setting as top KR, clear any existing top KR in the same department first (one per department)
    if (body.is_top_kr) {
      // Get the department_id for this KR's objective
      const krWithDept = await queryOne<{ department_id: number }>(
        `SELECT o.department_id
         FROM key_results kr
         JOIN objectives o ON kr.objective_id = o.id
         WHERE kr.id = $1`,
        [id]
      );

      if (krWithDept) {
        // Clear top KR only for KRs in the same department (except this one)
        await execute(
          `UPDATE key_results SET is_top_kr = FALSE
           WHERE is_top_kr = TRUE
           AND id != $1
           AND objective_id IN (SELECT id FROM objectives WHERE department_id = $2)`,
          [id, krWithDept.department_id]
        );
      }
    }

    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    let paramIndex = 1;

    const fields: (keyof UpdateKeyResult)[] = [
      'objective_id', 'code', 'title', 'description',
      'baseline_value', 'baseline_label', 'target_value', 'target_label',
      'current_value', 'current_label', 'unit_type', 'direction', 'target_date', 'is_top_kr'
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        // Convert empty strings to null for date fields
        const value = body[field];
        if (field === 'target_date' && value === '') {
          values.push(null);
        } else {
          values.push(value as string | number | boolean | null ?? null);
        }
      }
    }

    if (updates.length > 0) {
      updates.push(`updated_at = $${paramIndex++}`);
      values.push(getCurrentTimestamp());
      values.push(id);

      await execute(
        `UPDATE key_results SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    }

    const keyResult = await queryOne<KeyResult>('SELECT * FROM key_results WHERE id = $1', [id]);
    return NextResponse.json({ data: keyResult });
  } catch (error) {
    console.error('Error updating key result:', error);
    return NextResponse.json({ error: 'Failed to update key result' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await queryOne('SELECT * FROM key_results WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Key result not found' }, { status: 404 });
    }

    await execute('DELETE FROM key_results WHERE id = $1', [id]);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting key result:', error);
    return NextResponse.json({ error: 'Failed to delete key result' }, { status: 500 });
  }
}
