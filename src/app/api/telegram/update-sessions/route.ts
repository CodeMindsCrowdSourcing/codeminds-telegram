import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import { TelegramSessionModel } from '@/models/telegram-session';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Delete all sessions for this user
    const result = await TelegramSessionModel.deleteMany(
      { userId }
    );


    return NextResponse.json({
      success: true,
      message: 'Sessions deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete sessions' },
      { status: 500 }
    );
  }
}
