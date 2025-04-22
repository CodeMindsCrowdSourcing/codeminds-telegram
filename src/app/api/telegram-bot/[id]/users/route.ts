import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import { TelegramBotModel } from '@/models/telegram-bot';
import { TelegramUserModel } from '@/models/telegram-user';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Find the bot and check if it belongs to the user
    const bot = await TelegramBotModel.findById(params.id).populate('owner');
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Check if the bot belongs to the user
    if (bot.owner.clerkId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users for this bot
    const users = await TelegramUserModel.find({ botId: params.id });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching bot users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bot users' },
      { status: 500 }
    );
  }
} 