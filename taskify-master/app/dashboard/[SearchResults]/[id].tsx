import UnifiedListTable from '@/sections/task/UnifiedListTable';

interface PageProps {
  data: any[]; // Replace 'any' with specific types, e.g., Task[] or Contact[]
  dataType: 'tasks' | 'contacts'; // Union type to distinguish between task and contact data
}

export default function Page({ data, dataType }: PageProps) {
  // Handle delete task or contact (should return a Promise<void>)
  const handleDelete = async (id: number): Promise<void> => {
    console.log('Delete item with id:', id);
    // Add your delete logic here, e.g., an API call
    // Example: await fetch(`/api/delete/${id}`, { method: 'DELETE' });
  };

  // Handle update task (should return a Promise<void>)
  const handleUpdateTask = async () => {
    // Add your update logic here, e.g., an API call
    // Example: await fetch(`/api/task/update`, { method: 'PUT', body: JSON.stringify(task) });
  };

  // Handle update contact (should return a Promise<void>)
  const handleUpdateContact = async (contact: any): Promise<void> => {
    console.log('Update contact:', contact);
    // Add your update logic here, e.g., an API call
    // Example: await fetch(`/api/contact/update`, { method: 'PUT', body: JSON.stringify(contact) });
  };

  return (
    <div>
      <UnifiedListTable
        data={data}
        dataType={dataType}
        loading={false}
        deleting={false}
        onDelete={handleDelete} // Now returns a Promise<void>
        onUpdateContact={handleUpdateContact} // Now returns a Promise<void>
        onUpdateTask={handleUpdateTask} // Now returns a Promise<void>
      />
    </div>
  );
}
