import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function PUT(req: Request) {
  const secret = process.env.NEXTAUTH_SECRET;
  const cookieName = process.env.NEXTAUTH_COOKIE_NAME || 'authjs.session-token';

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined');
  }

  const token = await getToken({ req, secret, cookieName });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.sub;
  const body = await req.json();

  const {
    contactId,
    first_name,
    last_name,
    display_name,
    primary_email,
    secondary_email,
    work_phone,
    home_phone,
    mobile_number,
    home_address,
    home_city,
    home_state,
    home_zipcode,
    home_country,
    work_address,
    work_city,
    work_state,
    work_zipcode,
    work_country,
    job_title,
    department,
    organization,
    h_latitude,
    h_longitude,
    w_latitude,
    w_longitude,
  } = body;

  if (!contactId) {
    return NextResponse.json({ message: 'Missing contactId' }, { status: 400 });
  }

  if (!display_name) {
    return NextResponse.json(
      { message: 'Display name is required to update contact.' },
      { status: 400 }
    );
  }

  const [userResult] = await pool.query<RowDataPacket[]>(
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
    const [contactResult] = await pool.query<RowDataPacket[]>(
      'SELECT vcf_url FROM addressbook1 WHERE id = ?',
      [contactId]
    );

    if (!contactResult.length) {
      return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
    }

    const vcfUrl = contactResult[0].vcf_url;
    if (!vcfUrl) {
      return NextResponse.json({ message: 'VCF URL missing for contact' }, { status: 400 });
    }

    console.log('Updating contact at VCF URL:', vcfUrl);

    // Update the contact on the CardDAV server
    const caldavResponse = await syncToCalDAV({
      vcfUrl,
      first_name,
      last_name,
      display_name,
      primary_email,
      secondary_email,
      work_phone,
      home_phone,
      mobile_number,
      home_address,
      home_city,
      home_state,
      home_zipcode,
      home_country,
      work_address,
      work_city,
      work_state,
      work_zipcode,
      work_country,
      job_title,
      department,
      organization,
      h_latitude,
      h_longitude,
      w_latitude,
      w_longitude,
      caldavUsername: userCaldav.caldav_username,
      caldavPassword: userCaldav.caldav_password,
    });

    if (!caldavResponse.ok) {
      const errorMessage = await caldavResponse.text();
      console.error('CalDAV sync failed:', errorMessage);
      return NextResponse.json({ message: 'Failed to sync with CalDAV' }, { status: 500 });
    }

    // Update the contact in the database
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE addressbook1
       SET first_name = ?, last_name = ?, display_name = ?, primary_email = ?, secondary_email = ?, 
           work_phone = ?, home_phone = ?, mobile_number = ?, home_address = ?, home_city = ?, 
           home_state = ?, home_zipcode = ?, home_country = ?, work_address = ?, work_city = ?, 
           work_state = ?, work_zipcode = ?, work_country = ?, job_title = ?, department = ?, 
           organization = ?, h_latitude = ?, h_longitude = ?, w_latitude = ?, w_longitude = ?
       WHERE id = ?`,
      [
        first_name,
        last_name,
        display_name,
        primary_email,
        secondary_email,
        work_phone,
        home_phone,
        mobile_number,
        home_address,
        home_city,
        home_state,
        home_zipcode,
        home_country,
        work_address,
        work_city,
        work_state,
        work_zipcode,
        work_country,
        job_title,
        department,
        organization,
        h_latitude,
        h_longitude,
        w_latitude,
        w_longitude,
        contactId,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'No changes made' }, { status: 204 });
    }

    return NextResponse.json({ message: 'Contact updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating contact:', error.message);
    return NextResponse.json({ message: 'Error updating contact' }, { status: 500 });
  }
}

async function syncToCalDAV({
  first_name,
  last_name,
  display_name,
  primary_email,
  secondary_email,
  work_phone,
  home_phone,
  mobile_number,
  home_address,
  home_city,
  home_state,
  home_zipcode,
  home_country,
  work_address,
  work_city,
  work_state,
  work_zipcode,
  work_country,
  job_title,
  department,
  organization,
  h_latitude,
  h_longitude,
  w_latitude,
  w_longitude,
  caldavUsername,
  caldavPassword,
  vcfUrl, // URL of the existing contact file to update
}: any) {
  const vCardData = `
BEGIN:VCARD
VERSION:3.0
FN:${display_name || `${first_name} ${last_name}`}
EMAIL;TYPE=INTERNET:${primary_email}
EMAIL;TYPE=INTERNET;TYPE=HOME:${secondary_email || ''}
TEL;TYPE=HOME,VOICE:${home_phone || ''}
TEL;TYPE=WORK,VOICE:${work_phone || ''}
TEL;TYPE=CELL,VOICE:${mobile_number || ''}
ADR;TYPE=HOME:${home_address || ''}
ADR;TYPE=WORK:${work_address || ''}
ORG:${organization || ''}
TITLE:${job_title || ''}
DEPARTMENT:${department || ''}
UID:${vcfUrl.split('/').pop()?.replace('.vcf', '') || ''}
ADR;TYPE=HOME;TYPE=POSTAL:${home_address || ''};${home_city || ''};${home_state || ''};${home_zipcode || ''};${home_country || ''}
ADR;TYPE=WORK;TYPE=POSTAL:${work_address || ''};${work_city || ''};${work_state || ''};${work_zipcode || ''};${work_country || ''}
GEO:${h_latitude || ''};${h_longitude || ''}
GEO:${w_latitude || ''};${w_longitude || ''}
END:VCARD`;

const response = await fetch(vcfUrl, {
  method: 'PUT',
  headers: {
    Authorization:
      'Basic ' + Buffer.from(`${caldavUsername}:${caldavPassword}`).toString('base64'),
    'Content-Type': 'text/vcard',
  },
  body: vCardData,
});

return response;
}