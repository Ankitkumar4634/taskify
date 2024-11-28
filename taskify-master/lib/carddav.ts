import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
import { getToken } from 'next-auth/jwt';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';

export const fetchAndProcessContacts = async (req: Request) => {
  const secret = process.env.NEXTAUTH_SECRET;
  const cookieName = process.env.NEXTAUTH_COOKIE_NAME || 'authjs.session-token';

  if (!secret) {
    console.error('NEXTAUTH_SECRET is not defined');
    throw new Error('NEXTAUTH_SECRET is not defined');
  }

  // Get the user ID from the token
  const token = await getToken({ req, secret, cookieName });
  console.log('Token:', token); // Debug: Inspect the token object

  if (!token) {
    console.error('Unauthorized: Token not found');
    throw new Error('Unauthorized');
  }

  const userId = token.sub; // User ID from the token
  console.log('User ID:', userId); // Debug: Check the user ID

  try {
    // Fetch CardDAV credentials from the database
    const [userResult] = await pool.query<RowDataPacket[]>( 
      'SELECT caldav_username, caldav_password FROM users WHERE id = ?', 
      [userId] 
    );
    console.log('User Query Result:', userResult); // Debug: Inspect DB result for credentials

    if (userResult.length === 0) {
      console.error('User not found or CardDAV credentials missing');
      throw new Error('User not found or CardDAV credentials missing');
    }

    const { caldav_username: username, caldav_password: password } = userResult[0];
    console.log('CardDAV Credentials:', { username, password }); // Debug: Check credentials

    const carddavUrl = 'https://www.fgquest.net/dav.php/addressbooks/8wire/8wireadmin/';

    // Send the REPORT request to the CardDAV server
    const response = await fetch(carddavUrl, {
      method: 'REPORT',
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        Depth: '1',
        Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      },
      body: `<?xml version="1.0" encoding="UTF-8"?>
        <c:addressbook-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:carddav">
          <d:prop>
            <c:address-data/>
          </d:prop>
        </c:addressbook-query>`,
      timeout: 30000,
    });

    console.log('CardDAV Response Status:', response.status); // Debug: HTTP status code

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching contacts from CardDAV: ${response.status} - ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const rawData = await response.text();
    console.log('Raw XML Response:', rawData); // Debug: Full XML response

    const parsedData = await parseStringPromise(rawData);
    console.log('Parsed XML Data:', JSON.stringify(parsedData, null, 2)); // Debug: Parsed JSON structure

    // Process the address book data and extract contacts
    const contacts = parsedData['d:multistatus']['d:response']?.map((res: any) => {
      const href = res['d:href']?.[0]?.trim(); // Extract the href value
      const addressData = res['d:propstat'][0]['d:prop'][0]['card:address-data'][0];
    
      // Ensure the full VCF URL is constructed correctly
      const vcf_url = href.startsWith('http') 
        ? href // If the href is already a full URL
        : new URL(href, carddavUrl).toString(); // Combine relative URL with the base URL
    
      console.log('Constructed VCF URL:', vcf_url); // Debug: Log the constructed VCF URL
    
      const contactDetails = extractContactDetails(addressData);
      contactDetails.vcf_url = vcf_url;
      return contactDetails;
    }) || [];
    
    
    console.log('Extracted Contacts:', JSON.stringify(contacts, null, 2)); // Debug: List of processed contacts
    return contacts;

  } catch (error) {
    console.error('Error processing contacts:', error); // Debug: Log any errors
    throw error;
  }
};

// Helper function to extract contact details from the vCard data
const extractContactDetails = (addressData: string) => {
  const details: any = {};

  addressData.split('\n').forEach((line) => {
    if (line.startsWith('FN:')) {
      details.display_name = line.split('FN:')[1].trim();
    } else if (line.startsWith('N:')) {
      const parts = line.split('N:')[1].split(';');
      details.last_name = parts[0]?.trim() || '';
      details.first_name = parts[1]?.trim() || '';
    } else if (line.startsWith('EMAIL:')) {
      if (!details.primary_email) {
        details.primary_email = line.split('EMAIL:')[1].trim();
      }
    } else if (line.startsWith('EMAIL;TYPE=HOME:')) {
      details.secondary_email = line.split('EMAIL;TYPE=HOME:')[1].trim();
    } else if (line.startsWith('TEL;TYPE=WORK,VOICE:')) {
      details.work_phone = line.split('TEL;TYPE=WORK,VOICE:')[1].trim();
    } else if (line.startsWith('TEL;TYPE=HOME,VOICE:')) {
      details.home_phone = line.split('TEL;TYPE=HOME,VOICE:')[1].trim();
    } else if (line.startsWith('TEL;TYPE=CELL,VOICE:')) {
      details.mobile_number = line.split('TEL;TYPE=CELL,VOICE:')[1].trim();
    } else if (line.startsWith('ADR;TYPE=HOME:')) {
      const parts = line.split('ADR;TYPE=HOME:')[1].split(';');
      details.home_address = parts[2]?.trim() || '';
      details.home_city = parts[3]?.trim() || '';
      details.home_state = parts[4]?.trim() || '';
      details.home_zipcode = parts[5]?.trim() || '';
      details.home_country = parts[6]?.trim() || '';
    } else if (line.startsWith('ADR;TYPE=WORK:')) {
      const parts = line.split('ADR;TYPE=WORK:')[1].split(';');
      details.work_address = parts[2]?.trim() || '';
      details.work_city = parts[3]?.trim() || '';
      details.work_state = parts[4]?.trim() || '';
      details.work_zipcode = parts[5]?.trim() || '';
      details.work_country = parts[6]?.trim() || '';
    } else if (line.startsWith('TITLE:')) {
      details.job_title = line.split('TITLE:')[1].trim();
    } else if (line.startsWith('ORG:')) {
      details.organization = line.split('ORG:')[1].trim();
    } else if (line.startsWith('DEPARTMENT:')) {
      details.department = line.split('DEPARTMENT:')[1].trim();
    } else if (line.startsWith('UID:')) {
      details.uid = line.split('UID:')[1].trim();
    } else if (line.startsWith('GEO:')) {
      const geoValues = line.split('GEO:')[1].trim().split(';');
      if (!details.h_latitude && !details.h_longitude) {
        details.h_latitude = geoValues[0]?.trim() || '';
        details.h_longitude = geoValues[1]?.trim() || '';
      } else if (!details.w_latitude && !details.w_longitude) {
        details.w_latitude = geoValues[0]?.trim() || '';
        details.w_longitude = geoValues[1]?.trim() || '';
      }
    }
  });

  console.log('Extracted Contact Details:', details); // Debug: Final extracted contact details
  return details;
};

