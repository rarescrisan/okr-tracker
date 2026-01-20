import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, getCurrentTimestamp } from '@/src/lib/db';
import { Department, CreateDepartment } from '@/src/types';

export async function GET() {
  try {
    const departments = await query<Department>('SELECT * FROM departments ORDER BY display_order, name');
    return NextResponse.json({ data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateDepartment = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const now = getCurrentTimestamp();

    // Get max display_order
    const maxOrder = await queryOne<{ max: number | null }>('SELECT MAX(display_order) as max FROM departments');
    const displayOrder = body.display_order ?? ((maxOrder?.max || 0) + 1);

    const department = await queryOne<Department>(
      `INSERT INTO departments (name, description, color, display_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        body.name,
        body.description || null,
        body.color || '#6d6e6f',
        displayOrder,
        now,
        now
      ]
    );

    return NextResponse.json({ data: department }, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
