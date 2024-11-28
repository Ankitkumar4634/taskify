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
  const token = await getToken({
    req,
    secret,
    cookieName: cookieName
  });

  if (!token) {
    console.error('Unauthorized - No token found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.sub;

  try {
    const [tasks] = await pool.query(
      `SELECT id, title, description, startTime, endTime, status, createdAt, updatedAt
       FROM tasks
       WHERE userId = ?`,
      [userId]
    );
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { message: 'Error fetching tasks' },
      { status: 500 }
    );
  }
}
