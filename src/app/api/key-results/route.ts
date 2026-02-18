import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, getCurrentTimestamp } from '@/src/lib/db';
import { KeyResult, CreateKeyResult } from '@/src/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const objectiveId = searchParams.get('objective_id');

    let sqlQuery = 'SELECT * FROM key_results';
    const params: string[] = [];

    if (objectiveId) {
      sqlQuery += ' WHERE objective_id = $1';
      params.push(objectiveId);
    }

    sqlQuery += ' ORDER BY code';

    const keyResults = await query<KeyResult>(sqlQuery, params);

    return NextResponse.json({ data: keyResults });
  } catch (error) {
    console.error('Error fetching key results:', error);
    return NextResponse.json({ error: 'Failed to fetch key results' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateKeyResult = await request.json();

    if (!body.objective_id || !body.code || !body.title || body.target_value === undefined) {
      return NextResponse.json(
        { error: 'Objective ID, code, title, and target value are required' },
        { status: 400 }
      );
    }

    const now = getCurrentTimestamp();

    // If setting as top KR, clear any existing top KR in the same department first (one per department)
    if (body.is_top_kr) {
      // Get the department_id for this objective
      const objective = await queryOne<{ department_id: number }>(
        'SELECT department_id FROM objectives WHERE id = $1',
        [body.objective_id]
      );
      if (objective) {
        // Clear top KR only for KRs in the same department
        await execute(
          `UPDATE key_results SET is_top_kr = FALSE
           WHERE is_top_kr = TRUE
           AND objective_id IN (SELECT id FROM objectives WHERE department_id = $1)`,
          [objective.department_id]
        );
      }
    }

    const keyResult = await queryOne<KeyResult>(
      `INSERT INTO key_results (
        objective_id, code, title, description,
        baseline_value, baseline_label, target_value, target_label,
        current_value, current_label, unit_type, direction, target_date,
        is_top_kr, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        body.objective_id,
        body.code,
        body.title,
        body.description || null,
        body.baseline_value ?? null,
        body.baseline_label || null,
        body.target_value,
        body.target_label || null,
        body.current_value ?? 0,
        body.current_label || null,
        body.unit_type || 'number',
        body.direction || 'increase',
        body.target_date || null,
        body.is_top_kr || false,
        now,
        now
      ]
    );

    return NextResponse.json({ data: keyResult }, { status: 201 });
  } catch (error) {
    console.error('Error creating key result:', error);
    return NextResponse.json({ error: 'Failed to create key result' }, { status: 500 });
  }
}
