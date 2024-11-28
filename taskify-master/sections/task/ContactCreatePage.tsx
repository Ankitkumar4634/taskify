'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import MapWithMarker from '@/components/maps/address-map';

// Zod schema for form validation
const contactSchema = z.object({
  first_name: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  last_name: z.string().min(2, { message: 'Last name must be at least 2 characters.' }).optional().nullable(),
  display_name: z.string().min(2, { message: 'Display name must be at least 2 characters.' }).optional().nullable(),
  primary_email: z.string().email({ message: 'Please provide a valid email.' }).optional().nullable(),
  secondary_email: z.string().email({ message: 'Please provide a valid email.' }).optional().nullable(),
  home_phone: z.string().nullable().optional(),
  work_phone: z.string().nullable().optional(),
  mobile_number: z.string().nullable().optional(),
  h_latitude: z.number().nullable().optional(),
  h_longitude: z.number().nullable().optional(),
  w_latitude: z.number().nullable().optional(),
  w_longitude: z.number().nullable().optional(),
});

export default function CreateContactForm() {
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      display_name: '',
      primary_email: '',
      secondary_email: '',
      home_phone: '',
      work_phone: '',
      mobile_number: '',
      h_latitude: undefined,
      h_longitude: undefined,
      w_latitude: undefined,
      w_longitude: undefined,
    }
  });

  const [loading, setLoading] = React.useState(false);

  async function onSubmit(values: z.infer<typeof contactSchema>) {
    const payload = { ...values };
    setLoading(true);
    try {
      const response = await fetch('/api/addressbook/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create contact');
      }

      toast({
        title: 'Success',
        description: 'Contact created successfully!'
      });
      form.reset();
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while creating the contact.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full w-full">
      <div className="flex-1 space-y-6 p-4 sm:p-8">
        <div className="flex items-start justify-between">
          <h2>Create New Contact</h2>
        </div>
        <div className="no-scrollbar max-h-[80vh] overflow-y-auto rounded-lg pb-20">
          <Card className="w-full rounded-lg">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                Create New Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            First Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter first name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Last Name <span className="text-red-500">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ''} placeholder="Enter last name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="display_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Display Name <span className="text-red-500">(optional)</span>
                          </FormLabel>
                          <FormControl>
                           <Input {...field} placeholder="Enter display name" value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="primary_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Primary Email <span className="text-red-500">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter email" value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="secondary_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Email (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter secondary email" value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobile_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter mobile number" value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="home_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Home Phone (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter home phone" value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="work_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Phone (optional)</FormLabel>
                          <FormControl>
                           <Input {...field} placeholder="Enter work phone" value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="mb-2">Home Location</h3>
                      <MapWithMarker
  initialLatLng={{
    lat: form.watch('h_latitude') || 0,
    lng: form.watch('h_longitude') || 0,
  }}
  onLocationSelect={({ lat, lng }) => {
    console.log('Location selected:', lat, lng);
    form.setValue('h_latitude', lat);
    form.setValue('h_longitude', lng);
  }}
/>

                    </div>
                    <div>
                      <h3 className="mb-2">Work Location</h3>
                      <MapWithMarker
                        initialLatLng={{
                          lat: form.watch('w_latitude') || 0,
                          lng: form.watch('w_longitude') || 0,
                        }}
                        onLocationSelect={({ lat, lng }) => {
                          form.setValue('w_latitude', lat);
                          form.setValue('w_longitude', lng);
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Submitting...' : 'Create Contact'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
