import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, getJwtSecret());

      if (payload.role !== 'view' && payload.role !== 'admin') {
        return NextResponse.json({ valid: false, error: 'Invalid role in token' });
      }

      return NextResponse.json({
        valid: true,
        role: payload.role,
      });
    } catch {
      return NextResponse.json({ valid: false, error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
