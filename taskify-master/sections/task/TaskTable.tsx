import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash,
  Edit
} from 'lucide-react';
import { EditTaskDialog } from '@/components/modal/delete-task-modal';
import { Modal } from '@/components/ui/modal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/Spinner';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
}

interface TaskTableProps {
  tasks: Task[];
  loading: boolean;
  deleting: boolean;
  onDelete: (taskId: number) => void;
  onUpdate: () => void;
}

export default function TaskTable({
  tasks,
  loading,
  deleting,
  onDelete,
  onUpdate
}: TaskTableProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const openDeleteModal = (task: Task) => {
    setSelectedTask(task);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTask) {
      onDelete(selectedTask.id);
      // setDeleteModalOpen(false);
    }
  };

  return (
    <div className="h-full w-full">
      <EditTaskDialog
        task={selectedTask}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onUpdate={onUpdate}
      />
      <Modal
        title="Confirm Delete"
        description={`Are you sure you want to delete the task "${selectedTask?.title}"?`}
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) setDeleteModalOpen(false);
        }}
      >
        <div className="mt-4 flex justify-end space-x-4">
          <Button
            onClick={() => setDeleteModalOpen(false)}
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

      <div className="no-scrollbar hidden max-h-[80vh] overflow-y-auto rounded-lg pb-20 md:block">
        <Table className="w-full border-separate rounded-lg">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%] rounded-l-md">Title</TableHead>
              <TableHead className="w-[20%]">Description</TableHead>
              <TableHead className="w-[15%]">Status</TableHead>
              <TableHead className="w-[15%]">Start Time</TableHead>
              <TableHead className="w-[15%]">End Time</TableHead>
              <TableHead className="w-[10%] rounded-r-md">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from(Array(5).keys()).map((key) => (
                  <TableRow key={key} className="rounded-lg">
                    <TableCell className="p-4">
                      <Skeleton className="h-6 w-3/4" />
                    </TableCell>
                    <TableCell className="p-4">
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                    <TableCell className="p-4">
                      <Skeleton className="h-6 w-1/2" />
                    </TableCell>
                    <TableCell className="p-4">
                      <Skeleton className="h-6 w-1/3" />
                    </TableCell>
                    <TableCell className="p-4">
                      <Skeleton className="h-6 w-1/3" />
                    </TableCell>
                    <TableCell className="p-4">
                      <Skeleton className="h-6 w-1/4" />
                    </TableCell>
                  </TableRow>
                ))
              : tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer rounded-md hover:bg-muted"
                  >
                    <TableCell className="rounded-l-md p-4 font-medium">
                      {task.title}
                    </TableCell>
                    <TableCell className="p-4">
                      {task.description || 'No description'}
                    </TableCell>
                    <TableCell className="p-4">
                      {task.status === 'completed' ? (
                        <CheckCircle className="mr-2 inline-block text-green-500" />
                      ) : task.status === 'pending' ? (
                        <AlertCircle className="mr-2 inline-block text-yellow-500" />
                      ) : (
                        <Clock className="mr-2 inline-block text-blue-500" />
                      )}
                      {task.status
                        .replace('_', ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </TableCell>
                    <TableCell className="p-4">
                      <Calendar className="mr-2 inline-block text-gray-500" />
                      {new Date(task.startTime).toLocaleString()}
                    </TableCell>
                    <TableCell className="p-4">
                      <Calendar className="mr-2 inline-block text-gray-500" />
                      {new Date(task.endTime).toLocaleString()}
                    </TableCell>
                    <TableCell className="rounded-r-md p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditDialog(task)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-lg hover:shadow-xl dark:bg-primary-foreground"
                        >
                          <Edit className="size-5 text-primary-foreground dark:text-primary" />
                        </button>

                        <button
                          onClick={() => openDeleteModal(task)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary shadow-lg hover:shadow-xl dark:bg-secondary-foreground"
                        >
                          <Trash className="size-5 text-secondary-foreground dark:text-secondary" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="no-scrollbar block max-h-[80vh] space-y-4 overflow-y-auto rounded-lg p-2 pb-40 md:hidden">
        {loading
          ? Array.from(Array(5).keys()).map((key) => (
              <Card key={key} className="rounded-lg border p-4 shadow-lg">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-2 h-6 w-full" />
                <Skeleton className="mb-2 h-6 w-1/2" />
                <Skeleton className="mb-2 h-6 w-1/3" />
                <Skeleton className="h-6 w-1/3" />
              </Card>
            ))
          : tasks.map((task) => (
              <Card key={task.id} className="rounded-lg border p-4 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {task.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {task.status === 'completed' ? (
                      <CheckCircle className="mr-2 inline-block text-green-500" />
                    ) : task.status === 'pending' ? (
                      <AlertCircle className="mr-2 inline-block text-yellow-500" />
                    ) : (
                      <Clock className="mr-2 inline-block text-blue-500" />
                    )}
                    {task.status}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm">
                    {task.description || 'No description'}
                  </p>
                  <p className="text-sm">
                    <Calendar className="mr-2 inline-block text-gray-500" />
                    <strong>Start Time:</strong>{' '}
                    {new Date(task.startTime).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <Calendar className="mr-2 inline-block text-gray-500" />
                    <strong>End Time:</strong>{' '}
                    {new Date(task.endTime).toLocaleString()}
                  </p>
                </CardContent>

                <CardFooter className="flex justify-end">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditDialog(task)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg hover:shadow-xl dark:bg-primary-foreground"
                    >
                      <Edit className="text-primary-foreground dark:text-primary" />
                    </button>

                    <button
                      onClick={() => openDeleteModal(task)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary shadow-lg hover:shadow-xl dark:bg-secondary-foreground"
                    >
                      <Trash className="text-secondary-foreground dark:text-secondary" />
                    </button>
                  </div>
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
}
