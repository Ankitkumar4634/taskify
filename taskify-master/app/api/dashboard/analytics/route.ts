import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getToken } from 'next-auth/jwt';

const percentageChange = (current: number, previous: number): number =>
  previous > 0
    ? Math.round(((current - previous) / previous) * 100)
    : current > 0
    ? 100
    : 0;

export async function GET(req: Request) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    const cookieName =
      process.env.NEXTAUTH_COOKIE_NAME || 'authjs.session-token';

    if (!secret) throw new Error('NEXTAUTH_SECRET is not defined');

    //@ts-ignore
    const token: any = await getToken({ req, secret, cookieName });

    if (!token || !token.sub)
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const userId: string = token.sub;

    const [userTasksResult]: any = await pool.query(
      'SELECT COUNT(*) AS totalTasks FROM tasks WHERE userId = ?',
      [userId]
    );
    const totalTasks = userTasksResult[0]?.totalTasks ?? 0;

    const [exceededTasksResult]: any = await pool.query(
      `SELECT COUNT(*) AS exceededTasks 
       FROM tasks 
       WHERE endTime < NOW() AND status != "completed" AND userId = ?`,
      [userId]
    );
    const exceededTasks = exceededTasksResult[0]?.exceededTasks ?? 0;

    const [allTasksResult]: any = await pool.query(
      'SELECT COUNT(*) AS allTasks FROM tasks'
    );
    const allTasks = allTasksResult[0]?.allTasks ?? 0;

    const [completedTasksResult]: any = await pool.query(
      'SELECT COUNT(*) AS completedTasks FROM tasks WHERE status = "completed"'
    );
    const completedTasks = completedTasksResult[0]?.completedTasks ?? 0;

    const [createdLastMonthResult]: any = await pool.query(
      `SELECT COUNT(*) AS createdLastMonth 
       FROM tasks 
       WHERE MONTH(createdAt) = MONTH(NOW()) - 1 AND YEAR(createdAt) = YEAR(NOW())`
    );
    const createdLastMonth = createdLastMonthResult[0]?.createdLastMonth ?? 0;

    const totalTasksChange = percentageChange(totalTasks, createdLastMonth);
    const completedTasksChange = percentageChange(
      completedTasks,
      createdLastMonth
    );
    const allTasksChange = percentageChange(allTasks, createdLastMonth);

    return NextResponse.json({
      totalTasks,
      exceededTasks,
      allTasks,
      completedTasks,
      percentageChanges: {
        totalTasksChange,
        completedTasksChange,
        allTasksChange
      }
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { message: 'Error fetching analytics' },
      { status: 500 }
    );
  }
}
