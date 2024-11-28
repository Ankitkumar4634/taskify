import { NextRequest, NextResponse } from 'next/server';
import { fetchAndProcessEvents } from '../../../../../lib/caldav';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const events = await fetchAndProcessEvents();

    // Map events to insertion promises, but only for events that do not exist in the database
    const insertPromises = events.map((event: any) => {
      const { caldav_uid, summary, description, start, end, status, location } =
        event;
      const query = `
        INSERT INTO events (caldav_uid, summary, description, start, end, status, location)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE caldav_uid = VALUES(caldav_uid)
      `;
      return pool.query(query, [
        caldav_uid,
        summary,
        description,
        start,
        end,
        status,
        location
      ]);
    });

    // Await all insertions that were not filtered out
    await Promise.all(insertPromises);

    return NextResponse.json({ message: 'Events synchronized successfully' });
  } catch (error: any) {
    console.error('Event insertion error:', error);
    return NextResponse.json(
      { error: 'Insertion failed', details: error.message },
      { status: 500 }
    );
  }
}
