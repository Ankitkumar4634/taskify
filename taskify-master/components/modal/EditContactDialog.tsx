'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import Spinner from '@/components/ui/Spinner';

// Schema with display_name required, lat/long as numbers and address fields
const contactSchema = z.object({
  display_name: z.string().min(2, { message: 'Display name must be at least 2 characters.' }),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  primary_email: z.string().optional().refine(val => val === '' || z.string().email().safeParse(val).success, {
    message: 'Invalid primary email address.'
  }),
  secondary_email: z.string().optional().refine(val => val === '' || z.string().email().safeParse(val).success, {
    message: 'Invalid secondary email address.'
  }),
  work_phone: z.string().optional(),
  home_phone: z.string().optional(),
  mobile_number: z.string().optional(),
  job_title: z.string().optional(),
  department: z.string().optional(),
  organization: z.string().optional(),
  // Latitudes and Longitudes as numbers
  h_latitude: z.number().optional(),
  h_longitude: z.number().optional(),
  w_latitude: z.number().optional(),
  w_longitude: z.number().optional(),
  // Address fields
  home_address: z.string().optional(),
  home_city: z.string().optional(),
  home_state: z.string().optional(),
  home_zipcode: z.string().optional(),
  home_country: z.string().optional(),
  work_address: z.string().optional(),
  work_city: z.string().optional(),
  work_state: z.string().optional(),
  work_zipcode: z.string().optional(),
  work_country: z.string().optional(),
});

interface EditContactDialogProps {
  contact: any | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (contact: any) => Promise<void>;
}

export const EditContactDialog: React.FC<EditContactDialogProps> = ({
  contact,
  open,
  onClose,
  onUpdate
}) => {
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      display_name: contact?.display_name || '',
      first_name: contact?.first_name || '',
      last_name: contact?.last_name || '',
      primary_email: contact?.primary_email || '',
      secondary_email: contact?.secondary_email || '',
      work_phone: contact?.work_phone || '',
      home_phone: contact?.home_phone || '',
      mobile_number: contact?.mobile_number || '',
      job_title: contact?.job_title || '',
      department: contact?.department || '',
      organization: contact?.organization || '',
      h_latitude: contact?.h_latitude || undefined,
      h_longitude: contact?.h_longitude || undefined,
      w_latitude: contact?.w_latitude || undefined,
      w_longitude: contact?.w_longitude || undefined,
      home_address: contact?.home_address || '',
      home_city: contact?.home_city || '',
      home_state: contact?.home_state || '',
      home_zipcode: contact?.home_zipcode || '',
      home_country: contact?.home_country || '',
      work_address: contact?.work_address || '',
      work_city: contact?.work_city || '',
      work_state: contact?.work_state || '',
      work_zipcode: contact?.work_zipcode || '',
      work_country: contact?.work_country || '',
    }
  });

  const [loading, setLoading] = useState(false);

  // Reset the form values whenever contact prop changes
  useEffect(() => {
    if (contact) {
      form.reset({
        display_name: contact.display_name || '',
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        primary_email: contact.primary_email || '',
        secondary_email: contact.secondary_email || '',
        work_phone: contact.work_phone || '',
        home_phone: contact.home_phone || '',
        mobile_number: contact.mobile_number || '',
        job_title: contact.job_title || '',
        department: contact.department || '',
        organization: contact.organization || '',
        h_latitude: contact.h_latitude || undefined,
        h_longitude: contact.h_longitude || undefined,
        w_latitude: contact.w_latitude || undefined,
        w_longitude: contact.w_longitude || undefined,
        home_address: contact.home_address || '',
        home_city: contact.home_city || '',
        home_state: contact.home_state || '',
        home_zipcode: contact.home_zipcode || '',
        home_country: contact.home_country || '',
        work_address: contact.work_address || '',
        work_city: contact.work_city || '',
        work_state: contact.work_state || '',
        work_zipcode: contact.work_zipcode || '',
        work_country: contact.work_country || '',
      });
    }
  }, [contact, form]);

  const handleSubmit = async (values: z.infer<typeof contactSchema>) => {
    if (!contact?.id || !values.display_name) {
      console.error('Missing required fields:', {
        contactId: contact?.id || 'Missing contact ID',
        display_name: values.display_name || 'Missing display name',
      });
      return;
    }

    setLoading(true);
    try {
      await onUpdate({
        id: contact.id,
        ...values,
      });
      onClose();
    } catch (error) {
      console.error('Error updating contact:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Contact"
      isOpen={open}
      onClose={() => {
        if (!loading) onClose();
      }}
      description="Edit the details of the contact."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Display Name Field */}
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* First Name Field */}
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Last Name Field */}
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Primary Email Field */}
            <FormField
              control={form.control}
              name="primary_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter primary email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Secondary Email Field */}
            <FormField
              control={form.control}
              name="secondary_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter secondary email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Work Phone Field */}
            <FormField
              control={form.control}
              name="work_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter work phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Home Phone Field */}
            <FormField
              control={form.control}
              name="home_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter home phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Mobile Number Field */}
            <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter mobile number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Job Title Field */}
            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter job title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Department Field */}
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter department" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Organization Field */}
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Home Latitude */}
            <FormField
              control={form.control}
              name="h_latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Latitude</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter home latitude" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Home Longitude */}
            <FormField
              control={form.control}
              name="h_longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Longitude</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter home longitude" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Work Latitude */}
            <FormField
              control={form.control}
              name="w_latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Latitude</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter work latitude" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Work Longitude */}
            <FormField
              control={form.control}
              name="w_longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Longitude</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter work longitude" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Home Address */}
            <FormField
              control={form.control}
              name="home_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter home address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Home City */}
            <FormField
              control={form.control}
              name="home_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter home city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Home State */}
            <FormField
              control={form.control}
              name="home_state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home State</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter home state" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Home Zipcode */}
            <FormField
              control={form.control}
              name="home_zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Zipcode</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter home zipcode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Home Country */}
            <FormField
              control={form.control}
              name="home_country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter home country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Work Address */}
            <FormField
              control={form.control}
              name="work_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter work address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Work City */}
            <FormField
              control={form.control}
              name="work_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter work city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Work State */}
            <FormField
              control={form.control}
              name="work_state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work State</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter work state" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Work Zipcode */}
            <FormField
              control={form.control}
              name="work_zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Zipcode</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter work zipcode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Work Country */}
            <FormField
              control={form.control}
              name="work_country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter work country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Update Contact'}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};
