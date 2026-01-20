import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, getCurrentTimestamp } from '@/src/lib/db';
import { User, UpdateUser } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await queryOne<User>('SELECT * FROM users WHERE id = $1', [id]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateUser = await request.json();

    const existing = await queryOne('SELECT * FROM users WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: (string | null)[] = [];
    let paramIndex = 1;

    if (body.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(body.name);
    }
    if (body.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(body.email || null);
    }
    if (body.avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(body.avatar_url || null);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = $${paramIndex++}`);
      values.push(getCurrentTimestamp());
      values.push(id);

      await execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    }

    const user = await queryOne<User>('SELECT * FROM users WHERE id = $1', [id]);
    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await queryOne('SELECT * FROM users WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await execute('DELETE FROM users WHERE id = $1', [id]);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
