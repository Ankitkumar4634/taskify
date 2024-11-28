import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'contacts';

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    let results = [];

    if (type === 'contacts') {
      const [contactsRows]: any = await pool.query(
        `SELECT id, fullName, email, phone, address, organization, title 
         FROM contacts 
         WHERE fullName LIKE ? OR email LIKE ? OR phone LIKE ?`,
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );
      results = contactsRows;
    } else if (type === 'tasks') {
      const [tasksRows]: any = await pool.query(
        `SELECT id, title, description, startTime, endTime, status 
         FROM tasks 
         WHERE title LIKE ? OR description LIKE ?`,
        [`%${query}%`, `%${query}%`]
      );
      results = tasksRows;
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error fetching search results:', error);
    return NextResponse.json(
      { message: 'Error fetching search results' },
      { status: 500 }
    );
  }
}
