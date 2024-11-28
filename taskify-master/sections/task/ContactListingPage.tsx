'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import PageContainer from '@/components/layout/page-container';
import ContactTable from './ContactTable';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import {
  Plus,
  Clipboard,
  MapPin,
  XCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Modal } from '@/components/ui/modal';
import MapWithAvatars from '@/components/maps/MapWithAvatars';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Contacts', link: '/dashboard/contacts' }
];

interface Contact {
  email: string | undefined;
  title: string | undefined;
  workLatitude: null;
  workLongitude: null;
  id: number;
  display_name: string;
  primary_email: string | string[] | null;
  secondary_email: string | string[] | null;
  home_phone: string | null;
  work_phone: string | null;
  mobile_number: string | null;

  // Address fields
  home_address: string | null;
  home_city: string | null;
  home_state: string | null;
  home_zipcode: string | null;
  home_country: string | null;

  work_address: string | null;
  work_city: string | null;
  work_state: string | null;
  work_zipcode: string | null;
  work_country: string | null;

  // Other fields
  organization: string | null;
  job_title: string | null;
  department: string | null;
  h_latitude: string | null;
  h_longitude: string | null;
  w_latitude: string | null;
  w_longitude: string | null;
}

export default function ContactListingPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setLoading(true);
    try {
      const res = await fetch('/api/addressbook/list', {
        method: 'GET',
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      } else {
        throw new Error('Failed to fetch contacts');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: (
          <div className="text-red-500">
            <XCircle className="mr-2 inline-block" /> {error.message}
          </div>
        )
      });
    } finally {
      setLoading(false);
    }
  }

  async function syncContacts() {
    setLoading(true);
    try {
      const res = await fetch('/api/addressbook/insert', {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: (
            <div className="text-green-500">
              <CheckCircle className="mr-2 inline-block" /> Contacts synced
              successfully from address book
            </div>
          )
        });
        fetchContacts(); // Refresh contacts list after syncing
      } else {
        throw new Error('Failed to sync contacts');
      }
    } catch (error) {
      const errorAsError = error as Error;
      toast({
        title: 'Error',
        description: (
          <div className="text-red-500">
            <XCircle className="mr-2 inline-block" /> {errorAsError.message}
          </div>
        )
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(contactId: number) {
    if (!userId) {
      console.error('User ID is undefined');
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch('/api/addressbook/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, userId }),
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Success',
          description: (
            <div className="text-green-500">
              <CheckCircle className="mr-2 inline-block" /> Contact deleted
              successfully
            </div>
          )
        });
        fetchContacts();
      } else {
        throw new Error(`Failed to delete contact: ${data.message}`);
      }
    } catch (error) {
      const errorAsError = error as Error;
      toast({
        title: 'Error',
        description: (
          <div className="text-red-500">
            <XCircle className="mr-2 inline-block" /> {errorAsError.message}
          </div>
        )
      });
    } finally {
      setDeleting(false);
    }
  }

  const handleUpdate = async (updatedContact: Contact) => {
    console.log('Updating contact with data: ', updatedContact); // Add this log

    const contactData = {
      contactId: updatedContact.id,
      display_name: updatedContact.display_name,
      primary_email: updatedContact.primary_email,
      secondary_email: updatedContact.secondary_email,
      home_phone: updatedContact.home_phone,
      work_phone: updatedContact.work_phone,
      mobile_number: updatedContact.mobile_number,
      home_address: updatedContact.home_address,
      work_address: updatedContact.work_address,
      home_city: updatedContact.home_city,
      home_state: updatedContact.home_state,
      home_zipcode: updatedContact.home_zipcode,
      home_country: updatedContact.home_country,
      work_city: updatedContact.work_city,
      work_state: updatedContact.work_state,
      work_zipcode: updatedContact.work_zipcode,
      work_country: updatedContact.work_country,
      job_title: updatedContact.job_title,
      department: updatedContact.department,
      organization: updatedContact.organization,
      h_latitude: updatedContact.h_latitude,
      h_longitude: updatedContact.h_longitude,
      w_latitude: updatedContact.w_latitude,
      w_longitude: updatedContact.w_longitude
    };

    try {
      const res = await fetch('/api/addressbook/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData),
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to update contact');
      }

      toast({
        title: 'Success',
        description: 'Contact updated successfully'
      });

      fetchContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contact',
        variant: 'destructive'
      });
    }
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading
            title={`Contacts (${contacts.length})`}
            description="Manage your contacts"
          />
          <div className="mb-4 flex justify-between gap-2 align-middle">
            <Link
              href={'/dashboard/contacts/new'}
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Link>
            <Button onClick={() => setShowMapModal(true)}>
              <MapPin className="h-5 w-5" />
              <span>See All Contacts on Map</span>
            </Button>
            <Button onClick={syncContacts} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Sync Contacts
            </Button>
          </div>
        </div>
        <Separator />

        {loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Clipboard className="mb-4 h-12 w-12 text-gray-500" />
            <p className="text-lg text-gray-500">No contacts available</p>
            <Link
              href={'/dashboard/contacts/new'}
              className={cn(buttonVariants({ variant: 'default' }), 'mt-4')}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Contact
            </Link>
          </div>
        ) : (
          <>
            <ContactTable
              contacts={contacts}
              loading={loading}
              deleting={deleting}
              onDelete={handleDelete}
              onUpdate={(contact: Partial<Contact>) => handleUpdate(contact as Contact)}
            />
            <Modal
              isOpen={showMapModal}
              title=""
              description=""
              onClose={() => setShowMapModal(false)}
            >
              <MapWithAvatars
                contacts={contacts}
                onClose={() => setShowMapModal(false)}
              />
            </Modal>
          </>
        )}
      </div>
    </PageContainer>
  );
}
