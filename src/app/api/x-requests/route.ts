import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, getCurrentTimestamp } from '@/src/lib/db';
import { XRequest, CreateXRequest } from '@/src/types';

type XRequestRow = XRequest & {
  requesting_dept_name: string;
  requesting_dept_color: string;
  requesting_user_name: string;
  requesting_user_email: string;
  requesting_user_avatar_url: string;
  requesting_project_name: string;
  requesting_task_title: string;
  target_dept_name: string;
  target_dept_color: string;
  target_user_name: string;
  target_user_email: string;
  target_user_avatar_url: string;
};

function shapeRow(r: XRequestRow): XRequest {
  if (r.requesting_department_id) {
    r.requesting_department = {
      id: r.requesting_department_id,
      name: r.requesting_dept_name,
      color: r.requesting_dept_color,
      display_order: 0,
      created_at: '',
      updated_at: '',
    };
  }
  if (r.requesting_user_id) {
    r.requesting_user = {
      id: r.requesting_user_id,
      name: r.requesting_user_name,
      email: r.requesting_user_email,
      avatar_url: r.requesting_user_avatar_url,
      created_at: '',
      updated_at: '',
    };
  }
  if (r.requesting_project_id) {
    r.requesting_project = {
      id: r.requesting_project_id,
      name: r.requesting_project_name,
    } as XRequest['requesting_project'];
  }
  if (r.requesting_task_id) {
    r.requesting_task = {
      id: r.requesting_task_id,
      title: r.requesting_task_title,
    } as XRequest['requesting_task'];
  }
  if (r.target_department_id) {
    r.target_department = {
      id: r.target_department_id,
      name: r.target_dept_name,
      color: r.target_dept_color,
      display_order: 0,
      created_at: '',
      updated_at: '',
    };
  }
  if (r.target_user_id) {
    r.target_user = {
      id: r.target_user_id,
      name: r.target_user_name,
      email: r.target_user_email,
      avatar_url: r.target_user_avatar_url,
      created_at: '',
      updated_at: '',
    };
  }
  return r;
}

const BASE_QUERY = `
  SELECT
    xr.*,
    rd.name  AS requesting_dept_name,  rd.color  AS requesting_dept_color,
    ru.name  AS requesting_user_name,  ru.email  AS requesting_user_email,  ru.avatar_url AS requesting_user_avatar_url,
    rp.name  AS requesting_project_name,
    rt.title AS requesting_task_title,
    td.name  AS target_dept_name,      td.color  AS target_dept_color,
    tu.name  AS target_user_name,      tu.email  AS target_user_email,      tu.avatar_url AS target_user_avatar_url
  FROM x_requests xr
  LEFT JOIN departments  rd ON xr.requesting_department_id = rd.id
  LEFT JOIN users        ru ON xr.requesting_user_id       = ru.id
  LEFT JOIN projects     rp ON xr.requesting_project_id    = rp.id
  LEFT JOIN project_tasks rt ON xr.requesting_task_id      = rt.id
  LEFT JOIN departments  td ON xr.target_department_id     = td.id
  LEFT JOIN users        tu ON xr.target_user_id           = tu.id
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let sql = BASE_QUERY + ' WHERE 1=1';
    const params: (string | number)[] = [];
    let idx = 1;

    const requestingDeptId = searchParams.get('requesting_department_id');
    const targetDeptId = searchParams.get('target_department_id');
    const status = searchParams.get('status');

    if (requestingDeptId) { sql += ` AND xr.requesting_department_id = $${idx++}`; params.push(requestingDeptId); }
    if (targetDeptId)     { sql += ` AND xr.target_department_id = $${idx++}`;     params.push(targetDeptId); }
    if (status)           { sql += ` AND xr.status = $${idx++}`;                   params.push(status); }

    sql += ' ORDER BY xr.created_at DESC';

    const rows = await query<XRequestRow>(sql, params);
    return NextResponse.json({ data: rows.map(shapeRow) });
  } catch (error) {
    console.error('Error fetching x-requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateXRequest = await request.json();

    if (!body.requesting_department_id || !body.requesting_user_id || !body.target_department_id || !body.description) {
      return NextResponse.json({ error: 'requesting_department_id, requesting_user_id, target_department_id, and description are required' }, { status: 400 });
    }

    const now = getCurrentTimestamp();

    const record = await queryOne<XRequest>(
      `INSERT INTO x_requests (
        requesting_department_id, requesting_user_id, requesting_project_id, requesting_task_id,
        target_department_id, target_user_id,
        description, status, display_order, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        body.requesting_department_id,
        body.requesting_user_id,
        body.requesting_project_id || null,
        body.requesting_task_id || null,
        body.target_department_id,
        body.target_user_id || null,
        body.description,
        body.status || 'open',
        body.display_order ?? 0,
        now,
        now,
      ]
    );

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error('Error creating x-request:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
