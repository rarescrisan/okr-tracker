import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, getCurrentTimestamp } from '@/src/lib/db';
import { XRequest, UpdateXRequest } from '@/src/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateXRequest = await request.json();

    const existing = await queryOne('SELECT * FROM x_requests WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];
    let paramIndex = 1;

    const fields: (keyof UpdateXRequest)[] = [
      'requesting_department_id', 'requesting_user_id', 'requesting_project_id', 'requesting_task_id',
      'target_department_id', 'target_user_id',
      'description', 'status', 'display_order',
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
        `UPDATE x_requests SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    }

    const record = await queryOne<XRequest>('SELECT * FROM x_requests WHERE id = $1', [id]);
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error('Error updating x-request:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await queryOne('SELECT * FROM x_requests WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await execute('DELETE FROM x_requests WHERE id = $1', [id]);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting x-request:', error);
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}
