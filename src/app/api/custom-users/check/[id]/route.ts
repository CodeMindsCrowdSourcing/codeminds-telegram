import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import connectDB from '@/lib/mongodb';
import { CustomUserModel } from '@/models/custom-user';
import { UserModel } from '@/models/user';
import { TelegramSessionModel } from '@/models/telegram-session';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const customUser = await CustomUserModel.findOne({
      _id: params.id,
      userId: user._id
    });

    if (!customUser) {
      return NextResponse.json(
        { error: 'Custom user not found' },
        { status: 404 }
      );
    }

    // Create Telegram client with test mode configuration
    const client = new TelegramClient(
      new StringSession(session.session),
      parseInt(session.apiId),
      session.apiHash,
      {
        connectionRetries: 5,
        useWSS: true,
        testServers: session.isTestMode,
      }
    );

    await client.connect();

    try {
      // Check if user exists in Telegram
      const result = await client.invoke(
        new Api.contacts.ImportContacts({
          contacts: [
            new Api.InputPhoneContact({
              clientId: BigInt(0) as any,
              phone: customUser.phone,
              firstName: customUser.firstName || '',
              lastName: customUser.lastName || '',
            }),
          ],
        })
      );

      const isFound = result.users.length > 0;
      const telegramUser = isFound ? result.users[0] : null;

      const updatedUser = await CustomUserModel.findByIdAndUpdate(
        params.id,
        {
          isFound,
          error: isFound ? undefined : 'User not found in Telegram',
          username: isFound && telegramUser && 'username' in telegramUser ? telegramUser.username : undefined,
          firstName: isFound && telegramUser && 'firstName' in telegramUser ? telegramUser.firstName : undefined,
          lastName: isFound && telegramUser && 'lastName' in telegramUser ? telegramUser.lastName : undefined,
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      return NextResponse.json({
        success: true,
        user: {
          _id: updatedUser._id.toString(),
          phone: updatedUser.phone,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isFound: updatedUser.isFound,
          error: updatedUser.error,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString()
        }
      });
    } finally {
      await client.disconnect();
    }
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}
