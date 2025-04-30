import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { CustomUserModel } from '@/models/custom-user';
import { UserModel } from '@/models/user';
import { TelegramSessionModel } from '@/models/telegram-session';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: NextRequest, context: RouteParams) {
  const { id } = await context.params;

  try {
    await connectDB();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const session = await TelegramSessionModel.findOne({
      userId: userId.toString()
    });
    if (!session) {
      return NextResponse.json(
        { error: 'Telegram session not found' },
        { status: 404 }
      );
    }

    const customUser = await CustomUserModel.findOne({
      _id: id,
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
      // Check if user exists in Telegram using ResolvePhone
      const result = await client.invoke(
        new Api.contacts.ResolvePhone({
          phone: customUser.phone.replace(/\D/g, '')
        })
      );

      const isFound = result?.users?.[0] ? true : false;
      const telegramUser = isFound ? result.users[0] : null;

      const updatedUser = await CustomUserModel.findByIdAndUpdate(
        id,
        {
          isFound,
          error: isFound ? undefined : 'User not found in Telegram',
          username:
            isFound && telegramUser && 'username' in telegramUser
              ? telegramUser.username
              : undefined,
          firstName:
            isFound && telegramUser && 'firstName' in telegramUser
              ? telegramUser.firstName
              : undefined,
          lastName:
            isFound && telegramUser && 'lastName' in telegramUser
              ? telegramUser.lastName
              : undefined,
          checked: true
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
          checked: updatedUser.checked,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString()
        }
      });
    } catch (error: any) {
      // Handle specific Telegram API errors
      if (error.errorMessage === 'PHONE_NOT_OCCUPIED') {
        const updatedUser = await CustomUserModel.findByIdAndUpdate(
          id,
          {
            isFound: false,
            error: 'This phone number is not registered on Telegram',
            checked: true
          },
          { new: true }
        );

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
            checked: updatedUser.checked,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString()
          }
        });
      }

      throw error; // Re-throw other errors
    } finally {
      if (client.connected) {
        await client.destroy();
      }
    }
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      {
        error: 'Failed to check user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
