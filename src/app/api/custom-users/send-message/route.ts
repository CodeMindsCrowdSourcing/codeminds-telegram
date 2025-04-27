import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { CustomUserModel } from '@/models/custom-user';
import { UserModel } from '@/models/user';
import { TelegramSessionModel } from '@/models/telegram-session';
import connectDB from '@/lib/mongodb';

export async function POST(req: Request) {
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

    const session = await TelegramSessionModel.findOne({ userId });
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

    // TODO: Implement actual message sending using Telegram API
    // For now, we'll just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 