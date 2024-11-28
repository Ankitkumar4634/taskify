'use client';

import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import TaskTable from './TaskTable';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Plus, Clipboard, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Tasks', link: '/dashboard/tasks' }
];

export default function TaskListingPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const res = await fetch('/api/user/task/list', {
      method: 'GET',
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    } else {
      toast({
        title: 'Error',
        description: (
          <>
            <XCircle className="mr-2 inline-block text-red-500" /> Failed to
            fetch tasks
          </>
        )
      });
    }
    setLoading(false);
  }

  async function handleDelete(taskId: number) {
    setDeleting(true);
    try {
      const res = await fetch('/api/user/task/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
        credentials: 'include'
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: (
            <>
              <CheckCircle className="mr-2 inline-block text-green-500" /> Task
              deleted successfully
            </>
          )
        });
        fetchTasks();
      } else {
        toast({
          title: 'Error',
          description: (
            <>
              <XCircle className="mr-2 inline-block text-red-500" /> Failed to
              delete task
            </>
          )
        });
      }
    } catch (error) {
      console.log('➡️   ~ handleDelete ~ error:', error);
    } finally {
      setDeleting(false);
    }
  }

  const insertTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/task/insert', { method: 'POST' });
      if (response.ok) {
        await fetchTasks();
        toast({
          title: 'Success',
          description: (
            <>
              <CheckCircle className="mr-2 inline-block text-green-500" /> Tasks
              synced successfully
            </>
          )
        });
      } else {
        toast({
          title: 'Error',
          description: (
            <>
              <XCircle className="mr-2 inline-block text-red-500" /> Failed to
              sync tasks
            </>
          )
        });
      }
    } catch (error) {
      console.error('Error syncing tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Heading
              title={`Tasks (${tasks.length})`}
              description="Manage your tasks"
            />
          </div>
          <div className="flex space-x-2">
            <Link
              href={'/dashboard/tasks/new'}
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Link>
            <Button onClick={insertTasks}>Sync Tasks With CalDav</Button>
          </div>
        </div>

        <Separator />
        {loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Clipboard className="mb-4 h-12 w-12 text-gray-500" />
            <p className="text-lg text-gray-500">No tasks available</p>
            <Link
              href={'/dashboard/tasks/new'}
              className={cn(buttonVariants({ variant: 'default' }), 'mt-4')}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Task
            </Link>
          </div>
        ) : (
          <TaskTable
            tasks={tasks}
            loading={loading}
            deleting={deleting}
            onDelete={handleDelete}
            onUpdate={fetchTasks}
          />
        )}
      </div>
    </PageContainer>
  );
}
