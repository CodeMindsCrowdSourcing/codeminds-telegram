import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { TelegramBotModel } from '@/models/telegram-bot';
import { startBot, stopBot } from '@/lib/telegram';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    await connectDB();
    const bot = await TelegramBotModel.findById(id);
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }
    return NextResponse.json(bot);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bot' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await connectDB();

    const bot = await TelegramBotModel.findById(id);
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Handle bot start/stop
    if (typeof body.isRunning === 'boolean') {
      if (body.isRunning) {
        // Start bot
        try {
          startBot(bot).catch(error => {
          });
        } catch (error) {
          return NextResponse.json({ error: 'Failed to start bot' }, { status: 500 });
        }
      } else {
        // Stop bot
        try {
          await stopBot(bot);
        } catch (error) {
          return NextResponse.json({ error: 'Failed to stop bot' }, { status: 500 });
        }
      }
    }

    // Update bot in database
    const updatedBot = await TelegramBotModel.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    return NextResponse.json(updatedBot);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bot' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    await connectDB();
    const bot = await TelegramBotModel.findByIdAndDelete(id);
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Bot deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete bot' }, { status: 500 });
  }
}
