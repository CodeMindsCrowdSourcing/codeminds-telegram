import { NextResponse } from 'next/server';
import { TelegramUserModel } from '@/models/telegram-user';
import { TelegramBotModel } from '@/models/telegram-bot';
import { CustomUser } from '@/types/custom-user';
import connectToDatabase from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { users } = await request.json() as { users: CustomUser[] };

    if (!Array.isArray(users)) {
      return NextResponse.json(
        { error: 'Invalid users data' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get the first active bot
    const bot = await TelegramBotModel.findOne({ isRunning: true });
    if (!bot) {
      return NextResponse.json(
        { error: 'No active bot found' },
        { status: 400 }
      );
    }

    // Save only found users
    const foundUsers = users.filter(user => user.isFound);

    // Save users to database
    const savedUsers = await Promise.all(
      foundUsers.map(async (user) => {
        const telegramUser = await TelegramUserModel.findOneAndUpdate(
          { botId: bot._id, userId: user.phone },
          {
            botId: bot._id,
            userId: user.phone,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
          },
          { upsert: true, new: true }
        );

        // Update bot's users array
        await TelegramBotModel.findByIdAndUpdate(bot._id, {
          $addToSet: { users: telegramUser._id }
        });

        return telegramUser;
      })
    );

    return NextResponse.json({
      message: 'Users saved successfully',
      count: savedUsers.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error saving users' },
      { status: 500 }
    );
  }
}
