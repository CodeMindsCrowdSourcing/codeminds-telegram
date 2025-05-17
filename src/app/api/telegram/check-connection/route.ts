import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TelegramSessionModel } from '@/models/telegram-session';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { isConnected: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const session = await TelegramSessionModel.findOne({
      userId,
    });

    return NextResponse.json({ isConnected: !!session });
  } catch (error) {
    console.error('Error checking Telegram connection:', error);
    return NextResponse.json(
      { isConnected: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
