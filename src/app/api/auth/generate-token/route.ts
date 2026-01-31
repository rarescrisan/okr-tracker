import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

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
    const { role, expiry } = body;

    // Validate role
    if (!role || (role !== 'view' && role !== 'admin')) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "view" or "admin"' },
        { status: 400 }
      );
    }

    // Validate expiry
    if (expiry !== 'never' && (typeof expiry !== 'number' || expiry <= 0)) {
      return NextResponse.json(
        { error: 'Invalid expiry. Must be a positive number (hours) or "never"' },
        { status: 400 }
      );
    }

    const secretBytes = getJwtSecret();

    let builder = new SignJWT({ role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt();

    if (expiry !== 'never') {
      builder = builder.setExpirationTime(`${expiry}h`);
    }

    const token = await builder.sign(secretBytes);

    return NextResponse.json({
      token,
      role,
      expiry: expiry === 'never' ? 'never' : `${expiry} hours`,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
