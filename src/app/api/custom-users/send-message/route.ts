import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { CustomUserModel } from '@/models/custom-user';
import { UserModel } from '@/models/user';
import { TelegramSessionModel } from '@/models/telegram-session';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import connectDB from '@/lib/mongodb';

export async function POST(req: Request) {
  let client: TelegramClient | null = null;

  try {
    await connectDB();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const session = await TelegramSessionModel.findOne({ userId: userId.toString() });
    if (!session) {
      return NextResponse.json(
        { error: 'Telegram session not found' },
        { status: 404 }
      );
    }

    const { userId: customUserId, message } = await req.json();
    const customUser = await CustomUserModel.findOne({
      _id: customUserId,
      userId: user._id
    });

    if (!customUser) {
      return NextResponse.json(
        { error: 'Custom user not found' },
        { status: 404 }
      );
    }

    if (!customUser.username) {
      return NextResponse.json(
        { error: 'User has no Telegram username' },
        { status: 400 }
      );
    }

    // Create Telegram client
    client = new TelegramClient(
      new StringSession(session.sessionString),
      Number(process.env.TELEGRAM_API_ID),
      process.env.TELEGRAM_API_HASH as string,
      {
        connectionRetries: 5,
        useWSS: true,
        testServers: true
      }
    );

    await client.connect();

    try {
      // Send message
      await client.sendMessage(customUser.username, { message });

      return NextResponse.json({
        success: true,
        message: 'Message sent successfully'
      });
    } finally {
      if (client.connected) {
        await client.destroy();
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
