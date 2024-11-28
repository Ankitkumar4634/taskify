import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function POST(req: Request) {
  console.log('Received a registration request');

  const body = await req.json();
  const { username, email, password } = body;

  console.log('Received input:', { username, email });

  if (!username || !email || !password) {
    console.error('Missing required fields');
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    console.log('Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Connecting to the database and inserting user');

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    console.log('Database operation successful:', result);

    return NextResponse.json(
      { message: 'User created successfully', userId: result.insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: `The username or email already exists.` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    );
  }
}
