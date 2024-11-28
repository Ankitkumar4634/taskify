import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const [rows] = await pool.query<any>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const user = rows[0];
    console.log('➡️   ~ POST ~ user:', user);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: 'Login successful',
        email: user.email,
        username: user.username,
        userId: user.id
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error logging in' }, { status: 500 });
  }
}
