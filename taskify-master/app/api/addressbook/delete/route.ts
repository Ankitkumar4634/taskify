import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';

export async function DELETE(req: Request) {
  const secret = process.env.NEXTAUTH_SECRET;
  const cookieName = process.env.NEXTAUTH_COOKIE_NAME || 'authjs.session-token';

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined');
  }

  // Retrieve the token for user authentication
  const token = await getToken({ req, secret, cookieName });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.sub; // User ID from token
  const { contactId } = await req.json();

  if (!contactId) {
    return NextResponse.json(
      { message: 'Contact ID is required' },
      { status: 400 }
    );
  }

  // Fetch CalDAV credentials
  const [userResult] = await pool.query<any[]>(
    'SELECT caldav_username, caldav_password FROM users WHERE id = ?',
    [userId]
  );

  const userCaldav = userResult[0];
  if (!userCaldav || !userCaldav.caldav_username || !userCaldav.caldav_password) {
    return NextResponse.json(
      { message: 'CalDAV credentials are missing' },
      { status: 400 }
    );
  }

  try {
    // Retrieve the VCF file URL from the database
    const [contactResult]: any = await pool.query(
      `SELECT vcf_url FROM addressbook1 WHERE id = ?`,
      [contactId]
    );

    if (!contactResult.length) {
      return NextResponse.json(
        { message: 'Contact not found in database' },
        { status: 404 }
      );
    }

    const vcfUrl = contactResult[0].vcf_url;

    if (!vcfUrl) {
      return NextResponse.json(
        { message: 'VCF URL is missing for the contact' },
        { status: 400 }
      );
    }

    // Delete from the database
    const [dbResult]: any = await pool.query(
      `DELETE FROM addressbook1 WHERE id = ?`,
      [contactId]
    );

    if (dbResult.affectedRows === 0) {
      return NextResponse.json(
        { message: 'Contact not found in database during deletion' },
        { status: 404 }
      );
    }

    // Delete from CalDAV server
    const authHeader =
      'Basic ' +
      Buffer.from(
        `${userCaldav.caldav_username}:${userCaldav.caldav_password}`
      ).toString('base64');

    const caldavResponse = await fetch(vcfUrl, {
      method: 'DELETE',
      headers: { Authorization: authHeader }
    });

    if (!caldavResponse.ok) {
      const errorMessage = await caldavResponse.text();
      console.error('Error deleting from CalDAV:', errorMessage);

      // Rollback the database deletion if CalDAV deletion fails
      await pool.query(
        `INSERT INTO addressbook1 (id, vcf_url) VALUES (?, ?)`,
        [contactId, vcfUrl]
      );

      return NextResponse.json(
        { message: 'Failed to delete from CalDAV' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Contact deleted successfully from both database and CalDAV' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting contact:', error.message);
    return NextResponse.json(
      { message: 'Error deleting contact' },
      { status: 500 }
    );
  }
}
