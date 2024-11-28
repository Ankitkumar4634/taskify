import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function POST(req: Request) {
  const secret = process.env.NEXTAUTH_SECRET;
  const cookieName = process.env.NEXTAUTH_COOKIE_NAME || 'authjs.session-token';
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined');
  }

  //@ts-ignore
  const token = await getToken({ req, secret, cookieName });

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.sub;

  try {
    await pool.query(
      `UPDATE users SET caldav_url = NULL, caldav_username = NULL, caldav_password = NULL, caldavConfigured = false WHERE id = ?`,
      [userId]
    );

    return NextResponse.json(
      { message: 'CalDAV credentials disconnected.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error disconnecting CalDAV:', error);
    return NextResponse.json(
      { message: 'Error disconnecting CalDAV.' },
      { status: 500 }
    );
  }
}
