import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: any) {
  console.log('Received a request for /api/dav/create');

  if (req.method !== 'POST') {
    console.log('Invalid HTTP method used:', req.method);
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { title, description, startDate, endDate } = await req.json();
    console.log('Request payload:', { title, description, startDate, endDate });

    if (!title || !startDate || !endDate) {
      console.log('Missing required fields in the request payload');
      return NextResponse.json(
        { error: 'Title, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Define the URL for the CalDAV calendar
    const url = `https://www.fgquest.net/dav.php/calendars/8wiretest/default/${Date.now()}.ics`;

    // Generate a unique UID for the event
    const uniqueUID = `${Date.now()}@example.com`;

    // Create the ICS format for the event
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Organization//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${uniqueUID}
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d{3}/g, '')}
DTSTART:${new Date(startDate).toISOString().replace(/-|:|\.\d{3}/g, '')}
DTEND:${new Date(endDate).toISOString().replace(/-|:|\.\d{3}/g, '')}
SUMMARY:${title}
DESCRIPTION:${description || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    console.log('ICS data created:', icsData);

    // Send the PUT request to the WebDAV server
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/calendar',
        Authorization:
          'Basic ' +
          Buffer.from('8wiretest:8wiretest654123!!').toString('base64')
      },
      body: icsData
    });

    // Handle the response from the WebDAV server
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error('Error creating event:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    console.log('Event created successfully');
    const data = await response.text();
    return NextResponse.json({ message: 'Event created successfully', data });
  } catch (error: any) {
    console.error('Error in API route:', error.message);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
