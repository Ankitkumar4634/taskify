import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function DELETE(req: Request) {
  const secret = process.env.NEXTAUTH_SECRET;
  const cookieName = process.env.NEXTAUTH_COOKIE_NAME || 'authjs.session-token';

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined');
  }

  // @ts-ignore
  const token = await getToken({ req, secret, cookieName });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.sub;
  const { taskId } = await req.json();

  if (!taskId) {
    return NextResponse.json(
      { message: 'Task ID is required' },
      { status: 400 }
    );
  }

  const [userRows] = await pool.query<any[]>(
    'SELECT caldav_url, caldav_username, caldav_password FROM users WHERE id = ?',
    [userId]
  );

  const userCaldav = userRows[0];
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
    const [taskResult]: any = await pool.query(
      'SELECT caldav_uid FROM tasks WHERE id = ?',
      [taskId]
    );

    if (!taskResult.length) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const caldavUid = taskResult[0].caldav_uid;
    const caldavUrl = `${userCaldav.caldav_url}/calendars/${userCaldav.caldav_username}/default/${caldavUid}.ics`;

    const [dbResult]: any = await pool.query('DELETE FROM tasks WHERE id = ?', [
      taskId
    ]);

    if (dbResult.affectedRows === 0) {
      return NextResponse.json(
        { message: 'Task not found in database' },
        { status: 404 }
      );
    }

    const caldavResponse = await fetch(caldavUrl, {
      method: 'DELETE',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            `${userCaldav.caldav_username}:${userCaldav.caldav_password}`
          ).toString('base64')
      }
    });

    if (!caldavResponse.ok) {
      const errorMessage = await caldavResponse.text();
      console.error('Error deleting from CalDAV:', errorMessage);
      return NextResponse.json(
        { message: 'Failed to delete from CalDAV' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting task:', error.message);
    return NextResponse.json(
      { message: 'Error deleting task' },
      { status: 500 }
    );
  }
}
