import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, getCurrentTimestamp } from '@/src/lib/db';
import { TodoItem, CreateTodoItem } from '@/src/types';

export async function GET() {
  try {
    const rows = await query<TodoItem>(
      `SELECT * FROM todo_items ORDER BY is_completed ASC, display_order ASC, created_at ASC`
    );
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('Error fetching todo items:', error);
    return NextResponse.json({ error: 'Failed to fetch todo items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTodoItem = await request.json();

    if (!body.text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const now = getCurrentTimestamp();

    const record = await queryOne<TodoItem>(
      `INSERT INTO todo_items (text, is_completed, display_order, created_at, updated_at)
       VALUES ($1, FALSE, 0, $2, $3) RETURNING *`,
      [body.text.trim(), now, now]
    );

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error('Error creating todo item:', error);
    return NextResponse.json({ error: 'Failed to create todo item' }, { status: 500 });
  }
}
