'use client';
import { useState } from 'react';
import axios from 'axios';

const CreateTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/dav/create', {
        title,
        description,
        startDate,
        endDate
      });
      setMessage(response.data.message || 'Task created successfully');
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Create CalDAV Task</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Task Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Start Date:</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button type="submit">Create Task</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateTask;
