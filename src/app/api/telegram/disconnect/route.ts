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

    // Update session to inactive
    await TelegramSessionModel.findOneAndUpdate(
      { userId },
      {
        updatedAt: new Date()
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Disconnected successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
