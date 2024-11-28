import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        display_name AS fullName, 
        primary_email AS email, 
        organization, 
        job_title AS title, 
        home_address AS homeAddress, 
        work_address AS workAddress, 
        h_latitude AS homeLatitude, 
        h_longitude AS homeLongitude, 
        w_latitude AS workLatitude, 
        w_longitude AS workLongitude
      FROM addressbook1
      WHERE h_latitude IS NOT NULL OR w_latitude IS NOT NULL
    `);

    // The 'rows' array contains the data
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}
