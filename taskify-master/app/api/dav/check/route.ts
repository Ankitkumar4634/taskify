import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function GET(req: Request) {
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

  const [rows] = await pool.query<any[]>(
    'SELECT caldav_url FROM users WHERE id = ?',
    [userId]
  );

  const hasCredentials = !!rows[0]?.caldav_url;

  return NextResponse.json({ hasCredentials });
}
