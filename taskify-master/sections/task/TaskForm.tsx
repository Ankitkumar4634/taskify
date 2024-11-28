import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const taskSchema = z.object({
  title: z.string().max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(['Pending', 'Completed', 'Cancelled'])
});

export default function TaskForm({
  onSubmit
}: {
  onSubmit: (data: any) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(taskSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          {...register('title')}
          placeholder="Task Title"
          className="input"
        />
        {errors.title && errors.title.message && (
          <p className="error">{errors.title.message as string}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          {...register('description')}
          placeholder="Task Description (optional)"
          className="textarea"
        />
        {errors.description && errors.description.message && (
          <p className="error">{errors.description.message as string}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="startTime">Start Time</label>
        <input
          type="datetime-local"
          {...register('startTime')}
          className="input"
        />
        {errors.startTime && errors.startTime.message && (
          <p className="error">{errors.startTime.message as string}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="endTime">End Time</label>
        <input
          type="datetime-local"
          {...register('endTime')}
          className="input"
        />
        {errors.endTime && errors.endTime.message && (
          <p className="error">{errors.endTime.message as string}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select {...register('status')} className="select">
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        {errors.status && errors.status.message && (
          <p className="error">{errors.status.message as string}</p>
        )}
      </div>

      <button type="submit" className="btn">
        Submit
      </button>
    </form>
  );
}
