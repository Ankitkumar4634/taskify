'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Spinner from '../ui/Spinner';

const taskSchema = z.object({
  title: z.string().max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(500).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  startTime: z.string(),
  endTime: z.string()
});

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
}

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const formatDateForInput = (isoString: string) => {
  const localDate = new Date(isoString);
  const offsetDate = new Date(
    localDate.getTime() - localDate.getTimezoneOffset() * 60000
  );
  return offsetDate.toISOString().slice(0, 16);
};

export function EditTaskDialog({
  task,
  open,
  onClose,
  onUpdate
}: EditTaskDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'pending',
      startTime: task ? formatDateForInput(task.startTime) : '',
      endTime: task ? formatDateForInput(task.endTime) : ''
    }
  });

  useEffect(() => {
    if (task) {
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('status', task.status);
      setValue('startTime', formatDateForInput(task.startTime));
      setValue('endTime', formatDateForInput(task.endTime));
    }
  }, [task, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/task/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, taskId: task?.id })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Task updated successfully',
          className: 'toast-success'
        });
        onUpdate();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message,
          className: 'toast-error'
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        className: 'toast-error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="mx-auto max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="form-group">
              <label htmlFor="title" className="mb-1 block font-medium">
                Title
              </label>
              <Input {...register('title')} placeholder="Task Title" />
              {errors.title && (
                <p className="text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="status" className="mb-1 block font-medium">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full rounded border p-2"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && (
                <p className="text-red-500">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="mb-1 block font-medium">
              Description
            </label>
            <textarea
              {...register('description')}
              placeholder="Task Description"
              className="w-full rounded border p-2"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="form-group">
              <label htmlFor="startTime" className="mb-1 block font-medium">
                Start Time
              </label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  {...register('startTime')}
                  onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full"
                />
              </div>
              {errors.startTime && (
                <p className="text-red-500">{errors.startTime.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endTime" className="mb-1 block font-medium">
                End Time
              </label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  {...register('endTime')}
                  onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full"
                />
              </div>
              {errors.endTime && (
                <p className="text-red-500">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
