import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, getCurrentTimestamp } from '@/src/lib/db';
import { TodoItem } from '@/src/types';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await queryOne<TodoItem>('SELECT * FROM todo_items WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Todo item not found' }, { status: 404 });
    }

    const now = getCurrentTimestamp();
    const updated = await queryOne<TodoItem>(
      `UPDATE todo_items SET is_completed = $1, updated_at = $2 WHERE id = $3 RETURNING *`,
      [!existing.is_completed, now, id]
    );

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error toggling todo item:', error);
    return NextResponse.json({ error: 'Failed to update todo item' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await queryOne('SELECT id FROM todo_items WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Todo item not found' }, { status: 404 });
    }

    await execute('DELETE FROM todo_items WHERE id = $1', [id]);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting todo item:', error);
    return NextResponse.json({ error: 'Failed to delete todo item' }, { status: 500 });
  }
}
