'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ContactListingPage component to avoid SSR
const ContactListingPage = dynamic(() => import('@/sections/task/ContactListingPage'), {
  ssr: false, // Disable SSR for this component
});

export default function Page() {
  return <ContactListingPage />;
}
