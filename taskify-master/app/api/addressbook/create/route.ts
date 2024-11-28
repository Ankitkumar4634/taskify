import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function POST(req: Request) {
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
  const Email = token.email;
  const body = await req.json();

  const {
    first_name,
    last_name,
    display_name,
    primary_email,
    secondary_email,
    work_phone,
    home_phone,
    mobile_number,
    job_title,
    department,
    organization,
    h_latitude,
    h_longitude,
    w_latitude,
    w_longitude,
  } = body;

  // Ensure "first_name" and "last_name" are mandatory
  if (!first_name || !last_name) {
    return NextResponse.json(
      { message: 'First name and last name are required' },
      { status: 400 }
    );
  }

  // Normalize emails to a string format
  let emailList = null;
  if (Array.isArray([primary_email, secondary_email])) {
    emailList = [primary_email, secondary_email].join(', '); // If it's an array, join into a string
  } else if (typeof primary_email === 'string') {
    emailList = primary_email; // If it's already a string, use as is
  }

  try {
    // Fetch CalDAV credentials from the database
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

    // Generate a random UID
    const uniqueUID = crypto.randomUUID();
    const randomCaldavUrl = `https://www.fgquest.net/dav.php/addressbooks/8wire/8wireadmin/`;

    // Sync to CalDAV
    const caldavResponse = await syncToCalDAV({
      uid: uniqueUID,
      name: display_name,
      emails: emailList,
      home_phone,
      work_phone,
      mobile_phone: mobile_number,
      job_title,
      department,
      organization,
      h_latitude,
      h_longitude,
      w_latitude,
      w_longitude,
      caldavUrl: randomCaldavUrl,
      caldavUsername: userCaldav.caldav_username,
      caldavPassword: userCaldav.caldav_password,
    });

    if (!caldavResponse.ok) {
      const errorMessage = await (caldavResponse as Response).text();
      return NextResponse.json(
        { message: 'Failed to sync with CalDAV', details: errorMessage },
        { status: 500 }
      );
    }

    // Store the vCard URL in the database
    const vcfUrl = `${randomCaldavUrl}${uniqueUID}.vcf`;

    // Insert the new contact into the database
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO addressbook1 (
        first_name,
        last_name,
        display_name,
        primary_email,
        secondary_email,
        work_phone,
        home_phone,
        mobile_number,
        job_title,
        department,
        organization,
        h_latitude,
        h_longitude,
        w_latitude,
        w_longitude,
        vcf_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        display_name,
        primary_email || null,
        secondary_email || null,
        work_phone || null,
        home_phone || null,
        mobile_number || null,
        job_title || null,
        department || null,
        organization || null,
        h_latitude || null,
        h_longitude || null,
        w_latitude || null,
        w_longitude || null,
        vcfUrl,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Failed to create contact' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Contact created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error creating contact: ${error.message}` },
      { status: 500 }
    );
  }
}

// Helper function to sync to CalDAV
async function syncToCalDAV({
  uid,
  name,
  emails,
  home_phone,
  work_phone,
  mobile_phone,
  job_title,
  department,
  organization,
  h_latitude,
  h_longitude,
  w_latitude,
  w_longitude,
  caldavUrl,
  caldavUsername,
  caldavPassword,
}: any) {
  const url = `${caldavUrl}${uid}.vcf`;

  // Construct vCard data (vCard format 4.0)
  let vcardData = `BEGIN:VCARD
VERSION:4.0
FN:${name}
UID:${uid}`;

  if (emails) vcardData += `\nEMAIL:${emails}`;
  if (home_phone) vcardData += `\nTEL;TYPE=HOME:${home_phone}`;
  if (work_phone) vcardData += `\nTEL;TYPE=WORK:${work_phone}`;
  if (mobile_phone) vcardData += `\nTEL;TYPE=CELL:${mobile_phone}`;
  if (job_title) vcardData += `\nTITLE:${job_title}`;
  if (department) vcardData += `\nDEPARTMENT:${department}`;
  if (organization) vcardData += `\nORG:${organization}`;
  if (h_latitude && h_longitude) {
    vcardData += `\nGEO:${h_latitude};${h_longitude}`;
  }
  if (w_latitude && w_longitude) {
    vcardData += `\nGEO:${w_latitude};${w_longitude}`;
  }

  vcardData += `\nEND:VCARD`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/vcard',
        Authorization:
          'Basic ' +
          Buffer.from(`${caldavUsername}:${caldavPassword}`).toString('base64'),
      },
      body: vcardData,
    });

    if (!response.ok) {
      console.error('Failed to sync vCard to CalDAV');
      return { ok: false, error: await response.text() };
    }

    return { ok: true };
 } catch (error) {
   console.error('Error syncing vCard to CalDAV:', error);
   return { ok: false, error: (error as Error).message };
 }
}
