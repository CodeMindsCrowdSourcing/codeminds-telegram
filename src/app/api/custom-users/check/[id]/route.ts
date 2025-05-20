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

async function processBatch(users: any[], client: TelegramClient) {
  const results = [];

  for (const user of users) {
    try {
      const cleanPhone = user.phone.replace(/\D/g, '');

      // Check if user exists in Telegram using ResolvePhone
      const result = await client.invoke(
        new Api.contacts.ResolvePhone({
          phone: cleanPhone
        })
      );

      const isFound = result?.users?.[0] ? true : false;
      const telegramUser = isFound ? result.users[0] : null;

      let username, firstName, lastName;

      if (isFound && telegramUser) {
        // Handle different types of user objects from Telegram
        if ('username' in telegramUser && telegramUser.username) {
          username = telegramUser.username;
        }
        if ('firstName' in telegramUser && telegramUser.firstName) {
          firstName = telegramUser.firstName;
        }
        if ('lastName' in telegramUser && telegramUser.lastName) {
          lastName = telegramUser.lastName;
        }

        // If we have a User object, try to get additional data
        if (telegramUser instanceof Api.User) {
          if (telegramUser.username) username = telegramUser.username;
          if (telegramUser.firstName) firstName = telegramUser.firstName;
          if (telegramUser.lastName) lastName = telegramUser.lastName;
        }
      }

      const updateData: any = {
        isFound,
        error: isFound ? undefined : 'User not found in Telegram',
        checked: true
      };

      // Only add fields that were actually found
      if (username) updateData.username = username;
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;

      results.push({
        userId: user._id,
        ...updateData
      });
    } catch (error: any) {
      if (error.errorMessage === 'PHONE_NOT_OCCUPIED') {
        results.push({
          userId: user._id,
          isFound: false,
          error: 'This phone number is not registered on Telegram',
          checked: true
        });
      } else {
        results.push({
          userId: user._id,
          isFound: false,
          error: error.message || 'Unknown error occurred',
          checked: true
        });
      }
    }
  }

  return results;
}

export async function POST(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  let batchSize = 1;

  try {
    // Try to parse the request body, but don't fail if it's empty
    const body = await request.json().catch(() => ({}));
    batchSize = body.batchSize || 1;

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

    // If batchSize is 1, handle single user check
    if (batchSize === 1) {
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
        const [result] = await processBatch([customUser], client);
        const updatedUser = await CustomUserModel.findByIdAndUpdate(
          id,
          {
            isFound: result.isFound,
            error: result.error,
            username: result.username,
            firstName: result.firstName,
            lastName: result.lastName,
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
      } finally {
        if (client.connected) {
          await client.destroy();
        }
      }
    } else {
      // Handle batch processing
      const uncheckedUsers = await CustomUserModel.find({
        userId: user._id,
        checked: { $ne: true }
      }).limit(batchSize);

      if (uncheckedUsers.length === 0) {
        return NextResponse.json(
          { error: 'No unchecked users found' },
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
        const results = await processBatch(uncheckedUsers, client);

        // Update all users in the database
        const updatePromises = results.map((result) =>
          CustomUserModel.findByIdAndUpdate(
            result.userId,
            {
              isFound: result.isFound,
              error: result.error,
              username: result.username,
              firstName: result.firstName,
              lastName: result.lastName,
              checked: true
            },
            { new: true }
          )
        );

        const updatedUsers = await Promise.all(updatePromises);

        return NextResponse.json({
          success: true,
          users: updatedUsers.map((user) => ({
            _id: user._id.toString(),
            phone: user.phone,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isFound: user.isFound,
            error: user.error,
            checked: user.checked,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
          }))
        });
      } finally {
        if (client.connected) {
          await client.destroy();
        }
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to check user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
