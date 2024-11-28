'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EditContactDialog } from '@/components/modal/EditContactDialog';
import { Mail, Phone, Trash, Edit, Building, MapPin } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import Spinner from '@/components/ui/Spinner';

interface Contact {
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

interface ContactTableProps {
  contacts: Contact[];
  loading: boolean;
  deleting: boolean;
  onDelete: (id: number) => void;
  onUpdate: (contact: Partial<Contact>) => Promise<void>;
}

// Decodes phone numbers and labels each type
const decodePhones = (contact: Contact): string => {
  const phones: string[] = [];
  if (contact.home_phone) phones.push(`Home: ${contact.home_phone}`);
  if (contact.work_phone) phones.push(`Work: ${contact.work_phone}`);
  if (contact.mobile_number) phones.push(`Mobile: ${contact.mobile_number}`);
  return phones.length > 0 ? phones.join(', ') : 'N/A';
};

// Decodes addresses and labels each type
const decodeAddress = (contact: Contact): string => {
  const addresses: string[] = [];

  if (contact.home_address) {
    const homeDetails = [
      contact.home_address,
      contact.home_city,
      contact.home_state,
      contact.home_zipcode,
      contact.home_country
    ]
      .filter(Boolean) // Filter out null or undefined values
      .join(', '); // Join the details with commas
    addresses.push(`Home: ${homeDetails}`);
  }

  if (contact.work_address) {
    const workDetails = [
      contact.work_address,
      contact.work_city,
      contact.work_state,
      contact.work_zipcode,
      contact.work_country
    ]
      .filter(Boolean)
      .join(', ');
    addresses.push(`Work: ${workDetails}`);
  }

  return addresses.length > 0 ? addresses.join('; ') : 'N/A';
};

// Decodes any value and handles arrays or escape characters
const decodeValue = (value: string | string[] | null): string =>
  Array.isArray(value)
    ? value.map((v) => v.replace(/\\,/g, ',')).join(', ')
    : value?.replace(/\\,/g, ',') || 'N/A';

export default function ContactTable({
  contacts,
  loading,
  deleting,
  onDelete,
  onUpdate
}: ContactTableProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const openEditDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setEditDialogOpen(true);
  };

  const openDeleteModal = (contact: Contact) => {
    setSelectedContact(contact);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedContact) {
      onDelete(selectedContact.id); // Ensure ID is passed as a string
    }
  };

  // Close modal and reset selected contact
  const closeModal = () => {
    setEditDialogOpen(false);
    setDeleteModalOpen(false);
  };

  useEffect(() => {
    if (!editDialogOpen && !deleteModalOpen) {
      // Optionally reset the selected contact or perform other actions
      setSelectedContact(null);
    }
  }, [editDialogOpen, deleteModalOpen]);

  return (
    <div className="h-full w-full">
      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        description={`Are you sure you want to delete "${selectedContact?.display_name}"?`}
        isOpen={deleteModalOpen}
        onClose={closeModal}
      >
        <div className="mt-4 flex justify-end space-x-4">
          <Button
            onClick={closeModal}
            variant="secondary"
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button onClick={confirmDelete} disabled={deleting}>
            {deleting ? (
              <Spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </Modal>

      {/* Edit Contact Dialog */}
      <EditContactDialog
        contact={selectedContact}
        open={editDialogOpen}
        onClose={closeModal}
        onUpdate={onUpdate}
      />

      {/* Table View for Larger Screens */}
      <div className="no-scrollbar hidden md:block max-h-[80vh] overflow-y-auto">
        <Table className="w-full border-separate rounded-lg">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%]">Full Name</TableHead>
              <TableHead className="w-[15%]">Email</TableHead>
              <TableHead className="w-[15%]">Phone</TableHead>
              <TableHead className="w-[15%]">Address</TableHead>
             
              <TableHead className="w-[10%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from(Array(5).keys()).map((key) => (
                  <TableRow key={key}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <TableCell key={i} className="p-4">
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500">
                      No contacts available.
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact) => (
                    <TableRow
                      key={contact.id}
                      className="cursor-pointer hover:bg-muted"
                    >
                      <TableCell>{decodeValue(contact.display_name)}</TableCell>
                      <TableCell>{decodeValue(contact.primary_email)}</TableCell>
                      <TableCell>{decodePhones(contact)}</TableCell>
                      <TableCell>{decodeAddress(contact)}</TableCell>
                     
                      <TableCell>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditDialog(contact)}
                            aria-label={`Edit ${contact.display_name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow hover:bg-primary-dark"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(contact)}
                            aria-label={`Delete ${contact.display_name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
          </TableBody>
        </Table>
      </div>

      {/* Card View for Smaller Screens */}
      <div className="no-scrollbar block md:hidden max-h-[80vh] overflow-y-auto p-2">
        {loading
          ? Array.from(Array(5).keys()).map((key) => (
              <Card key={key} className="mb-4 rounded-lg border p-4 shadow-lg">
                <CardHeader>
                  <Skeleton className="mb-2 h-6 w-3/4" />
                  <Skeleton className="mb-2 h-6 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="mb-2 h-6 w-1/2" />
                  <Skeleton className="mb-2 h-6 w-1/2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-6 w-1/2" />
                </CardFooter>
              </Card>
            ))
          : contacts.map((contact) => (
              <Card key={contact.id} className="mb-4 rounded-lg border p-4 shadow-lg">
                <CardHeader>
                  <div className="text-lg font-bold">{decodeValue(contact.display_name)}</div>
                  <div className="text-sm text-gray-600">{decodeValue(contact.primary_email)}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">{decodePhones(contact)}</div>
                  <div className="text-sm">{decodeAddress(contact)}</div>
                  <div className="text-sm">{decodeValue(contact.job_title)}</div>
                  <div className="text-sm">{decodeValue(contact.department)}</div>
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditDialog(contact)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(contact)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
}
