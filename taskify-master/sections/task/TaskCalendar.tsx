'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import Spinner from '@/components/ui/Spinner';
import { Clipboard, Maximize, Minimize } from 'lucide-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Calendar', link: '/dashboard/calendar' }
];

export default function TaskCalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStart, setTaskStart] = useState(new Date());
  const [taskEnd, setTaskEnd] = useState(new Date());
  const [taskStatus, setTaskStatus] = useState('pending');
  const [isKioskMode, setIsKioskMode] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/task/list');
      if (res.ok) {
        const data = await res.json();
        setEvents(
          data.map((task: any) => ({
            ...task,
            start: parseISO(task.startTime),
            end: parseISO(task.endTime)
          }))
        );
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setTaskTitle(event.title);
    setTaskDescription(event.description);
    setTaskStart(new Date(event.start));
    setTaskEnd(new Date(event.end));
    setTaskStatus(event.status || 'pending');
    setEditDialogOpen(true);
  };

  const handleSlotSelect = ({ start, end }: any) => {
    setTaskStart(start);
    setTaskEnd(end);
    setTaskTitle('');
    setTaskDescription('');
    setTaskStatus('pending');
    setAddDialogOpen(true);
  };

  const handleAddEvent = async () => {
    const newEvent = {
      title: taskTitle,
      description: taskDescription,
      startTime: format(taskStart, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(taskEnd, "yyyy-MM-dd'T'HH:mm:ss"),
      status: taskStatus
    };

    try {
      const res = await fetch('/api/user/task/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });

      if (res.ok) {
        fetchTasks();
        setAddDialogOpen(false);
      } else {
        console.error('Failed to create task');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleTaskUpdate = async () => {
    const updatedEvent = {
      taskId: selectedEvent.id,
      title: taskTitle,
      description: taskDescription,
      startTime: format(taskStart, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(taskEnd, "yyyy-MM-dd'T'HH:mm:ss"),
      status: taskStatus
    };

    try {
      const res = await fetch('/api/user/task/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent)
      });

      if (res.ok) {
        fetchTasks();
        setEditDialogOpen(false);
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const eventStyleGetter = (event: any) => ({
    style: {
      fontSize: '12px',
      padding: '2px',
      height: '18px',
      lineHeight: '1.2',
      backgroundColor: 'blue',
      borderRadius: '4px',
      color: 'white'
    }
  });

  return (
    <PageContainer>
      <div className="">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex flex-col items-start justify-between">
          <Heading
            title="Calendar"
            description="View and manage your tasks on the calendar"
          />
          <div className="mb-4 flex items-center justify-between">
            <Button
              onClick={() => setIsKioskMode(!isKioskMode)}
              className={`ml-auto ${isKioskMode ? 'fixed z-50' : ''}`}
              style={
                isKioskMode
                  ? {
                      zIndex: 1000,
                      position: 'fixed',
                      top: '15px',
                      left: '60%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'black',
                      color: 'white'
                    }
                  : {}
              }
              variant="outline"
            >
              {isKioskMode ? (
                <Minimize className="mr-2 h-4 w-4" />
              ) : (
                <Maximize className="mr-2 h-4 w-4" />
              )}
              {isKioskMode ? 'Exit Kiosk Mode' : 'Enter Kiosk Mode'}
            </Button>
          </div>
        </div>
        <Separator />

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Clipboard className="mb-4 h-12 w-12 text-gray-500" />
            <p className="text-lg text-gray-500">No tasks available</p>
          </div>
        ) : (
          <div
            className={
              isKioskMode ? 'fixed inset-0 z-50 overflow-auto bg-white p-4' : ''
            }
          >
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{
                height: isKioskMode ? 'calc(100vh - 60px)' : '430px',
                padding: '20px',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
              onSelectEvent={handleEventClick}
              onSelectSlot={handleSlotSelect}
              selectable
              tooltipAccessor={(event) => event.description}
              eventPropGetter={eventStyleGetter}
            />
          </div>
        )}

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                aria-label="Task Title"
              />
              <Input
                placeholder="Task Description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                aria-label="Task Description"
              />
              <Input
                type="datetime-local"
                value={format(taskStart, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setTaskStart(new Date(e.target.value))}
                aria-label="Start Date"
              />
              <Input
                type="datetime-local"
                value={format(taskEnd, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setTaskEnd(new Date(e.target.value))}
                aria-label="End Date"
              />
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                aria-label="Task Status"
                className="block w-full rounded border p-2"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <DialogFooter>
                <Button onClick={handleTaskUpdate}>Update Task</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                aria-label="Task Title"
              />
              <Input
                placeholder="Task Description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                aria-label="Task Description"
              />
              <Input
                type="datetime-local"
                value={format(taskStart, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setTaskStart(new Date(e.target.value))}
                aria-label="Start Date"
              />
              <Input
                type="datetime-local"
                value={format(taskEnd, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setTaskEnd(new Date(e.target.value))}
                aria-label="End Date"
              />
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                aria-label="Task Status"
                className="block w-full rounded border p-2"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <DialogFooter>
                <Button onClick={handleAddEvent}>Add Event</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
