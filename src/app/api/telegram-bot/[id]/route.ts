import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { TelegramBotModel } from '@/models/telegram-bot';
import { startBot, stopBot } from '@/lib/telegram';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    await connectDB();
    const bot = await TelegramBotModel.findById(id);
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // If bot should be running but isn't, restart it
    if (bot.isRunning) {
      try {
        await startBot(bot);
      } catch (error) {}
    }

    return NextResponse.json(bot);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bot' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await connectDB();

    const bot = await TelegramBotModel.findById(id);
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Handle bot start/stop
    if (
      typeof body.isRunning === 'boolean' &&
      body.isRunning !== bot.isRunning
    ) {
      if (body.isRunning) {
        // Start bot
        try {
          await startBot(bot);
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to start bot' },
            { status: 500 }
          );
        }
      } else {
        // Stop bot
        try {
          await stopBot(bot);
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to stop bot' },
            { status: 500 }
          );
        }
      }
    }

    // Update bot in database with all fields
    const updatedBot = await TelegramBotModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(body.name && { name: body.name }),
          ...(body.token && { token: body.token }),
          ...(typeof body.isRunning === 'boolean' && {
            isRunning: body.isRunning
          }),
          ...(body.buttonText && { buttonText: body.buttonText }),
          ...(body.infoText && { infoText: body.infoText }),
          ...(body.authorId && { authorId: body.authorId }),
          ...(body.linkImage && { linkImage: body.linkImage }),
          ...(body.buttonPrivateMessage && {
            buttonPrivateMessage: body.buttonPrivateMessage
          }),
          ...(body.messagePrivateMessage && {
            messagePrivateMessage: body.messagePrivateMessage
          }),
          ...(body.messageOnClick && { messageOnClick: body.messageOnClick })
        }
      },
      { new: true }
    );

    return NextResponse.json(updatedBot);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update bot' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    await connectDB();
    const bot = await TelegramBotModel.findByIdAndDelete(id);
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Bot deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete bot' },
      { status: 500 }
    );
  }
}
