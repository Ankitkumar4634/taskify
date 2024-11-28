'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowBigLeft, CheckCircle, ChevronLeft, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Heading } from '@/components/ui/heading';
import Spinner from '@/components/ui/Spinner';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().optional(),
  startTime: z.string().nonempty({ message: 'Start time is required.' }),
  endTime: z.string().nonempty({ message: 'End time is required.' }),
  status: z.enum(['pending', 'in_progress', 'completed'], {
    required_error: 'Please select a status.'
  })
});

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Tasks', link: '/dashboard/tasks' },
  { title: 'Create', link: '/dashboard/employee/create' }
];

export default function CreateTaskForm() {
  const [loading, setLoading] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      status: undefined
    }
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const res = await fetch('/api/user/task/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!res.ok) {
        const { message } = await res.json();
        console.error('Error creating task:', message);
        toast({
          title: 'Error',
          description: (
            <>
              <XCircle className="mr-2 inline-block text-red-500" /> Failed to
              create task with error: {message}
            </>
          )
        });
        return;
      }

      const { taskId } = await res.json();
      console.log('Task created with ID:', taskId);
      toast({
        title: 'Success',
        description: (
          <>
            <CheckCircle className="mr-2 inline-block text-green-500" /> Task
            created successfully
          </>
        )
      });
      router.push('/dashboard/tasks');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: (
          <>
            <XCircle className="mr-2 inline-block text-red-500" /> Failed to
            create task
          </>
        )
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full w-full">
      <div className="flex-1 space-y-6 p-4 sm:p-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading
            title={`Create New Task`}
            description="Enter the details of the task you want to create."
          />
          {!loading && (
            <Link
              href={'/dashboard/tasks'}
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          )}
        </div>
        <div className="no-scrollbar max-h-[80vh] overflow-y-auto rounded-lg pb-20">
          <Card className="w-full rounded-lg">
            <CardHeader>
              <CardTitle className="text-left text-2xl font-bold">
                {/* Create New Task */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">
                            Title
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="text-sm sm:text-base"
                              placeholder="Enter task title"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-lg">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="text-sm sm:text-base"
                              placeholder="Enter task description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">
                            Start Time
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="text-sm sm:text-base"
                              type="datetime-local"
                              onFocus={(e) =>
                                e.target.showPicker && e.target.showPicker()
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">
                            End Time
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="text-sm sm:text-base"
                              type="datetime-local"
                              onFocus={(e) =>
                                e.target.showPicker && e.target.showPicker()
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm sm:text-base">
                          Status
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="pending" />
                              </FormControl>
                              <FormLabel className="text-sm font-normal sm:text-base">
                                Pending
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="in_progress" />
                              </FormControl>
                              <FormLabel className="text-sm font-normal sm:text-base">
                                In Progress
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="completed" />
                              </FormControl>
                              <FormLabel className="text-sm font-normal sm:text-base">
                                Completed
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Create Task'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
