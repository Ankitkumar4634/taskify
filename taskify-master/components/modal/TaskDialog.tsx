'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TaskDialogProps {
  task: {
    id: number;
    title: string;
    description: string;
    status: string;
    startTime: string;
    endTime: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onRemindLater: () => void;
  onNextTask?: () => void;
}

export function TaskDialog({
  task,
  isOpen,
  onClose,
  onRemindLater,
  onNextTask
}: TaskDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Due Today</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong>Title:</strong> {task.title || 'N/A'}
          </div>
          <div>
            <strong>Description:</strong> {task.description || 'N/A'}
          </div>
          <div>
            <strong>Status:</strong> {task.status || 'N/A'}
          </div>
          <div>
            <strong>Start Time:</strong>{' '}
            {task.startTime
              ? new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                }).format(new Date(task.startTime))
              : 'N/A'}
          </div>
          <div>
            <strong>End Time:</strong>{' '}
            {task.endTime
              ? new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                }).format(new Date(task.endTime))
              : 'N/A'}
          </div>
        </div>
        <DialogFooter>
          {onNextTask && <Button onClick={onNextTask}>Next Task</Button>}
          <Button onClick={onRemindLater}>Remind Me Later</Button>
          <Button onClick={onClose} variant="destructive">
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
