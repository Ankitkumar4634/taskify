import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

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

  const body = await req.json();
  const { caldav_url, caldav_username, caldav_password } = body;

  if (!caldav_url || !caldav_username || !caldav_password) {
    return NextResponse.json(
      { message: 'All fields are required.' },
      { status: 400 }
    );
  }

  //   const hashedPassword = await bcrypt.hash(caldav_password, 10);

  try {
    await pool.query(
      `UPDATE users SET caldav_url = ?, caldav_username = ?, caldav_password = ?, caldavConfigured = ? WHERE id = ?`,
      [caldav_url, caldav_username, caldav_password, true, token.id]
    );

    return NextResponse.json(
      { message: 'CalDAV credentials saved successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving CalDAV credentials:', error);
    return NextResponse.json(
      { message: 'Error saving CalDAV credentials.' },
      { status: 500 }
    );
  }
}
