import { NextRequest, NextResponse } from 'next/server';
import { fetchAndProcessContacts } from '../../../../lib/carddav';
import pool from '@/lib/db';
import { getToken } from 'next-auth/jwt';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    const cookieName = process.env.NEXTAUTH_COOKIE_NAME || 'authjs.session-token';

    if (!secret) {
      throw new Error('NEXTAUTH_SECRET is not defined');
    }

    const token = await getToken({ req, secret, cookieName });
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.sub; // The authenticated user's ID

    const contacts = await fetchAndProcessContacts(req);
    if (!Array.isArray(contacts)) {
      throw new Error('Invalid contacts data');
    }

    const insertPromises = contacts.map(async (contact) => {
      const {
        uid,
        vcf_url, // Extracted from CardDAV
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
      } = contact;

      const [existingContact] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM addressbook1 WHERE vcf_url = ?',
        [vcf_url]
      );

      if (existingContact.length === 0) {
        try {
          await pool.query(
            `INSERT INTO addressbook1 ( 
              uid, vcf_url, first_name, last_name, display_name,
              primary_email, secondary_email, work_phone, home_phone,
              mobile_number, home_address, home_city, home_state, home_zipcode,
              home_country, work_address, work_city, work_state, work_zipcode,
              work_country, job_title, department, organization, h_latitude,
              h_longitude, w_latitude, w_longitude
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

            [
              uid,
              vcf_url, // Save the vcf_url
              first_name || '',
              last_name || '',
              display_name || '',
              primary_email || '',
              secondary_email || '',
              work_phone || '',
              home_phone || '',
              mobile_number || '',
              home_address || '',
              home_city || '',
              home_state || '',
              home_zipcode || '',
              home_country || '',
              work_address || '',
              work_city || '',
              work_state || '',
              work_zipcode || '',
              work_country || '',
              job_title || '',
              department || '',
              organization || '',
              h_latitude || null,
              h_longitude || null,
              w_latitude || null,
              w_longitude || null,
            ]
          );
        } catch (err) {
          console.error(`Error inserting contact with UID ${uid}:`, err);
        }
      }
    });

    await Promise.all(insertPromises);
    return NextResponse.json({ message: 'Contacts synchronized successfully' });
  } catch (error: unknown) {
    console.error('Contact synchronization error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: 'Synchronization failed', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Synchronization failed', details: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
