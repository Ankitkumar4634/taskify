'use client';

import { AreaGraph } from '../area-graph';
import { BarGraph } from '../bar-graph';
import { PieGraph } from '../pie-graph';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import PageContainer from '@/components/layout/page-container';
import { RecentSales } from '../recent-sales';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Spinner from '@/components/ui/Spinner';
import { CalendarOff, CheckCircle, Sparkles, SquareCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { TaskDialog } from '@/components/modal/TaskDialog';

export default function OverViewPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [currentHint, setCurrentHint] = useState<number | null>(null);
  const [buttonText, setButtonText] = useState('Tap to Reveal a Hint ✨');
  const [tasksDueToday, setTasksDueToday] = useState([]);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [playSound, setPlaySound] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalTasks: 0,
    exceededTasks: 0,
    allTasks: 0,
    completedTasks: 0,
    createdThisMonth: 0,
    percentageChanges: {
      totalTasksChange: 0,
      completedTasksChange: 0,
      allTasksChange: 0
    }
  });
  const hints = [
    '🚀 Smart tools to automate your workflows!',
    '🧠 Predictive features that anticipate your needs!',
    '📅 Seamless calendar and task synchronization!',
    '🔍 Powerful search to find everything instantly!',
    '🏆 A personalized dashboard for better productivity!'
  ];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/dashboard/analytics');
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/user/task/due-today');
        const tasks = await response.json();
        if (tasks.length > 0 && shouldNotify()) {
          setTasksDueToday(tasks);
          setSelectedTask(tasks[0]);
          setDialogOpen(true);
          playNotificationSound();
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const handleClick = () => {
    const nextHint =
      currentHint === null ? 0 : (currentHint + 1) % hints.length;
    setCurrentHint(nextHint);
    setButtonText(nextHint === 0 ? 'Tap for More ✨' : 'More Hints ✨');
  };

  const shouldNotify = (): boolean => {
    const lastDismissed = localStorage.getItem('lastDismissed');
    const today = new Date().toDateString();
    return lastDismissed !== today;
  };

  const dismissNotification = () => {
    const today = new Date().toDateString();
    localStorage.setItem('lastDismissed', today);
    setDialogOpen(false);
  };

  const remindLater = () => {
    setDialogOpen(false);
  };

  const playNotificationSound = () => {
    if (playSound) {
      const audio = new Audio('./notification.mp3');
      audio.play();
    }
  };

  const nextTask = () => {
    setSelectedTaskIndex((prevIndex) => (prevIndex + 1) % tasksDueToday.length);
  };

  return (
    <PageContainer scrollable={true}>
      <TaskDialog
        task={tasksDueToday[selectedTaskIndex]}
        isOpen={dialogOpen}
        onClose={dismissNotification}
        onRemindLater={remindLater}
        onNextTask={tasksDueToday.length > 1 ? nextTask : undefined}
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="flex items-center space-x-1 text-2xl font-bold tracking-tight">
            <span>Hi, {session?.user?.name ?? 'Welcome'}</span>
            <div className="origin-bottom animate-waveOnce text-2xl">👋</div>
          </h2>

          <div className="hidden items-center space-x-2 md:flex">
            <CalendarDateRangePicker />
            <Button>Download</Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Your Tasks
                  </CardTitle>
                  <SquareCheck className="h-4 w-4" stroke="currentColor" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? (
                      <Spinner stroke="currentColor" className="h-6 w-6" />
                    ) : (
                      analyticsData.totalTasks
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.percentageChanges.totalTasksChange}% from
                    last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Tasks
                  </CardTitle>
                  <SquareCheck className="h-4 w-4" stroke="currentColor" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? (
                      <Spinner stroke="currentColor" className="h-6 w-6" />
                    ) : (
                      analyticsData.allTasks
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.percentageChanges.allTasksChange}% from last
                    month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Tasks
                  </CardTitle>
                  <CheckCircle className="h-4 w-4" stroke="green" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? (
                      <Spinner stroke="currentColor" className="h-6 w-6" />
                    ) : (
                      analyticsData.completedTasks
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.percentageChanges.completedTasksChange}% from
                    last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Exceeded Tasks
                  </CardTitle>
                  <CalendarOff className="h-4 w-4" stroke="red" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? (
                      <Spinner stroke="currentColor" className="h-6 w-6" />
                    ) : (
                      analyticsData.exceededTasks
                    )}
                  </div>
                  {/* <p className="text-xs text-muted-foreground">
                    +0% from last month
                  </p> */}
                </CardContent>
              </Card>
            </div>
            <div className="relative h-[50vh] rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-6">
              <Sparkles className="absolute right-4 top-4 h-10 w-10 animate-sparkle text-yellow-300" />
              <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                <h1 className="text-3xl font-bold text-white">
                  Something Awesome is Coming Soon!
                </h1>
                <p className="max-w-md text-lg italic text-white/80">
                  "The best things in life are worth waiting for.{' '}
                  <span className="whitespace-nowrap">Hang tight!</span>" —
                  Jiyauddin
                </p>

                <div className="flex flex-col items-center space-y-4">
                  <Button
                    onClick={handleClick}
                    className="rounded-full bg-white px-6 py-3 text-black transition-all hover:bg-gray-200"
                  >
                    {buttonText}
                  </Button>
                  {currentHint !== null && (
                    <div className="mt-2 rounded-full bg-white px-4 py-2 text-black">
                      {hints[currentHint]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
