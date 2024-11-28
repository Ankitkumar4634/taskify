import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';

export const fetchAndProcessEvents = async () => {
  const caldavUrl =
    'https://www.fgquest.net/dav.php/calendars/8wiretest/default/';
  const username = '8wiretest';
  const password = '8wiretest654123!!';

  try {
    const response = await fetch(caldavUrl, {
      method: 'REPORT',
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        Depth: '1',
        Authorization:
          'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      },
      body: `<?xml version="1.0" encoding="UTF-8"?>
        <c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
          <d:prop>
            <d:getetag/>
            <c:calendar-data/>
          </d:prop>
          <c:filter>
            <c:comp-filter name="VCALENDAR">
              <c:comp-filter name="VEVENT"/>
            </c:comp-filter>
          </c:filter>
        </c:calendar-query>`
    });

    if (!response.ok)
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    const data = await response.text();
    const parsedData = await parseStringPromise(data);

    const events =
      parsedData['d:multistatus']['d:response']?.map((res: any) => {
        const calendarData =
          res['d:propstat'][0]['d:prop'][0]['cal:calendar-data'][0];
        return extractEventDetails(calendarData);
      }) || [];

    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

const extractEventDetails = (calendarData: string) => {
  const details: any = {};
  calendarData.split('\n').forEach((line) => {
    if (line.startsWith('UID:'))
      details.caldav_uid = line.split('UID:')[1].trim();
    else if (line.startsWith('SUMMARY:'))
      details.summary = line.split('SUMMARY:')[1].trim();
    else if (line.startsWith('DTSTART:'))
      details.start = line.split('DTSTART:')[1].trim();
    else if (line.startsWith('DTEND:'))
      details.end = line.split('DTEND:')[1].trim();
    else if (line.startsWith('DESCRIPTION:'))
      details.description = line.split('DESCRIPTION:')[1].trim();
    else if (line.startsWith('STATUS:'))
      details.status = line.split('STATUS:')[1].trim();
    else if (line.startsWith('LOCATION:'))
      details.location = line.split('LOCATION:')[1].trim();
  });
  return details;
};
