import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import { TelegramBotModel } from '@/models/telegram-bot';
import { TelegramUserModel } from '@/models/telegram-user';
import { UserModel } from '@/models/user';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get or create user
    let user = await UserModel.findOne({ clerkId: userId });

    if (!user) {
      // Get user data from Clerk
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json(
          { error: 'User data not found' },
          { status: 404 }
        );
      }
    }

    // Find the bot and check if it belongs to the user
    const bot = await TelegramBotModel.findById(id).populate('owner');
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Check if the bot belongs to the user
    if (bot.owner.clerkId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users for this bot
    const users = await TelegramUserModel.find({ botId: id });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bot users' },
      { status: 500 }
    );
  }
}
