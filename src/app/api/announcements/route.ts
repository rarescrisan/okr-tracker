import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, getCurrentTimestamp } from '@/src/lib/db';
import { Announcement, CreateAnnouncement } from '@/src/types';

type AnnouncementRow = Announcement & {
  dept_name: string;
  dept_color: string;
};

function shapeRow(r: AnnouncementRow): Announcement {
  if (r.department_id) {
    r.department = {
      id: r.department_id,
      name: r.dept_name,
      color: r.dept_color,
      display_order: 0,
      created_at: '',
      updated_at: '',
    };
  }
  return r;
}

export async function GET() {
  try {
    const rows = await query<AnnouncementRow>(
      `SELECT a.*, d.name AS dept_name, d.color AS dept_color
       FROM announcements a
       LEFT JOIN departments d ON a.department_id = d.id
       ORDER BY a.created_at DESC`
    );
    return NextResponse.json({ data: rows.map(shapeRow) });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAnnouncement = await request.json();

    if (!body.department_id || !body.author_name?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { error: 'department_id, author_name, and description are required' },
        { status: 400 }
      );
    }

    const now = getCurrentTimestamp();

    const record = await queryOne<Announcement>(
      `INSERT INTO announcements (department_id, author_name, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [body.department_id, body.author_name.trim(), body.description.trim(), now, now]
    );

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
