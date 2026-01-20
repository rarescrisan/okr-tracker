import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, getCurrentTimestamp } from '@/src/lib/db';
import { User, CreateUser } from '@/src/types';

export async function GET() {
  try {
    const users = await query<User>('SELECT * FROM users ORDER BY name');
    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUser = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const now = getCurrentTimestamp();

    const user = await queryOne<User>(
      `INSERT INTO users (name, email, avatar_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [body.name, body.email || null, body.avatar_url || null, now, now]
    );

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
