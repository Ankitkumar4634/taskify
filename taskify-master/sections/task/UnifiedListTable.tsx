import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Edit,
  Trash,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Building
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { EditContactDialog } from '@/components/modal/EditContactDialog';
import { EditTaskDialog } from '@/components/modal/delete-task-modal';

interface UnifiedListTableProps {
  data: any[];
  dataType: 'tasks' | 'contacts';
  loading: boolean;
  deleting: boolean;
  onDelete: (id: number) => Promise<void>;
  onUpdateContact: (item: any) => Promise<void>;
  onUpdateTask: () => void;
}

export default function UnifiedListTable({
  data,
  dataType,
  loading,
  deleting,
  onDelete,
  onUpdateContact,
  onUpdateTask
}: UnifiedListTableProps) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const openEditDialog = (item: any) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const openDeleteModal = (item: any) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      onDelete(selectedItem.id);
      setDeleteModalOpen(false);
    }
  };

  const renderRow = (item: any) => {
    if (dataType === 'contacts') {
      return (
        <>
          <TableCell className="p-4 font-medium">{item.fullName}</TableCell>
          <TableCell className="p-4">{item.email}</TableCell>
          <TableCell className="p-4">{item.phone}</TableCell>
          <TableCell className="p-4">{item.organization}</TableCell>
          <TableCell className="p-4">{item.address}</TableCell>
        </>
      );
    } else if (dataType === 'tasks') {
      return (
        <>
          <TableCell className="p-4 font-medium">{item.title}</TableCell>
          <TableCell className="p-4">
            {item.description || 'No description'}
          </TableCell>
          <TableCell className="p-4">
            {item.status === 'completed' ? (
              <CheckCircle className="mr-2 inline-block text-green-500" />
            ) : item.status === 'pending' ? (
              <AlertCircle className="mr-2 inline-block text-yellow-500" />
            ) : (
              <Clock className="mr-2 inline-block text-blue-500" />
            )}
            {item.status
              .replace('_', ' ')
              .replace(/\b\w/g, (c: any) => c.toUpperCase())}
          </TableCell>
          <TableCell className="p-4">
            <Calendar className="mr-2 inline-block text-gray-500" />
            {new Date(item.startTime).toLocaleString()}
          </TableCell>
          <TableCell className="p-4">
            <Calendar className="mr-2 inline-block text-gray-500" />
            {new Date(item.endTime).toLocaleString()}
          </TableCell>
        </>
      );
    }
  };

  return (
    <div className="h-full w-full">
      <Modal
        title="Confirm Delete"
        description={`Are you sure you want to delete "${
          selectedItem?.title || selectedItem?.fullName
        }"?`}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
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

      {dataType === 'contacts' && (
        <EditContactDialog
          contact={selectedItem}
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onUpdate={onUpdateContact}
        />
      )}
      {dataType === 'tasks' && (
        <EditTaskDialog
          task={selectedItem}
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onUpdate={onUpdateTask}
        />
      )}

      <div className="no-scrollbar hidden max-h-[80vh] overflow-y-auto rounded-lg pb-20 md:block">
        <Table className="w-full border-separate rounded-lg">
          <TableHeader>
            <TableRow>
              {dataType === 'tasks' ? (
                <>
                  <TableHead className="w-[15%]">Title</TableHead>
                  <TableHead className="w-[20%]">Description</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="w-[15%]">Start Time</TableHead>
                  <TableHead className="w-[15%]">End Time</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="w-[15%]">Full Name</TableHead>
                  <TableHead className="w-[15%]">Email</TableHead>
                  <TableHead className="w-[15%]">Phone</TableHead>
                  <TableHead className="w-[20%]">Organization</TableHead>
                  <TableHead className="w-[15%]">Address</TableHead>
                </>
              )}
              <TableHead className="w-[10%]">Actions</TableHead>
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
              : data.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer rounded-md hover:bg-muted"
                  >
                    {renderRow(item)}
                    <TableCell className="rounded-r-md p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditDialog(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-lg hover:shadow-xl"
                        >
                          <Edit className="h-5 w-5 text-primary-foreground" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary shadow-lg hover:shadow-xl"
                        >
                          <Trash className="h-5 w-5 text-secondary-foreground" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Responsive Cards for mobile view */}
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
          : data.map((item) => (
              <Card key={item.id} className="rounded-lg border p-4 shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    {dataType === 'contacts' ? item.fullName : item.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {dataType === 'contacts' ? (
                      <>
                        <Mail className="mr-2 inline-block h-4 w-4" />
                        {item.email}
                      </>
                    ) : (
                      <>
                        {item.status === 'completed' ? (
                          <CheckCircle className="mr-2 inline-block text-green-500" />
                        ) : item.status === 'pending' ? (
                          <AlertCircle className="mr-2 inline-block text-yellow-500" />
                        ) : (
                          <Clock className="mr-2 inline-block text-blue-500" />
                        )}
                        {item.status}
                      </>
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm">
                    {dataType === 'contacts' ? item.phone : item.description}
                  </p>
                  {dataType === 'contacts' ? (
                    <p className="text-sm text-gray-700">
                      <Building className="mr-2 inline-block h-4 w-4" />
                      {item.organization || 'N/A'}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm">
                        <Calendar className="mr-2 inline-block text-gray-500" />
                        <strong>Start Time:</strong>{' '}
                        {new Date(item.startTime).toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <Calendar className="mr-2 inline-block text-gray-500" />
                        <strong>End Time:</strong>{' '}
                        {new Date(item.endTime).toLocaleString()}
                      </p>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditDialog(item)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg hover:shadow-xl"
                    >
                      <Edit className="text-primary-foreground" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(item)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      <Trash className="text-secondary-foreground" />
                    </button>
                  </div>
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
}
