import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

interface CaldavCredentials {
  caldav_url: string;
  caldav_username: string;
  caldav_password: string;
}

export async function POST(req: Request) {
  const cookieName = process.env.NEXTAUTH_COOKIE_NAME || 'authjs.session-token';
  const body = await req.json();
  const { title, description, startTime, endTime, status } = body;

  if (!title || !startTime || !endTime || !status) {
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    );
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined');
  }

  // @ts-ignore
  const token = await getToken({ req, secret, cookieName });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.sub;
  const Email = token.email;

  const [rows] = await pool.query<any[]>(
    'SELECT caldav_url, caldav_username, caldav_password FROM users WHERE id = ?',
    [userId]
  );

  const userCaldav = rows[0];
  if (
    !userCaldav ||
    !userCaldav.caldav_url ||
    !userCaldav.caldav_username ||
    !userCaldav.caldav_password
  ) {
    return NextResponse.json(
      { message: 'CalDAV credentials are missing' },
      { status: 400 }
    );
  }

  try {
    const uniqueUID = `${Date.now()}-${Email}`;

    const normalizedStatus = status.toLowerCase().replace(' ', '_') as
      | 'pending'
      | 'in_progress'
      | 'completed';

    if (!['pending', 'in_progress', 'completed'].includes(normalizedStatus)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      );
    }

    const caldavResponse = await syncToCalDAV({
      title,
      description,
      startTime,
      endTime,
      status: normalizedStatus,
      uid: uniqueUID,
      caldavUrl: userCaldav.caldav_url,
      caldavUsername: userCaldav.caldav_username,
      caldavPassword: userCaldav.caldav_password
    });

    if (!caldavResponse.ok) {
      const errorMessage = await caldavResponse.text();
      console.error('CalDAV sync failed:', errorMessage);
      return NextResponse.json(
        { message: 'Failed to sync with CalDAV' },
        { status: 500 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tasks (userId, title, description, startTime, endTime, status, caldav_uid) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        description || '',
        new Date(startTime),
        new Date(endTime),
        normalizedStatus,
        uniqueUID
      ]
    );

    const taskId = result.insertId;

    return NextResponse.json(
      { message: 'Task created successfully', taskId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating task:', error.message);
    return NextResponse.json(
      { message: 'Error creating task' },
      { status: 500 }
    );
  }
}

async function syncToCalDAV({
  title,
  description,
  startTime,
  endTime,
  status,
  uid,
  caldavUrl,
  caldavUsername,
  caldavPassword
}: any) {
  const url = `${caldavUrl}/calendars/${caldavUsername}/default/${uid}.ics`;

  const validStatus =
    status === 'pending'
      ? 'TENTATIVE'
      : status === 'in_progress'
      ? 'CONFIRMED'
      : status === 'completed'
      ? 'CONFIRMED'
      : 'CONFIRMED';

  const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Organization//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d{3}/g, '')}
DTSTART:${new Date(startTime).toISOString().replace(/-|:|\.\d{3}/g, '')}
DTEND:${new Date(endTime).toISOString().replace(/-|:|\.\d{3}/g, '')}
SUMMARY:${title}
DESCRIPTION:${description || ''}
STATUS:${validStatus}
END:VEVENT
END:VCALENDAR`;

  return await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/calendar',
      Authorization:
        'Basic ' +
        Buffer.from(`${caldavUsername}:${caldavPassword}`).toString('base64')
    },
    body: icsData
  });
}
