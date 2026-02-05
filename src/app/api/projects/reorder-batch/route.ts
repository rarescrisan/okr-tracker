import { NextRequest, NextResponse } from 'next/server';
import { execute, getCurrentTimestamp, getPool } from '@/src/lib/db';

export async function POST(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { updates } = body as { updates: Array<{ id: number; display_order: number }> };

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Invalid updates array' }, { status: 400 });
    }

    const now = getCurrentTimestamp();

    // Use a transaction and a single query with CASE statement for maximum performance
    await client.query('BEGIN');

    // Build a single UPDATE query with CASE statement
    const ids = updates.map(u => u.id);
    const caseStatement = updates.map(u => `WHEN ${u.id} THEN ${u.display_order}`).join(' ');

    const query = `
      UPDATE projects
      SET display_order = CASE id ${caseStatement} END,
          updated_at = $1
      WHERE id = ANY($2)
    `;

    await client.query(query, [now, ids]);
    await client.query('COMMIT');

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error batch reordering projects:', error);
    return NextResponse.json({ error: 'Failed to reorder projects' }, { status: 500 });
  } finally {
    client.release();
  }
}
