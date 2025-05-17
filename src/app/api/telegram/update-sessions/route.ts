import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import { TelegramSessionModel } from '@/models/telegram-session';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Attempting to delete sessions for userId:', userId);
    await connectDB();

    // Check existing sessions
    const existingSessions = await TelegramSessionModel.find({ userId });
    console.log('Found existing sessions:', existingSessions);

    // Delete all sessions for this user
    const result = await TelegramSessionModel.deleteMany(
      { userId }
    );

    console.log('Delete result:', result);

    return NextResponse.json({
      success: true,
      message: 'Sessions deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting sessions:', error);
    return NextResponse.json(
      { error: 'Failed to delete sessions' },
      { status: 500 }
    );
  }
}
